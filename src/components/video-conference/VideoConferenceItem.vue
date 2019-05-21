<template>
  <div :class="['video-conference-item-container', { threeD }]">
    <div :class="['card', 'video-conference-item', { 'rotated-left': threeD }]" v-if="participant">
      <div class="main" :style="{ 'padding-top': paddingTop }" v-if="!fullScreen">
        <div class="video-container">
          <div class="video-loading" v-if="participant.loading">
            <div>Loading...</div>
          </div>
          <video-stream class="video" :stream="participant.stream" :mirrored="mirrored" :muted="muted" />
        </div>
        <div v-if="debugInformation && participant.stream" class="debug-information" @click="toggleDebugInformation"></div>
      </div>
      <div v-if="fullScreen">
        <div class="video-loading" v-if="participant.loading">
          <div>Loading...</div>
        </div>
        <video-stream class="video-fullscreen" :stream="participant.stream" :mirrored="mirrored" :muted="muted" />
      </div>
      <div class="card-footer video-menu">
        <div class="caption">{{ participant.caption }}</div>
        <!-- <div class="volume-icon">
          <volume-low-icon :title="$t('conference.participantNotSpeaking')" v-if="!participant.speaking" />
          <volume-high-icon :title="$t('conference.participantSpeaking')" v-if="participant.speaking" />
          <volume-off-icon v-if="!participant.local && participant.muted" />
        </div>-->
        <div class="spacer"></div>
        <div class="toggle-link" @click="toggleVideo" v-if="participant.local">
          <video-icon v-if="video" :title="$t('conference.muteVideo')" />
          <video-off-icon v-if="!video" :title="$t('conference.unmuteVideo')" />
        </div>
        <div class="toggle-link" @click="toggleAudio" :style="{ visibility: participant.local ? '' : 'hidden' }">
          <microphone-icon v-if="audio" :title="$t('conference.muteAudio')" />
          <microphone-off-icon v-if="!audio" :title="$t('conference.unmuteAudio')" />
        </div>
        <div v-if="!participant.local">
          <network-strength1-alert-icon class="network-strength-alert-icon" v-if="parseInt(this.participant.pluginHandle.getBitrate()) === 0" />
          <network-strength1-icon class="network-strength-icon" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= 200 && parseInt(this.participant.pluginHandle.getBitrate()) > 0" />
          <network-strength2-icon class="network-strength-icon" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= 400 && parseInt(this.participant.pluginHandle.getBitrate()) > 200" />
          <network-strength3-icon class="network-strength-icon" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) <= 500 && parseInt(this.participant.pluginHandle.getBitrate()) > 400" />
          <network-strength4-icon class="network-strength-icon" v-else-if="parseInt(this.participant.pluginHandle.getBitrate()) > 500" />
        </div>
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
import VolumeOffIcon from "vue-material-design-icons/VolumeOff";
import VolumeLowIcon from "vue-material-design-icons/VolumeLow";
import VolumeHighIcon from "vue-material-design-icons/VolumeHigh";
import NetworkStrength1AlertIcon from "vue-material-design-icons/NetworkStrength1Alert";
import NetworkStrength1Icon from "vue-material-design-icons/NetworkStrength1";
import NetworkStrength2Icon from "vue-material-design-icons/NetworkStrength2";
import NetworkStrength3Icon from "vue-material-design-icons/NetworkStrength3";
import NetworkStrength4Icon from "vue-material-design-icons/NetworkStrength4";
import { Participant } from "../../model/Participant";

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
    threeD: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      debugInformation: false,
      audio: true,
      video: true
    };
  },

  computed: {
    /**
     * Returns the calculated ratio height / width in order to use this CSS trick: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp
     */
    paddingTop() {
      return (100 * this.ratioY) / this.ratioX + "%";
    }
  },

  methods: {
    toggleDebugInformation() {
      this.debugInformation = !this.debugInformation;
    },

    toggleAudio() {
      this.audio = !this.audio;
    },

    toggleVideo() {
      this.video = !this.video;
    }
  },

  watch: {
    audio: {
      handler() {
        if (this.participant.local) {
          if (this.audio) {
            this.participant.unmuteAudio();
          } else {
            this.participant.muteAudio();
          }
          this.$emit("mute", !this.audio);
        }
      }
    },

    video: {
      handler() {
        if (this.participant.local) {
          if (this.video) {
            this.participant.unmuteVideo();
          } else {
            this.participant.muteVideo();
          }
        }
      }
    }
  },

  components: {
    VideoStream,
    VideoIcon,
    VideoOffIcon,
    MicrophoneIcon,
    MicrophoneOffIcon,
    VolumeOffIcon,
    VolumeLowIcon,
    VolumeHighIcon,
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

    .video {
      object-fit: cover;
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
  padding: 0.2rem 1rem;
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
}
</style>
