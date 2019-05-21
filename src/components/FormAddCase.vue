<template>
  <div>
    <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
    <div v-if="!loading">
      <form autocomplete="off" ref="addCaseForm">
        <div class="form-row">
          <div class="form-group col">
            <label for="patientId">{{ $t("patientId") }}*</label>
            <input required id="patientId" type="text" class="form-control" :placeholder="$t('patientId')" v-model="patientId" />
          </div>
          <div class="form-group col">
            <label for="caseNumber">{{ $t("caseNumber") }}*</label>
            <input required id="caseNumber" type="text" class="form-control" :placeholder="$t('caseNumber')" v-model="caseNumber" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label>{{ $t("firstName") }}*</label>
            <input required type="text" class="form-control" :placeholder="$t('firstName')" v-model="firstName" />
          </div>
          <div class="form-group col">
            <label>{{ $t("lastName") }}*</label>
            <input required type="text" class="form-control" :placeholder="$t('lastName')" v-model="lastName" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label for="birthDate">{{ $t("worklist.birthDate") }}*</label>
            <input required id="birthDate" type="date" class="form-control" v-model="birthDate" />
          </div>
          <div class="form-group col">
            <label>{{ $t("sex") }}*</label>
            <select required class="form-control" v-model="sex">
              <option selected disabled value="">{{ $t("pleaseChoose") }}</option>
              <option value="M">{{ $t("male") }}</option>
              <option value="F">{{ $t("female") }}</option>
              <option value="UNKNOWN">{{ $t("unknown") }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col">
            <label for="diagnoseOfTumor">{{ $t("worklist.diagnosis") }}*</label>
            <input required id="diagnoseOfTumor" type="text" class="form-control" :placeholder="$t('worklist.diagnosis')" v-model="diagnoseOfTumor" />
          </div>
        </div>
      </form>
      <div class="button-panel">
        <button class="btn btn-secondary cancel-button" @click="cancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="submit">{{ $t("planner.addCase") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

import { addEntry } from "../api/process-api";

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
      caseNumber: null,
      firstName: null,
      lastName: null,
      birthDate: null,
      diagnoseOfTumor: null,
      sex: "",
      vituID: null,
      loading: false
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
      this.caseNumber = null;
      this.firstName = null;
      this.lastName = null;
      this.birthDate = null;
      this.diagnoseOfTumor = null;
      this.sex = null;
      this.vituID = null;
    },

    cancel() {
      this.$emit("cancel");
      this.clearFields();
    },

    async submit() {
      let form = this.$refs.addCaseForm;
      if (!form.checkValidity()) {
        form.reportValidity();
      } else {
        this.loading = true;
        try {
          await addEntry(this.caseNumber, this.patientId, this.firstName, this.lastName, this.diagnoseOfTumor, this.birthDate, this.sex, this.firstStatus, "", this.token);
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
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.button-panel {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .cancel-button {
    margin-right: 0.5rem;
  }
}
</style>
