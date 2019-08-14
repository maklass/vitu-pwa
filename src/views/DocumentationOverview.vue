<template>
  <div class="documentation-overview-wrapper">
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="showSuccess" :successMessage="$t('admin.saveSuccessful')" />
    <div class="documentation-overview">
      <div class="container">
        <div class="admin-header">
          <h5 class="headline">{{ $t("documentation.documentation") }}</h5>
          <div class="spacer" />
          <router-link class="btn btn-primary" tag="button" :to="{ name: 'documentation-new' }">{{ $t("documentation.newProtocol") }}</router-link>
        </div>
        <div class="main">
          <h6>{{ $t("documentation.existingProtocols") }}</h6>
        </div>
        <paginated-list :fhirBaseUrl="fhirBaseUrl" resourceName="Composition" :searchParams="searchParams" :searchAttributes="searchAttributes" :searchInputPlaceholder="$t('documentation.searchProtocol')" @update="onBundleUpdated">
          <div v-if="protocols && protocols.length">
            <list-item class="list-item" v-for="protocol in protocols" :key="protocol.id" :title="protocol.subject.display" :subtitle="$d(new Date(protocol.date))" @click="onClick(protocol)">
              <template slot="icon">
                <file-document-icon class="icon" />
              </template>
            </list-item>
          </div>
        </paginated-list>
        <spinner v-if="!protocols" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="protocols && !protocols.length">{{ $t("documentation.noProtocolsFound") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { mapFhirData } from "@molit/fhir-api";
import { handleAxiosError } from "@/util/error-util";
import config from "@/config/config";

import FileDocumentIcon from "vue-material-design-icons/FileDocument";
import Spinner from "vue-simple-spinner";
import { PaginatedList } from "@molit/fhir-components";

export default {
  data() {
    return {
      error: null,
      showSuccess: false,
      protocols: null,
      searchParams: {
        type: "http://molit.eu/fhir/genomics/CodeSystem/documentType|tumor-recommendation-protocol",
        _sort: "-date"
      },
      searchAttributes: [
        {
          name: "Subject",
          value: "subject:Patient.name:contains"
        }
      ]
    };
  },

  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },

  methods: {
    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    },

    onClick(protocol) {
      this.$router.push({ name: "documentation", params: { id: protocol.id } });
    },

    handleQueryParams() {
      if (this.$route.query.success) {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      }
    },

    onBundleUpdated(bundle) {
      this.protocols = mapFhirData(bundle);
    }
  },

  mounted() {
    this.handleQueryParams();
  },

  components: {
    FileDocumentIcon,
    ListItem,
    NotificationPanels,
    Spinner,
    PaginatedList
  }
};
</script>

<style lang="scss" scoped>
.documentation-overview {
  padding-bottom: 1rem;
}

.main {
  padding-top: 1rem;
}

.documentation-overview-wrapper {
  background: white;
  flex: 1;
}

.list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 0.8rem;
  padding-bottom: 0.6rem;

  &:last-child {
    border: 0;
  }

  cursor: pointer;
}

.icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}
</style>
