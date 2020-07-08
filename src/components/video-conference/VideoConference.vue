<template>
  <div>
    <div class="consent-dialog" v-if="consentDialogScreen"></div>
    <div class="conference">
      <div class="main-panel">
        <div v-if="demo" class="info-box">
          <i18n path="demo.room">
            <a :href="url" place="url">{{ url }}</a>
          </i18n>
        </div>
        <h4 class="title" v-if="roomName">
          {{ roomName }}<span v-if="roomDate && showRoomDate"> - {{ $d(new Date(roomDate), "long") }}</span>
        </h4>
        <div class="video-conference-container">
          <div
            :class="[{ 'video-conference': !fullScreenParticipant }]"
            :style="[
              {
                display: fullScreenParticipant ? '' : 'grid',
                'max-width': fullScreenParticipant ? '160px' : '',
                flex: !fullScreenParticipant ? 1 : '',
                'grid-template-columns': !fullScreenParticipant ? 'repeat(auto-fit, minmax(' + getMinSizeForVideoElement() + ', 0.5fr))' : ''
              }
            ]"
          >
            <video-conference-item
              v-if="localParticipant"
              :mirrored="true"
              :muted="true"
              :participant="localParticipant"
              :ratioX="ratioX"
              :ratioY="ratioY"
              :cutVideoStreams="cutVideoStreams"
              :audio="audio"
              :video="video"
              @toggleVideo="toggleVideo"
              @toggleAudio="toggleAudio"
              :style="[{ display: video ? '' : 'none' }]"
            />
            <video-conference-item
              v-for="remoteParticipant in filteredRemoteParticipants"
              :key="remoteParticipant.id"
              :participant="remoteParticipant"
              :ratioX="ratioX"
              :ratioY="ratioY"
              :cutVideoStreams="cutVideoStreams"
              :bitrate="bitrate"
              :style="[{ display: shouldDisplayParticipant(remoteParticipant) ? '' : 'none' }]"
            />
          </div>
          <div class="fullscreen-element" v-if="fullScreenParticipant" :style="[{ 'margin-left': showMarginOnFullScreenParticipant ? '' : '0' }]">
            <video-conference-item :mirrored="false" :muted="true" :fullScreen="true" :participant="p" v-for="p in fullScreenParticipants" :key="p.id" />
          </div>
        </div>
      </div>
      <control-panel
        class="control-panel"
        @shareScreen="shareScreen"
        @unshareScreen="unshareScreen"
        @leave="goToHome"
        @toggleAudio="toggleAudio"
        @toggleVideo="toggleVideo"
        @audioDeviceChanged="onAudioDeviceChanged"
        :showEntries="showEntries"
        :entries="entries"
        v-if="room"
        :room="room"
        :consentDialogScreen="consentDialogScreen"
        :audio="audio"
        :video="video"
        :speaking="speaking"
        :devices="devices"
        :screenShared="screenShared"
        :fullScreenParticipant="fullScreenParticipant"
        :currentRoundTripTime="currentRoundTripTime"
        :numberOfVideos="numberOfVideos"
        :maxNumberOfVideos="maxNumberOfVideos"
      />
    </div>
  </div>
</template>

<script>
import Janus from "../../assets/js/janus.js";
import hark from "hark";
import ControlPanel from "../ControlPanel";
import VideoConferenceItem from "./VideoConferenceItem";
import config from "./../../config/config";
import { Participant, LocalParticipant } from "./../../model/Participant";
import { mapState } from "vuex";

import joinSound from "@/assets/sounds/join.mp3";

const RECONNECT_TIMEOUT = 8000;
const RETRY_TIMEOUT = 2000;

export default {
  props: {
    entries: {
      type: Array,
      default() {
        return [];
      }
    },

    showEntries: {
      type: Boolean,
      default: true
    },

    roomToken: {
      type: String,
      required: true
    },

    ratioX: {
      type: Number,
      default: 16,
      validator(value) {
        return value !== 0;
      }
    },

    ratioY: {
      type: Number,
      default: 10
    },

    showVideoInitially: {
      type: Boolean,
      default: true
    },

    bitrate: {
      type: Number,
      default: 300
    },

    cutVideoStreams: {
      type: Boolean,
      default: true
    },

    turnUrl: {
      type: String,
      required: true
    },

    turnUser: {
      type: String,
      required: true
    },

    turnSecret: {
      type: String,
      required: true
    },

    room: {
      type: Number,
      required: true
    },

    roomName: {
      type: String
    },

    roomDate: {
      type: [Date, String]
    },

    showRoomDate: {
      type: Boolean
    },

    maxNumberOfVideos: {
      type: Number,
      default: 8
    }
  },

  data() {
    return {
      server: config.JANUS_URL,
      opaqueId: "vitu-" + Janus.randomString(12),
      opaqueIdScreen: "vitu-screen-" + Janus.randomString(12),
      consentDialog: false,
      consentDialogScreen: false,
      errors: [],
      janus: null,
      bitrateTimer: [],
      localParticipant: null,
      remoteParticipants: [],
      screenHandle: null,
      audio: true,
      video: this.showVideoInitially,
      switching: false,
      speechEvents: null,
      speaking: false,
      devices: [],
      statsInterval: null,
      statsIntervalTimeout: 2000,
      currentRoundTripTime: 0,
      screenShared: false,
      audioDisconnectedTimeout: null
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

    fullScreenParticipant() {
      if (!this.remoteParticipants) {
        return null;
      }
      return this.remoteParticipants.find(participant => {
        return participant.caption.startsWith("Screen");
      });
    },

    fullScreenParticipants() {
      if (!this.remoteParticipants) {
        return [];
      }
      return this.remoteParticipants.filter(participant => {
        return participant.caption.startsWith("Screen");
      });
    },

    showMarginOnFullScreenParticipant() {
      return this.video || this.filteredRemoteParticipants.find(participant => participant.stream && participant.stream.getVideoTracks() && participant.stream.getVideoTracks().length > 0);
    },

    filteredRemoteParticipants() {
      return this.remoteParticipants.filter(participant => {
        return !participant.caption.startsWith("Screen");
      });
    },

    numberOfVideos() {
      let numberOfVideos = 0;
      if (this.video) {
        numberOfVideos++;
      }
      numberOfVideos = this.filteredRemoteParticipants.reduce((acc, p) => {
        if (this.shouldDisplayParticipant(p)) {
          acc++;
        }
        return acc;
      }, numberOfVideos);
      return numberOfVideos;
    }
  },

  methods: {
    toggleAudio() {
      this.audio = !this.audio;
    },

    toggleVideo() {
      if (this.numberOfVideos >= this.maxNumberOfVideos && !this.video) {
        return;
      }
      this.video = !this.video;
    },

    shouldDisplayParticipant(participant) {
      return participant.stream && participant.stream.getVideoTracks() && participant.stream.getVideoTracks().length > 0;
    },

    registerSpeakingListeners(stream) {
      this.speechEvents = hark(stream);
      this.speechEvents.on("speaking", this.onSpeaking);
      this.speechEvents.on("stopped_speaking", this.onStopSpeakeing);
    },

    onSpeaking() {
      this.speaking = true;
    },

    onStopSpeakeing() {
      this.speaking = false;
    },

    onAudioDeviceChanged(deviceId) {
      this.localParticipant.publish(true, this.video, false, deviceId);
    },

    onJanusInitialized() {
      if (!Janus.isWebrtcSupported()) {
        alert("No WebRTC support... ");
        return;
      }

      if (!this.turnUrl) {
        alert("Turn Server not defined, please contact administrator.");
        return;
      }

      const iceServers = [
        {
          urls: `turn:${this.turnUrl}:443?transport=tcp`,
          username: this.turnUser,
          credential: this.turnSecret
        }
      ];

      this.janus = new Janus({
        server: this.server,
        iceTransportPolicy: "relay",
        iceServers,
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
      Janus.error(error + "MOUNT EVEREST");
      this.reconnect();
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
      if (on) {
        clearTimeout(this.audioDisconnectedTimeout);
        if (this.audio) {
          if (this.localParticipant) {
            this.localParticipant.unmuteAudio();
          }
        } else {
          if (this.localParticipant) {
            this.localParticipant.muteAudio();
          }
        }
      } else if (!on && medium === "audio") {
        this.currentRoundTripTime = 0;
        this.audioDisconnectedTimeout = setTimeout(this.reconnect, RECONNECT_TIMEOUT);
      }
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
      this.localParticipant.setBitrate(this.bitrate * 1024);
      this.registerSpeakingListeners(stream);
      Janus.debug(stream);
    },

    onJanusPluginAttachCleanup() {
      Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
      if (this.localParticipant) {
        this.localParticipant.stream = null;
      }
      if (this.switching) {
        this.switching = false;
        this.localParticipant.publish(true, this.video, false, this.deviceId);
      }
    },

    onJanusVideoRoomJoined(msg) {
      this.localParticipant.id = msg.id;
      this.localParticipant.pvtid = msg.private_id;
      Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.localParticipant.id);
      this.localParticipant.publish(true, this.video, false);
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
        if (remoteParticipant) {
          if (remoteParticipant.pluginHandle) {
            remoteParticipant.pluginHandle.detach();
          }
          this.removeRemoteParticipantById(msg.leaving);
        }
      } else if (msg.unpublished) {
        const unpublished = msg["unpublished"];
        Janus.log("Publisher left: " + unpublished);
        if (unpublished === "ok") {
          // That's us
          if (this.localParticipant && this.localParticipant.pluginHandle) {
            // this.localParticipant.pluginHandle.hangup();
          }
          return;
        }
        let remoteParticipant = this.getRemoteParticipantById(unpublished);
        if (remoteParticipant) {
          if (remoteParticipant.pluginHandle) {
            remoteParticipant.pluginHandle.detach();
          }
          this.removeRemoteParticipantById(unpublished);
        }
      } else if (msg.error) {
        console.error(msg.error);
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

    playJoinSound() {
      const audio = new Audio(joinSound);
      audio.play();
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
      if (remoteParticipant && this.fullScreenParticipant && this.fullScreenParticipant.id === remoteParticipant.id && stream.getTracks() && stream.getTracks().length < 2) {
        console.log(stream.getTracks());
        console.log(pluginHandle);
        console.log(remoteParticipant);
      }
      if (remoteParticipant) {
        remoteParticipant.setStream(stream);
      }
    },

    onJanusRemotePluginAttachedCleanup(id) {
      Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
      this.removeRemoteParticipantById(id);
    },

    getRemoteParticipantById(id) {
      return this.remoteParticipants.find(remoteParticipant => {
        return remoteParticipant.id === id;
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
              token: this.roomToken ? this.roomToken : ""
            }
          });
        },
        error: error => console.error(error),
        consentDialog: on => {
          this.consentDialogScreen = on;
        },
        onmessage: (msg, jsep) => {
          let event = msg["videoroom"];
          if (event && event === "joined") {
            let media = {
              audioRecv: false,
              videoRecv: false,
              audioSend: false,
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
        },
        onlocalstream: stream => {
          this.screenShared = true;
          if (stream && stream.getVideoTracks() && stream.getVideoTracks()[0]) {
            stream.getVideoTracks()[0].onended = () => {
              this.unshareScreen();
            };
          }
        }
      });
    },

    unshareScreen() {
      if (this.screenHandle) {
        let unpublish = { request: "unpublish" };
        this.screenHandle.send({ message: unpublish });
        this.screenHandle.detach();
      }
      this.screenHandle = null;
      this.screenShared = false;
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

    join() {
      window.addEventListener("beforeunload", this.leave);

      this.localParticipant = new LocalParticipant();
      this.localParticipant.mirrored = true;
      this.localParticipant.loading = true;
      this.localParticipant.caption = this.caption;
      this.localParticipant.local = true;

      Janus.init({ debug: "all", callback: this.onJanusInitialized });
      Janus.listDevices(devices => (this.devices = devices), { audio: true, video: false });

      this.startStatsInterval();
    },

    leave() {
      if (this.statsInterval) {
        clearInterval(this.statsInterval);
      }
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
      this.screenHandle = null;
      this.remoteParticipants = [];
    },

    reconnect() {
      this.leave();
      setTimeout(this.join, RETRY_TIMEOUT);
    },

    goToHome() {
      this.$router.push({ name: "home" });
    },

    getMinSizeForVideoElement() {
      switch (this.numberOfVideos) {
        case 0:
        case 1:
        case 2:
          return "34%";
        case 3:
        case 4:
        case 5:
        case 6:
          return "26%";
        case 7:
        case 8:
          return "21%";
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
          return "17%";
        default:
          return "15%";
      }
    },

    startStatsInterval() {
      this.statsInterval = setInterval(() => {
        if (
          !this.localParticipant ||
          !this.localParticipant.pluginHandle ||
          !this.localParticipant.pluginHandle.webrtcStuff ||
          !this.localParticipant.pluginHandle.webrtcStuff.pc ||
          !this.localParticipant.pluginHandle.webrtcStuff.pc.getStats
        ) {
          return;
        }
        this.localParticipant.pluginHandle.webrtcStuff.pc.getStats().then(stats => {
          stats.forEach(report => {
            Object.keys(report).forEach(statName => {
              if (statName === "roundTripTime") {
                this.currentRoundTripTime = report[statName];
              }
            });
          });
        });
      }, this.statsIntervalTimeout);
    }
  },

  watch: {
    audio: {
      handler() {
        if (this.audio) {
          if (this.localParticipant) {
            this.localParticipant.unmuteAudio();
          }
        } else {
          if (this.localParticipant) {
            this.localParticipant.muteAudio();
          }
        }
      }
    },
    video: {
      handler() {
        this.switching = true;
        this.localParticipant.unpublish();
      }
    }
  },

  mounted() {
    this.join();
  },

  beforeDestroy() {
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
    grid-template-columns: repeat(auto-fit, minmax(6em, 1fr));
    grid-gap: 0.25rem;
  }
}

@include media-breakpoint-up(sm) {
  .video-conference {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(25%, 0.5fr));
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
    width: 100%;
  }
}

.conference {
  display: flex;
}

.main-panel {
  flex: 1;
  overflow: hidden;
}

.control-panel {
  width: 300px;
  padding-left: 15px;
  height: calc(100vh - #{$navbar-height});
  margin-right: -15px;
  margin-bottom: -15px;
  margin-top: -15px;
}

.consent-dialog {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
}

.title {
  color: $vitu-green;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
