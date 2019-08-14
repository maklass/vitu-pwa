<template>
  <div>
    <div class="error-header" v-if="showError">
      <div :class="[{ container: !fluid, 'container-fluid': fluid }]">
        <strong>{{ $t("error.errorOccurred") }}:</strong> {{ errorMessage }}
      </div>
    </div>
    <div class="success-header" v-if="showSuccess">
      <div :class="[{ container: !fluid, 'container-fluid': fluid }]">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showError: {
      default: false
    },
    errorMessage: [String, Error],
    showSuccess: {
      default: false
    },
    successMessage: {
      type: String,
      default: ""
    },
    fluid: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  color: #eee;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

.error-header {
  @extend .header;
  background: $vitu-danger;
}

.success-header {
  @extend .header;
  background: $vitu-green;
}
</style>
