<template>
  <div>
    <div>
      <div class="genetic-report-information pt-2">
        <h5>Befundanforderung</h5>
        Keine Befundanforderung vorhanden.
        <hr />

        <genetic-report :fhirBaseUrl="fhirBaseUrl" :id="reportId" :token="token" v-if="false" />
      </div>
    </div>
  </div>
</template>

<script>
import { GeneticReport } from "@molit/fhir-components";
import config from "@/config/config";
import { mapState } from "vuex";

export default {
  props: {
    reportId: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapState({
      keycloak: state => state.authentication.keycloak,
      token: state => state.authentication.keycloak.token
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },

  components: {
    GeneticReport
  }
};
</script>

<style lang="scss" scoped></style>
