<template>
  <div class="pt-2">
    <h5 id="anchor-patient">{{ $tc("worklist.patient") }}</h5>
    <div v-if="patient">
      <div class="form-row">
        <label class="col-md-3 col-form-label">{{ $t("name") }}</label>
        <label class="col-md-9 col-form-label">{{ patientLastName }}, {{ patientFirstName }}</label>
      </div>
      <div class="form-row">
        <label class="col-md-3 col-form-label">{{ $t("worklist.birthDate") }}</label>
        <label class="col-md-9 col-form-label">{{ $d(new Date(patient.birthDate)) }}</label>
      </div>
      <div class="form-row">
        <label class="col-md-3 col-form-label">{{ $t("sex") }}</label>
        <label class="col-md-9 col-form-label">{{ $t(patient.gender) }}</label>
      </div>
    </div>
    <hr />
    <div>
      <div v-if="showCaseRegistrationButton">
        <router-link class="btn btn-primary" :to="{ name: 'clinical-case-edit', params: { id: task.id } }">{{ $t("registerCase") }}</router-link>
      </div>
      <div v-else>
        <h5 id="anchor-inclusion-criteria">{{ $t("inclusionCriteria") }}</h5>
        <div class="form-row" v-for="item in indicationItems" :key="item.linkId">
          <label class="col-md-9 col-form-label">{{ item.text }}</label>
          <label class="col-md-3 col-form-label">{{ getAnswerFromItem(item) }}</label>
        </div>

        <hr />
        <h5 id="anchor-diagnosis">{{ $tc("worklist.diagnosis") }}</h5>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("icd10") }}</label>
          <label class="col-md-9 col-form-label">{{ icd10 }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("subType") }}</label>
          <label class="col-md-9 col-form-label">{{ icdo3 }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("dateOfDiagnosis") }}</label>
          <label class="col-md-9 col-form-label">{{ conditionDate }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("uicc") }}</label>
          <label class="col-md-9 col-form-label">{{ uicc }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("initialTnm") }}</label>
          <label class="col-md-9 col-form-label">
            {{ tValue }}
            {{ nValue }}
            {{ mValue }}
          </label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label"></label>
          <div class="col-md-9"><hr /></div>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("currentStatus") }}</label>
          <label class="col-md-9 col-form-label">{{ currentStatus }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $t("currentEcogScore") }}</label>
          <label class="col-md-9 col-form-label">{{ ecogScore }}</label>
        </div>
        <div class="form-row">
          <label class="col-md-3 col-form-label">{{ $tc("relevantSecondaryDiagnoses") }}</label>
          <label class="col-md-9 col-form-label" v-if="condition && condition.note">{{ condition.note.map(c => c.text).join(", ") }}</label>
        </div>
        <hr />
        <h5 id="anchor-diagnostics">{{ $t("performedDiagnostics") }}</h5>
        <div class="form-row" v-for="biomarker in biomarkerList" :key="biomarker.code">
          <label class="col-md-9 col-form-label" :for="biomarker.code">{{ biomarker.display }}</label>
          <label class="col-md-3 col-form-label">{{ getBiomarkerValueForCode(biomarker.code) }}</label>
        </div>
        <hr />
        <h5 id="anchor-previous-therapies">{{ $tc("previousTherapies") }}</h5>
        <table class="table table-bordered" style="table-layout: fixed;">
          <colgroup>
            <col style="width: 140px" />
            <col style="width: 140px" />
            <col style="width: 32%" />
            <col style="width: 68%" />
          </colgroup>
          <thead>
            <tr class="row-header">
              <th>{{ $t("therapyStartDate") }}</th>
              <th>{{ $t("therapyEndDate") }}</th>
              <th>{{ $t("therapyType") }}</th>
              <th>{{ $t("medication") }} / {{ $t("documentation.protocol") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!therapies || !therapies.length">
              <td colspan="4" class="text-center">{{ $t("noEntriesFound") }}</td>
            </tr>
            <tr v-for="(therapy, index) in therapies" :key="index">
              <td>{{ getTherapyStartDate(therapy) }}</td>
              <td>{{ getTherapyEndDate(therapy) }}</td>
              <td>{{ getTherapyType(therapy) }}</td>
              <td>{{ getTherapyMedication(therapy) }}</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h5 id="anchor-documents">{{ $tc("document", 2) }}</h5>

        <!-- <hr />
    <h5 id="anchor-consent">{{ $tc("consent") }}</h5> -->

        <span v-for="document in documents" :key="document.id">
          <span class="btn btn-secondary mr-2 mb-2" @click="openDocument(document)">{{ document.description }}</span>
        </span>
        <hr />
        <h5 id="anchor-further-information">{{ $tc("furtherInformation") }}</h5>
        <div v-if="comment && comment !== ''" v-html="comment"></div>
        <div v-else>-</div>
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import { get } from "lodash";
import { Base64 } from "js-base64";
import { markdownToHtml } from "@/util/util";

export default {
  props: {
    resources: {
      type: Array,
      default: () => {
        return [];
      }
    },

    task: {
      type: Object,
      default: () => {
        return {};
      }
    },

    biomarkerList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },

  data() {
    return {
      formData: {
        icd10: null,
        subType: null,
        dateOfDiagnosis: null,
        uicc: null,
        t: null,
        n: null,
        m: null,
        currentStatus: null,
        ecog: null,
        secondaryDiagnosis: null,
        consentForTumorboard: null,
        inclusionCriteriaResponse: null,
        comment: null,
        biomarkerList: null,
        consentTumorboard: null,
        consentScientificUsage: null,
        consentScientificQuestions: null,
        consentAdditionalReports: null,
        additionalDischargeSummaries: [],
        additionalReports: []
      }
    };
  },

  computed: {
    patient() {
      if (!this.resources) {
        return null;
      }
      return this.resources.find(resource => resource.resourceType === "Patient");
    },

    patientFirstName() {
      return get(this.patient, "name[0].given[0]", "");
    },

    patientLastName() {
      return get(this.patient, "name[0].family", "");
    },

    condition() {
      if (!this.resources) {
        return null;
      }
      return this.resources.find(resource => resource.resourceType === "Condition");
    },

    conditionDate() {
      if (!this.condition || !this.condition.onsetDateTime) {
        return null;
      }
      return this.$d(new Date(this.condition.onsetDateTime));
    },

    observations() {
      if (!this.resources) {
        return [];
      }
      return this.resources.filter(resource => resource.resourceType === "Observation");
    },

    therapies() {
      if (!this.resources) {
        return [];
      }
      return this.resources
        .filter(resource => resource.resourceType === "MedicationStatement" || resource.resourceType === "Procedure")
        .sort((t1, t2) => {
          if (!t1 || !t2) {
            return 0;
          }
          const t1Date = this.getTherapyStartDate(t1);
          const t2Date = this.getTherapyStartDate(t2);
          if (!t1Date || !t2Date) {
            return 0;
          }
          return t1Date.localeCompare(t2Date);
        });
    },

    currentStatus() {
      return this.getObservationValueBySystemAndCode("http://ncit.nci.nih.gov", "C25688");
    },

    ecogScore() {
      return this.getObservationValueBySystemAndCode("http://loinc.org", "89247-1");
    },

    tnmObservation() {
      return this.getObservationBySystemAndCode("http://loinc.org", "75620-5");
    },

    uicc() {
      return this.getObservationValueBySystemAndCode("http://loinc.org", "75620-5");
    },

    tValue() {
      if (!this.tnmObservation) {
        return "";
      }
      return this.getComponentValueByLoincCode(this.tnmObservation.component, "21905-5");
    },

    nValue() {
      if (!this.tnmObservation) {
        return "";
      }
      return this.getComponentValueByLoincCode(this.tnmObservation.component, "21906-3");
    },

    mValue() {
      if (!this.tnmObservation) {
        return "";
      }
      return this.getComponentValueByLoincCode(this.tnmObservation.component, "21907-1");
    },

    icd10() {
      if (!this.formData.icd10 || !this.formData.icd10.code || !this.formData.icd10.display) {
        return "";
      }
      return this.formData.icd10.code + " - " + this.formData.icd10.display;
    },

    icdo3() {
      return this.getObservationValueBySystemAndCode("http://ncit.nci.nih.gov", "C25696");
    },

    indication() {
      if (!this.resources) {
        return null;
      }
      return this.resources.find(resource => resource.resourceType === "QuestionnaireResponse");
    },

    indicationItems() {
      return get(this.indication, "item", []);
    },

    documents() {
      return this.resources.filter(resource => resource.resourceType === "DocumentReference" && resource.description);
    },

    comment() {
      const resource = this.resources.find(resource => resource.resourceType === "DocumentReference" && get(resource, "type.coding", []).find(coding => coding.code === "C42619"));
      const data = get(resource, "content[0].attachment.data", "");
      if (data) {
        return markdownToHtml(Base64.decode(data));
      }
      return "-";
    },

    showCaseRegistrationButton() {
      if (this.task && this.task.businessStatus && this.task.businessStatus.text === "Neu") {
        return true;
      }
      return false;
    }
  },

  methods: {
    createFormData(resources) {
      const formData = {};
      const condition = resources.find(resource => resource.resourceType === "Condition");
      if (condition) {
        formData.icd10 = get(condition, "code.coding[0]", {});
        formData.subType = this.getObservationValueBySystemAndCode("http://loinc.org", "59848-2");
      }

      this.formData = formData;
    },

    getObservationBySystemAndCode(system, code) {
      if (!this.observations || !system || !code) {
        return null;
      }
      return this.observations.find(resource => get(resource, "code.coding[0].system") === system && get(resource, "code.coding[0].code") === code);
    },

    getObservationValueBySystemAndCode(system, code) {
      if (!this.observations || !system || !code) {
        return null;
      }
      return get(this.getObservationBySystemAndCode(system, code), "valueCodeableConcept.coding[0].display");
    },

    getBiomarkerForCode(code) {
      if (!this.observations || !code) {
        return null;
      }
      return this.observations.find(resource => get(resource, "code.coding[0].code") === code);
    },

    getBiomarkerValueForCode(code) {
      if (!this.observations || !code) {
        return null;
      }
      const value = get(this.getBiomarkerForCode(code), "valueCodeableConcept.coding[0].display");
      if (value) {
        return this.$t(value.toLocaleLowerCase());
      }
      return null;
    },

    getTherapyType(therapy) {
      if (!therapy) {
        return "";
      }

      if (therapy.resourceType === "Procedure") {
        const display = get(therapy, "category.coding[0].display");
        if (display === "Radiation Therapy") {
          return "Bestrahlung";
        } else if (display === "Surgery procedure") {
          return "Operation";
        }
        return get(therapy, "category.coding[0].display");
      } else {
        return "Systemische Therapie";
      }
    },

    getTherapyEndDate(therapy) {
      if (!therapy) {
        return "";
      }

      if (therapy.resourceType === "Procedure") {
        return get(therapy, "performedPeriod.end", "-");
      } else {
        return get(therapy, "effectivePeriod.end", "-");
      }
    },

    openDocument(documentReference) {
      const data = get(documentReference, "content[0].attachment.data");
      if (data) {
        const win = window.open("", "_blank");
        let html = "";

        html += "<html>";
        html += '<body style="margin:0!important">';
        html += '<embed width="100%" height="100%" src="data:application/pdf;base64,' + data + '" type="application/pdf" />';
        html += "</body>";
        html += "</html>";

        setTimeout(() => {
          win.document.write(html);
        }, 0);
      }
    },

    getComponentValueByLoincCode(components, code) {
      if (!components) {
        return "";
      }
      const component = components.find(c => get(c, "code.coding[0].code") === code);
      return get(component, "valueCodeableConcept.coding[0].display", "");
    },

    getTherapyStartDate(therapy) {
      if (!therapy) {
        return "";
      }

      if (therapy.resourceType === "Procedure") {
        return get(therapy, "performedPeriod.start", "-");
      } else {
        return get(therapy, "effectivePeriod.start", "-");
      }
    },

    getTherapyMedication(therapy) {
      if (!therapy) {
        return "";
      }

      if (therapy.resourceType === "Procedure") {
        return "-";
      } else {
        return get(therapy, "medicationCodeableConcept.coding[0].display");
      }
    },

    getAnswerFromItem(item) {
      const answer = get(item, "answer[0].valueBoolean", false);
      if (answer) {
        return this.$t("yes");
      } else {
        return this.$t("no");
      }
    }
  },

  mounted() {
    this.createFormData(this.resources);
  }
};
</script>

<style lang="scss" scoped>
.col-form-label {
  padding: 0.2rem 5px;
}

.form-row:hover {
  background: lighten($vitu-background, 3.5%);
}

h5::before {
  display: block;
  // height: calc(#{$navbar-height} + 0.8rem);
  // margin-top: calc(-#{$navbar-height} - 0.8rem);
  // content: "";
}

.btn-link {
  cursor: pointer;
}
</style>
