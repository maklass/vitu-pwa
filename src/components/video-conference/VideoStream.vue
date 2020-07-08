<template>
  <video :class="{ mirrored }" @playing="onPlaying" @pause="onPause" autoplay playsinline ref="video" @click="onClick()" :muted="muted"></video>
</template>

<script>
export default {
  data() {
    return {
      playing: false
    };
  },

  props: {
    stream: null,
    muted: {
      type: Boolean,
      default: false
    },
    mirrored: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onClick() {
      this.$emit("click");
      this.updateVideoStream();
    },

    onPlaying(event) {
      this.playing = true;
      this.$emit("playing", event);
    },

    onPause(event) {
      this.playing = false;
      this.$emit("pause", event);
    },

    /**
     * Sets the srcObject of the video element to the janus stream.
     */
    updateVideoStream() {
      if (this.$refs.video && this.stream !== undefined) {
        this.$refs.video.srcObject = this.stream;
      }
    }
  },

  watch: {
    stream: {
      handler() {
        this.updateVideoStream();
      },
      deep: true
    }
  },

  mounted() {
    this.updateVideoStream();
  }
};
</script>

<style lang="scss" scoped>
.mirrored {
  transform: rotateY(180deg);
}
</style>
