<template>
  <div>
    <div class="conference">
      <div class="main-panel">
        <div v-if="demo" class="info-box">
          <i18n path="demo.room">
            <a :href="url" place="url">{{ url }}</a>
          </i18n>
        </div>
        <div class="video-conference-container">
          <div :class="[{ 'video-conference': !fullScreenParticipant }]" :style="[{ width: fullScreenParticipant ? '200px' : '', flex: !fullScreenParticipant ? 1 : '' }]" v-if="!localScreenShared">
            <video-conference-item v-if="localParticipant && !localScreenShared" :mirrored="true" :muted="true" :participant="localParticipant" />
            <video-conference-item v-for="remoteParticipant in filteredRemoteParticipants" :key="remoteParticipant.id" :participant="remoteParticipant" />
          </div>
          <div class="fullscreen-element" v-if="fullScreenParticipant">
            <video-conference-item :mirrored="false" :muted="true" :fullScreen="true" :participant="fullScreenParticipant" />
          </div>
        </div>
      </div>
      <control-panel class="control-panel" @shareScreen="shareScreen" @unshareScreen="unshareScreen" :entries="entries" v-if="room" :room="room" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Janus from "../../assets/js/janus.js";
import ControlPanel from "../ControlPanel";
import VideoConferenceItem from "./VideoConferenceItem";
import { Participant, LocalParticipant } from "./../../model/Participant";
import { getAccessTokenForRoom } from "../../api/video-api";
import config from "./../../config/config";

export default {
  props: {
    entries: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  data() {
    return {
      server: config.JANUS_URL,
      opaqueId: "vitu-" + Janus.randomString(12),
      opaqueIdScreen: "vitu-screen-" + Janus.randomString(12),
      consentDialog: false,
      errors: [],
      janus: null,
      room: null,
      bitrateTimer: [],
      localParticipant: null,
      remoteParticipants: [],
      screenHandle: null,
      roomToken: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      fullUserName: state => state.authentication.keycloak.idTokenParsed.name,
      company: state => state.authentication.keycloak.idTokenParsed.company,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    demo() {
      return config.DEMO;
    },

    url() {
      return window.location.href;
    },

    caption() {
      return this.fullUserName + (this.company ? " - " + this.company : "");
    },

    isModerator() {
      return this.roles.includes("vitu-moderator");
    },

    secrets() {
      return this.roles.find(role => role.startsWith("turn"));
    },

    turnUrl() {
      if (this.secrets) {
        return this.secrets.split(":")[1];
      }
    },

    turnUser() {
      if (this.secrets) {
        return this.secrets.split(":")[2];
      }
    },

    turnSecret() {
      if (this.secrets) {
        return this.secrets.split(":")[3];
      }
    },

    localScreenShared() {
      if (this.$route.query.screen === "true") {
        return true;
      } else {
        return false;
      }
    },

    fullScreenParticipant() {
      if (this.localScreenShared) {
        return this.localParticipant;
      } else {
        const participant = this.remoteParticipants.find(participant => {
          return participant.caption.startsWith("Screen");
        });
        return participant;
      }
    },

    filteredRemoteParticipants() {
      return this.remoteParticipants.filter(participant => {
        return !participant.caption.startsWith("Screen");
      });
    }
  },

  methods: {
    onJanusInitialized() {
      if (!Janus.isWebrtcSupported()) {
        alert("No WebRTC support... ");
        return;
      }

      if (!this.secrets) {
        alert("User role not defined, please contact administrator");
        return;
      }

      this.janus = new Janus({
        server: this.server,
        iceTransportPolicy: "relay",
        iceServers: [
          {
            urls: `turn:${this.turnUrl}:443?transport=tcp`,
            username: this.turnUser,
            credential: this.turnSecret
          }
        ],
        success: this.onJanusCreateSuccess,
        error: this.onJanusCreateError,
        destroyed: this.onJanusDestroyed
      });
    },

    onJanusCreateSuccess() {
      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: this.opaqueId,
        success: this.onJanusPluginAttachSuccess,
        error: this.onJanusPluginAttachError,
        consentDialog: this.onJanusPluginAttachConsentDialog,
        mediaState: this.onJanusPluginAttachMediaState,
        webrtcState: this.onJanusPluginAttachWebrtcState,
        onmessage: this.onJanusPluginAttachMessage,
        onlocalstream: this.onJanusPluginAttachLocalStream,
        oncleanup: this.onJanusPluginAttachCleanup
      });
    },

    onJanusCreateError(error) {
      Janus.error(error);
    },

    onJanusDestroyed() {
      Janus.log("Janus destroyed");
    },

    onJanusPluginAttachSuccess(pluginHandle) {
      this.localParticipant.pluginHandle = pluginHandle;
      Janus.log("Plugin attached! (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");
      Janus.log("  -- This is a publisher/manager");
      this.localParticipant.register(this.room, this.turnSecret, this.roomToken);
    },

    onJanusPluginAttachError(error) {
      Janus.error("  -- Error attaching plugin...", error);
    },

    onJanusPluginAttachConsentDialog(on) {
      Janus.log("Consent " + (on ? "on" : "off"));
    },

    onJanusPluginAttachMediaState(medium, on) {
      Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
    },

    onJanusPluginAttachWebrtcState(on) {
      Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
      if (this.localParticipant) {
        this.localParticipant.loading = false;
      }
    },

    onJanusPluginAttachMessage(msg, jsep) {
      Janus.debug(" ::: Got a message (publisher) :::");
      Janus.debug(msg);
      let event = msg["videoroom"];
      Janus.debug("Event: " + event);

      if (event) {
        switch (event) {
          case "joined":
            this.onJanusVideoRoomJoined(msg);
            break;
          case "desroyed":
            this.onJanusVideoRoomDestroyed();
            break;
          case "event":
            this.onJanusVideoRoomEvent(msg);
            break;
        }
      }

      if (jsep) {
        Janus.debug("Handling SDP as well...");
        Janus.debug(jsep);

        this.localParticipant.handleRemoteJsep({ jsep: jsep });

        // Check if any of the media we wanted to publish has
        // been rejected (e.g., wrong or unsupported codec)
        if (!this.checkAudio(msg)) {
          Janus.error("Audio has been rejected.");
        }
        if (!this.checkVideo(msg)) {
          Janus.error("Video has been rejected.");
        }
      }
    },

    onJanusPluginAttachLocalStream(stream) {
      Janus.debug(" ::: Got a local stream :::");
      this.localParticipant.setStream(stream);
      this.localParticipant.setBitrate(512000);
      Janus.debug(stream);
    },

    onJanusPluginAttachCleanup() {
      Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
      if (this.localParticipant) {
        this.localParticipant.stream = null;
      }
    },

    onJanusVideoRoomJoined(msg) {
      this.localParticipant.id = msg.id;
      this.localParticipant.pvtid = msg.private_id;
      Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.localParticipant.id);
      this.localParticipant.publish(true, true, this.localScreenShared);
      this.checkRemoteStreams(msg);
    },

    onJanusVideoRoomDestroyed() {
      Janus.warn("The room has been destroyed!");
    },

    onJanusVideoRoomEvent(msg) {
      if (msg.publishers) {
        this.checkRemoteStreams(msg);
      } else if (msg.leaving) {
        let remoteParticipant = this.getRemoteParticipantById(msg.leaving);
        remoteParticipant.pluginHandle.detach();
        this.removeRemoteParticipantById(msg.leaving);
      }
    },

    newRemoteStream(id) {
      let remotePluginHandle;

      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: this.opaqueId,
        pin: this.turnSecret,
        success: pluginHandle => {
          remotePluginHandle = pluginHandle;
          this.onJanusRemotePluginAttachedSuccess(remotePluginHandle, id);
        },
        error: this.onJanusRemotePluginAttachedError,
        onmessage: (msg, jsep) => this.onJanusRemotePluginAttachedMessage(msg, jsep, remotePluginHandle),
        onremotestream: stream => this.onJanusRemotePluginAttachedRemoteStream(stream, remotePluginHandle),
        oncleanup: () => this.onJanusRemotePluginAttachedCleanup(id)
      });
    },

    onJanusRemotePluginAttachedSuccess(pluginHandle, id) {
      pluginHandle.simulcastStarted = false;
      let listen = {
        request: "join",
        room: this.room,
        ptype: "subscriber",
        pin: this.turnSecret,
        feed: id,
        private_id: this.localParticipant.pvtid
      };
      pluginHandle.send({ message: listen });
    },

    onJanusRemotePluginAttachedError(error) {
      Janus.error("  -- Error attaching plugin...", error);
    },

    onJanusRemotePluginAttachedMessage(msg, jsep, pluginHandle) {
      Janus.debug(" ::: Got a message (subscriber) :::");
      Janus.debug(msg);
      let event = msg["videoroom"];
      Janus.debug("Event: " + event);
      if (msg["error"] !== undefined && msg["error"] !== null) {
        // bootbox.alert(msg["error"]);
      } else if (event != undefined && event != null) {
        if (event === "attached") {
          // Subscriber created and attached
          let remoteParticipant = new Participant();
          pluginHandle.id = msg["id"];
          remoteParticipant.id = msg["id"];
          remoteParticipant.caption = msg["display"];
          remoteParticipant.pluginHandle = pluginHandle;
          this.remoteParticipants.push(remoteParticipant);
        }
      }
      if (jsep !== undefined && jsep !== null) {
        Janus.debug("Handling SDP as well...");
        Janus.debug(jsep);
        // Answer and attach
        pluginHandle.createAnswer({
          jsep: jsep,
          // Add data:true here if you want to subscribe to datachannels as well
          // (obviously only works if the publisher offered them in the first place)
          media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
          success: function(jsep) {
            Janus.debug("Got SDP!");
            Janus.debug(jsep);
            let body = { request: "start", room: this.room };
            pluginHandle.send({ message: body, jsep: jsep });
          }.bind(this),
          error: function(error) {
            Janus.error("WebRTC error:", error);
          }
        });
      }
    },

    onJanusRemotePluginAttachedRemoteStream(stream, pluginHandle) {
      let remoteParticipant = this.getRemoteParticipantById(pluginHandle.id);
      remoteParticipant.setStream(stream);
    },

    onJanusRemotePluginAttachedCleanup(id) {
      Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
    },

    getRemoteParticipantById(id) {
      return this.remoteParticipants.find(localParticipant => {
        return localParticipant.id === id;
      });
    },

    removeRemoteParticipantById(id) {
      this.remoteParticipants = this.remoteParticipants.filter(remoteParticipant => {
        return remoteParticipant.id !== id;
      });
    },

    shareScreen() {
      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: this.opaqueIdScreen,
        success: pluginHandle => {
          this.screenHandle = pluginHandle;
          this.screenHandle.send({
            message: {
              request: "join",
              room: this.room,
              ptype: "publisher",
              display: `Screen: ${this.caption}`,
              pin: this.turnSecret,
              token: this.roomToken
            }
          });
        },
        error: error => console.error(error),
        onmessage: (msg, jsep) => {
          let event = msg["videoroom"];
          if (event && event === "joined") {
            let media = {
              audioRecv: false,
              videoRecv: false,
              audioSend: true,
              videoSend: true,
              video: "screen"
            };

            this.screenHandle.createOffer({
              media,
              pin: this.turnSecret,
              simulcast: false,
              success: jsep => {
                this.screenHandle.send({
                  pin: this.pin,
                  message: {
                    request: "configure",
                    audio: true,
                    video: true,
                    pin: this.pin
                  },
                  jsep
                });
              },
              error: error => console.error(error)
            });
          }

          if (jsep) {
            Janus.debug("Handling SDP as well...");
            Janus.debug(jsep);

            this.screenHandle.handleRemoteJsep({ jsep: jsep });
          }
        }
      });
    },

    unshareScreen() {
      let unpublish = { request: "unpublish" };
      this.screenHandle.send({ message: unpublish });
      this.screenHandle.detach();
      this.screenHandle = null;
    },

    checkRemoteStreams(msg) {
      if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
        let list = msg["publishers"];

        Janus.debug("Got a list of available publishers/feeds:");
        Janus.debug(list);

        for (let f in list) {
          let id = list[f]["id"];
          let display = list[f]["display"];
          let audio = list[f]["audio_codec"];
          let video = list[f]["video_codec"];
          Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
          this.newRemoteStream(id, display, audio, video);
        }
      }
    },

    checkAudio(msg) {
      let audio = msg["audio_codec"];
      if (this.localParticipant.stream && this.localParticipant.stream.getAudioTracks() && this.localParticipant.stream.getAudioTracks().length > 0 && !audio) {
        return false;
      }
      return true;
    },

    checkVideo(msg) {
      let video = msg["video_codec"];
      if (this.localParticipant.stream && this.localParticipant.stream.getVideoTracks() && this.localParticipant.stream.getVideoTracks().length > 0 && !video) {
        return false;
      }
      return true;
    },

    leave() {
      if (this.localParticipant && this.localParticipant.pluginHandle) {
        this.localParticipant.pluginHandle.detach();
      }
      if (this.screenHandle) {
        this.screenHandle.detach();
      }
      if (this.janus) {
        this.janus.destroy();
      }
      this.localParticipant = null;
      this.remoteParticipants = [];
    }
  },

  async mounted() {
    window.addEventListener("beforeunload", this.leave);

    // this.initVideoRoom();

    if (this.$route.params.room) {
      this.room = parseInt(this.$route.params.room);
      const response = await getAccessTokenForRoom(this.room, this.token);
      this.roomToken = response.data.token;
    }

    this.localParticipant = new LocalParticipant();
    this.localParticipant.mirrored = true;
    this.localParticipant.loading = true;
    this.localParticipant.caption = this.localScreenShared ? `Screen: ${this.caption}` : this.caption;
    this.localParticipant.local = true;

    Janus.init({ debug: "all", callback: this.onJanusInitialized });
  },

  beforeDestroy: function() {
    this.leave();
  },

  components: {
    ControlPanel,
    VideoConferenceItem
  }
};
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/bootstrap";

@include media-breakpoint-down(sm) {
  .video-conference {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
    grid-gap: 0.25rem;
  }
}

@include media-breakpoint-up(sm) {
  .video-conference {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18em, 0.4fr));
    grid-gap: 0.25rem;
  }
}

.video-conference-container {
  display: flex;
  flex: 1;
}

.fullscreen-element {
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: 15px;

  & > div {
    max-width: 70vw;
  }
}

.conference {
  display: flex;
}

.main-panel {
  flex: 1;
}

.control-panel {
  width: 300px;
  padding-left: 15px;
  height: calc(100vh - 15px - 15px - 74px);
}

.info-box {
  background: $vitu-blue;
  color: #eee;
  padding: 0.8rem 1rem;
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px);
  margin-bottom: 1rem;

  a {
    color: #eee;
    font-weight: bold;
  }

  a:hover,
  a:active,
  a:focus {
    color: white;
  }
}
</style>
