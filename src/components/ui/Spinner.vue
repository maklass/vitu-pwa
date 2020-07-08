<template>
  <spinner line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :message="message" :speed="1.5" />
</template>

<script>
import Spinner from "vue-simple-spinner";

export default {
  props: {
    message: {
      type: String,
      default: ""
    }
  },

  components: {
    Spinner
  }
};
</script>
