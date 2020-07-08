<template>
  <div>
    <spinner class="spinner mt-2" v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
    <div v-else>
      <div class="case-overview">
        <div class="menu">
          <div class="menu-header">
            <h5>{{ $t("caseOverview") }}</h5>
          </div>
          <ul class="nav flex-column">
            <li class="nav-item">
              <button :class="['btn btn-link nav-link', { 'font-weight-bold': tabIndex === 0 }]" @click="goToTab(0)">{{ $t("planner.patientInformation") }}</button>
              <ul v-if="tabIndex === 0" class="submenu">
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-patient">{{ $tc("worklist.patient") }}</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-inclusion-criteria">{{ $tc("inclusionCriteria") }}</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-diagnosis">{{ $tc("worklist.diagnosis") }}</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-diagnostics">{{ $tc("performedDiagnostics") }}</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-previous-therapies">{{ $tc("previousTherapies") }}</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-documents">{{ $tc("document", 2) }}</a>
                </li>
                <!-- <li class="nav-item">
                  <a class="nav-link" href="#anchor-consent">{{ $tc("consent") }}</a>
                </li> -->
                <li class="nav-item">
                  <a class="nav-link" href="#anchor-further-information">{{ $tc("furtherInformation") }}</a>
                </li>
              </ul>
            </li>
            <li class="nav-item">
              <button :class="['btn btn-link nav-link', { 'font-weight-bold': tabIndex === 1 }]" @click="goToTab(1)">{{ $t("molecularDiagnostic") }}</button>
            </li>
            <li class="nav-item">
              <button :class="['btn btn-link nav-link', { 'font-weight-bold': tabIndex === 2 }]" @click="goToTab(2)">
                {{ $t("planner.comments") }} <span class="badge badge-primary">{{ commentsTotal }}</span>
              </button>
            </li>
            <li class="nav-item">
              <button :class="['btn btn-link nav-link', { 'font-weight-bold': tabIndex === 3 }]" @click="goToTab(3)">{{ $t("planner.therapyRecommendation") }}</button>
            </li>
            <li class="nav-item">
              <button :class="['btn btn-link nav-link', { 'font-weight-bold': tabIndex === 4 }]" @click="goToTab(4)">{{ $t("worklist.status") }}</button>
            </li>
          </ul>
        </div>
        <div class="main">
          <div class="container">
            <div class="page-header">
              <div class="row spacer" v-if="patient">
                <!-- <h5>{{ $t("caseOverview") }}</h5> -->
                <div class="col-md-3">
                  <strong>{{ $t("name") }}:</strong> {{ patientLastName }}, {{ patientFirstName }}
                </div>
                <div class="col-md-3">
                  <strong>{{ $t("worklist.birthDate") }}:</strong> {{ $d(new Date(patient.birthDate)) }}
                </div>
                <div class="col-md-2">
                  <strong>{{ $t("fhir.gender") }}:</strong> {{ $t(patient.gender) }}
                </div>
                <div class="col-md-4">
                  <strong>{{ $t("worklist.diagnosis") }}:</strong> {{ conditionString }}
                </div>
              </div>
            </div>
            <div class="page-body">
              <b-tabs fill v-model="tabIndex">
                <b-tab>
                  <template slot="title">
                    {{ $t("planner.patientInformation") }}
                  </template>
                  <patient-information :resources="patientEverything" :task="task" :biomarkerList="biomarkerList"></patient-information>
                </b-tab>
                <b-tab>
                  <template slot="title">{{ $t("molecularDiagnostic") }}</template>
                  <results :reportId="'413'"></results>
                </b-tab>
                <b-tab>
                  <template slot="title">
                    {{ $t("planner.comments") }} <span class="badge badge-primary">{{ commentsTotal }}</span>
                  </template>
                  <comments @updateCommentsTotal="onUpdateCommentsTotal" @error="onError" :patientId="patient ? patient.id : ''" :episodeOfCareId="episodeOfCare ? episodeOfCare.id : ''"></comments>
                </b-tab>
                <b-tab :title="$t('planner.therapyRecommendation')" v-if="isModerator || isFreigeber">
                  <therapy-recommendation :episodeOfCare="episodeOfCare"></therapy-recommendation>
                </b-tab>
                <b-tab :title="$t('worklist.status')" v-if="isModerator || isFreigeber">
                  <case-options :task="task" :statuses="statuses" :reasonsForCancellation="reasonsForCancellation" @updateTask="updateTask"></case-options>
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CaseOptions from "./moderator/CaseOptions";
import Comments from "./moderator/Comments";
import PatientInformation from "./moderator/PatientInformation";
import Results from "./moderator/Results";
import Spinner from "vue-simple-spinner";
import TherapyRecommendation from "./moderator/TherapyRecommendation";
import { fetchResource, fetchByUrl, mapFhirResponse } from "@molit/fhir-api";
import { fetchStatuses, fetchReasonsForCancellation, updateTask } from "@/api/worklist-api";
import config from "@/config/config";
import { get } from "lodash";
import { mapState } from "vuex";
import roles from "@/model/roles";

export default {
  props: {
    caseId: {
      type: [String, Number]
    }
  },

  data() {
    return {
      biomarkerList: null,
      patientEverything: null,
      task: null,
      episodeOfCare: null,
      loading: true,
      statuses: null,
      reasonsForCancellation: null,
      tabIndex: 0,
      commentsTotal: 0
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      keycloak: state => state.authentication.keycloak
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    patient() {
      if (!this.patientEverything) {
        return null;
      }
      return this.patientEverything.find(resource => resource.resourceType === "Patient");
    },

    patientFirstName() {
      return get(this.patient, "name[0].given[0]", "");
    },

    patientLastName() {
      return get(this.patient, "name[0].family", "");
    },

    conditionString() {
      if (!this.patientEverything) {
        return "-";
      }
      const condition = this.patientEverything.find(resource => resource.resourceType === "Condition");
      return get(condition, "code.coding[0].code", "") + " - " + get(condition, "code.coding[0].display", "").split("|")[0];
    },

    isModerator() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.MODERATOR);
      } else {
        return false;
      }
    },

    isFreigeber() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.FREIGEBER);
      } else {
        return false;
      }
    }
  },

  methods: {
    async fetchResources() {
      try {
        if (this.caseId) {
          this.task = (await fetchResource(this.fhirBaseUrl, "Task", this.caseId, {}, this.token)).data;
        }

        if (this.task.for && this.task.for.reference) {
          this.patientEverything = mapFhirResponse(await fetchByUrl(`${this.fhirBaseUrl}/Patient/${this.task.for.reference.split("/")[1]}/$everything?_count=1000`, {}, this.token));
        }

        if (this.task.input && this.task.input[0] && this.task.input[0].valueReference && this.task.input[0].valueReference.reference) {
          this.episodeOfCare = (await fetchResource(this.fhirBaseUrl, "EpisodeOfCare", this.task.input[0].valueReference.reference.split("/")[1], {}, this.token)).data;
        }

        this.statuses = await fetchStatuses(this.fhirBaseUrl, this.token);
        this.reasonsForCancellation = await fetchReasonsForCancellation(this.fhirBaseUrl, this.token);
        await this.fetchBiomarkerList();

        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.$emit("error", e);
      }
    },

    onError(e) {
      this.$emit("error", e);
    },

    resetResources() {
      this.patientEverything = null;
      this.episodeOfCare = null;
      this.task = null;
    },

    async fetchBiomarkerList() {
      const response = await fetchByUrl(`${config.FHIR_URL}/ValueSet?url=http://molit.eu/fhir/vitu/ValueSet/biomarker-vitu-registration`, null, this.token);
      const valueSet = mapFhirResponse(response)[0];

      if (!valueSet) {
        throw new Error("ValueSet 'biomarkers' not found on server.");
      }

      this.biomarkerList = get(valueSet, "compose.include[0].concept", []);

      this.biomarkerList.forEach(biomarker => {
        if (biomarker.code === "C36318") {
          this.$set(biomarker, "result", { system: "https://molit.eu/fhir/vitu/CodeSystem/outcomes/msi", code: "C17998", display: "Unknown" });
        } else {
          this.$set(biomarker, "result", { system: "https://molit.eu/fhir/vitu/CodeSystem/outcomes", code: "LA4489-6", display: "Unknown" });
        }
      });
    },

    async updateTask(task, status, reasonForCancellation, reasonForCancellationOther) {
      try {
        const tabIndex = this.tabIndex;
        this.loading = true;
        this.task = (await updateTask(this.fhirBaseUrl, this.token, task, status, reasonForCancellation, reasonForCancellationOther)).data;
        this.loading = false;
        this.tabIndex = tabIndex;
      } catch (e) {
        this.loading = false;
        this.$emit("error", e);
      }
    },

    goToTab(index) {
      this.tabIndex = index;
    },

    onUpdateCommentsTotal(commentsTotal) {
      this.commentsTotal = commentsTotal;
    }
  },

  mounted() {
    this.fetchResources();
  },

  watch: {
    caseId() {
      this.loading = true;
      this.resetResources();
      this.fetchResources();
    }
  },

  components: {
    CaseOptions,
    Comments,
    PatientInformation,
    Results,
    Spinner,
    TherapyRecommendation
  }
};
</script>

<style lang="scss" scoped>
.patient-information {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.case-overview {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.menu {
  min-width: 260px;
  width: 260px;
  border-left: 1px solid $border-color;
  border-right: 1px solid $border-color;
  position: fixed;
  top: $navbar-height;
  height: calc(100vh - #{$navbar-height});
  background: lighten($vitu-background, 4.5%);

  .nav-link {
    padding: 0.2rem 1rem;
  }

  .submenu {
    list-style: none;
    padding-left: 1rem;
    padding-bottom: 0.15rem;

    .nav-link {
      padding: 0.05rem 1rem;
    }
  }

  .menu-header {
    padding-left: 1rem;
    display: flex;
    align-items: center;
    height: 3.6rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    margin-bottom: 0.5rem;

    h5 {
      margin-bottom: 0;
    }
  }
}

.main {
  margin-left: 260px;
  flex: 1;
}

.btn-link.nav-link {
  text-align: left;
}
</style>
