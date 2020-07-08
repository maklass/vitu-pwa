<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="$t('admin.saveSuccessful')" @closeSuccess="closeSuccess" @closeError="closeError" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.conferenceSettings') }]" />
      <div class="page-header">
        <h5 class="headline">{{ $t("admin.conferenceSettings") }}</h5>
      </div>
      <div class="page-body">
        <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="settings && !loading">
          <form @submit.prevent="save" ref="form" autocomplete="off">
            <div class="form-group row">
              <label for="showVideo" class="col-md-3 col-form-label">{{ $t("showVideo") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="showVideo" v-model="settings.showVideo" />
              </div>
            </div>
            <div class="form-group row">
              <label for="bitrate" class="col-md-3 col-form-label">{{ $t("admin.bitrate") }}</label>
              <div class="col-md-9">
                <select class="form-control" id="bitrate" v-model="settings.bitrate">
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
            <div class="form-group row">
              <label for="maxNumberOfVideos" class="col-md-3 col-form-label">{{ $t("maxNumberOfVideos") }}</label>
              <div class="col-md-9">
                <input type="number" min="0" step="1" class="form-control" id="maxNumberOfVideos" :placeholder="$t('maxNumberOfVideos')" v-model.number="settings.maxNumberOfVideos" />
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
                <input type="text" :maxlength="maxLengthConferenceName" class="form-control" id="persistentRoomName" :placeholder="$t('admin.persistentRoomName')" v-model="settings.persistentRoomName" />
              </div>
            </div>
            <hr />
            <div class="form-group row">
              <label for="showDateTimeInTitle" class="col-md-3 col-form-label">{{ $t("admin.showDateTimeInTitle") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="showDateTimeInTitle" v-model="settings.showDateTimeInTitle" />
              </div>
            </div>
            <hr />
            <div class="form-group row">
              <label for="turnUrl" class="col-md-3 col-form-label">{{ $t("admin.turnUrl") }}</label>
              <div class="col-md-9">
                <input type="text" class="form-control" id="turnUrl" :placeholder="$t('admin.turnUrl')" v-model="settings.turnUrl" />
              </div>
            </div>
            <div class="form-group row">
              <label for="turnUser" class="col-md-3 col-form-label">{{ $t("admin.turnUser") }}</label>
              <div class="col-md-9">
                <input type="text" class="form-control" id="turnUser" autocomplete="off" :placeholder="$t('admin.turnUser')" v-model="settings.turnUser" />
              </div>
            </div>
            <div class="form-group row">
              <label for="turnSecret" class="col-md-3 col-form-label">{{ $t("admin.turnSecret") }}</label>
              <div class="col-md-9">
                <input type="password" autocomplete="new-password" class="form-control" id="turnSecret" :placeholder="$t('admin.turnSecret')" v-model="settings.turnSecret" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="page-footer">
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
import notifications from "@/mixins/notifications";

import Spinner from "vue-simple-spinner";
import { mapActions, mapState } from "vuex";

export default {
  mixins: [notifications],

  data() {
    return {
      showSuccess: false,
      loading: false
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

    onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }
      this.save();
    },

    async save() {
      this.showSuccess = false;
      this.loading = true;
      try {
        let settings = Object.assign({}, config.DEFAULT_CONFERENCE_SETTINGS, this.settings);
        await this.updateConferenceSettings({ token: this.token, settings });
        this.showSuccess = true;
        this.loading = false;
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      } catch (e) {
        this.handleError(e);
        this.loading = false;
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
