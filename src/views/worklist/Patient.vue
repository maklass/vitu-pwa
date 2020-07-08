<template>
  <div>
    <notification-panels
      :showError="showError"
      :errorMessage="error"
      :showWarning="showWarning"
      :warning="warning"
      :showSuccess="showSuccess"
      :successMessage="success"
      @closeSuccess="closeSuccess"
      @closeWarning="closeWarning"
      @closeError="closeError"
    />
    <div class="container">
      <breadcrumps
        :breadcrumps="[
          { name: $tc('worklist.patient', 2), route: { name: 'patients' } },
          { name: $t('worklist.patientDetails'), route: { name: 'patient' } }
        ]"
      />
      <spinner class="spinner" v-if="spinner.loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      <div class="page-header" v-if="!spinner.loading">
        <h5 class="headline">{{ $tc("worklist.patient", 1) }}</h5>
        <div class="spacer"></div>
        <router-link v-if="patient && isAdmin" class="btn" :to="{ name: 'patient-edit', params: { id: patient.id }, query: { redirect: 'patient' } }"><edit-icon class="icon"></edit-icon></router-link>
      </div>
      <div class="page-body" v-if="!spinner.loading">
        <div class="main">
          <form autocomplete="off" ref="form" v-on:submit.prevent="onSubmit" v-if="!spinner.loading">
            <fieldset>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="patientId">{{ $t("patientId") }}</label>
                <div class="col-md-9">
                  <div>
                    <input type="text" class="form-control" :placeholder="$t('patientId')" id="patientId" disabled v-if="patient" v-model="patientId" />
                  </div>
                  <small class="form-text text-muted">{{ $t("patientIdInfo") }}</small>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="firstName">{{ $t("firstName") }}</label>
                <div class="col-md-9">
                  <div>
                    <input disabled id="firstName" type="text" class="form-control" :placeholder="$t('firstName')" v-if="patient && patient.name" v-model="patient.name[0].given[0]" />
                  </div>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="lastName">{{ $t("lastName") }}</label>
                <div class="col-md-9">
                  <div>
                    <input v-if="patient && patient.name" disabled id="lastName" type="text" class="form-control" :placeholder="$t('lastName')" v-model="patient.name[0].family" />
                  </div>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="birthDate">{{ $t("worklist.birthDate") }}</label>
                <div class="col-md-3">
                  <div>
                    <input v-if="patient && patient.birthDate" disabled id="birthDate" type="text" class="form-control" :placeholder="$t('worklist.birthDate')" v-model="birthDate" />
                  </div>
                </div>
                <label class="col-md-3 col-form-label" for="gender">{{ $t("sex") }}</label>
                <div class="col-md-3">
                  <select disabled id="gender" type="date" class="form-control" :placeholder="$t('sex')" v-model="patient.gender" v-on:keyup.enter="onSubmit">
                    <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
                    <option value="male">{{ $t("male") }}</option>
                    <option value="female">{{ $t("female") }}</option>
                    <option value="other">{{ $t("diverse") }}</option>
                    <option value="unknown">{{ $t("unknown") }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="lastName">{{ $t("worklist.caseId") }}*</label>
                <div class="col-md-9">
                  <input disabled id="caseId" type="text" class="form-control" :placeholder="$t('worklist.caseId')" v-model="caseId" v-on:keyup.enter="onSubmit" />
                  <small class="form-text text-muted">{{ $t("caseIdInfo") }}</small>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="organization">{{ $t("organization") }}*</label>
                <div class="col-md-9">
                  <input disabled id="organization" type="text" class="form-control" :placeholder="$t('organization')" :value="organization" />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div class="page-footer" v-if="!spinner.loading && patient && showCaseRegistrationButton">
        <div class="spacer"></div>
        <router-link class="btn btn-primary" :to="{ name: 'clinical-case-new', query: { patientId: patient.id } }">{{ $t("registerCase") }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import editIcon from "vue-material-design-icons/Pencil";
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import { getPatient } from "@/api/worklist-api";
import Spinner from "vue-simple-spinner";
import config from "@/config/config";
import moment from "moment";
import { mapState } from "vuex";
import roles from "@/model/roles";
import * as fhirApi from "@molit/fhir-api";

export default {
  mixins: [notifications],

  components: {
    editIcon,
    Breadcrumps,
    NotificationPanels,
    Spinner
  },

  data() {
    return {
      patientId: null,
      birthDate: null,
      patient: null,
      caseId: null,
      showSuccess: false,
      success: null,
      spinner: { loading: false },
      error: null,
      edit: false,
      task: null,
      showCaseRegistrationButton: false
    };
  },

  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    ...mapState({
      token: state => state.authentication.keycloak.token,
      keycloak: state => state.authentication.keycloak
    }),

    isAdmin() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.ADMINISTRATOR);
      } else {
        return false;
      }
    },

    organization() {
      if (this.patient && this.patient.managingOrganization) {
        return this.patient.managingOrganization.display;
      }
      return "-";
    }
  },

  methods: {
    /**
     * Formats the given Date
     */
    formatDate(date) {
      return moment(date).format("DD.MM.YYYY");
    },
    /**
     * Returns the Identifierobject
     */
    getIdentifier() {
      if (this.patient && this.patient.identifier && this.patient.identifier.length !== 0) {
        for (let i = 0; i < this.patient.identifier.length; i++) {
          if (this.patient.identifier[i].system === "molit/testsystem") {
            return this.patient.identifier[i].value;
          }
        }
      }
      return null;
    }
  },

  mounted() {
    if (this.$route.query.success) {
      this.showSuccess = true;
      this.success = this.$t(this.$route.query.success);
    }
  },

  async created() {
    try {
      this.spinner.loading = true;
      let response = await getPatient(this.fhirBaseUrl, this.$route.params.id, {}, this.token);
      this.patient = response.data;
      this.patientId = this.getIdentifier();
      this.birthDate = this.formatDate(this.patient.birthDate);

      let url = this.fhirBaseUrl + "/EpisodeOfCare?patient=Patient/" + this.patient.id;
      let responseEpisodeOfCare = await fhirApi.fetchByUrl(url);
      let entries = responseEpisodeOfCare.data.entry;
      if (entries && entries.length && entries[0].resource && entries[0].resource.identifier) {
        this.caseId = entries[0].resource.identifier[0].value;
      }

      if (this.caseId) {
        this.task = fhirApi.mapFhirResponse(await fhirApi.fetchResources(this.fhirBaseUrl, "Task", { subject: "Patient/" + this.$route.params.id }, this.token))[0];

        if (this.task && this.task.businessStatus && this.task.businessStatus.text === "Neu") {
          this.showCaseRegistrationButton = true;
        }
      }

      setTimeout(() => {
        this.spinner.loading = false;
      }, 200);
    } catch (error) {
      this.spinner.loading = false;
      this.handleError(error);
    }
  }
};
</script>

<style lang="scss" scoped>
.spinner {
  padding-top: 15px;
}
.icon {
  color: $vitu-green;
}
</style>
