<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="success" @closeSuccess="closeSuccess" @closeError="closeError" />
    <spinner class="spinner" v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
    <div class="container" v-else>
      <breadcrumps :breadcrumps="[{ name: $tc('worklist.worklist', 1), route: { name: 'clinical-case-list' } }, { name: existingClinicalCase ? $t('editClinicalCase') : $t('addClinicalCase') }]" />
      <div class="page-header">
        <h5 v-if="!existingClinicalCase">{{ $t("addClinicalCase") }}</h5>
        <h5 v-else>{{ $t("editClinicalCase") }}</h5>
      </div>
      <div class="page-body">
        <form autocomplete="off" ref="form" v-on:submit.prevent="onSubmit">
          <fieldset>
            <div class="form-group row">
              <label class="col-md-3 col-form-label">{{ $t("worklist.patient") }}*</label>
              <div class="col-md-9">
                <div v-if="patientCreated">
                  <input readonly class="form-control-plaintext" :value="patientName" />
                  <button type="button" class="btn btn-link" @click="patientCreated = false">{{ $t("selectAnotherPatient") }}</button>
                </div>
                <div v-else>
                  <resource-select
                    :fhirBaseUrl="fhirBaseUrl"
                    :resourceName="'Patient'"
                    :titleAttribute="patientSelector.titleAttribute"
                    :subtitleAttributes="patientSelector.subtitleAttributes"
                    :searchAttributes="patientSelector.searchAttributes"
                    :queryParams="patientSelector.queryParams"
                    :searchInputPlaceholder="$t('search')"
                    :token="token"
                    :required="true"
                    @error="handleError"
                    v-model="patient"
                  />
                  <router-link class="form-text" :to="{ name: 'patient-new', query: { redirect: 'clinical-case-new' } }"><plus-icon />{{ $t("addPatient") }}</router-link>
                </div>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="clinicalCaseNumber">{{ $t("clinicalCaseNumber") }}*</label>
              <div class="col-md-9">
                <input required id="clinicalCaseNumber" type="text" class="form-control" :placeholder="$t('clinicalCaseNumber')" v-model="clinicalCaseNumber" v-on:keyup.enter="onSubmit" />
                <small class="form-text text-muted">{{ $t("caseIdInfo") }}</small>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="diagnosis">{{ $t("worklist.diagnosis") }}*</label>
              <div class="col-md-9">
                <input required id="diagnosis" type="text" class="form-control" :placeholder="$t('worklist.diagnosis')" v-model="diagnosis" v-on:keyup.enter="onSubmit" />
                <small class="form-text text-muted">{{ $t("icd10Info") }}</small>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="status">{{ $t("worklist.status") }}*</label>
              <div class="col-md-9">
                <select required id="status" class="form-control" v-model="status">
                  <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
                  <option v-for="(status, index) in statuses" :key="status.code" :value="status">{{ index + 1 + " - " + status.display }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row" v-if="status && status.code === 'cancelled'">
              <label class="col-md-3 col-form-label" for="reasonForCancellation">{{ $t("worklist.reasonForCancellation") }}*</label>
              <div class="col-md-9">
                <select class="form-control" id="reasonForCancellation" v-model="reasonForCancellation">
                  <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
                  <option v-for="reason in reasonsForCancellation" :key="reason.code" :value="reason.code">{{ reason.display }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row" v-if="status && status.code === 'cancelled' && reasonForCancellation === 'other'">
              <label class="col-md-3 col-form-label" for="reasonForCancellationOther">{{ $t("worklist.reasonCode.other") }}*</label>
              <div class="col-md-9">
                <input required id="reasonForCancellationOther" type="text" class="form-control" :placeholder="$t('worklist.reasonCode.other')" v-model="reasonForCancellationOther" />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
      <div class="page-footer">
        <div class="spacer"></div>
        <button class="btn btn-danger btn-delete" v-if="existingClinicalCase" @click="showDeleteModal">{{ $t("worklist.deleteCase") }}</button>
        <button class="btn btn-secondary btn-cancel" @click="onCancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="onSubmit" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
      </div>
    </div>
    <b-modal id="delete-modal" okVariant="danger" :title="$t('worklist.deleteCase')" header-text-variant="danger" :okTitle="$t('worklist.deleteCase')" :cancelTitle="$t('cancel')" @ok="deleteClinicalCase">
      {{ $t("worklist.deleteCaseConfirmation", { patient: patientName }) }}
    </b-modal>
  </div>
</template>

<script>
import Spinner from "vue-simple-spinner";
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import ResourceSelect from "@/components/ui/ResourceSelect";
import { addClinicalCase, deleteClinicalCase, updateClinicalCase } from "@/api/worklist-api";
import PlusIcon from "vue-material-design-icons/Plus";
import config from "@/config/config";
import { mapState } from "vuex";
import { fetchPatient, fetchResources, mapFhirResponse, fetchResource } from "@molit/fhir-api";
import { getStringFromHumanName, getIdentifierBySystem } from "@molit/fhir-util";
import notifications from "@/mixins/notifications";
import { get } from "lodash";

export default {
  mixins: [notifications],

  data() {
    return {
      patient: null,
      clinicalCaseNumber: null,
      diagnosis: null,
      statuses: null,
      status: null,
      patientSelector: {
        searchAttributes: [
          {
            name: "Name",
            value: "name:contains"
          }
        ],
        queryParams: {
          _sort: "name",
          active: true
        },
        titleAttribute: {
          value: "name",
          type: "HumanName"
        },
        subtitleAttributes: [
          {
            name: this.$t("worklist.birthDate"),
            value: "birthDate",
            type: "Date"
          }
        ]
      },
      patientCreated: false,
      loading: true,
      task: null,
      episodeOfCare: null,
      reasonForCancellation: null,
      reasonForCancellationOther: null,
      reasonsForCancellation: []
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    existingClinicalCase() {
      return this.$route.params.id && this.$route.params.id !== "new";
    },

    saveButtonDisabled() {
      return false;
    },

    patientName() {
      if (this.patient) {
        return getStringFromHumanName(this.patient.name);
      } else {
        return "";
      }
    }
  },

  methods: {
    async onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      try {
        this.loading = true;
        if (this.existingClinicalCase) {
          await updateClinicalCase(config.FHIR_URL, this.patient, this.diagnosis, this.clinicalCaseNumber, this.status, this.task, this.episodeOfCare, this.reasonForCancellation, this.reasonForCancellationOther, this.token);
          let query = { success: "worklist.successfullyEditedCase", highlight: this.task.id };
          this.enhanceQuery(query);
          this.$router.push({ name: "clinical-case-list", query });
        } else {
          const response = await addClinicalCase(config.FHIR_URL, this.patient, this.diagnosis, this.clinicalCaseNumber, this.status, this.reasonForCancellation, this.reasonForCancellationOther, this.token);
          let query = { success: "worklist.successfullyAddedCase" };
          let location = get(response, "data.entry[1].response.location", null);
          if (location) {
            let highlight = location.split("/")[1];
            if (highlight) {
              query.highlight = highlight;
            }
          }
          this.enhanceQuery(query);
          this.$router.push({ name: "clinical-case-list", query });
        }
      } catch (e) {
        this.loading = false;
        this.handleError(e, this);
      }
    },

    async fetchClinicalCase(id) {
      try {
        this.task = (await fetchResource(this.fhirBaseUrl, "Task", id, {}, this.token)).data;
        this.reasonForCancellation = get(this.task, "extension[0].extension[0].valueCodeableConcept.coding[0].code", null);
        this.reasonForCancellationOther = get(this.task, "extension[0].extension[1].valueString", null);

        if (this.task.for && this.task.for.reference) {
          await this.fetchPatient(this.task.for.reference.split("/")[1]);
        }

        if (this.task.businessStatus && this.task.businessStatus.coding && this.task.businessStatus.coding[0] && this.task.businessStatus.coding[0].code) {
          this.status = this.getStatusByCode(this.task.businessStatus.coding[0].code);
        }

        if (this.task.input && this.task.input[0] && this.task.input[0].valueReference && this.task.input[0].valueReference.reference) {
          let episodeOfCareId = this.task.input[0].valueReference.reference.split("/")[1];
          this.episodeOfCare = (await fetchResource(this.fhirBaseUrl, "EpisodeOfCare", episodeOfCareId, {}, this.token)).data;
          if (this.episodeOfCare && this.episodeOfCare.diagnosis && this.episodeOfCare.diagnosis[0] && this.episodeOfCare.diagnosis[0].condition && this.episodeOfCare.diagnosis[0].condition.display) {
            this.diagnosis = this.episodeOfCare.diagnosis[0].condition.display;
          }
          if (this.episodeOfCare && this.episodeOfCare.identifier) {
            const identifier = getIdentifierBySystem(this.episodeOfCare.identifier, "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care");
            if (identifier) {
              this.clinicalCaseNumber = identifier.value;
            }
          }
        }
      } catch (e) {
        this.loading = false;
        this.handleError(e, this);
      }
    },

    async fetchReasonsForCancellation() {
      try {
        const response = await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/ValueSet/tumorboard-cancellation-reason" });
        const entries = mapFhirResponse(response);
        if (entries && entries.length) {
          this.reasonsForCancellation = entries[0].compose.include[0].concept;
        }
      } catch (e) {
        this.loading = false;
        this.handleError(e, this);
      }
    },

    async fetchPatient(id) {
      try {
        this.patient = (await fetchPatient(this.fhirBaseUrl, id, {}, this.token)).data;
        this.patientCreated = true;
      } catch (e) {
        this.loading = false;
        this.handleError(e, this);
      }
    },

    async fetchStatuses() {
      try {
        const valueSet = mapFhirResponse(await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/ValueSet/vitu-workinglist" }, this.token))[0];
        if (!valueSet) {
          throw new Error("ValueSet 'vitu-worklist' not found on server.");
        }
        this.statuses = valueSet.compose.include[0].concept;
      } catch (e) {
        this.loading = false;
        this.handleError(e);
      }
    },

    async deleteClinicalCase() {
      try {
        this.loading = true;
        let episodeOfCareId;
        if (this.episodeOfCare) {
          episodeOfCareId = this.episodeOfCare.id;
        } else {
          episodeOfCareId = undefined;
        }
        await deleteClinicalCase(this.fhirBaseUrl, episodeOfCareId, this.task.id, this.token);
        let query = { success: "worklist.deleteSuccessful" };
        this.$router.push({ name: "clinical-case-list", query: this.enhanceQuery(query) });
      } catch (e) {
        this.loading = false;
        this.handleError(e);
      }
    },

    getStatusByCode(code) {
      if (!code || !this.statuses) {
        return null;
      }

      return this.statuses.find(s => s.code === code);
    },

    enhanceQuery(query) {
      if (this.status && this.status.code === "cancelled") {
        query.tab = "cancelled";
      } else if (this.status && this.status.code === "finalized") {
        query.tab = "completed";
      }
      return query;
    },

    showDeleteModal() {
      this.$bvModal.show("delete-modal");
    },

    onCancel() {
      this.$router.push({ name: "clinical-case-list", query: this.enhanceQuery({}) });
    }
  },

  async mounted() {
    if (this.$route.query.success) {
      this.success = this.$t(this.$route.query.success);
    }

    await this.fetchStatuses();
    await this.fetchReasonsForCancellation();

    if (this.existingClinicalCase) {
      await this.fetchClinicalCase(this.$route.params.id);
    } else if (this.$route.query.patientId) {
      await this.fetchPatient(this.$route.query.patientId);
    }
    this.loading = false;
  },

  components: {
    Breadcrumps,
    NotificationPanels,
    PlusIcon,
    ResourceSelect,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.btn-cancel,
.btn-delete {
  margin-right: 0.5rem;
}

.btn-link {
  padding: 0;
}

.spinner {
  margin-top: 1rem;
}
</style>
