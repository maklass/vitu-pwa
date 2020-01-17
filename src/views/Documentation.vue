<template>
  <div class="documentation-wrapper">
    <notification-panels :showError="error" :errorMessage="error" />
    <div class="container documentation">
      <breadcrumps :breadcrumps="[{ name: $t('documentation.documentation'), route: { name: 'documentation-overview' } }, { name: $t('documentation.newProtocol') }]" />
      <div class="page-header">
        <h5 class="headline">{{ $t("documentation.newProtocol") }}</h5>
      </div>
      <div class="main">
        <form ref="form">
          <spinner v-if="loading && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
          <div v-if="!loading && !error">
            <fieldset>
              <legend>{{ $t("documentation.informationTumorboard") }}</legend>
              <div>
                <div class="form-group row">
                  <label for="conferenceDate" class="col-md-3 col-form-label">{{ $t("documentation.date") }}</label>
                  <div class="col-md-9">
                    <input type="date" required @invalid="onInvalid" class="form-control" id="conferenceDate" v-model="encounter.period.start" />
                  </div>
                </div>
                <div class="form-group row">
                  <label for="encounterId" class="col-md-3 col-form-label">{{ $t("documentation.encounterId") }}</label>
                  <div class="col-md-9">
                    <input type="text" required @invalid="onInvalid" class="form-control" id="encounterId" v-model="encounter.identifier[0].value" :placeholder="$t('documentation.encounterId')" />
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-md-3 col-form-label">{{ $t("documentation.participants") }}</label>
                  <div class="col-md-9">
                    <div class="participant-panel">
                      <div class="participant-add-panel">
                        <button type="button" class="btn btn-secondary" @click="onParticipantSelectButtonClicked">{{ $t("documentation.addParticipant") }}</button>
                      </div>
                      <div :class="['participant-list', { 'mb-2': participants && participants.length }]">
                        <list-item class="list-item" v-for="participant in participants" :key="participant.reference" :title="participant.display">
                          <template slot="icon">
                            <account-circle-icon class="account-icon" />
                          </template>
                          <template slot="actions">
                            <delete-icon @click="removeParticipant(participant)" />
                          </template>
                        </list-item>
                      </div>
                      <resource-selector
                        v-if="showParticipantSelector"
                        :fhirBaseUrl="fhirBaseUrl"
                        :resourceName="'Practitioner'"
                        :titleAttribute="participantSelector.titleAttribute"
                        :subtitleAttributes="participantSelector.subtitleAttributes"
                        :searchAttributes="participantSelector.searchAttributes"
                        :queryParams="participantSelector.queryParams"
                        :cancelText="$t('cancel')"
                        :searchInputPlaceholder="$t('search')"
                        :okText="$t('documentation.addParticipant')"
                        :title="$t('documentation.addParticipant')"
                        :token="token"
                        @update="onParticipantSelectorUpdate"
                        @cancel="onParticipantSelectorCancel"
                      />
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="followUp" class="col-md-3 col-form-label">{{ $t("documentation.followUp") }}</label>
                  <div class="col-md-9 active-container">
                    <input type="checkbox" id="followUp" v-model="followUp" />
                  </div>
                </div>
                <div class="form-group row" v-if="followUp">
                  <label for="followUpReason" class="col-md-3 col-form-label">{{ $t("documentation.followUpReason") }}</label>
                  <div class="col-md-9">
                    <input type="text" class="form-control" id="followUpReason" v-model="followUpReason" :placeholder="$t('documentation.followUpReason')" />
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <div class="legend-button-panel">
                <legend>{{ $t("worklist.patient") }}</legend>
                <button type="button" class="btn btn-secondary" @click="onPatientSelectButtonClicked">{{ $t("documentation.selectPatient") }}</button>
              </div>
              <resource-selector
                v-if="showPatientSelector"
                :fhirBaseUrl="fhirBaseUrl"
                :resourceName="'Patient'"
                :titleAttribute="patientSelector.titleAttribute"
                :subtitleAttributes="patientSelector.subtitleAttributes"
                :searchAttributes="patientSelector.searchAttributes"
                :queryParams="patientSelector.queryParams"
                :cancelText="$t('cancel')"
                :searchInputPlaceholder="$t('search')"
                :okText="$t('documentation.selectPatient')"
                :title="$t('documentation.selectPatient')"
                :token="token"
                @update="onPatientSelectorUpdate"
                @cancel="onPatientSelectorCancel"
              />
              <div>
                <div v-if="!patient">
                  <p>{{ $t("documentation.selectPatientInfo") }}</p>
                </div>
                <div v-if="patient">
                  <div class="form-group row readonly">
                    <label for="patientName" class="col-md-3 col-form-label">{{ $t("documentation.name") }}</label>
                    <div class="col-md-9">
                      <input type="text" readonly class="form-control-plaintext" id="patientName" :value="patientName" />
                    </div>
                  </div>
                  <div class="form-group row readonly">
                    <label for="patientBirthDate" class="col-md-3 col-form-label">{{ $t("worklist.birthDate") }}</label>
                    <div class="col-md-9">
                      <input v-if="patient.birthDate" type="text" readonly class="form-control-plaintext" id="patientBirthDate" :value="$d(new Date(patient.birthDate))" />
                      <input v-else type="text" readonly class="form-control-plaintext" value="-" />
                    </div>
                  </div>
                  <div class="form-group row readonly">
                    <label for="patientBirthDate" class="col-md-3 col-form-label">{{ $t("sex") }}</label>
                    <div class="col-md-9">
                      <input v-if="patient.gender" type="text" readonly class="form-control-plaintext" id="patientBirthDate" :value="$t(patient.gender)" />
                      <input v-else type="text" readonly class="form-control-plaintext" value="-" />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-if="patient">
              <div>
                <legend>{{ $t("documentation.anamnesis") }}</legend>
              </div>
              <div class="form-group row">
                <label for="firstDiagnosis" class="col-md-3 col-form-label">{{ $t("documentation.firstDiagnosis") }}</label>
                <div class="col-md-9">
                  <textarea class="form-control" rows="3" id="firstDiagnosis" v-model="condition.code.text" :placeholder="$t('documentation.firstDiagnosis')" />
                </div>
              </div>
              <div class="form-group row">
                <label for="firstDiagnosisDate" class="col-md-3 col-form-label">{{ $t("worklist.date") + " " + $t("documentation.firstDiagnosis") }}</label>
                <div class="col-md-9">
                  <input type="date" class="form-control" id="firstDiagnosisDate" v-model="condition.onsetDateTime" />
                </div>
              </div>
            </fieldset>
            <fieldset v-if="patient">
              <div class="legend-button-panel">
                <legend>{{ $t("documentation.detectedMutations") }}</legend>
                <button v-if="!loadingDiagnosticReport" type="button" class="btn btn-secondary" @click="onReportSelectButtonClicked">{{ $t("documentation.selectReport") }}</button>
              </div>
              <div v-if="!geneticReport">
                <p>{{ $t("documentation.selectReportInfo") }}</p>
              </div>
              <resource-selector
                v-if="showReportSelector"
                :fhirBaseUrl="fhirBaseUrl"
                :resourceName="'DiagnosticReport'"
                :titleAttribute="reportSelector.titleAttribute"
                :subtitleAttributes="reportSelector.subtitleAttributes"
                :searchAttributes="reportSelector.searchAttributes"
                :queryParams="reportSelector.queryParams"
                :cancelText="$t('cancel')"
                :searchInputPlaceholder="$t('search')"
                :okText="$t('documentation.selectReport')"
                :title="$t('documentation.selectReport')"
                :token="token"
                @update="onReportSelectorUpdate"
                @cancel="onReportSelectorCancel"
              />
              <div>
                <spinner v-if="loadingDiagnosticReport && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
                <div v-if="geneticReport">
                  <div class="genetic-report-information">
                    <h6>{{ $t("documentation.reportInformation") }}</h6>
                    <div class="form-group row readonly" v-if="geneticLaboratory">
                      <label for="laboratory" class="col-md-3 col-form-label">{{ $t("documentation.laboratory") }}</label>
                      <div class="col-md-9">
                        <input type="text" readonly class="form-control-plaintext" id="laboratory" :value="geneticLaboratory.name" />
                      </div>
                    </div>
                    <div class="form-group row readonly">
                      <label for="reportId" class="col-md-3 col-form-label">{{ $t("documentation.reportId") }}</label>
                      <div class="col-md-9">
                        <input type="text" readonly class="form-control-plaintext" id="reportId" :value="geneticReport.identifier[0].value" />
                      </div>
                    </div>
                    <!-- <div class="form-group row readonly">
                    <label for="geneticReportDate" class="col-md-3 col-form-label">{{ $t("documentation.reportDate") }}</label>
                    <div class="col-md-9">
                      <input type="text" readonly class="form-control-plaintext" id="geneticReportDate" :value="$d(new Date(geneticReport.issued), 'long')" />
                    </div>
                  </div> -->
                  </div>
                  <div class="report">
                    <h6>{{ $t("documentation.somaticVariants") }}</h6>
                    <div>
                      <molecular-report :resources="somaticVariants" :hideReference="true" v-if="somaticVariants && somaticVariants.length" />
                      <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                    </div>
                  </div>
                  <div class="report">
                    <h6>{{ $t("documentation.copyNumberVariants") }}</h6>
                    <div>
                      <molecular-report :resources="copyNumberVariants" variantType="CNV" :hideFunctionalClass="true" v-if="copyNumberVariants && copyNumberVariants.length" />
                      <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                    </div>
                  </div>
                  <div class="report">
                    <h6>{{ $t("documentation.structuralVariants") }}</h6>
                    <div>
                      <molecular-report :resources="structuralVariants" variantType="SV" v-if="structuralVariants && structuralVariants.length" />
                      <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset v-if="patient">
              <div class="legend-button-panel">
                <legend>{{ $t("documentation.therapyRecommendation") }}</legend>
                <button type="button" class="btn btn-secondary" @click="onAddTherapyRecommendationButtonClicked">{{ $t("documentation.addTherapyRecommendation") }}</button>
              </div>
              <div v-if="!carePlan.activity || !carePlan.activity.length">
                <p>{{ $t("documentation.addTherapyRecommendationInfo") }}</p>
              </div>
              <div>
                <div v-for="(activity, index) in carePlan.activity" :key="index">
                  <div class="therapy-recommentation-header">
                    <h6>{{ index + 1 }}. {{ $t("documentation.therapyRecommendation") }}</h6>
                    <delete-icon @click="removeTherapyRecommendation(index)" />
                  </div>
                  <div class="form-group row">
                    <label for="recommendedStart" class="col-md-3 col-form-label">{{ $t("documentation.recommendedStart") }}</label>
                    <div class="col-md-9">
                      <input type="date" class="form-control" id="recommendedStart" v-model="activity.detail.scheduledPeriod.start" />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="therapyRecommendation" class="col-md-3 col-form-label">{{ $t("documentation.therapyRecommendation") }}</label>
                    <div class="col-md-9">
                      <textarea required @invalid="onInvalid" class="form-control" rows="3" id="therapyRecommendation" v-model="activity.detail.productCodeableConcept.text" :placeholder="$t('documentation.therapyRecommendation')" />
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="therapyRecommendation" class="col-md-3 col-form-label">{{ $t("documentation.therapyRecommendationReason") }}</label>
                    <div class="col-md-9">
                      <select class="form-control" rows="3" id="therapyRecommendation" v-model="activity.detail.reasonReference.reference" :placeholder="$t('documentation.therapyRecommendation')">
                        <option :value="null">{{ $t("noInformation") }}</option>
                        <option v-for="observation in geneticObservations" :key="observation.id" :value="`Observation/${observation.id}`">{{ observation.id }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div class="page-footer">
            <div class="spacer"></div>
            <button type="button" class="btn btn-secondary btn-cancel" @click="cancel">{{ $t("cancel") }}</button>
            <button type="button" class="btn btn-primary" @click="save" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
          </div>
        </form>
      </div>
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

import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { handleAxiosError } from "@/util/error-util";
import config from "@/config/config";

import _ from "lodash";
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import DeleteIcon from "vue-material-design-icons/Delete";
import PlusIcon from "vue-material-design-icons/Plus";
import Spinner from "vue-simple-spinner";
import { fetchByUrl, fetchResources, mapFhirData, updateResource, submitResource } from "@molit/fhir-api";
import { getStringFromHumanName, getValueByLoincCode } from "@molit/fhir-util";
import { mapState } from "vuex";
import { MolecularReport, ResourceSelector } from "@molit/fhir-components";

export default {
  data() {
    return {
      error: null,
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
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
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

        const response = await fetchResources(config.FHIR_URL, "DiagnosticReport", params);
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

    cancel() {
      this.$router.push({ name: "documentation-overview" });
    }
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
    AccountCircleIcon,
    Breadcrumps,
    DeleteIcon,
    ListItem,
    MolecularReport,
    NotificationPanels,
    PlusIcon,
    ResourceSelector,
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
  padding-bottom: 1rem;
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
</style>

<style lang="scss">
.molit-modal-dialog {
  top: 66px !important;
  height: calc(100vh - 66px) !important;

  > div {
    height: calc(100vh - 66px - 2rem) !important;
  }

  .btn-secondary {
    background: white;
  }
}
</style>
