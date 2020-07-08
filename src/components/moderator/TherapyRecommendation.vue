<template>
  <div>
    <div>
      <form ref="form">
        <spinner v-if="loading && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="!loading && !error">
          <fieldset>
            <table class="table table-bordered" style="table-layout: fixed;">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 70%" />
                <col style="width: 240px" />
                <col style="width: 30%" />
                <col style="width: 50px" />
              </colgroup>
              <thead>
                <tr class="row-header">
                  <th>#</th>
                  <th>{{ $t("documentation.therapyRecommendation") }}</th>
                  <th>{{ $t("treatmentContext") }}</th>
                  <th>{{ $t("recommendationCategory") }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!recommendations || !recommendations.length">
                  <td colspan="5" class="text-center">{{ $t("noEntriesFound") }}</td>
                </tr>
              </tbody>
              <tbody v-for="(recommendation, index) in recommendations" :key="index">
                <tr>
                  <td>{{ index + 1 }}</td>
                  <td>
                    <concept-select
                      class="multiple"
                      :fhirBaseUrl="fhirBaseUrl"
                      resourceName="ValueSet"
                      url="http://molit.eu/fhir/ValueSet/wirkstoffe-zpm"
                      sort
                      multiple
                      :searchInputPlaceholder="$t('search')"
                      :token="token"
                      @error="handleError"
                      mapToConceptMap
                      conceptMapUrl="http://molit.eu/fhir/vitu/ConceptMap/protocols-to-atc"
                      :sortFunction="medicationSortFunction"
                    ></concept-select>
                  </td>
                  <td><v-select :options="instantOfTimeList" :placeholder="$t('pleaseSelect')" /></td>
                  <td><v-select :options="recommendationCategories" :placeholder="$t('pleaseSelect')" /></td>
                  <td>
                    <button type="button" class="btn btn-link delete-icon" @click="onRemoveRecommendation(index)"><delete-icon /></button>
                  </td>
                </tr>
                <tr class="sub-heading">
                  <th></th>
                  <th>Wirkstoff</th>
                  <th>{{ $t("worklist.reason") }}</th>
                  <th>{{ $t("evidenceLevel") }}</th>
                  <th></th>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <concept-select
                      class="multiple"
                      :fhirBaseUrl="fhirBaseUrl"
                      resourceName="ValueSet"
                      url="http://molit.eu/fhir/ValueSet/wirkstoffe-zpm"
                      sort
                      multiple
                      :searchInputPlaceholder="$t('search')"
                      :token="token"
                      @error="handleError"
                      mapToConceptMap
                      conceptMapUrl="http://molit.eu/fhir/vitu/ConceptMap/protocols-to-atc"
                      :sortFunction="medicationSortFunction"
                    ></concept-select>
                  </td>
                  <td><input class="form-control" :placeholder="$t('worklist.reason')" /></td>
                  <td><v-select :options="evidenceLevelList" :placeholder="$t('pleaseSelect')" /></td>
                  <td>
                    <button type="button" class="btn btn-link delete-icon"><delete-icon /></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-right">
              <button type="button" @click="onAddRecommendation" class="btn btn-secondary">{{ $t("documentation.addTherapyRecommendation") }}</button>
            </div>
            <div class="form-group">
              <label for="note">{{ $t("furtherInformation") }}</label>
              <textarea class="form-control" id="note" rows="3"></textarea>
            </div>
          </fieldset>
        </div>
        <div class="page-footer">
          <div class="spacer"></div>
          <button type="button" class="btn btn-primary" @click="save" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
        </div>
        <hr />
        <div class="page-footer">
          <div class="spacer"></div>
          <button class="btn btn-primary" disabled>{{ $t("generateProtocol") }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const defaults = {
  diagnostic: {
    target: null,
    method: null,
    date: null,
    lab: null,
    result: null,
    therapyOption: null
  },
  therapy: {
    start: null,
    treatment: null,
    status: null
  },
  variant: {
    category: null,
    aberration: null,
    gene: null,
    kind: null,
    functionalClass: null,
    variant: null,
    effect: null,
    naf: null
  },
  therapyLine: {
    name: "Therapielinie",
    treatments: [
      {
        category: null,
        treatment: null,
        level: null,
        costAcquisition: false,
        reasonReference: [],
        reason: null
      }
    ]
  },
  treatment: {
    category: null,
    treatment: null,
    level: null,
    costAcquisition: false,
    reasonReference: [],
    reason: null
  }
};

const compositionTemplate = {
  resourceType: "Composition",
  status: "preliminary",
  type: {
    coding: [
      {
        system: "http://molit.eu/fhir/genomics/CodeSystem/documentType",
        code: "tumor-recommendation-protocol"
      }
    ],
    text: "Tumor board recommendation protocol"
  },
  date: new Date().toISOString(),
  section: [
    {
      entry: []
    }
  ]
};

const carePlanActivityTemplate = {
  detail: {
    scheduledPeriod: {
      start: null
    },
    reasonReference: {
      reference: null
    },
    productCodeableConcept: {
      text: null
    }
  }
};

import config from "@/config/config";

import _ from "lodash";
import DeleteIcon from "vue-material-design-icons/Delete";
import Spinner from "vue-simple-spinner";
import { fetchByUrl, fetchResources, mapFhirData, updateResource, submitResource } from "@molit/fhir-api";
import { getStringFromHumanName, getValueByLoincCode } from "@molit/fhir-util";
import { mapState } from "vuex";
import ConceptSelect from "@/components/ui/ConceptSelect";

export default {
  data() {
    return {
      error: null,
      loading: false,
      fhirBaseUrl: config.FHIR_URL,

      medicationSortFunction: (c1, c2) => {
        if (!c1.selectTitle || !c2.selectTitle) {
          return 0;
        }
        if (c1.selectTitle.includes("(") && !c2.selectTitle.includes("(")) {
          return 1;
        }
        if (!c1.selectTitle.includes("(") && c2.selectTitle.includes("(")) {
          return -1;
        }
        return c1.selectTitle.localeCompare(c2.selectTitle);
      },

      recommendations: [{}],

      instantOfTimeList: ["Erstdiagnose", "Lokoregionäres Rezidiv", "Neue Fernmetastasierung", "Progrediente Erkrankung", "Stable disease", "Vollremisssion"],
      evidenceLevelList: ["1", "2", "3A", "3B", "4"],
      variants: ["BRCA1", "BRCA2", "HER2"],

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

      participantSelector: {
        searchAttributes: [
          {
            name: "Name",
            value: "name:contains"
          }
        ],
        queryParams: {
          _sort: "name"
        },
        titleAttribute: {
          value: "name",
          type: "HumanName"
        }
      },

      reportSelector: {
        searchAttributes: [
          {
            name: "Identifier",
            value: "_id"
          }
        ],
        queryParams: {
          identifier: "http://molit.eu/fhir/genomics/NamingSystem/cegat/reportID|",
          _sort: "-issued"
        },
        titleAttribute: {
          value: "identifier[0].value"
        },
        subtitleAttributes: [
          {
            name: this.$t("worklist.date"),
            value: "issued",
            type: "Date"
          }
        ]
      },

      recommendationCategories: ["Leitlinie", "Off-Label", "Studie"],

      showPatientSelector: false,
      showParticipantSelector: false,
      showReportSelector: false,

      patient: null,
      composition: _.cloneDeep(compositionTemplate),

      encounter: {
        resourceType: "Encounter",
        period: {
          start: null
        },
        identifier: [
          {
            system: `http://molit.eu/fhir/genomics/NamingSystem/${config.FHIR_ORGANIZATION}/tb-encounter-id`,
            value: null
          }
        ],
        participant: []
      },

      condition: {
        resourceType: "Condition",
        code: {
          text: null
        },
        onsetDateTime: null
      },

      carePlan: {
        resourceType: "CarePlan",
        activity: []
      },

      geneticReport: null,
      geneticObservations: [],
      geneticLaboratory: null,

      followUp: false,
      followUpReason: "",

      participants: [],

      loadingDiagnosticReport: false,

      defaults: defaults
    };
  },

  computed: {
    patientName() {
      if (this.patient) {
        return getStringFromHumanName(this.patient.name);
      }
      return "";
    },

    somaticVariants() {
      if (!this.geneticObservations) {
        return [];
      }

      return this.geneticObservations.filter(observation => getValueByLoincCode(observation.component, "variant-type") === "SNV");
    },

    copyNumberVariants() {
      if (!this.geneticObservations) {
        return [];
      }
      return this.geneticObservations.filter(observation => getValueByLoincCode(observation.component, "variant-type") === "CNV");
    },

    structuralVariants() {
      if (!this.geneticObservations) {
        return [];
      }
      return this.geneticObservations.filter(observation => getValueByLoincCode(observation.component, "variant-type") === "SV");
    },

    modalDialogShowing() {
      return this.showPatientSelector || this.showParticipantSelector || this.showReportSelector;
    },

    saveButtonDisabled() {
      return !this.patient || !this.geneticReport;
    },

    ...mapState({
      token: state => state.authentication.keycloak.token
    })
  },

  methods: {
    handleError(error) {
      this.$emit("error", error);
    },

    onInvalid(event) {
      event.target.scrollIntoView(false);
    },

    onPatientSelectButtonClicked() {
      this.showPatientSelector = true;
    },

    onPatientSelectorCancel() {
      this.showPatientSelector = false;
    },

    onPatientSelectorUpdate(patient) {
      this.patient = patient;
      this.showPatientSelector = false;
    },

    onParticipantSelectButtonClicked() {
      this.showParticipantSelector = true;
    },

    onParticipantSelectorCancel() {
      this.showParticipantSelector = false;
    },

    onParticipantSelectorUpdate(practitioner) {
      const reference = this.getReferenceFromResource(practitioner);
      if (!this.participants.find(p => p.reference === reference)) {
        this.participants.push({
          display: getStringFromHumanName(practitioner.name),
          reference
        });
      }
      this.showParticipantSelector = false;
    },

    onReportSelectButtonClicked() {
      this.showReportSelector = true;
    },

    onReportSelectorCancel() {
      this.showReportSelector = false;
    },

    async onReportSelectorUpdate(report) {
      this.showReportSelector = false;
      if (!report) {
        return;
      }

      try {
        this.loadingDiagnosticReport = true;

        const params = new URLSearchParams();
        params.append("_id", report.id);
        params.append("_include", "DiagnosticReport:result");
        params.append("_include", "DiagnosticReport:performer");
        params.append("_count", 1);

        const response = await fetchResources(config.FHIR_URL, "DiagnosticReport", params, this.token);
        const diagnosticReportWithResults = mapFhirData(response.data);
        this.loadingDiagnosticReport = false;
        this.geneticReport = diagnosticReportWithResults.find(report => report.resourceType === "DiagnosticReport");
        this.geneticLaboratory = diagnosticReportWithResults.find(report => report.resourceType === "Organization");
        this.geneticObservations = diagnosticReportWithResults.filter(report => report.resourceType === "Observation").sort((e1, e2) => (e1.id && e2.id ? e1.id.localeCompare(e2.id) : 0));
      } catch (e) {
        this.handleError(e);
      }
    },

    onAddTherapyRecommendationButtonClicked() {
      if (this.carePlan && this.carePlan.activity) {
        this.carePlan.activity.push(_.cloneDeep(carePlanActivityTemplate));
      }
    },

    removeParticipant(participant) {
      const reference = participant.reference;
      this.participants = this.participants.filter(p => p.reference !== reference);
    },

    removeTherapyRecommendation(index) {
      if (this.carePlan && this.carePlan.activity) {
        this.carePlan.activity.splice(index, 1);
      }
    },

    getReferenceFromResource(resource) {
      if (!resource || !resource.id || !resource.resourceType) {
        throw new Error("Resource not defined");
      }
      return `${config.FHIR_URL}/${resource.resourceType}/${resource.id}`;
    },

    async save() {
      if (!this.$refs.form.checkValidity()) {
        // Try focus on the error
        this.$refs.form.reportValidity();
        return;
      }

      try {
        if (this.patient && this.geneticReport && this.geneticReport.subject && this.geneticReport.subject.reference) {
          this.loading = true;

          // Set intermediate patient.active = false and link to patient from HIS
          // Update intermediate patient
          const intermediatePatient = (await fetchByUrl(`${config.FHIR_URL}/${this.geneticReport.subject.reference}`)).data;
          intermediatePatient.active = false;
          intermediatePatient.link = {
            type: "replaced-by",
            other: {
              reference: "Patient/" + this.patient.id,
              display: this.patientName
            }
          };
          updateResource(config.FHIR_URL, intermediatePatient, this.token);

          // Update patient from HIS
          if (intermediatePatient.identifier) {
            let intermediatePatientIdentifier = intermediatePatient.identifier.find(identifier => identifier.system === "http://molit.eu/fhir/genomics/NamingSystem/cegat/patID");
            if (intermediatePatientIdentifier) {
              let identifier;
              if (!this.patient.identifier) {
                this.patient.identifier = [];
              } else {
                identifier = this.patient.identifier.find(identifier => identifier.system === "http://molit.eu/fhir/genomics/NamingSystem/cegat/patID");
              }
              if (identifier) {
                identifier.value = intermediatePatientIdentifier.value;
              } else {
                this.patient.identifier.push(intermediatePatientIdentifier);
              }
              updateResource(config.FHIR_URL, this.patient, this.token);
            }
          }

          // Create new resources
          // Create Condition
          this.condition.subject = {
            reference: "Patient/" + this.patient.id,
            display: this.patientName
          };
          const condition = (await submitResource(config.FHIR_URL, this.condition, this.token)).data;

          // Create Encounter
          this.encounter.subject = {
            reference: "Patient/" + this.patient.id,
            display: this.patientName
          };
          this.participants.forEach(participant => {
            this.encounter.participant.push({
              individual: participant
            });
          });
          const encounter = (await submitResource(config.FHIR_URL, this.encounter, this.token)).data;

          // Create CarePlan
          this.carePlan.subject = {
            reference: "Patient/" + this.patient.id,
            display: this.patientName
          };
          const carePlan = (await submitResource(config.FHIR_URL, this.carePlan, this.token)).data;

          // Create Observation follow-up
          let observation = {
            resourceType: "Observation",
            subject: {
              reference: "Patient/" + this.patient.id,
              display: this.patientName
            },
            code: {
              text: "follow-up"
            },
            valueBoolean: this.followUp,
            component: [
              {
                code: {
                  text: "reason"
                },
                valueString: this.followUpReason
              }
            ]
          };
          observation = (await submitResource(config.FHIR_URL, observation, this.token)).data;

          // Create composition
          this.composition.subject = {
            reference: "Patient/" + this.patient.id,
            display: this.patientName
          };
          this.composition.section[0].entry.push({
            reference: `Encounter/${encounter.id}`
          });
          this.composition.section[0].entry.push({
            reference: `Patient/${this.patient.id}`,
            display: this.patientName
          });
          this.composition.section[0].entry.push({
            reference: `Condition/${condition.id}`
          });
          this.composition.section[0].entry.push({
            reference: `CarePlan/${carePlan.id}`
          });
          this.composition.section[0].entry.push({
            reference: `Observation/${observation.id}`
          });
          this.composition.section[0].entry.push({
            reference: `DiagnosticReport/${this.geneticReport.id}`
          });
          let composition = (await submitResource(config.FHIR_URL, this.composition, this.token)).data;
          this.$router.push({ name: "documentation", params: { id: composition.id }, query: { success: true } });
        }
      } catch (e) {
        this.handleError(e);
      }
    },

    onAddRecommendation() {
      this.recommendations.push({});
    },

    onRemoveRecommendation(index) {
      console.log(index);
      this.recommendations.splice(index, 1);
    },

    onCancel() {}
  },

  watch: {
    modalDialogShowing(modalDialogShowing) {
      try {
        const body = document.getElementsByTagName("body")[0];
        if (modalDialogShowing) {
          body.style.overflow = "hidden";
        } else {
          body.style.overflow = "visible";
        }
      } catch (e) {
        console.log("Could not hide/show scrollbar");
      }
    }
  },

  components: {
    ConceptSelect,
    DeleteIcon,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.documentation-wrapper {
  background: white;
  flex: 1;
}

.documentation {
  padding-bottom: 12rem;
}

.main {
  padding-top: 1rem;
}

fieldset {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

legend {
  font-size: 1.3rem;
}

.legend-button-panel {
  display: flex;
  justify-content: space-between;

  button {
    white-space: nowrap;
  }
}

.page-footer {
  border-top: 0;
}

.delete-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: rgba(0, 0, 0, 0.7);
  }
}

.account-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.active-container {
  display: flex;
  align-items: center;
}

.btn-cancel {
  margin-right: 0.5rem;
}

.form-group.readonly {
  margin-bottom: 0;
}

.participant-add-panel {
  display: flex;
  justify-content: flex-end;
}

h6 {
  margin-top: 1rem;
}

.genetic-report-information {
  margin-bottom: 1.5rem;
}

.report {
  margin-bottom: 1rem;

  h6 {
    margin-bottom: 0;
    margin-top: 2vw;
  }
}

.therapy-recommentation-header {
  display: flex;
  justify-content: space-between;
}

.btn-link {
  padding: 0;
}

tr.sub-heading {
  th {
    font-weight: 400;
    font-style: italic;
  }
}

table tbody {
  border-top-color: rgba(0, 0, 0, 0.3);
}

table thead th {
  border-bottom-color: rgba(0, 0, 0, 0.3);
}
</style>

<style lang="scss">
.molit-modal-dialog {
  top: $navbar-height !important;
  height: calc(100vh - #{$navbar-height}) !important;

  > div {
    height: calc(100vh - #{$navbar-height} - 2rem) !important;
  }

  .btn-secondary {
    background: white;
  }
}
</style>
