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
      <breadcrumps v-if="editMode" :breadcrumps="[{ name: $tc('worklist.patient', 2), route: { name: 'patients' } }, { name: $t('worklist.editPatient') }]" />
      <breadcrumps v-else :breadcrumps="[{ name: $tc('worklist.patient', 2), route: { name: 'patients' } }, { name: $t('addPatient') }]" />
      <div class="page-header" v-if="editMode">
        <h5>{{ $t("worklist.editPatient") }}</h5>
      </div>
      <div class="page-header" v-else>
        <h5>{{ $t("addPatient") }}</h5>
      </div>
      <div class="page-body">
        <spinner v-if="spinner.loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :message="spinner.message" :speed="1.5" />
        <form autocomplete="off" ref="form" v-on:submit.prevent="onSubmit" v-if="!spinner.loading">
          <fieldset>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="patientId">{{ $t("patientId") }}*</label>
              <div class="col-md-9">
                <input required id="patientId" type="text" class="form-control" :placeholder="$t('patientId')" v-model="patientId" v-on:keyup.enter="onSubmit" />
                <small class="form-text text-muted">{{ $t("patientIdInfo") }}</small>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="firstName">{{ $t("firstName") }}*</label>
              <div class="col-md-9">
                <input required id="firstName" type="text" class="form-control" :placeholder="$t('firstName')" v-model="firstName" v-on:keyup.enter="onSubmit" />
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="lastName">{{ $t("lastName") }}*</label>
              <div class="col-md-9">
                <input required id="lastName" type="text" class="form-control" :placeholder="$t('lastName')" v-model="lastName" v-on:keyup.enter="onSubmit" />
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="birthDate">{{ $t("worklist.birthDate") }}*</label>
              <div class="col-md-3">
                <input required id="birthDate" type="date" class="form-control" :placeholder="$t('worklist.birthDate')" v-model="birthDate" v-on:keyup.enter="onSubmit" />
              </div>
              <label class="col-md-3 col-form-label" for="gender">{{ $t("sex") }}*</label>
              <div class="col-md-3">
                <select required id="gender" type="date" class="form-control" :placeholder="$t('sex')" v-model="gender" v-on:keyup.enter="onSubmit">
                  <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
                  <option v-for="gender in genders" :value="gender.code" :key="gender.code">{{ $t(gender.code) }}</option>
                </select>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="lastName">{{ $t("worklist.caseId") }}*</label>
              <div class="col-md-9">
                <input required id="caseId" type="text" class="form-control" :placeholder="$t('worklist.caseId')" v-model="caseId" v-on:keyup.enter="onSubmit" />
                <small class="form-text text-muted">{{ $t("caseIdInfo") }}</small>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-md-3 col-form-label" for="organization">{{ $t("organization") }}*</label>
              <div class="col-md-9">
                <resource-select
                  required
                  :fhirBaseUrl="fhirBaseUrl"
                  :token="token"
                  resourceName="Organization"
                  :titleAttribute="{ value: 'name' }"
                  v-model="organization"
                  :searchAttributes="organizationSearchAttributes"
                  :searchInputPlaceholder="$t('search')"
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
      <div class="page-footer" v-if="!spinner.loading">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel mr-2" @click="onCancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import { addPatient, updatePatient, getPatient, addPatientEpisodeOfCare } from "@/api/worklist-api";
import config from "@/config/config";
import { mapState } from "vuex";
import Spinner from "vue-simple-spinner";
import * as fhirApi from "@molit/fhir-api";
import { get } from "lodash";
import ResourceSelect from "@/components/ui/ResourceSelect";

export default {
  mixins: [notifications],

  data() {
    return {
      patient: {},
      episodeOfCare: {},
      spinner: { loading: false, message: "" },
      error: null,
      patientId: null,
      firstName: null,
      lastName: null,
      birthDate: null,
      gender: null,
      caseId: null,
      genders: null,
      organization: null,
      // TODO get users organization system
      patientIdentifierSystem: "molit/testsystem",
      organizationSearchAttributes: [
        {
          name: "Name",
          value: "name:contains"
        }
      ]
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

    editMode() {
      return this.$route.params.id && this.$route.params.id !== "new";
    }
  },

  methods: {
    /**
     * Returns the Identifierobject
     */
    getIdentifier() {
      if (this.patient && this.patient.identifier && this.patient.identifier.length !== 0) {
        for (let i = 0; i < this.patient.identifier.length; i++) {
          if (this.patient.identifier[i].system === this.patientIdentifierSystem) {
            return this.patient.identifier[i].value;
          }
        }
      }
      return null;
    },

    /**
     * If patient is available, it checks if a identifier exists with the correct system and overwrite the value, else push a new element. The
     * identifier system depends on the organisation the user is part of.
     *
     * @param {String} value - patient identifier value
     */
    setIdentifier(value) {
      let identExists = false;
      if (this.patient && this.patient.identifier && this.patient.identifier.length !== 0) {
        for (let i = 0; i < this.patient.identifier.length; i++) {
          if (this.patient.identifier[i].system === this.patientIdentifierSystem) {
            this.patient.identifier[i].value = value;
            identExists = true;
          }
        }
      }
      if (!identExists) {
        if (!this.patient.identifier) {
          this.patient.identifier = [];
        }
        this.patient.identifier.push({ system: this.patientIdentifierSystem, value: value });
      }
    },

    async getAdministrativeGender() {
      const response = (await fhirApi.fetchByUrl(this.fhirBaseUrl + "/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender", {}, this.token)).data;
      this.genders = get(response, "expansion.contains");
    },

    async getEpisodeOfCare() {
      let url = this.fhirBaseUrl + "/EpisodeOfCare?patient=Patient/" + this.patient.id;
      let response = await fhirApi.fetchByUrl(url);

      this.episodeOfCare = get(response, "data.entry[0].resource");
      this.caseId = get(this.episodeOfCare, "identifier[0].value");
    },

    async getPatient() {
      let response = await getPatient(this.fhirBaseUrl, this.$route.params.id, {}, this.token);
      this.patient = response.data;
      this.patientId = this.getIdentifier();
      this.birthDate = this.patient.birthDate;
      this.gender = this.patient.gender;
      if (this.patient.name && this.patient.name[0] && this.patient.name[0].given) {
        this.firstName = this.patient.name[0].given[0];
        this.lastName = this.patient.name[0].family;
      }
      if (this.patient.managingOrganization && this.patient.managingOrganization.reference) {
        this.organization = {
          id: this.patient.managingOrganization.reference.split("/")[1],
          name: this.patient.managingOrganization.display
        };
      }
    },

    async getValueSets() {
      try {
        await this.getAdministrativeGender();
      } catch (e) {
        this.handleError(e, true);
      }
    },

    async getResources() {
      try {
        await this.getPatient();
        await this.getEpisodeOfCare();
      } catch (e) {
        this.spinner.loading = false;
        this.handleError(e, true);
      }
    },

    async createResources() {
      let identifier = { system: this.patientIdentifierSystem, value: this.patientId };
      const response = await addPatient(this.fhirBaseUrl, this.token, identifier, this.firstName, this.lastName, this.birthDate, this.gender, this.caseId, this.organization);
      const patientLocation = get(response, "data.entry[1].response.location");
      let patientId;

      if (patientLocation) {
        patientId = patientLocation.split("/")[1];
      }

      if (this.$route.query.redirect && patientId) {
        this.$router.push({ name: "patient", params: { id: patientId }, query: { success: "patientCreatedSuccessfully" } });
      }
    },

    async createByQueryParams() {
      this.spinner.message = this.$t("loadingData");

      this.patient = {
        resourceType: "Patient",
        active: true
      };

      let newName = {
        use: "official"
      };
      this.spinner.message = this.$t("checkIfPatientExists");
      if (this.$route.query.patId) {
        try {
          const patient = fhirApi.mapFhirResponse(await fhirApi.fetchByUrl(encodeURI(this.fhirBaseUrl + `/Patient?identifier=` + this.patientIdentifierSystem + `|${this.$route.query.patId}`), {}))[0];

          if (patient) {
            this.$router.push({ name: "patient", params: { id: patient.id } });
            return;
          } else {
            this.patient.identifier = [{ system: this.patientIdentifierSystem, value: this.$route.query.patId }];
          }
        } catch (e) {
          //
        }
        this.patientId = this.$route.query.patId;
      }
      this.spinner.message = this.$t("creatingPatient");
      if (this.$route.query.firstName) {
        newName.given = [this.$route.query.firstName];
      }

      if (this.$route.query.lastName) {
        newName.family = this.$route.query.lastName;
      }

      this.patient.name = [newName];

      if (this.$route.query.birthDate) {
        this.patient.birthDate = [this.$route.query.birthDate];
      }

      if (this.$route.query.gender && this.$route.query.gender !== "X") {
        switch (this.$route.query.gender) {
          case "M":
          case "m":
            this.patient.gender = "male";
            break;
          case "W":
          case "w":
            this.patient.gender = "female";
            break;
          case "U":
          case "u":
            this.patient.gender = "unknown";
            break;
          case "S":
          case "s":
            this.patient.gender = "other";
            break;
        }
      }
      this.spinner.message = this.$t("savingPatient");
      try {
        let response = await addPatientEpisodeOfCare(this.fhirBaseUrl, this.patient, this.$route.query.caseId);
        let split = response.data.entry[1].response.location.split("/");
        this.$router.push({ name: "patient", params: { id: split[1] }, query: { success: "patientCreatedSuccessfully" } });
      } catch (error) {
        this.$router.push({ name: "patients", query: { error: "creatingPatientFailed" } });
      }
    },

    async updateResources() {
      this.setIdentifier(this.patientId);
      await updatePatient(this.fhirBaseUrl, this.token, this.patient, this.patient.id, this.patient.identifier, this.firstName, this.lastName, this.birthDate, this.gender, this.episodeOfCare, this.caseId, this.organization);
      if (this.$route.query.redirect) {
        this.$router.push({ name: this.$route.query.redirect, query: { patientId: this.patient.id, success: "patientUpdatedSuccessfully" } });
      }
    },

    async onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }
      this.spinner.loading = true;

      try {
        if (this.editMode) {
          await this.updateResources();
        } else {
          await this.createResources();
        }
      } catch (e) {
        this.handleError(e, true);
      }
      this.spinner.loading = false;
    },

    onCancel() {
      this.$router.push({ name: this.$route.query.redirect, query: { patientId: this.patient.id } });
    }
  },

  async mounted() {
    this.spinner.loading = true;
    await this.getValueSets();

    if (this.editMode) {
      await this.getResources();
    } else if (this.$route.query.patId && this.$route.query.caseId) {
      await this.createByQueryParams();
    }

    this.spinner.loading = false;
  },

  components: {
    Spinner,
    NotificationPanels,
    Breadcrumps,
    ResourceSelect
  }
};
</script>
