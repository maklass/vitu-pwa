<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="success" @closeSuccess="closeSuccess" @closeError="closeError" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.statusList'), route: { name: 'statuses' } }, { name: $t('worklist.status') }]" />
      <div class="page-header">
        <h5 v-if="!isExistingStatus">{{ $t("admin.addStatus") }}</h5>
        <h5 v-else>{{ $t("admin.editStatus") }}</h5>
      </div>
      <div class="page-body">
        <div v-if="status && !loading">
          <form @submit.prevent="save" ref="form" autocomplete="off">
            <div class="form-group row">
              <label for="description" class="col-md-3 col-form-label">{{ $t("admin.description") }}</label>
              <div class="col-md-9">
                <input type="text" required class="form-control" id="description" :placeholder="$t('admin.description')" v-model="status.display" />
              </div>
            </div>
            <div class="form-group row">
              <label for="active" class="col-md-3 col-form-label">{{ $t("admin.active") }}</label>
              <div class="col-md-9 active-container">
                <input type="checkbox" id="active" v-model="statusActive" />
              </div>
            </div>
          </form>
        </div>
        <spinner v-if="(loading || !status) && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      </div>
      <div class="page-footer">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel" @click="cancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" :disabled="error" @click="save">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Spinner from "vue-simple-spinner";

import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import config from "@/config/config";
import { fetchResources, mapFhirResponse, updateResource } from "@molit/fhir-api";
import { statusTemplate } from "@/templates/fhir-templates";
import { cloneDeep } from "lodash";

export default {
  mixins: [notifications],

  data() {
    return {
      status: null,
      statuses: null,
      changed: false,
      valueSet: null,
      codeSystem: null,
      loading: false,
      statusActive: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    isExistingStatus() {
      return this.$route.params.id && this.$route.params.id !== "new-status";
    }
  },

  methods: {
    cancel() {
      this.$router.push({ name: "statuses" });
    },

    async fetchStatuses() {
      try {
        this.valueSet = mapFhirResponse(await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist" }, this.token))[0];
        this.codeSystem = mapFhirResponse(await fetchResources(config.FHIR_URL, "CodeSystem", { url: "http://molit.eu/fhir/vitu/CodeSystem/vitu-workinglist" }, this.token))[0];
        if (!this.valueSet) {
          throw new Error("ValueSet 'vitu-worklist' not found on server.");
        }
        if (!this.codeSystem) {
          throw new Error("CodeSystem 'vitu-worklist' not found on server.");
        }
        this.statuses = this.valueSet.compose.include[0].concept;
      } catch (e) {
        this.loading = false;
        this.handleError(e);
      }
    },

    async save() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      try {
        this.loading = true;
        if (this.isExistingStatus) {
          const statusValueSet = this.statuses.find(s => s.code === this.$route.params.id);
          const statusCodeSystem = this.codeSystem.concept.find(s => s.code === this.$route.params.id);
          statusCodeSystem.display = this.status.display;
          if (this.statusActive) {
            if (!statusValueSet) {
              this.status.extension = cloneDeep(statusTemplate.extension);
              this.status.extension[0].valueDecimal = this.statuses.length;
              this.statuses.push(this.status);
            } else {
              statusValueSet.display = this.status.display;
            }
          } else {
            if (statusValueSet) {
              this.valueSet.compose.include[0].concept = this.statuses.filter(s => s.code !== statusValueSet.code);
              this.valueSet.compose.include[0].concept.forEach((status, index) => (status.extension[0].valueDecimal = index));
            }
          }
          await updateResource(config.FHIR_URL, this.codeSystem, this.token);
          await updateResource(config.FHIR_URL, this.valueSet, this.token);
        } else {
          this.status.code = this.status.display.replace(/\s+/g, "-").toLocaleLowerCase();
          const statusCodeSystem = cloneDeep(this.status);
          delete statusCodeSystem.extension;
          this.codeSystem.concept.push(statusCodeSystem);
          await updateResource(config.FHIR_URL, this.codeSystem, this.token);
          if (this.statusActive) {
            this.status.extension[0].valueDecimal = this.statuses.length;
            this.statuses.push(this.status);
            await updateResource(config.FHIR_URL, this.valueSet, this.token);
          }
        }
        this.$router.push({ name: "statuses", query: { success: true } });
      } catch (e) {
        this.loading = false;
        if (e && e.response && e.response.status === 500) {
          this.error = this.$t("admin.statusAlreadyExists");
        } else {
          this.handleError(e);
        }
      }
    }
  },

  async mounted() {
    await this.fetchStatuses();
    if (this.isExistingStatus) {
      try {
        let status = this.statuses.find(s => s.code === this.$route.params.id);
        if (!status) {
          status = this.codeSystem.concept.find(s => s.code === this.$route.params.id);
          this.statusActive = false;
        } else {
          this.statusActive = true;
        }
        if (!status) {
          throw new Error("Status could not be found.");
        }
        this.status = cloneDeep(status);
      } catch (e) {
        this.handleError(e);
      }
    } else {
      this.status = cloneDeep(statusTemplate);
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
