<template>
  <div class="notification-panels">
    <div :class="['error-header', { 'header-hidden': !showError }]">
      <div :class="[{ container: !fluid, 'container-fluid': fluid }]">
        <div class="row">
          <div class="col align-self-center">
            <strong>{{ $t("error.errorOccurred") }}:</strong> {{ errorMessage }}
          </div>
          <div class="col-md-auto">
            <span class="close-icon" @click="$emit('closeError')">×</span>
          </div>
        </div>
      </div>
    </div>
    <div :class="['warning-header', { 'header-hidden': !showWarning }]">
      <div :class="[{ container: !fluid, 'container-fluid': fluid }]">
        <div class="row">
          <div class="col align-self-center">
            <strong>{{ $t("hint") }}:</strong> {{ warning }}
          </div>
          <div class="col-md-auto">
            <span class="close-icon" @click="$emit('closeWarning')">×</span>
          </div>
        </div>
      </div>
    </div>
    <div :class="['success-header', { 'header-hidden': !showSuccess }]">
      <div :class="[{ container: !fluid, 'container-fluid': fluid }]">
        <div class="row">
          <div class="col align-self-center">
            {{ successMessage }}
          </div>
          <div class="col-md-auto">
            <span class="close-icon" @click="$emit('closeSuccess')">×</span>
          </div>
        </div>
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
    showWarning: {
      default: false
    },
    warning: {
      type: String,
      default: ""
    },
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
  transition: max-height 0.3s ease;
  max-height: 2000px;
  overflow: hidden;

  &.header-hidden {
    max-height: 0;
  }

  .container,
  .container-fluid {
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
  }
}

.error-header {
  @extend .header;
  background: $vitu-danger;
}

.warning-header {
  @extend .header;
  background: $vitu-warning;
  color: $vitu-text;
}

.success-header {
  @extend .header;
  background: $vitu-green;
}

.close-icon {
  font-size: 1.2rem;
  cursor: pointer;
  font-weight: bold;
}

.notification-panels {
  overflow: hidden;
}
</style>
