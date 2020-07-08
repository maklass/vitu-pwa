<template>
  <div :class="['video-conference-item-container', { threeD }]">
    <div :class="['card', 'video-conference-item', { 'rotated-left': threeD }]" v-if="participant">
      <div class="main" :style="{ 'padding-top': paddingTop }" v-if="!fullScreen">
        <div class="video-container">
          <div class="video-loading" v-if="participant.loading">
            <div>Loading...</div>
          </div>
          <video-stream class="video" :stream="participant.stream" :mirrored="mirrored" :muted="muted" ref="videoConferenceItem" :style="{ 'object-fit': cutVideoStreams ? 'cover' : '' }" />
        </div>
        <div v-if="debugInformation && participant.stream" class="debug-information" @click="toggleDebugInformation"></div>
      </div>
      <div v-if="fullScreen" class="video-fullscreen-wrapper">
        <div class="video-loading" v-if="participant.loading">
          <div>Loading...</div>
        </div>
        <video-stream class="video-fullscreen" width="100%" height="100%" :stream="participant.stream" :mirrored="mirrored" :muted="muted" ref="videoConferenceItem" />
      </div>
      <div class="card-footer video-menu">
        <div class="caption">{{ participant.caption }}</div>
        <!-- <div class="volume-icon">
          <volume-low-icon :title="$t('conference.participantNotSpeaking')" v-if="!participant.speaking" />
          <volume-high-icon :title="$t('conference.participantSpeaking')" v-if="participant.speaking" />
          <volume-off-icon v-if="!participant.local && participant.muted" />
        </div>-->
        <div class="spacer"></div>
        <div id="el-audio" class="toggle-link" @click="$emit('toggleAudio')" :style="{ display: participant.local ? '' : 'none' }">
          <microphone-icon v-if="audio" title="" />
          <microphone-off-icon v-if="!audio" title="" />
        </div>
        <div id="el-video" class="toggle-link" @click="$emit('toggleVideo')" v-if="participant.local">
          <video-icon v-if="video" title="" />
          <video-off-icon v-if="!video" title="" />
        </div>
        <div v-if="!participant.local" :id="participant.id + 'network-strength'">
          <network-strength1-alert-icon class="network-strength-alert-icon" title="" v-if="parseInt(this.participant.pluginHandle.getBitrate()) === 0" />
          <network-strength1-icon class="network-strength-icon" title="" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= bitrate * 0.25 && parseInt(this.participant.pluginHandle.getBitrate()) > 0" />
          <network-strength2-icon class="network-strength-icon" title="" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= bitrate * 0.5 && parseInt(this.participant.pluginHandle.getBitrate()) > bitrate * 0.25" />
          <network-strength3-icon class="network-strength-icon" title="" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= bitrate * 0.75 && parseInt(this.participant.pluginHandle.getBitrate()) > bitrate * 0.5" />
          <network-strength4-icon class="network-strength-icon" title="" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) > bitrate * 0.75" />
        </div>
        <div :id="participant.id + 'toggle-fullscreen'" class="toggle-link" @click="toggleFullScreen" v-if="!participant.local">
          <full-screen-icon></full-screen-icon>
        </div>
        <b-tooltip target="el-audio" triggers="hover" :title="audio ? $t('conference.muteAudio') : $t('conference.unmuteAudio')" />
        <b-tooltip target="el-video" triggers="hover" :title="$t('conference.muteVideo')" />
        <b-tooltip v-if="!participant.local" :target="participant.id + 'network-strength'" :title="participant.pluginHandle.getBitrate()"></b-tooltip>
        <b-tooltip :target="participant.id + 'toggle-fullscreen'" triggers="hover" :title="$t('fullscreen')" />
      </div>
    </div>
  </div>
</template>

<script>
import VideoStream from "./VideoStream";
import VideoIcon from "vue-material-design-icons/Video";
import VideoOffIcon from "vue-material-design-icons/VideoOff";
import MicrophoneIcon from "vue-material-design-icons/Microphone";
import MicrophoneOffIcon from "vue-material-design-icons/MicrophoneOff";
import FullScreenIcon from "vue-material-design-icons/Fullscreen";
import NetworkStrength1AlertIcon from "vue-material-design-icons/NetworkStrength1Alert";
import NetworkStrength1Icon from "vue-material-design-icons/NetworkStrength1";
import NetworkStrength2Icon from "vue-material-design-icons/NetworkStrength2";
import NetworkStrength3Icon from "vue-material-design-icons/NetworkStrength3";
import NetworkStrength4Icon from "vue-material-design-icons/NetworkStrength4";
import { Participant } from "../../model/Participant";
import { toggleFullScreen } from "@/util/dom-util";

export default {
  name: "VideoConferenceItem",

  props: {
    participant: {
      type: Participant,
      required: true
    },

    muted: {
      type: Boolean,
      default: false
    },

    mirrored: {
      type: Boolean,
      default: false
    },

    bitrate: {
      type: Number,
      default: 500
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

    cutVideoStreams: {
      type: Boolean,
      default: true
    },

    threeD: {
      type: Boolean,
      default: false
    },

    fullScreen: {
      type: Boolean,
      default: false
    },

    audio: {
      type: Boolean,
      default: true
    },

    video: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      debugInformation: false
    };
  },

  computed: {
    /**
     * Returns the calculated ratio height / width in order to use this CSS trick: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp
     */
    paddingTop() {
      return (100 * this.ratioY) / this.ratioX + "%";
    },

    display() {
      return this.participant && this.participant.stream && this.participant.stream.getVideoTracks() && this.participant.stream.getVideoTracks().length > 0;
    }
  },

  methods: {
    toggleFullScreen() {
      toggleFullScreen(this.$refs.videoConferenceItem);
    },

    toggleDebugInformation() {
      this.debugInformation = !this.debugInformation;
    }
  },

  components: {
    VideoStream,
    VideoIcon,
    VideoOffIcon,
    MicrophoneIcon,
    MicrophoneOffIcon,
    // VolumeOffIcon,
    FullScreenIcon,
    // VolumeLowIcon,
    // VolumeHighIcon,
    NetworkStrength1AlertIcon,
    NetworkStrength1Icon,
    NetworkStrength2Icon,
    NetworkStrength3Icon,
    NetworkStrength4Icon
  }
};
</script>

<style lang="scss" scoped>
.video-conference-item {
  transition: transform 1s;
  transform-style: preserve-3d;
  display: block;
}

.main {
  position: relative;
  overflow: hidden;

  .video-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: black;

    .video {
      width: 100%;
      height: 100%;
    }
  }

  .debug-information {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.5rem;
    color: white;
    background: rgba(80, 80, 80, 0.6);
  }
}

.caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-menu {
  color: white;
  background: $vitu-dark-grey;
  display: flex;
  align-items: center;
  padding: 0 0.6rem;
}

.hidden {
  opacity: 0;
  position: absolute;
  transform: rotateX(90deg);
}

.threeD {
  perspective: 4000px;
}

.video-loading {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background: rgba(4, 4, 4, 0.5);
  z-index: 99999999999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.rotated-left {
  transform: rotateY(20deg);
  transform-origin: center left;
}

.icon {
  font-size: 24px;
  font-weight: bold;
  margin-left: 0.5em;
}

.volume-off-icon {
  @extend .icon;
  font-size: 20px;
  color: $vitu-danger;
}

.volume-icon {
  @extend .icon;
  // color: $vitu-light-green;
  font-size: 20px;
  margin-left: 0.25em;
}

.network-strength-icon {
  @extend .icon;
  color: $vitu-light-green;
}

.network-strength-alert-icon {
  @extend .icon;
  color: $vitu-danger;
}

.toggle-link {
  color: #bbb;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.5em;

  &:hover {
    color: white;
  }
}

.volume-high-icon {
  margin-left: 3px;
}

.video-fullscreen {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - #{$navbar-height} - 100px);
}

.video-fullscreen-wrapper {
  background: black;
}
</style>
