<template>
  <div class="documentation-wrapper">
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="showSuccess" :successMessage="$t('admin.saveSuccessful')" />
    <div class="container documentation">
      <breadcrumps class="breadcrumps" :breadcrumps="[{ name: $t('documentation.documentation'), route: { name: 'documentation-overview' } }, { name: $t('documentation.documentation') + ' ' + $route.params.id }]" />
      <div class="page-header">
        <h5 class="headline">{{ $t("documentation.protocol") + " " + $route.params.id }}</h5>
        <div class="spacer"></div>
        <button class="btn btn-secondary" type="button" @click="print">{{ $t("print") }}</button>
      </div>
      <div class="main">
        <form v-if="compositionElements && compositionElements.length">
          <fieldset>
            <div>
              <legend>{{ $t("documentation.informationTumorboard") }}</legend>
            </div>
            <div>
              <div class="form-group row readonly">
                <label for="conferenceDate" class="col-md-3 col-form-label">{{ $t("documentation.date") }}</label>
                <div class="col-md-9">
                  <input v-if="encounter && encounter.period && encounter.period.start" type="text" class="form-control-plaintext" readonly id="conferenceDate" :value="$d(new Date(encounter.period.start))" required />
                </div>
              </div>
              <div class="form-group row readonly">
                <label for="encounterId" class="col-md-3 col-form-label">{{ $t("documentation.encounterId") }}</label>
                <div class="col-md-9">
                  <input type="text" class="form-control-plaintext" readonly id="encounterId" :value="encounter.identifier[0].value" :placeholder="$t('documentation.encounterId')" />
                </div>
              </div>
              <div class="form-group row">
                <label class="col-md-3 col-form-label">{{ $t("documentation.participants") }}</label>
                <div class="col-md-9">
                  <div class="participant-panel">
                    <div :class="['participant-list', { 'mb-2': participants && participants.length }]">
                      <list-item class="list-item" v-for="participant in participants" :key="participant.reference" :title="participant.display">
                        <template slot="icon">
                          <account-circle-icon class="icon" />
                        </template>
                      </list-item>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group row readonly">
                <label for="followUp" class="col-md-3 col-form-label">{{ $t("documentation.followUp") }}</label>
                <div class="col-md-9 active-container">
                  <input type="text" readonly class="form-control-plaintext" id="patientName" :value="followUp ? $t('yes') : $t('no')" />
                </div>
              </div>
              <div class="form-group row readonly" v-if="followUp">
                <label for="followUpReason" class="col-md-3 col-form-label">{{ $t("documentation.followUpReason") }}</label>
                <div class="col-md-9">
                  <input type="text" readonly class="form-control-plaintext" id="patientName" :value="followUpReason" />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div>
              <legend>{{ $t("worklist.patient") }}</legend>
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
                <label for="patientSex" class="col-md-3 col-form-label">{{ $t("sex") }}</label>
                <div class="col-md-9">
                  <input v-if="patient.gender" type="text" readonly class="form-control-plaintext" id="patientSex" :value="$t(patient.gender)" />
                  <input v-else type="text" readonly class="form-control-plaintext" value="-" />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div>
              <legend>{{ $t("documentation.anamnesis") }}</legend>
            </div>
            <div v-if="condition">
              <div class="form-group row readonly">
                <label for="firstDiagnosis" class="col-md-3 col-form-label">{{ $t("documentation.firstDiagnosis") }}</label>
                <div class="col-md-9">
                  <div class="form-control-plaintext" v-if="condition.code">{{ condition.code.text }}</div>
                </div>
              </div>
              <div class="form-group row readonly">
                <label for="firstDiagnosisDate" class="col-md-3 col-form-label">{{ $t("worklist.date") + " " + $t("documentation.firstDiagnosis") }}</label>
                <div class="col-md-9">
                  <div class="form-control-plaintext" v-if="condition.onsetDateTime">
                    {{ $d(new Date(condition.onsetDateTime)) }}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div>
              <legend>{{ $t("documentation.detectedMutations") }}</legend>
            </div>
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
                  <molecular-report :resources="somaticVariants" :hideReference="true" v-if="somaticVariants && somaticVariants.length" :showColumnHideOptions="false" />
                  <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                </div>
              </div>
              <div class="report">
                <h6>{{ $t("documentation.copyNumberVariants") }}</h6>
                <div>
                  <molecular-report :resources="copyNumberVariants" variantType="CNV" :hideFunctionalClass="true" v-if="copyNumberVariants && copyNumberVariants.length" :showColumnHideOptions="false" />
                  <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                </div>
              </div>
              <div class="report">
                <h6>{{ $t("documentation.structuralVariants") }}</h6>
                <div>
                  <molecular-report :resources="structuralVariants" variantType="SV" v-if="structuralVariants && structuralVariants.length" :showColumnHideOptions="false" />
                  <div v-else>{{ $t("documentation.noVariantsFound") }}</div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div class="legend-button-panel">
              <legend>{{ $t("documentation.therapyRecommendation") }}</legend>
            </div>
            <div>
              <div v-for="(activity, index) in carePlan.activity" :key="index">
                <div class="therapy-recommentation-header">
                  <h6>{{ index + 1 }}. {{ $t("documentation.therapyRecommendation") }}</h6>
                </div>
                <div class="form-group row readonly">
                  <label for="recommendedStart" class="col-md-3 col-form-label">{{ $t("documentation.recommendedStart") }}</label>
                  <div class="col-md-9">
                    <div class="form-control-plaintext" v-if="activity.detail && activity.detail.scheduledPeriod && activity.detail.scheduledPeriod.start">
                      {{ $d(new Date(activity.detail.scheduledPeriod.start)) }}
                    </div>
                  </div>
                </div>
                <div class="form-group row readonly">
                  <label for="therapyRecommendation" class="col-md-3 col-form-label">{{ $t("documentation.therapyRecommendation") }}</label>
                  <div class="col-md-9">
                    <div class="form-control-plaintext" v-if="activity.detail && activity.detail.productCodeableConcept">{{ activity.detail.productCodeableConcept.text }}</div>
                  </div>
                </div>
                <div class="form-group row readonly">
                  <label for="therapyRecommendation" class="col-md-3 col-form-label">{{ $t("documentation.therapyRecommendationReason") }}</label>
                  <div class="col-md-9">
                    <div class="form-control-plaintext" v-if="activity.detail && activity.detail.reasonReference && activity.detail.reasonReference[0]">{{ activity.detail.reasonReference[0].reference }}</div>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class="signatures">
            <div class="legend-button-panel">
              <legend>{{ $tc("documentation.signature", 2) }}</legend>
            </div>
            <div class="form-group row readonly">
              <label class="col-md-4 col-form-label">{{ $t("documentation.name") }}</label>
              <label class="col-md-4 col-form-label">{{ $t("documentation.name") }}</label>
              <label class="col-md-4 col-form-label">{{ $t("documentation.name") }}</label>
            </div>
            <div class="form-group row readonly">
              <label class="col-md-4 col-form-label">{{ $t("worklist.date") }}</label>
              <label class="col-md-4 col-form-label">{{ $t("worklist.date") }}</label>
              <label class="col-md-4 col-form-label">{{ $t("worklist.date") }}</label>
            </div>
            <div class="form-group row readonly">
              <label class="col-md-4 col-form-label">{{ $tc("documentation.signature") }}</label>
              <label class="col-md-4 col-form-label">{{ $tc("documentation.signature") }}</label>
              <label class="col-md-4 col-form-label">{{ $tc("documentation.signature") }}</label>
            </div>
          </fieldset>
          <fieldset class="evidence-levels">
            <div class="legend-button-panel">
              <legend>{{ $t("documentation.evidenceLevels") }}</legend>
            </div>
            <h6>Level 1:</h6>
            <p>
              A: Das Medikament ist für die vorliegende Tumorentität im Zusammenhang mit dem spezifischen Biomarker zugelassen.
            </p>

            <p>
              B: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des korrespondierenden Medikaments in einer molekular stratifizierten Kohorte wurde in einer prospektiven Studie mit adäquater Power oder einer Meta-Analyse
              nachgewiesen.
            </p>

            <h6>Level 2:</h6>
            <p>
              A: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des Medikaments in einer molekular stratifizierten Kohorte wurde in einer prospektiven Studie mit Biomarkern als sekundärem Ziel oder in einer retrospektiven
              Kohorten- oder Fall-Kontroll-Studie mit adäquater Power im gleichen Tumortyp nachgewiesen.
            </p>
            <p>
              B: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des Medikaments in einer molekular stratifizierten Kohorte wurde anhand klinischer Daten bei einer anderen Tumorentität nachgewiesen.
            </p>

            <p>
              C: Eine Fallstudie oder ein einzelner Fall mit unerwartetem Therapieansprechen deuten an, dass der Biomarker mit einem Ansprechen auf das Medikament assoziiert ist. Der Befund wird durch eine wissenschaftliche Rationale
              unterstützt.
            </p>

            <h6>Level 3:</h6>
            <p>
              Präklinische Daten (in-vitro- oder in-vivo-Modelle und funktionelle Genomik) belegen den prädiktiven Wert des Biomarkers für das Ansprechen von Tumorzellen auf das Medikament.
            </p>

            <h6>Level 4:</h6>
            <p>
              Es existiert eine biologische Rationale, aufgrund der das Medikament mit dem alterierten Signalweg oder dem relevanten Basket in Verbindung steht. Es existieren keine publizierten klinischen oder präklinischen Daten
              hinsichtlich des Ansprechens auf das Medikament.
            </p>
          </fieldset>
          <div style="display: flex" class="page-footer">
            <div class="spacer"></div>
            <router-link class="btn btn-secondary btn-cancel" :to="{ name: 'documentation-overview' }">{{ $t("close") }}</router-link>
          </div>
        </form>
        <spinner v-else line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { handleAxiosError } from "@/util/error-util";
import config from "@/config/config";

import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import Spinner from "vue-simple-spinner";
import { fetchByUrl, mapFhirData } from "@molit/fhir-api";
import { getStringFromHumanName, getValueByLoincCode } from "@molit/fhir-util";
import { mapState } from "vuex";
import { MolecularReport } from "@molit/fhir-components";

export default {
  data() {
    return {
      error: null,
      showSuccess: false,
      compositionElements: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),

    patient() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "Patient");
    },

    patientName() {
      if (this.patient) {
        return getStringFromHumanName(this.patient.name);
      }
      return "";
    },

    participants() {
      if (!this.compositionElements || !this.encounter || !this.encounter.participant) {
        return null;
      }
      return this.encounter.participant.map(p => p.individual);
    },

    encounter() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "Encounter");
    },

    condition() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "Condition");
    },

    geneticReport() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "DiagnosticReport");
    },

    geneticObservations() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.filter(report => report.resourceType === "Observation").sort((e1, e2) => (e1.id && e2.id ? e1.id.localeCompare(e2.id) : 0));
    },

    geneticLaboratory() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "Organization");
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

    carePlan() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "CarePlan");
    },

    observation() {
      if (!this.compositionElements) {
        return null;
      }
      return this.compositionElements.find(report => report.resourceType === "Observation" && report.code && report.code.text === "follow-up");
    },

    followUp() {
      if (!this.compositionElements || !this.observation) {
        return null;
      }
      return this.observation.valueBoolean;
    },

    followUpReason() {
      if (!this.compositionElements || !this.observation || !this.observation.component) {
        return null;
      }
      const reasonComponent = this.observation.component.find(c => c.code && c.code.text === "reason");
      if (reasonComponent) {
        return reasonComponent.valueString;
      } else {
        return null;
      }
    }
  },

  methods: {
    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    },

    print() {
      window.print();
    },

    handleQueryParams() {
      if (this.$route.query.success) {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      }
    },

    async getProtocol() {
      try {
        const response = await fetchByUrl(`${config.FHIR_URL}/Composition/${this.$route.params.id}/$document`);
        this.compositionElements = mapFhirData(response.data);
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    this.handleQueryParams();
    this.getProtocol();
  },

  components: {
    AccountCircleIcon,
    Breadcrumps,
    ListItem,
    MolecularReport,
    NotificationPanels,
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

  &:last-child {
    border: 0;
  }
}

legend {
  font-size: 1.3rem;
}

h6 {
  margin-top: 1rem;
}

.form-group.readonly {
  margin-bottom: 0;
}

.genetic-report-information {
  margin-bottom: 1.5rem;
}

.report {
  margin-bottom: 1rem;

  h6 {
    margin-top: 2vw;
  }
}

.icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}

label {
  color: #444;
  font-weight: 600;
}

.evidence-levels {
  page-break-before: always;
}

.signatures .col-form-label {
  text-align: initial;
}

.page-footer {
  border-top: 0;
}
</style>
