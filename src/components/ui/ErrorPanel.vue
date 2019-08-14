<template>
  <div>
    <div class="error-panel" :style="{ background }" v-if="errors && errors.length > 0">
      <div class="error" v-for="error in errors" :key="error"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    background: {
      type: String,
      default: "red"
    },
    errors: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.error-panel {
  color: white;
  padding: 0.5rem 1rem;
}
</style>
