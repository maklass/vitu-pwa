import { handleAxiosError } from "@/util/error-util";

export default {
  data() {
    return {
      error: null,
      showError: false,
      warning: null,
      showWarning: false,
      success: null,
      showSuccess: false,
      notificationTimeout: 500
    };
  },

  methods: {
    closeError() {
      this.showError = false;
      setTimeout(() => (this.error = null), this.notificationTimeout);
    },

    closeWarning() {
      this.showWarning = false;
      setTimeout(() => (this.warning = null), this.notificationTimeout);
    },

    closeSuccess() {
      this.showSuccess = false;
      setTimeout(() => (this.success = null), this.notificationTimeout);
    },

    handleError(error, isFhirRequest) {
      if (isFhirRequest && error.message === "Network Error") {
        this.warning = this.$t("error.clinicalDataNotAvailable");
      } else {
        this.error = handleAxiosError(error, this);
      }
      window.scrollTo(0, 0);
    }
  },

  watch: {
    error(newValue) {
      if (newValue) {
        this.showError = true;
      }
    },

    warning(newValue) {
      if (newValue) {
        this.showWarning = true;
      }
    },

    success(newValue) {
      if (newValue) {
        this.showSuccess = true;
      }
    }
  }
};
