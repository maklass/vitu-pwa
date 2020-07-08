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
          { name: $tc('admin.organization', 2), route: { name: 'organizations' } }
        ]"
      />
      <div class="page-header">
        <h5 class="headline">{{ $tc("admin.organization", 2) }}</h5>
        <div class="spacer"></div>
        <router-link class="btn btn-primary" :to="{ name: 'organization', params: { id: 'new' } }">{{ $t("admin.addOrganization") }}</router-link>
      </div>
      <div class="page-body">
        <div class="main">
          <h6>{{ $t("admin.existingOrganizations") }}</h6>
        </div>
        <paginated-list
          :fhirBaseUrl="fhirBaseUrl"
          resourceName="Organization"
          :searchParams="searchParams"
          :searchAttributes="searchAttributes"
          :searchInputPlaceholder="$t('admin.searchOrganization')"
          @update="onBundleUpdated"
          @error="handlePaginatedError"
        >
          <div v-if="organizations && organizations.length">
            <list-item class="list-item" v-for="organization in organizations" :key="organization.id" :title="organization.name" :subtitle="getSubtitle(organization)" :to="{ name: 'organization', params: { id: organization.id } }">
              <template slot="icon">
                <bank-icon class="icon" />
              </template>
              <template slot="actions">
                <b-dropdown right variant="link" no-caret>
                  <template slot="button-content">
                    <dots-vertical-icon />
                  </template>
                  <b-dropdown-item :to="{ name: 'organization', params: { id: organization.id }, query: { mode: 'edit' } }">{{ $t("admin.editOrganization") }}</b-dropdown-item>
                </b-dropdown>
              </template>
            </list-item>
          </div>
          <template slot="firstPage">
            <chevron-double-left-icon />
          </template>
          <template slot="previousPage">
            <chevron-left-icon />
          </template>
          <template slot="nextPage">
            <chevron-right-icon />
          </template>
          <template slot="lastPage">
            <chevron-double-right-icon />
          </template>
        </paginated-list>
        <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="organizations && !organizations.length">{{ $t("admin.noOrganizations") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import { PaginatedList } from "@molit/fhir-components";
import config from "@/config/config";
import { mapFhirData } from "@molit/fhir-api";
import * as fhirUtil from "@molit/fhir-util";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import Spinner from "vue-simple-spinner";

import DotsVerticalIcon from "vue-material-design-icons/DotsVertical";
import BankIcon from "vue-material-design-icons/Bank";
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft";
import ChevronDoubleLeftIcon from "vue-material-design-icons/ChevronDoubleLeft";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight";
import ChevronDoubleRightIcon from "vue-material-design-icons/ChevronDoubleRight";

export default {
  mixins: [notifications],
  components: {
    Spinner,
    Breadcrumps,
    NotificationPanels,
    PaginatedList,
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
    BankIcon,
    DotsVerticalIcon,
    ListItem
  },
  data() {
    return {
      error: null,
      success: null,
      showSuccess: false,
      organizations: null,
      searchParams: { _sort: "name", active: true },
      searchAttributes: [{ name: "name", value: "name" }],
      loading: true
    };
  },
  computed: {
    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },
  methods: {
    getSubtitle(organization) {
      if (organization) {
        let subtitle = "Id: " + organization.id;
        return subtitle;
      }
      return "";
    },
    /**
     *
     */
    getName(name) {
      return fhirUtil.getStringFromHumanName(name, true);
    },

    onBundleUpdated(bundle) {
      this.organizations = mapFhirData(bundle);
      this.loading = false;
    },

    handlePaginatedError(e) {
      this.handleError(e, true);
      this.loading = false;
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
.list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 0.8rem;
  padding-bottom: 0.6rem;

  &:last-child {
    border: 0;
  }
}

.icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}
</style>
