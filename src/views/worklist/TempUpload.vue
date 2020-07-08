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
      <breadcrumps :breadcrumps="[{ name: $tc('upload', 2), route: { name: 'temp-upload' } }]" />
      <h2>Files</h2>
      <ul>
        <li v-for="file in files" :key="file.id">
          <a href="" target="_blank">{{ file.id }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import config from "@/config/config";
import { mapState } from "vuex";
import { fetchResources, mapFhirResponse } from "@molit/fhir-api";

export default {
  mixins: [notifications],

  components: {
    Breadcrumps,
    NotificationPanels
  },

  data() {
    return {
      files: [],
      newFile: null
    };
  },

  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    ...mapState({
      token: state => state.authentication.keycloak.token,
      keycloak: state => state.authentication.keycloak
    })
  },

  methods: {
    async getFiles() {
      try {
        const params = {
          _summary: true,
          _count: 10000
        };
        this.files = mapFhirResponse(await fetchResources(this.fhirBaseUrl, "Binary", params, this.token));
      } catch (e) {
        console.warning("Propably not in VPN.");
      }
    },

    deleteFile() {},

    uploadFile() {}
  },

  async created() {
    this.getFiles();
  }
};
</script>
