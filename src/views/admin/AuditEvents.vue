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
      <breadcrumps
        :breadcrumps="[
          { name: $t('admin.adminArea'), route: { name: 'admin' } },
          { name: $t('auditLog'), route: { name: 'auditevents' } }
        ]"
      />
      <spinner class="spinner" v-if="spinner.loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      <div class="page-header" v-if="!spinner.loading">
        <h5 class="headline">{{ $t("auditLog") }}</h5>
        <div class="spacer"></div>
      </div>
      <div class="page-body">
        <div v-if="!auditEvents" class="no-logs">{{ $t("noAuditEvents") }}</div>
        <table class="table table-sm" v-if="auditEvents && !spinner.loading">
          <thead>
            <tr class="row-header">
              <th v-for="column in columns" :key="column.name">
                <div>{{ getTranslatedName(column.name) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in auditEvents" :key="event.id">
              <td v-for="column in columns" :key="column.name">
                <div v-if="column.name === 'object'">
                  <a :href="`${fhirBaseUrl}/${getValueFromColumnName(event, column.name)}`" target="_blank">{{ getValueFromColumnName(event, column.name) }}</a>
                </div>
                <div v-else>{{ getValueFromColumnName(event, column.name) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <paginated-list
          :searchable="false"
          :fhirBaseUrl="fhirBaseUrl"
          resourceName="AuditEvent"
          :searchParams="searchParams"
          :pageCount="250"
          :searchAttributes="searchAttributes"
          :searchInputPlaceholder="$t('admin.searchOrganization')"
          @update="onBundleUpdated"
          @error="handlePaginatedError"
        >
        </paginated-list>
      </div>
    </div>
  </div>
</template>

<script>
import { PaginatedList } from "@molit/fhir-components";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import Spinner from "vue-simple-spinner";
import config from "@/config/config";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { mapFhirData } from "@molit/fhir-api";
export default {
  mixins: [notifications],
  components: {
    Spinner,
    Breadcrumps,
    NotificationPanels,
    PaginatedList
  },
  data() {
    return {
      columns: [
        {
          name: "date"
        },
        {
          name: "user"
        },
        {
          name: "action"
        },
        {
          name: "subtype"
        },
        {
          name: "type"
        },
        {
          name: "object"
        },
        {
          name: "outcome"
        }
      ],
      error: null,
      success: null,
      showSuccess: false,
      auditEvents: null,
      searchParams: { _sort: "-date" },
      searchAttributes: [],
      spinner: { loading: true }
    };
  },
  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },
  methods: {
    getTranslatedName(name) {
      switch (name) {
        case "action":
          return this.$t("action");
        case "date":
          return this.$t("worklist.date");
        case "user":
          return this.$t("admin.user");
        case "type":
          return this.$t("type");
        case "subtype":
          return this.$t("subtype");
        case "object":
          return this.$t("object");
        case "outcome":
          return this.$t("outcome");
        default:
          return "";
      }
    },
    getValueFromColumnName(event, name) {
      switch (name) {
        case "action":
          if (event.action) {
            return event.action;
          }
          break;
        case "date":
          if (event.recorded) {
            let date = new Date(event.recorded);
            return this.$d(date, "long");
          }
          break;
        case "user":
          if (event.agent[0].name) {
            return event.agent[0].name;
          }
          break;
        case "type":
          if (event.type) {
            return event.type.display;
          }
          break;
        case "subtype":
          if (event.subtype) {
            return event.subtype[0].display;
          }
          break;
        case "object":
          if (event.entity[0].what) {
            return event.entity[0].what.reference;
          }
          break;
        case "outcome":
          if (event.outcome) {
            return this.getOutcomeValue(event.outcome);
          }
          break;
        default:
          return "";
      }
    },
    getOutcomeValue(code) {
      switch (code) {
        case "0":
          return "Success";
        case "4":
          return "Minor failure";
        case "8":
          return "Serious failure";
        case "12":
          return "Major failure";
      }
    },
    onBundleUpdated(bundle) {
      this.spinner.loading = false;
      this.auditEvents = mapFhirData(bundle);
    },

    handlePaginatedError(e) {
      this.handleError(e, true);
      this.spinner.loading = false;
    }
  },
  mounted() {
    if (this.$route.query.success) {
      this.showSuccess = true;
      this.success = this.$t(this.$route.query.success);
    }
  }
};
</script>

<style lang="scss" scoped>
.no-logs {
  display: flex;
  justify-content: center;
  margin: 8px;
}
.spinner {
  margin: 8px;
}
</style>
