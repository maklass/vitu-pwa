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
      @closeError="closeError"
      @closeWarning="closeWarning"
    />
    <spinner class="spinner" v-if="loading" />
    <div class="container" v-else>
      <breadcrumps :breadcrumps="[{ name: $tc('worklist.worklist', 1), route: { name: 'clinical-cases' } }, { name: $t('editClinicalCase') }]" />
      <div class="page-header">
        <h5>{{ $t("editClinicalCase") }}</h5>
      </div>
      <div class="page-body">
        <div class="information-icon-wrapper">
          <div><information-outline-icon class="information-icon" /></div>
          <div>{{ $t("caseRegistrationInformation") }}</div>
        </div>
        <hr />
        <form ref="form" @submit.prevent="onSubmit" autocomplete="off">
          <fieldset>
            <legend>{{ $tc("worklist.patient") }}*</legend>
            <div class="information-icon-wrapper">
              <div><information-outline-icon class="information-icon" /></div>
              <div>{{ $t("pleaseSelectPatient") }}</div>
            </div>
            <div class="form-group form-row">
              <div class="col-md-12">
                <div v-if="patient">
                  <input readonly class="form-control" disabled :value="patientName" />
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
                </div>
              </div>
            </div>
          </fieldset>
          <hr />
          <fieldset class="inclusion-criteria">
            <legend>{{ $t("inclusionCriteria") }}*</legend>
            <div class="information-icon-wrapper">
              <div><information-outline-icon class="information-icon" /></div>
              <div>{{ $t("indicationInfo") }}</div>
            </div>
            <div class="indication-criteria">
              <!-- :questionnaireResponse="formData.inclusionCriteriaResponse" -->
              <questionnaire-renderer
                :questionnaire="questionnaire"
                :baseUrl="fhirBaseUrl"
                mode="FullQuestionnaire"
                :enableReturn="true"
                danger="red"
                :subject="patient"
                :locale="locale"
                @updated="onInclusionFactorsUpdated"
              ></questionnaire-renderer>
            </div>
          </fieldset>
          <hr />
          <fieldset>
            <legend>{{ $tc("worklist.diagnosis") }}</legend>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="icd10">{{ $t("worklist.diagnosis") }}*</label>
              <div class="col-md-9">
                <concept-select
                  :fhirBaseUrl="fhirBaseUrl"
                  resourceName="ValueSet"
                  url="http://molit.eu/fhir/ValueSet/icd-10-gm-c00-d48"
                  :showCode="true"
                  :showBorder="true"
                  :searchInputPlaceholder="$t('search')"
                  :token="token"
                  :required="true"
                  :expandValueSet="false"
                  @error="$emit('error')"
                  v-model="formData.icd10"
                />
              </div>
            </div>
            <div class="form-group form-row" v-if="icdo3list && icdo3list.length">
              <label class="col-md-3 col-form-label" for="subType">{{ $t("subtype") }}*</label>
              <div class="col-md-9">
                <v-select id="subType" required :options="icdo3list" v-model="formData.subType" :placeholder="icdo3list && icdo3list.length ? $t('pleaseSelect') : '-'" label="display">
                  <template #option="option">{{ option.display }}</template>
                  <template #no-options>{{ $t("noEntriesFound") }}</template>
                </v-select>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="date-of-diagnosis">{{ $t("dateOfDiagnosis") }}*</label>
              <div class="col-md-9">
                <div>
                  <date-input required v-model="formData.dateOfDiagnosis" :validation="false" :yearPlaceholder="$t('dateInput.year')" :monthPlaceholder="$t('dateInput.month')" :dayPlaceholder="$t('dateInput.day')" />
                  <small class="form-text text-muted">{{ $t("dateInfo") }}</small>
                </div>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="diagnosis">{{ $t("uicc") }}*</label>
              <div class="col-md-9">
                <v-select :options="optionsUicc" v-model="formData.uicc" :placeholder="$t('pleaseSelect')">
                  <template #search="{attributes, events}">
                    <input class="vs__search" :required="!formData.uicc" v-bind="attributes" v-on="events" />
                  </template>
                </v-select>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="tnm">{{ $t("initialTnm") }}</label>
              <div class="col-md-9">
                <div class="form-row">
                  <div class="col">
                    <v-select :options="optionsT" v-model="formData.t" :placeholder="`T - ${$t('pleaseSelect')}`"></v-select>
                  </div>
                  <div class="col">
                    <v-select :options="optionsN" v-model="formData.n" :placeholder="`N - ${$t('pleaseSelect')}`"></v-select>
                  </div>
                  <div class="col">
                    <v-select :options="optionsM" v-model="formData.m" :placeholder="`M - ${$t('pleaseSelect')}`"></v-select>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3"></div>
              <div class="col-md-9"><hr /></div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="current-status">{{ $t("currentStatus") }}*</label>
              <div class="col-md-9">
                <v-select id="current-status" required :options="optionsStatus" :placeholder="$t('pleaseSelect')" v-model="formData.currentStatus">
                  <template #search="{attributes, events}">
                    <input class="vs__search" :required="!formData.currentStatus" v-bind="attributes" v-on="events" />
                  </template>
                </v-select>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="ecog">{{ $t("currentEcogScore") }}*</label>
              <div class="col-md-9">
                <v-select id="ecog" required :options="optionsEcog" label="display" :placeholder="$t('pleaseSelect')" v-model="formData.ecog">
                  <template #search="{attributes, events}">
                    <input class="vs__search" :required="!formData.ecog" v-bind="attributes" v-on="events" />
                  </template>
                </v-select>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="secondary-diagnosis">{{ $tc("relevantSecondaryDiagnoses") }}</label>
              <div class="col-md-9">
                <textarea id="secondary-diagnosis" class="form-control" rows="4" v-model="formData.additionalDiagnosis"></textarea>
              </div>
            </div>
          </fieldset>
          <hr />
          <fieldset class="performed-diagnostics">
            <legend>{{ $t("performedDiagnostics") }}</legend>
            <div class="form-group form-row" v-for="biomarker in formData.biomarkerList" :key="biomarker.code">
              <label class="col col-form-label" :for="biomarker.code">{{ biomarker.display }}</label>
              <div class="ml-auto"></div>
              <div v-if="biomarker.code === '62862-8'">
                <div class="form-check form-check-inline" v-for="outcome in optionsMSI" :key="outcome.code">
                  <!-- <input class="form-check-input" type="radio" :name="biomarker.code" :id="biomarker.code + '-' + outcome.code" :checked="true" @click="handleRadioInput(biomarker.code, outcome)" /> -->
                  <input class="form-check-input" type="radio" :name="biomarker.code" :id="biomarker.code + '-' + outcome.code" :value="outcome" v-model="biomarker.result" />
                  <label class="form-check-label" :for="biomarker.code + '-' + outcome.code">{{ $t(outcome.display.toLocaleLowerCase()) }}</label>
                </div>
              </div>
              <div v-else>
                <div class="form-check form-check-inline" v-for="outcome in optionsOutcomes" :key="outcome.code">
                  <!-- <input class="form-check-input" type="radio" :name="biomarker.code" :id="biomarker.code + '-' + outcome.code" :checked="true" @click="handleRadioInput(biomarker.code, outcome)" /> -->
                  <input class="form-check-input" type="radio" :name="biomarker.code" :id="biomarker.code + '-' + outcome.code" :value="outcome" v-model="biomarker.result" />
                  <label class="form-check-label" :for="biomarker.code + '-' + outcome.code">{{ $t(outcome.display.toLocaleLowerCase()) }}</label>
                </div>
              </div>
            </div>
          </fieldset>
          <hr />
          <fieldset>
            <legend>{{ $tc("previousTherapies") }}</legend>
            <table class="table table-bordered" style="table-layout: fixed;">
              <colgroup>
                <col style="width: 140px" />
                <col style="width: 140px" />
                <col style="width: 32%" />
                <col style="width: 68%" />
                <col style="width: 50px" />
              </colgroup>
              <thead>
                <tr class="row-header">
                  <th>{{ $t("therapyStartDate") }}</th>
                  <th>{{ $t("therapyEndDate") }}</th>
                  <th>{{ $t("therapyType") }}*</th>
                  <th>{{ $t("medication") }} / {{ $t("documentation.protocol") }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!formData.therapies || !formData.therapies.length">
                  <td colspan="5" class="text-center">{{ $t("noEntriesFound") }}</td>
                </tr>
                <tr v-for="(therapy, index) in formData.therapies" :key="index">
                  <td><input type="text" class="form-control" placeholder="MM/JJJJ" v-model="therapy.startDate" /></td>
                  <td><input type="text" class="form-control" placeholder="MM/JJJJ" v-model="therapy.endDate" /></td>
                  <td>
                    <v-select v-model="therapy.therapyOption" :options="optionsTherapy" :placeholder="$t('pleaseSelect')">
                      <template #search="{attributes, events}">
                        <input class="vs__search" :required="!therapy.therapyOption" v-bind="attributes" v-on="events" />
                      </template>
                    </v-select>
                  </td>
                  <td>
                    <concept-select
                      v-if="therapy.therapyOption === 'Systemische Therapie'"
                      :fhirBaseUrl="fhirBaseUrl"
                      resourceName="ValueSet"
                      url="http://molit.eu/fhir/ValueSet/wirkstoffe-zpm"
                      sort
                      :searchInputPlaceholder="$t('search')"
                      :token="token"
                      @error="handleError"
                      v-model="therapy.medication"
                      mapToConceptMap
                      conceptMapUrl="http://molit.eu/fhir/vitu/ConceptMap/protocols-to-atc"
                      :sortFunction="medicationSortFunction"
                    ></concept-select>
                    <span v-else class="form-control no-border">&mdash;</span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-link delete-icon" @click="onRemoveTherapy(index)"><delete-icon /></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-right">
              <button type="button" @click="onAddTherapy" class="btn btn-secondary">{{ $t("addTherapy") }}</button>
            </div>
          </fieldset>
          <hr />
          <fieldset>
            <legend>{{ $tc("document", 2) }}</legend>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label">{{ $t("mostRecentDischargeSummary") }}</label>
              <div class="col">
                <b-form-file v-model="formData.dischargeSummary" :placeholder="$t('chooseFile')" accept="application/pdf" no-drop :browse-text="$t('browse')"></b-form-file>
              </div>
            </div>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label">{{ $tc("relevantPathologyReport") }}</label>
              <div class="col-md-9">
                <b-form-file v-model="formData.report" :placeholder="$t('chooseFile')" accept="application/pdf" no-drop :browse-text="$t('browse')"></b-form-file>
              </div>
            </div>
            <div class="form-group form-row" v-for="(document, index) in formData.additionalDocuments" :key="index">
              <label class="col-md-3 col-form-label">{{ $t("additionalDocument") }}</label>
              <div class="col">
                <b-form-file v-model="formData.additionalDocuments[index]" :placeholder="$t('chooseFile')" accept="application/pdf" no-drop :browse-text="$t('browse')"></b-form-file>
              </div>
              <div class="col-md-auto">
                <button type="button" class="btn btn-link delete-icon" @click="onRemoveAdditionalDocuments(index)"><delete-icon /></button>
              </div>
            </div>
            <div class="text-right">
              <button type="button" @click="onAddAdditionalDocuments" class="btn btn-secondary">{{ $t("addAdditionalDocument") }}</button>
            </div>
          </fieldset>
          <hr />
          <fieldset>
            <legend>{{ $tc("consent") }}</legend>
            <div class="form-group form-row">
              <label for="consentForDataDonation" class="col-md-3"></label>
              <div class="col-md-9">
                <div>
                  <strong>{{ $tc("tumorBoard") }}*</strong>
                </div>
              </div>
            </div>
            <div class="form-group form-row">
              <label for="consentForDataDonation" class="col-md-3"></label>
              <div class="col-md-9">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="consentForTumorboard" required v-model="formData.consentTumorboard" />
                  <label for="consentForTumorboard" class="form-check-label">Besprechung im standortübergreifenden Tumorboard</label>
                </div>
              </div>
            </div>
            <div class="form-group form-row">
              <label for="consentForDataDonation" class="col-md-3"></label>
              <div class="col-md-9">
                <div>
                  <strong>{{ $tc("dataDonation") }}</strong>
                </div>
              </div>
            </div>
            <div class="form-group form-row">
              <label for="consentForDataDonation" class="col-md-3"></label>
              <div class="col-md-9">
                <div class="form-check">
                  <input class="form-check-input" disabled type="checkbox" id="data-donation-all" @change="consentAllClicked" v-model="consentAll" />
                  <label for="data-donation-all" class="form-check-label">{{ $t("selectAll") }}</label>
                </div>
              </div>
            </div>
            <div class="form-group form-row">
              <label for="consentForDataDonation" class="col-md-3"></label>
              <div class="col-md-9">
                <div class="form-check">
                  <input class="form-check-input" disabled type="checkbox" id="consentScientificUsage" v-model="formData.consentScientificUsage" />
                  <label for="consentScientificUsage" class="form-check-label">Erhebung und wissenschaftliche Nutzung der Patientendaten</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" disabled type="checkbox" id="consentScientificQuestions" v-model="formData.consentScientificQuestions" />
                  <label for="consentScientificQuestions" class="form-check-label">Erneuter Kontakt für wissenschaftliche Rückfragen</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" disabled type="checkbox" id="consentAdditionalReports" v-model="formData.consentAdditionalReports" />
                  <label for="consentAdditionalReports" class="form-check-label">Erneuter Kontakt für medizinische Zusatzbefunde</label>
                </div>
              </div>
            </div>
          </fieldset>
          <hr />
          <fieldset>
            <legend>{{ $tc("furtherInformation") }}</legend>
            <div class="form-group form-row">
              <label class="col-md-3 col-form-label" for="comment">{{ $tc("comment") }}</label>
              <div class="col-md-9">
                <textarea id="comment" class="form-control" v-model="formData.comment" rows="4"></textarea>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
      <div class="page-footer">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel" @click="onCancel">{{ $t("cancel") }}</button>
        <!-- <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button> -->
        <button class="btn btn-primary" @click="onFinalize">{{ $t("finalizeCaseRegistration") }}</button>
      </div>
      <!-- <div class="page-footer">
        <div class="spacer"></div>
      </div> -->
    </div>
  </div>
</template>

<script>
import Spinner from "@/components/ui/Spinner";
import Breadcrumps from "@/components/ui/Breadcrumps";
import DateInput from "@/components/ui/DateInput";
import NotificationPanels from "@/components/ui/NotificationPanels";
import DeleteIcon from "vue-material-design-icons/Delete";
import InformationOutlineIcon from "vue-material-design-icons/InformationOutline";
import ResourceSelect from "@/components/ui/ResourceSelect";
import ConceptSelect from "@/components/ui/ConceptSelect";
import config from "@/config/config";
import { mapState } from "vuex";
import { addResourceToTransaction, editClinicalCase, updateTask } from "@/api/worklist-api";
import { fetchPatient, fetchResource, submitResource, fetchResources, mapFhirResponse, fetchValueSetConceptByUrl } from "@molit/fhir-api";
import { getStringFromHumanName } from "@molit/fhir-util";
import notifications from "@/mixins/notifications";
import { get } from "lodash";
import { QuestionnaireRenderer } from "@molit/fhir-components";
import { transactionTemplate } from "@/templates/fhir-templates";
import { cloneDeep } from "lodash";

export default {
  mixins: [notifications],

  data() {
    return {
      loading: true,
      prefetchUrls: [
        "ValueSet/$expand?url=http://loinc.org/vs/LL529-9",
        "ValueSet/$expand?url=http://molit.eu/fhir/vitu/ValueSet/biomarker-vitu-registration",
        "ValueSet/$expand?url=http://molit.eu/fhir/vitu/ValueSet/outcomes",
        "ValueSet/$expand?url=http://loinc.org/vs/LL3994-2",
        "ValueSet/$expand?url=http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist",
        "ConceptMap?url=http://molit.eu/fhir/vitu/ConceptMap/protocols-to-atc",
        "ConceptMap?url=http://molit.eu/fhir/vitu/ConceptMap/icd10-to-subtype"
      ],
      prefetchData: [],
      optionsStatus: ["Erstdiagnose", "Lokoregionäres Rezidiv", "Neue Fernmetastasierung", "Progrediente Erkrankung", "Stable disease", "Vollremisssion"],
      optionsTherapy: ["Systemische Therapie", "Bestrahlung", "Operation"],
      optionsUicc: ["I", "II", "III", "IV"],
      optionsT: ["T0", "T1", "T2", "T3", "T4"],
      optionsN: ["N0", "N1", "N2", "N3"],
      optionsM: ["M0", "M1"],
      optionsMSI: [],
      optionsOutcomes: [],
      optionsEcog: [],
      formData: {
        icd10: null, // condition
        subType: null, //
        dateOfDiagnosis: null,
        uicc: null,
        t: null,
        n: null,
        m: null,
        currentStatus: null,
        ecog: null,
        additionalDiagnosis: null,
        therapies: [],
        consentForTumorboard: null,
        inclusionCriteriaResponse: null,
        comment: null,
        biomarkerList: null,
        consentTumorboard: null,
        consentScientificUsage: null,
        consentScientificQuestions: null,
        consentAdditionalReports: null,
        dischargeSummary: null,
        report: null,
        additionalDocuments: []
      },
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
      questionnaire: {
        resourceType: "Questionnaire",
        title: "Inklusionskriterien",
        url: "http://molit.eu/fhir/Questionnaire/inclusion-criteria",
        description: "Fragebogen Inklusionskriterien für eine molekulare Diagnostik",
        status: "active",
        publisher: "MOLIT Institut gGmbH",
        date: "2020-02-07T15:11:00+01:00",
        item: [
          {
            linkId: "1",
            prefix: "1.",
            text: "Patient ohne weitere leitliniengerechte Therapieoptionen",
            type: "boolean",
            required: true
          },
          {
            linkId: "2",
            prefix: "2.",
            text: "Ungewöhnlicher Erkrankungsverlauf",
            type: "boolean",
            required: true
          },
          {
            linkId: "3",
            prefix: "3.",
            text: "Patienten mit seltenen Tumorerkrankungen",
            type: "boolean",
            required: true
          },
          {
            linkId: "4",
            prefix: "4.",
            text: "Seltene Histologie",
            type: "boolean",
            required: true
          },
          {
            linkId: "5",
            prefix: "5.",
            text: "Junges Erkrankungsalter bezogen auf Tumorentität",
            type: "boolean",
            required: true
          },
          {
            linkId: "6",
            prefix: "6.",
            text: "Verdacht auf Hereditäre Tumorerkrankung",
            type: "boolean",
            required: true
          },
          {
            linkId: "7",
            prefix: "7.",
            text: "Up-Front (z.B. CUP = C80, Pankreas = C25)",
            type: "boolean",
            required: true
          }
        ]
      },
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
      patient: null,
      task: null,
      consentAll: null,
      responseInitialized: false
    };
  },

  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    locale() {
      return this.$i18n.locale;
    },

    statuses() {
      const valueSet = this.prefetchData.find(r => get(r, "compose.include[0].valueSet[0]") === "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist");
      return get(valueSet, "expansion.contains");
    },

    conceptMapIcd10toIcdo3() {
      return this.prefetchData.find(r => r && r.url === "http://molit.eu/fhir/vitu/ConceptMap/icd10-to-subtype");
    },

    conceptMapProtocols() {
      return this.prefetchData.find(r => r && r.url === "http://molit.eu/fhir/vitu/ConceptMap/protocols-to-atc");
    },

    icdo3list() {
      if (this.formData && this.formData.icd10 && this.formData.icd10.code) {
        let concept = this.conceptMapIcd10toIcdo3.group[0].element.find(concept => this.formData.icd10.code.includes(concept.code));
        if (concept) {
          return concept.target;
        }
      }

      return [];
    },

    patientName() {
      if (this.patient) {
        return getStringFromHumanName(this.patient.name);
      } else {
        return "";
      }
    },

    isIndicationCriteriaSelected() {
      if (!this.formData || !this.formData.inclusionCriteriaResponse || !this.formData.inclusionCriteriaResponse.item) {
        return false;
      }

      const trueAnswer = this.formData.inclusionCriteriaResponse.item.find(item => get(item, "answer[0].valueBoolean"));
      return trueAnswer ? true : false;
    }
  },

  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        await editClinicalCase(this.fhirBaseUrl, this.token, this.patient, null, this.formData);
        const status = this.statuses.find(status => status.code === "finished-case-submission");
        if (status) {
          await updateTask(this.fhirBaseUrl, this.token, this.task, status, null, null);
        }

        this.$router.push({ name: "clinical-case", params: { id: this.task.id } });
      } catch (e) {
        this.handleError(e);
        this.loading = false;
      }
    },

    onFinalize() {
      if (!this.isIndicationCriteriaSelected) {
        this.warning = this.$t("indicationWarning");
        return;
      }
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }
      this.onSubmit();
    },

    onError(e) {
      this.handleError(e);
    },

    onInclusionFactorsUpdated(response) {
      if (response && !this.responseInitialized) {
        for (let i = 0; i < response.item.length; i++) {
          const item = response.item[i];
          item.answer.push({
            valueBoolean: false
          });
        }
        this.responseInitialized = true;
      }
      this.formData.inclusionCriteriaResponse = response;
    },

    getDisplayForProtocol(option) {
      if (option.system !== "http://molit.eu/fhir/CodeSystem/protocols" || !this.conceptMapProtocols) {
        return option.display;
      }

      let mappedConcept = this.conceptMapProtocols.group[0].element.find(concept => concept.code === option.code);
      return `${mappedConcept.display} (${mappedConcept.target.reduce((acc, current, index) => acc + (index !== 0 ? ", " : "") + current.display, "")})`;
    },

    onAddTherapy() {
      this.formData.therapies.push({});
    },

    onRemoveTherapy(index) {
      this.formData.therapies.splice(index, 1);
    },

    onAddAdditionalDocuments() {
      this.formData.additionalDocuments.push(null);
    },

    onRemoveAdditionalDocuments(index) {
      this.formData.additionalDocuments.splice(index, 1);
    },

    onCancel() {
      this.$router.push({ name: "clinical-cases", params: { id: this.task.id } });
    },

    consentAllClicked() {
      if (this.consentAll) {
        this.formData.consentAdditionalReports = true;
        this.formData.consentScientificQuestions = true;
        this.formData.consentScientificUsage = true;
      } else {
        this.formData.consentAdditionalReports = false;
        this.formData.consentScientificQuestions = false;
        this.formData.consentScientificUsage = false;
      }
    },

    async fetchClinicalCase(id) {
      this.task = (await fetchResource(this.fhirBaseUrl, "Task", id, {}, this.token)).data;
      if (this.task.for && this.task.for.reference) {
        this.patient = (await fetchPatient(this.fhirBaseUrl, this.task.for.reference.split("/")[1], {}, this.token)).data;
      }
    },

    async fetchClinicalCaseByPatientId(id) {
      const response = await fetchResources(this.fhirBaseUrl, "Task", { patient: id }, this.token);
      const task = mapFhirResponse(response)[0];
      if (!task) {
        throw Error("Task not found, please select another Patient.");
      }
      this.task = task;
      if (this.task.for && this.task.for.reference) {
        this.patient = (await fetchPatient(this.fhirBaseUrl, this.task.for.reference.split("/")[1], {}, this.token)).data;
      }
    },

    async initialize() {
      try {
        if (this.$route.params.id) {
          this.fetchClinicalCase(this.$route.params.id);
        } else if (this.$route.query.patientId) {
          this.fetchClinicalCaseByPatientId(this.$route.query.patientId);
        }

        const transaction = cloneDeep(transactionTemplate);
        this.prefetchUrls.forEach(url => {
          addResourceToTransaction(transaction, undefined, undefined, "GET", url);
        });

        const response = await submitResource(this.fhirBaseUrl, transaction, this.token);
        this.prefetchData = response.data.entry.map(entry => {
          if (entry.resource && entry.resource.resourceType === "Bundle") {
            entry.resource = get(entry, "resource.entry[0].resource");
          }
          return entry.resource;
        });

        this.formData.biomarkerList = await fetchValueSetConceptByUrl(this.fhirBaseUrl, this.token, "http://molit.eu/fhir/vitu/ValueSet/biomarker-vitu-registration");
        this.optionsMSI = await fetchValueSetConceptByUrl(this.fhirBaseUrl, this.token, "http://loinc.org/vs/LL3994-2");
        this.optionsOutcomes = await fetchValueSetConceptByUrl(this.fhirBaseUrl, this.token, "http://loinc.org/vs/LL3044-6");
        this.optionsEcog = await fetchValueSetConceptByUrl(this.fhirBaseUrl, this.token, "http://loinc.org/vs/LL529-9");

        this.formData.biomarkerList.forEach(biomarker => {
          if (biomarker.code === "62862-8") {
            this.$set(biomarker, "result", { code: "C17998", display: "Unknown" });
          } else {
            this.$set(biomarker, "result", { code: "LA4489-6", display: "Unknown" });
          }
        });

        this.loading = false;
      } catch (e) {
        this.handleError(e);
        this.loading = false;
      }
    }
  },

  mounted() {
    this.initialize();
  },


  components: {
    Breadcrumps,
    ConceptSelect,
    DateInput,
    ResourceSelect,
    DeleteIcon,
    InformationOutlineIcon,
    NotificationPanels,
    QuestionnaireRenderer,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.btn-cancel,
.btn-delete {
  margin-right: 0.5rem;
}

.delete-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 24px;
}

.btn-link {
  padding: 0;
}

.spinner {
  margin-top: 1rem;
}

.emphasized-option {
  font-weight: bold;
  white-space: pre-wrap;
}

.performed-diagnostics {
  label {
    text-align: left;
    padding: 0.2rem;
  }

  .form-row:hover {
    background: lighten($vitu-background, 3.5%);
  }

  .form-group {
    margin: 0;
  }
}

.information-icon-wrapper {
  display: flex;
  align-items: flex-start;
  background: lighten($vitu-background, 3.5%);
  padding: 0.4rem 0.4rem;
  margin-bottom: 1rem;
}

.information-icon {
  font-size: 18px;
  margin-right: 0.5rem;
}
</style>

<style lang="scss">
.inclusion-criteria {
  p {
    margin: 0 !important;
  }

  .card-margin-bottom {
    display: none;
  }

  .list-complete-item {
    .card {
      border: 0 !important;
      margin: 0 !important;
      background: initial;
      cursor: initial;

      > div:nth-child(2) {
        display: none;
      }
    }

    .card-body {
      padding: 0;
      > div:first-child {
        display: none;
      }
      > div:nth-child(2) {
        display: flex;
        justify-content: space-between;
        padding: 0.2rem;

        &:hover {
          background: lighten($vitu-background, 3.5%);
        }
      }
      > div > div:not(.form-group) > div:nth-child(2) {
        display: none;
      }
    }

    hr,
    br {
      display: none;
    }

    h2 {
      font-size: 1rem;
      font-weight: initial;
      cursor: initial;
      margin: 0;
    }

    .radio-button-card {
      min-height: 0 !important;
      cursor: initial !important;
      background: initial !important;
      flex: initial !important;
    }

    .form-group {
      display: flex;
      margin: 0;
    }

    .form-check {
      padding-left: 1rem;
      display: flex;
    }

    .form-check-label.title {
      font-size: initial;
      font-weight: initial;
      display: initial;
      padding: 0;
    }

    .form-check-input.radio-button {
      width: initial;
      height: initial;
      margin-left: initial;
      position: initial;
    }
  }
}
</style>
