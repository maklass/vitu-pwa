<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="false" />
    <div class="container">
      <div class="page-header">
        <h5>{{ $t("addPatient") }}</h5>
      </div>
      <div class="page-body">
        <form autocomplete="off" ref="form" v-on:submit.prevent="onSubmit">
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
                  <option value="male">{{ $t("male") }}</option>
                  <option value="female">{{ $t("female") }}</option>
                  <option value="other">{{ $t("diverse") }}</option>
                  <option value="unknown">{{ $t("unknown") }}</option>
                </select>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
      <div class="page-footer">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel" @click="onCancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationPanels from "@/components/ui/NotificationPanels";
import { addPatient } from "@/api/worklist-api";
import { handleAxiosError } from "@/util/error-util";
import config from "@/config/config";
import { mapState } from "vuex";

export default {
  data() {
    return {
      error: null,
      patientId: null,
      firstName: null,
      lastName: null,
      birthDate: null,
      gender: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },

  methods: {
    onCancel() {
      this.$router.go(-1);
    },

    onError(error) {
      this.error = handleAxiosError(error);
      window.scrollTo(0, 0);
    },

    async onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      try {
        const response = await addPatient(this.fhirBaseUrl, this.patientId, this.firstName, this.lastName, this.birthDate, this.gender, this.token);
        const patient = response.data;
        if (this.$route.query.redirect) {
          this.$router.push({ name: this.$route.query.redirect, query: { patientId: patient.id, success: "patientCreatedSuccessfully" } });
        }
      } catch (e) {
        this.onError(e);
      }
    }
  },

  components: {
    NotificationPanels
  }
};
</script>

<style lang="scss" scoped>
.btn-cancel {
  margin-right: 0.5rem;
}
</style>
