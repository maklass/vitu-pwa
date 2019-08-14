<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="showSuccess" :successMessage="$t('admin.saveSuccessful')" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.conferenceSettings') }]" />
      <div class="admin-header">
        <h5 class="headline">{{ $t("admin.conferenceSettings") }}</h5>
      </div>
      <div class="admin-body">
        <spinner v-if="!settings && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="settings">
          <form @submit.prevent="save" ref="form">
            <div class="form-group row">
              <label for="bitrate" class="col-md-3 col-form-label">{{ $t("admin.bitrate") }}</label>
              <div class="col-md-9">
                <select class="form-control" id="aspect-ratio" v-model="settings.bitrate">
                  <option v-for="bitrate in bitrates" :key="bitrate.value" :value="bitrate.value">{{ $t(`admin.bitrates.${bitrate.display}`) }} {{ bitrate.value !== 0 ? `(${bitrate.value} kbit/s)` : "" }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row">
              <label for="aspect-ratio" class="col-md-3 col-form-label">{{ $t("admin.aspectRatio") }}</label>
              <div class="col-md-9">
                <select class="form-control" id="aspect-ratio" v-model="settings.aspectRatio">
                  <option v-for="aspectRatio in aspectRatios" :key="aspectRatio.value" :value="aspectRatio.value">{{ aspectRatio.display }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row">
              <label for="cutVideoStreams" class="col-md-3 col-form-label">{{ $t("admin.cutVideoStreams") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="cutVideoStreams" v-model="settings.cutVideoStreams" />
              </div>
            </div>
            <hr />
            <div class="form-group row">
              <label for="persistentRoomEnabled" class="col-md-3 col-form-label">{{ $t("admin.persistentRoomEnabled") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="persistentRoomEnabled" v-model="settings.persistentRoomEnabled" />
              </div>
            </div>
            <div class="form-group row">
              <label for="persistentRoomName" class="col-md-3 col-form-label">{{ $t("admin.persistentRoomName") }}</label>
              <div class="col-md-9">
                <input type="text" :maxlength="maxLengthConferenceName" class="form-control" id="persistentRoomName" :placeholder="$t('admin.persistentRoomName')" v-model.number="settings.persistentRoomName" />
              </div>
            </div>
            <hr />
            <div class="form-group row">
              <label for="showDateTimeInTitle" class="col-md-3 col-form-label">{{ $t("admin.showDateTimeInTitle") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="showDateTimeInTitle" v-model="settings.showDateTimeInTitle" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="admin-footer">
        <div class="spacer"></div>
        <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import config from "@/config/config";
import aspectRatios from "@/model/aspect-ratios";
import bitrates from "@/model/bitrates";
import { handleAxiosError } from "@/util/error-util";

import Spinner from "vue-simple-spinner";
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      showSuccess: false,
      error: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles,
      settings: state => state.settings.conferenceSettings
    }),

    aspectRatios() {
      return aspectRatios;
    },

    bitrates() {
      return bitrates;
    },

    maxLengthConferenceName() {
      return config.MAX_LENGTH_CONFERENCE_NAME;
    }
  },

  methods: {
    ...mapActions(["updateConferenceSettings"]),

    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    },

    onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        // Try focus on the error
        this.$refs.form.reportValidity();
        return;
      }
      this.save();
    },

    async save() {
      this.showSuccess = false;
      try {
        let settings = Object.assign({}, config.DEFAULT_CONFERENCE_SETTINGS, this.settings);
        await this.updateConferenceSettings({ token: this.token, settings });
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  components: {
    Breadcrumps,
    NotificationPanels,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.active-container {
  display: flex;
  align-items: center;
}
</style>
