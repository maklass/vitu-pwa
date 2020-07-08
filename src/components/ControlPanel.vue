<template>
  <div>
    <b-card no-body class="tab-container">
      <b-tabs card class="tabs" v-model="tabIndex" justified>
        <b-tab active class="tab-pane">
          <template slot="title">
            <div id="participant-list"><account-multiple-icon class="tab-icon" title="" /></div>
            <b-tooltip target="participant-list" triggers="hover" :title="$t('participantList')" />
          </template>
          <div class="panel-wrapper">
            <div v-if="error" class="error-panel">{{ error }}</div>
            <participant-list :participants="participants" class="participant-list" />
          </div>
        </b-tab>
        <b-tab class="tab-pane" :title-link-class="{ update_trigger_hack: '' }">
          <template slot="title">
            <div id="chat">
              <forum-icon class="tab-icon" title="" />
              <sup v-if="newMessages > 0">
                <b-badge variant="danger">{{ newMessages }}</b-badge>
              </sup>
            </div>
            <b-tooltip target="chat" triggers="hover" :title="$t('chat.chat')" />
          </template>
          <div v-if="error" class="error-panel">{{ error }}</div>
          <chat v-else :messages="messages" :visible="tabIndex === 1" @message="onownmessage" @startTyping="sendStartTyping" @endTyping="sendStopTyping" :subject="subject" :typingText="typingText" />
        </b-tab>
        <b-tab class="tab-pane" v-if="showEntries">
          <template slot="title">
            <format-list-checkbox-icon id="case-list" class="tab-icon" />
            <b-tooltip target="case-list" triggers="hover" :title="$t('caseList')" />
          </template>
          <div class="panel-wrapper">
            <div class="cases-panel">
              <div v-if="demo">
                <div>
                  1. Maxi Musterfrau
                </div>
                <div>
                  2. Martin Mustermann
                </div>
              </div>
              <div v-else>
                <div v-for="(entry, index) in filteredEntries" :key="entry ? entry.id : index">{{ index + 1 }} {{ entry && entry.patient ? entry.patient.firstName : "-" }} {{ entry && entry.patient ? entry.patient.lastName : "-" }}</div>
                <div v-if="!filteredEntries.length">{{ $t("conference.noEntries") }}</div>
              </div>
            </div>
          </div>
        </b-tab>
        <b-tab class="tab-pane">
          <template slot="title">
            <div id="moderation-panel"><monitor-icon class="tab-icon" /></div>
            <b-tooltip target="moderation-panel" triggers="hover" :title="$t('moderationPanel')" />
          </template>
          <div class="panel-wrapper">
            <div class="moderator-panel">
              <h6>{{ $t("conference.shareScreen") }}</h6>
              <p>
                {{ $t("conference.shareScreenDescription") }}
              </p>
              <div>
                <button v-if="!screenShared" class="btn btn-primary" @click="onShareScreen">
                  {{ $t("conference.shareScreen") }}
                </button>
                <button v-else class="btn btn-primary" @click="onUnshareScreen">
                  {{ $t("conference.unshareScreen") }}
                </button>
              </div>
            </div>
            <hr />
            <div class="moderator-panel" v-if="keycloak.hasRealmRole('vitu-moderator') && !deactivateDocumentation">
              <h6>{{ $t("openCaseOverview") }}</h6>
              <p>{{ $t("caseOverviewDescription") }}</p>
              <router-link class="btn btn-primary" target="_blank" :to="{ name: 'conference-moderator' }">{{ $t("openCaseOverview") }} <open-in-new-icon /></router-link>
            </div>
          </div>
        </b-tab>
      </b-tabs>
      <div class="options-panel">
        <div id="network-strength" class="option-info">
          <network-strength1-alert-icon class="network-strength-alert-icon" title="" v-if="currentRoundTripTime === 0 || currentRoundTripTime > 1" />
          <network-strength4-icon class="network-strength-icon" title="" v-else-if="currentRoundTripTime <= 0.02 && currentRoundTripTime > 0" />
          <network-strength3-icon class="network-strength-icon" title="" v-else-if="currentRoundTripTime <= 0.05 && currentRoundTripTime > 0.02" />
          <network-strength2-icon class="network-strength-icon" title="" v-else-if="currentRoundTripTime <= 0.2 && currentRoundTripTime > 0.05" />
          <network-strength1-icon class="network-strength-icon" title="" v-else-if="currentRoundTripTime > 0.2" />
        </div>
        <div class="vertical-rule"></div>
        <button type="button" class="btn btn-link" @click="$emit('toggleAudio')" id="audio">
          <microphone-icon title="" class="option-icon" v-if="audio" />
          <microphone-off-icon title="" class="option-icon icon-danger" v-if="!audio" />
        </button>
        <button type="button" class="btn btn-link" @click="$emit('toggleVideo')" id="video">
          <video-icon title="" class="option-icon" v-if="video" />
          <video-off-icon title="" :class="['option-icon', { 'disabled-icon': !canAddVideo }]" v-if="!video" />
        </button>
        <b-dropdown right dropup variant="link" no-caret id="settings">
          <template slot="button-content">
            <cog-icon title="" class="option-icon" />
          </template>
          <div class="settings-dropup">
            <h6>{{ $t("microphone") }}</h6>
            <div class="form-check" v-for="device in audioDevices" :key="device.deviceId">
              <input class="form-check-input" type="radio" name="audio-device" :id="'audio-device-' + device.deviceId" :value="device.deviceId" v-model="audioDevice" />
              <label class="form-check-label" :for="'audio-device-' + device.deviceId">
                {{ device.label }}
              </label>
            </div>
          </div>
        </b-dropdown>
        <button type="button" class="btn btn-link" @click="$emit('leave')" id="leave">
          <exit-run-icon title="" class="option-icon" />
        </button>
        <b-tooltip target="network-strength" triggers="hover" :title="currentRoundTripTime * 1000 + ' ms'" />
        <b-tooltip target="audio" triggers="hover" :title="audio ? $t('conference.muteAudio') : $t('conference.unmuteAudio')" />
        <b-tooltip target="video" triggers="hover" :title="tooltipVideo" />
        <b-tooltip target="settings" triggers="hover" :title="$t('settings')" />
        <b-tooltip target="leave" triggers="hover" :title="$t('conference.leaveConference')" />
      </div>
    </b-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AccountMultipleIcon from "vue-material-design-icons/AccountMultiple";
import ExitRunIcon from "vue-material-design-icons/ExitRun";
import ForumIcon from "vue-material-design-icons/Forum";
import MonitorIcon from "vue-material-design-icons/Monitor";
import FormatListCheckboxIcon from "vue-material-design-icons/FormatListCheckbox";
import MicrophoneIcon from "vue-material-design-icons/Microphone";
import MicrophoneOffIcon from "vue-material-design-icons/MicrophoneOff";
import NetworkStrength1AlertIcon from "vue-material-design-icons/NetworkStrength1Alert";
import NetworkStrength1Icon from "vue-material-design-icons/NetworkStrength1";
import NetworkStrength2Icon from "vue-material-design-icons/NetworkStrength2";
import NetworkStrength3Icon from "vue-material-design-icons/NetworkStrength3";
import NetworkStrength4Icon from "vue-material-design-icons/NetworkStrength4";
import OpenInNewIcon from "vue-material-design-icons/OpenInNew";
import CogIcon from "vue-material-design-icons/Cog";
import VideoIcon from "vue-material-design-icons/Video";
import VideoOffIcon from "vue-material-design-icons/VideoOff";
import Chat from "./Chat";
import ParticipantList from "./ParticipantList";
import { setTimeout } from "timers";
import config from "../config/config";
import { uniqBy } from "lodash";

export default {
  props: {
    showEntries: {
      type: Boolean,
      default: true
    },

    entries: {
      type: Array,
      default() {
        return [];
      }
    },

    consentDialogScreen: {
      type: Boolean,
      defaulft: false
    },

    room: {
      type: Number
    },

    audio: {
      type: Boolean,
      default: true
    },

    video: {
      type: Boolean,
      default: false
    },

    speaking: {
      type: Boolean,
      default: false
    },

    devices: {
      type: Array,
      default() {
        return [];
      }
    },

    currentRoundTripTime: {
      type: Number,
      default: 0
    },

    screenShared: {
      type: Boolean,
      default: false
    },

    fullScreenParticipant: {
      type: Object,
      default: null
    },

    numberOfVideos: {
      type: Number,
      default: 0
    },

    maxNumberOfVideos: {
      type: Number,
      default: 8
    }
  },

  data() {
    return {
      connection: null,
      connected: false,
      socketUrl: `${config.WEBSOCKET_URL}/message/${this.room}`,
      messages: [],
      newMessages: 0,
      participants: [],
      tabIndex: 0,
      pingInterval: 15000,
      pingIntervalHandle: null,
      typingText: "",
      error: null,
      audioDevice: "default"
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      fullUserName: state => state.authentication.keycloak.idTokenParsed.name,
      subject: state => state.authentication.keycloak.subject,
      keycloak: state => state.authentication.keycloak
    }),

    demo() {
      return config.DEMO;
    },

    filteredEntries() {
      if (this.entries) {
        return this.entries.filter(entry => entry);
      } else {
        return [];
      }
    },

    deactivateDocumentation() {
      return config.DEACTIVATE_DOCUMENTATION;
    },

    audioDevices() {
      if (!this.devices) {
        return [];
      }
      return uniqBy(
        this.devices.filter(device => device.kind === "audioinput"),
        "groupId"
      );
    },

    canAddVideo() {
      return this.numberOfVideos < this.maxNumberOfVideos;
    },

    tooltipVideo() {
      if (this.video) {
        return this.$t("conference.muteVideo");
      } else {
        if (this.canAddVideo) {
          return this.$t("conference.unmuteVideo");
        } else {
          return this.$t("noMoreVideoStreamsAllowed");
        }
      }
    }
  },

  methods: {
    sendMessage(message) {
      this.connection.send(
        JSON.stringify({
          type: "MESSAGE",
          message
        })
      );
    },

    sendStartTyping() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_START"
        })
      );
    },

    sendStopTyping() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_END"
        })
      );
    },

    sendStartSpeaking() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_START",
          message: "SPEAKING_START"
        })
      );
    },

    sendStopSpeaking() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_START",
          message: "SPEAKING_END"
        })
      );
    },

    ping() {
      this.connection.send(
        JSON.stringify({
          type: "PING"
        })
      );
    },

    connect() {
      let params = new URLSearchParams();
      if (this.token) {
        params.append("access_token", this.token);
      }
      this.connection = new WebSocket(`${this.socketUrl}?${params}`);
      this.connection.onopen = this.onopen;
      this.connection.onclose = this.onclose;
      this.connection.onmessage = this.onmessage;
      this.connection.onerror = this.onerror;
    },

    onownmessage(message) {
      this.sendMessage(message);
    },

    onopen() {
      this.connected = true;
    },

    onclose() {
      this.connected = false;
      setTimeout(this.connect, 10);
    },

    onmessage(e) {
      let message = JSON.parse(e.data);

      switch (message.type) {
        case "MESSAGE":
          this.messages.push(message);
          if (this.tabIndex !== 1) {
            this.newMessages++;
          }
          break;
        case "PARTICIPANT_LIST":
          this.participants = message.payload
            ? message.payload.map(p => {
                p.speaking = false;
                p.typing = false;
                return p;
              })
            : [];
          break;
        case "TYPING_START": {
          if (message.fromId !== this.subject) {
            this.typingText = message.from;
          }
          switch (message.message) {
            case "SPEAKING_START": {
              let participant = this.participants.find(p => p.userId === message.fromId);
              if (participant) {
                participant.speaking = true;
              }
              break;
            }
            case "SPEAKING_END": {
              let participant = this.participants.find(p => p.userId === message.fromId);
              if (participant) {
                participant.speaking = false;
              }
              break;
            }
          }
          break;
        }
        case "TYPING_END":
          if (message.fromId !== this.subject) {
            this.typingText = "";
          }
          break;

        case "SPEAKING_START":
          // console.log(message);
          break;
        case "SPEAKING_END":
          // console.log(message);
          break;
        case "ERROR":
          if (message.payload === "invalid room") {
            this.error = this.$t("error.noConnectionToChat");
            clearInterval(this.pingIntervalHandle);
            this.connection.onclose = () => {};
            this.connection.close();
          } else {
            this.error = message.payload;
          }
      }
    },

    onerror(error) {
      console.error("WebSocket Error ", error);
    },

    onShareScreen() {
      this.$emit("shareScreen");
    },

    onUnshareScreen() {
      this.$emit("unshareScreen");
    }
  },

  mounted() {
    this.connect();
  },

  beforeDestroy() {
    if (this.connection) {
      clearInterval(this.pingIntervalHandle);
      this.connection.onclose = () => {};
      this.connection.close();
    }
  },

  watch: {
    tabIndex(newValue) {
      if (newValue === 1) {
        this.newMessages = 0;
      }
    },

    speaking(newValue) {
      if (newValue) {
        this.sendStartSpeaking();
      } else {
        this.sendStopSpeaking();
      }
    },

    audioDevice(newValue) {
      this.$emit("audioDeviceChanged", newValue);
    }
  },

  components: {
    AccountMultipleIcon,
    Chat,
    CogIcon,
    ExitRunIcon,
    FormatListCheckboxIcon,
    ForumIcon,
    MicrophoneIcon,
    MicrophoneOffIcon,
    MonitorIcon,
    NetworkStrength1AlertIcon,
    NetworkStrength1Icon,
    NetworkStrength2Icon,
    NetworkStrength3Icon,
    NetworkStrength4Icon,
    OpenInNewIcon,
    ParticipantList,
    VideoIcon,
    VideoOffIcon
  }
};
</script>

<style lang="scss" scoped>
.tab-icon {
  font-size: 1.2rem;
}

.tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-pane {
  margin: 0;
  padding: 0;
  height: 100%;
}

.moderator-panel {
  padding: 15px;
}

.cases-panel {
  padding: 15px;
  flex: 1;
}

.error-panel {
  padding: 15px;
  background: $vitu-danger;
  color: white;
}

.participant-list {
  flex: 1;
}

.options-panel {
  border-top: 1px solid $border-color;
  padding: 3px;
  display: flex;
  justify-content: center;
}

.option-icon {
  font-size: 1.4rem;
}

.disabled-icon {
  color: grey;

  &:hover,
  &:focus {
    color: grey;
  }
}

.network-strength-icon {
  @extend .option-icon;
  color: $vitu-green;
}

.network-strength-alert-icon {
  @extend .option-icon;
  color: $vitu-danger;
}

.option-info {
  padding: 0.375rem 0.75rem;
}

.settings-dropup {
  width: 300px;
  padding: 0.25rem 1.5rem;
}

.tab-container {
  border-radius: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  // overflow: hidden;
}

.vertical-rule {
  border-left: 1px solid $border-color;
  margin-right: 0.25rem;
  margin-left: 0.25rem;
  margin-top: -3px;
}

.icon-danger {
  color: $vitu-danger;
}
</style>

<style lang="scss">
.tab-container {
  .card-header {
    background: white;
  }

  .tab-content {
    overflow-y: auto;
    flex: 1;
  }
}
</style>
