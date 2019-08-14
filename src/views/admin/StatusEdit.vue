<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="false" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.statusList'), route: { name: 'statuses' } }, { name: $t('worklist.status') }]" />
      <div class="admin-header">
        <h5 v-if="!isExistingStatus">{{ $t("admin.addStatus") }}</h5>
        <h5 v-else>{{ $t("admin.editStatus") }}</h5>
      </div>
      <div class="admin-body">
        <div v-if="status">
          <div class="form-group row">
            <label for="description" class="col-md-2 col-form-label">{{ $t("admin.description") }}</label>
            <div class="col-md-10">
              <input type="text" class="form-control" id="description" readonly :placeholder="$t('admin.description')" :value="$t(`worklist.statusCode.${status.description}`)" />
            </div>
          </div>
          <div class="form-group row">
            <label for="active" class="col-sm-2 col-form-label">{{ $t("admin.active") }}</label>
            <div class="col-sm-10 active-container">
              <input type="checkbox" id="active" v-model="statusActive" />
            </div>
          </div>
        </div>
        <spinner v-if="!status && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      </div>
      <div class="admin-footer">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel" @click="cancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="save" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getStatusById, updateStatus } from "@/api/process-api";
import Spinner from "vue-simple-spinner";

import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { handleAxiosError } from "@/util/error-util";

export default {
  data() {
    return {
      status: null,
      error: null,
      changed: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    statusActive: {
      get() {
        if (this.status) {
          return !this.status.disabled;
        }
      },
      set(value) {
        this.status.disabled = !value;
        this.changed = true;
      }
    },

    isExistingStatus() {
      return this.$route.params.id && this.$route.params.id !== "new";
    },

    saveButtonDisabled() {
      return !this.changed || this.error;
    }
  },

  methods: {
    cancel() {
      this.$router.push({ name: "statuses" });
    },

    async save() {
      if (this.isExistingStatus) {
        try {
          await updateStatus(this.status, this.token);
          this.$router.push({ name: "statuses", query: { success: true } });
        } catch (e) {
          this.error = handleAxiosError(e, this);
        }
      }
    }
  },

  async mounted() {
    if (this.isExistingStatus) {
      try {
        this.status = (await getStatusById(this.$route.params.id, this.token)).data;
      } catch (e) {
        this.error = handleAxiosError(e, this);
      }
    } else {
      this.status = {
        description: null,
        icon: null,
        orderNumber: null
      };
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

.btn-cancel {
  margin-right: 0.5rem;
}
</style>
