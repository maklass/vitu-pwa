<template>
  <div>
    <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
    <div v-if="!loading">
      <form autocomplete="off" ref="addCaseForm" v-on:submit.prevent="submit">
        <fieldset>
          <div class="form-group">
            <label>{{ $tc("worklist.patient", 1) }}*</label>
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
              @update="onPatientSelectorUpdate"
            />
          </div>
          <div class="form-group">
            <label for="diagnoseOfTumor">{{ $t("worklist.diagnosis") }}*</label>
            <input required id="diagnoseOfTumor" type="text" class="form-control" :placeholder="$t('worklist.diagnosis')" v-model="diagnoseOfTumor" v-on:keyup.enter="submit" />
          </div>
          <div class="form-group">
            <label for="clinicalCaseNumber">{{ $t("clinicalCaseNumber") }}*</label>
            <input required id="clinicalCaseNumber" type="text" class="form-control" :placeholder="$t('clinicalCaseNumber')" v-model="clinicalCaseNumber" v-on:keyup.enter="submit" />
          </div>
        </fieldset>
      </form>
      <div class="button-panel">
        <button class="btn btn-secondary btn-cancel" @click="cancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="submit">{{ $t("planner.addCase") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "vue-simple-spinner";
import config from "@/config/config";
import { mapState } from "vuex";
import ResourceSelect from "@/components/ui/ResourceSelect";
import { addEntry } from "../api/process-api";
import { getStringFromHumanName } from "@molit/fhir-util";

export default {
  props: {
    statuses: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      patientId: null,
      clinicalCaseNumber: null,
      firstName: null,
      lastName: null,
      birthDate: null,
      diagnoseOfTumor: null,
      sex: "",
      vituID: null,
      loading: false,
      fhirBaseUrl: config.FHIR_URL,

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

      patient: null
    };
  },

  computed: {
    firstStatus() {
      return this.statuses[0];
    },

    ...mapState({
      token: state => state.authentication.keycloak.token
    })
  },

  methods: {
    clearFields() {
      this.patientId = null;
      this.clinicalCaseNumber = null;
      this.firstName = null;
      this.lastName = null;
      this.birthDate = null;
      this.diagnoseOfTumor = null;
      this.sex = null;
      this.vituID = null;
      this.patient = null;
    },

    cancel() {
      this.$emit("cancel");
      this.clearFields();
    },

    onPatientSelectButtonClicked() {
      this.showPatientSelector = true;
    },

    onPatientSelectorUpdate(patient) {
      this.patient = patient;
    },

    async submit() {
      let form = this.$refs.addCaseForm;
      if (!form.checkValidity()) {
        form.reportValidity();
      } else {
        this.loading = true;
        try {
          await addEntry(this.clinicalCaseNumber, this.patient.id, getStringFromHumanName(this.patient.name), "", this.diagnoseOfTumor, this.patient.birthDate, this.patient.sex, this.firstStatus, "", this.token);
          this.loading = false;
          this.$emit("success");
          this.clearFields();
        } catch (e) {
          console.error(e);
        }
      }
    }
  },

  components: {
    ResourceSelect,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.button-panel {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .btn-cancel {
    margin-right: 0.5rem;
  }
}

.legend-button-panel {
  display: flex;
  justify-content: space-between;

  button {
    white-space: nowrap;
  }
}
</style>
