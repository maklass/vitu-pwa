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
      :fluid="true"
    />
    <div class="container-fluid" v-if="paramsInitialized">
      <breadcrumps :breadcrumps="[{ name: $tc('worklist.worklist', 1), route: { name: 'clinical-cases' } }]" />
      <div class="page-header">
        <h5 class="headline">{{ $tc("worklist.worklist") }}</h5>
        <div class="spacer"></div>
        <router-link class="btn btn-primary" :to="{ name: 'patient-edit' }" :query="{ redirect: 'worklist' }">{{ $t("addClinicalCase") }}</router-link>
      </div>
      <div class="page-body">
        <div class="info-box" v-if="showInfoBox">
          <strong>{{ $t("hint") }}</strong> {{ $t("worklist.deactivatedStateInfo") }}
        </div>
        <div class="row justify-content-between">
          <div class="col-md-auto">
            <div class="row">
              <div class="input-group mb-3 col">
                <input class="form-control" :placeholder="searchPlaceholder" v-model="search" @input="onSearch" />
                <div class="input-group-append">
                  <select class="form-control" v-model="searchAttribute" @change="onChangeSearchAttribute">
                    <option v-for="column in searchableColumns" :key="column.name" :value="column.search">{{ $tc(`worklist.${column.name}`) }}</option>
                  </select>
                </div>
              </div>
              <div class="col-xs-auto align-self-center mb-3" v-if="showSearchIndicator">
                <spinner line-fg-color="#148898" line-bg-color="#99bfbf" />
              </div>
            </div>
          </div>
          <!-- <div class="form-group col-md-auto form-row">
            <label class="col-form-label col" for="entries-per-page">{{ $t("worklist.entriesPerPage") }}</label>
            <div class="col">
              <select id="entries-per-page" class="form-control" v-model="pageCount">
                <option v-for="option in pageOptions" :value="option" :key="option">{{ option }}</option>
              </select>
            </div>
          </div> -->
          <div class="col-md-auto mb-3">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label v-for="tabOption in tabOptions" :key="tabOption" :class="['btn', { active: tab === tabOption }]">
                <input type="radio" autocomplete="off" checked v-model="tab" :value="tabOption" />
                {{ $t(`worklist.${tabOption}`) }} <span class="badge badge-light" v-if="total && tab === tabOption">{{ total }}</span>
              </label>
            </div>
          </div>
        </div>
        <table class="table table-hover table-sm table-bordered" v-if="!loading">
          <thead>
            <tr class="row-header">
              <th v-for="column in columns" :key="column.name" @click="onSort(column.sort)" :class="[{ unsortable: !column.sort }]">
                <div class="th-wrapper">
                  <div>{{ $tc(`worklist.${column.name}`, 1) }}</div>
                  <div class="sort-icon-container">
                    <chevron-down-icon v-if="searchParams._sort === `-${column.sort}`" />
                    <chevron-up-icon v-else-if="searchParams._sort === column.sort" />
                    <chevron-up-icon class="hidden" v-else />
                  </div>
                </div>
              </th>
              <th v-if="tab === 'cancelled'" class="unsortable">
                <div>{{ $t("worklist.reasonForCancellation") }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clinicalCase in clinicalCases" :key="clinicalCase.id" @click="onRowClicked(clinicalCase)" :class="[{ 'table-danger': clinicalCase.statusInactive, highlight: $route.query.highlight === clinicalCase.id }]">
              <td v-for="column in columns" :key="column.name" :class="[{ 'text-rights': column.name === 'birthDate' }]">
                <span class="status-icons" v-if="tab === 'in-progress' && column.name === 'status'">
                  <span :style="{ color: getStatusIcon(clinicalCase) === 'TIMER' ? '#D06800 !important' : '' }">
                    <timer-sand-empty-icon class="icon" />
                  </span>
                  <span :style="{ color: getStatusIcon(clinicalCase) === 'CALENDAR' ? '#7A9814' : '' }">
                    <calendar-range-icon class="icon" />
                  </span>
                  <span :style="{ color: getStatusIcon(clinicalCase) === 'FOLDER' ? '#148898' : '' }">
                    <folder-account-icon class="icon" />
                  </span>
                </span>
                {{ getValueFromColumnName(clinicalCase, column) }}
              </td>
              <td v-if="tab === 'cancelled'">{{ getValueFromColumnName(clinicalCase, { name: "reasonForCancellation" }) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="text-center" v-if="clinicalCases && !clinicalCases.length">
          {{ $t("worklist.noEntriesFound") }}
        </div>
        <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
        <paginated-list :fhirBaseUrl="fhirBaseUrl" resourceName="Task" :searchParams="searchParams" :pageCount="pageCount" :searchable="false" @update="onBundleUpdated" @error="handlePaginatedListError">
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
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import { PaginatedList } from "@molit/fhir-components";
import NotificationPanels from "@/components/ui/NotificationPanels";
import config from "@/config/config";
import { mapState } from "vuex";
import notifications from "@/mixins/notifications";
import { fetchEpisodeOfCares } from "@/api/worklist-api";

import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft";
import ChevronDoubleLeftIcon from "vue-material-design-icons/ChevronDoubleLeft";
import ChevronRightIcon from "vue-material-design-icons/ChevronRight";
import ChevronDoubleRightIcon from "vue-material-design-icons/ChevronDoubleRight";
import ChevronDownIcon from "vue-material-design-icons/ChevronDown";
import ChevronUpIcon from "vue-material-design-icons/ChevronUp";
import CalendarRangeIcon from "vue-material-design-icons/CalendarRange";
import FolderAccountIcon from "vue-material-design-icons/FolderAccount";
import Spinner from "vue-simple-spinner";
import TimerSandEmptyIcon from "vue-material-design-icons/TimerSandEmpty";
import debounce from "debounce";
import { mapFhirData, mapFhirResponse, fetchResources } from "@molit/fhir-api";
import { getStringFromHumanName, getIdentifierBySystem } from "@molit/fhir-util";
import { get } from "lodash";

export default {
  mixins: [notifications],

  data() {
    return {
      columns: [
        {
          name: "creationDate",
          sort: "authored-on",
          search: "authored-on"
        },
        {
          name: "lastUpdated",
          sort: "_lastUpdated",
          search: "_lastUpdated"
        },
        {
          name: "caseId"
        },
        {
          name: "patient",
          sort: "patient",
          search: "patient.name:contains"
        },
        {
          name: "birthDate",
          search: "patient.birthdate"
        },
        // {
        //   name: "diagnosis"
        // },
        {
          name: "organization",
          search: "patient.organization.name:contains"
        },
        {
          name: "status",
          sort: "business-status",
          search: "business-status:text"
        }
      ],
      search: null,
      searchAttribute: "patient.name:contains",
      searchPlaceholder: this.$t("worklist.filterEntries"),
      showSearchIndicator: false,
      pageCount: 25,
      pageOptions: [10, 25, 50, 100],
      searchParams: {
        code: "http://molit.eu/fhir/NamingSystem/vitu-task|mtb-task",
        status: "in-progress",
        _sort: "-_lastUpdated",
        _include: ["Task:patient", "Task:input.valueReference"]
      },
      bundle: null,
      total: null,
      tab: "in-progress",
      tabOptions: ["in-progress", "completed", "cancelled"],
      episodeOfCares: null,
      paramsInitialized: false,
      reasonsForCancellation: null,
      statuses: null,
      showInfoBox: false,
      loading: true
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    clinicalCases() {
      if (this.bundle) {
        return mapFhirData(this.bundle).filter(e => e.resourceType === "Task");
      } else {
        return null;
      }
    },

    patients() {
      if (this.bundle) {
        return mapFhirData(this.bundle).filter(e => e.resourceType === "Patient");
      } else {
        return null;
      }
    },

    searchableColumns() {
      return this.columns.filter(c => c.search);
    }
  },

  methods: {
    async onBundleUpdated(bundle) {
      if (!bundle) {
        this.handleError("Something went wrong while fetching date from the server.");
      }
      try {
        const ids = mapFhirData(bundle)
          .filter(r => r.resourceType === "Task" && r.input && r.input[0] && r.input[0].valueReference && r.input[0].valueReference.reference)
          .map(t => t.input[0].valueReference.reference.split("/")[1]);
        if (ids && ids.length) {
          this.episodeOfCares = mapFhirResponse(await fetchEpisodeOfCares(this.fhirBaseUrl, ids, this.token));
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.handleError(e, true);
      }
      this.bundle = bundle;
      this.total = bundle.total;
      this.showSearchIndicator = false;
    },

    async fetchReasonsForCancellation() {
      try {
        const response = await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/vitu/ValueSet/tumorboard-cancellation-reason" });
        const entries = mapFhirResponse(response);
        if (entries && entries.length) {
          this.reasonsForCancellation = entries[0].compose.include[0].concept;
        }
      } catch (e) {
        this.loading = false;
        this.handleError(e, true);
      }
    },

    async fetchStatuses() {
      try {
        const valueSet = mapFhirResponse(await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist" }, this.token))[0];
        if (!valueSet) {
          throw new Error("ValueSet 'vitu-worklist' not found on server.");
        }
        this.statuses = valueSet.compose.include[0].concept;
      } catch (e) {
        this.loading = false;
        this.handleError(e, true);
      }
    },

    getStatusIcon(clinicalCase) {
      const code = get(clinicalCase, "businessStatus.coding[0].code", "");

      if (!code) {
        return null;
      }

      const timerStatuses = ["new", "finished-case-submission", "wait-for-report", "specimen-sent"];
      const calendarStatuses = ["case-review-announced", "report-ready"];
      const folderStatuses = ["case-discussed"];

      if (timerStatuses.includes(code)) {
        return "TIMER";
      } else if (calendarStatuses.includes(code)) {
        return "CALENDAR";
      } else if (folderStatuses.includes(code)) {
        return "FOLDER";
      }
      return null;
    },

    onChangeSearchAttribute() {
      if (this.searchAttribute === "patient.birthdate" || this.searchAttribute === "authored-on" || this.searchAttribute === "_lastUpdated") {
        this.searchPlaceholder = this.$t("placeholderDate");
      } else {
        this.searchPlaceholder = this.$t("worklist.filterEntries");
      }

      this.search = null;
      this.removeSearchAttributes();
    },

    onRowClicked(clinicalCase) {
      this.$router.push({ name: "clinical-case", params: { id: clinicalCase.id } });
    },

    onSort(attribute) {
      if (!attribute) {
        return;
      }
      this.showSearchIndicator = true;
      let sort;
      if (this.searchParams._sort === attribute) {
        sort = `-${attribute}`;
      } else {
        sort = attribute;
      }
      this.$set(this.searchParams, "_sort", sort);
    },

    onSearch: debounce(function() {
      let search = this.search;
      this.showSearchIndicator = true;
      if (this.searchAttribute === "patient.birthdate" || this.searchAttribute === "authored-on" || this.searchAttribute === "_lastUpdated") {
        const dateRegex = /^([0-9]{4}|[0-9]{4}-(0[1-9]|1[0-2])|[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))$/;
        const fullDateRegex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!dateRegex.test(search)) {
          this.$set(this.searchParams, this.searchAttribute, "");
          this.showSearchIndicator = false;
          return;
        } else {
          if (fullDateRegex.test(search)) {
            let lower = `gt${search}`;
            let upper = `lt${search}T23:59:59.999`;
            search = [lower, upper];
          } else {
            search = `eq${search}`;
          }
        }
      }
      this.$set(this.searchParams, this.searchAttribute, search);
    }, 250),

    onChangeTab() {
      this.total = null;
      this.bundle = null;
      this.$set(this.searchParams, "status", this.tab);
    },

    removeSearchAttributes() {
      this.columns.forEach(column => this.$delete(this.searchParams, column.search));
    },

    getValueFromColumnName(clinicalCase, column) {
      switch (column.name) {
        case "creationDate":
          if (clinicalCase.authoredOn) {
            return this.$d(new Date(clinicalCase.authoredOn));
          }
          break;
        case "lastUpdated":
          if (clinicalCase.meta && clinicalCase.meta.lastUpdated) {
            return this.$d(new Date(clinicalCase.meta.lastUpdated));
          }
          break;
        case "caseId": {
          const episodeOfCare = this.getEpisodeOfCareByClinicalCase(clinicalCase);
          if (episodeOfCare && episodeOfCare.identifier) {
            const identifier = getIdentifierBySystem(episodeOfCare.identifier, "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care");
            if (identifier) {
              return identifier.value;
            }
          }
          break;
        }
        case "patient":
          if (clinicalCase.for && clinicalCase.for.reference) {
            const patient = this.getByReference(this.patients, clinicalCase.for.reference);
            if (patient) {
              return getStringFromHumanName(patient.name);
            }
          }
          break;
        case "birthDate":
          if (clinicalCase.for && clinicalCase.for.reference) {
            const patient = this.getByReference(this.patients, clinicalCase.for.reference);
            if (patient && patient.birthDate) {
              return this.$d(new Date(patient.birthDate));
            }
          }
          break;
        case "diagnosis": {
          const episodeOfCare = this.getEpisodeOfCareByClinicalCase(clinicalCase);
          if (episodeOfCare && episodeOfCare.diagnosis && episodeOfCare.diagnosis[0] && episodeOfCare.diagnosis[0].condition && episodeOfCare.diagnosis[0].condition.display) {
            return episodeOfCare.diagnosis[0].condition.display;
          }
          break;
        }
        case "organization": {
          if (clinicalCase.for && clinicalCase.for.reference) {
            const patient = this.getByReference(this.patients, clinicalCase.for.reference);
            if (patient && patient.managingOrganization) {
              return patient.managingOrganization.display;
            }
          }
          break;
        }
        case "status": {
          let text = null;
          if (this.statuses) {
            let status = this.statuses.find(s => s.code === get(clinicalCase, "businessStatus.coding[0].code", ""));
            if (status) {
              text = get(status, "extension[0].valueDecimal", null);
            }
          }
          if (clinicalCase.status === "in-progress" && text !== null && text !== undefined) {
            text = text + 1 + "/" + (this.statuses.length - 1) + " · " + clinicalCase.businessStatus.text;
          } else if (clinicalCase.status === "in-progress" && (text === null || text === undefined)) {
            text = clinicalCase.businessStatus.text;
            this.$set(clinicalCase, "statusInactive", true);
            this.showInfoBox = true;
          } else {
            text = clinicalCase.businessStatus.text;
          }
          return text;
        }
        case "reasonForCancellation": {
          const reasonForCancellation = get(clinicalCase, "extension[0].extension[0].valueCodeableConcept.coding[0]", null);
          if (reasonForCancellation && reasonForCancellation.code !== "other" && this.reasonsForCancellation) {
            const reason = this.reasonsForCancellation.find(r => r.code === reasonForCancellation.code);
            if (reason) {
              return reason.display;
            } else {
              return "";
            }
          } else {
            return get(clinicalCase, "extension[0].extension[1].valueString", "");
          }
        }
      }
      return "";
    },

    getById(array, id) {
      if (!id || !array) {
        return null;
      }

      return array.find(p => p.id === id);
    },

    getByReference(array, reference) {
      if (!reference || !array) {
        return null;
      }

      const id = reference.split("/")[1];
      return this.getById(array, id);
    },

    getEpisodeOfCareByClinicalCase(clinicalCase) {
      if (clinicalCase.input && clinicalCase.input[0] && clinicalCase.input[0].valueReference && clinicalCase.input[0].valueReference.reference) {
        return this.getByReference(this.episodeOfCares, clinicalCase.input[0].valueReference.reference);
      }
      return null;
    },

    handlePaginatedListError(e) {
      this.handleError(e, true);
    }
  },

  async mounted() {
    if (this.$route.query.success) {
      this.success = this.$t(this.$route.query.success);
    }
    if (this.$route.query.tab) {
      if (this.tabOptions.includes(this.$route.query.tab)) {
        this.tab = this.$route.query.tab;
      }
    }
    await this.fetchStatuses();
    await this.fetchReasonsForCancellation();
    this.paramsInitialized = true;
  },

  watch: {
    tab() {
      this.onChangeTab();
    }
  },

  components: {
    Breadcrumps,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    CalendarRangeIcon,
    FolderAccountIcon,
    NotificationPanels,
    PaginatedList,
    Spinner,
    TimerSandEmptyIcon
  }
};
</script>

<style lang="scss" scoped>
label {
  white-space: nowrap;
}

th {
  cursor: pointer;

  .th-wrapper {
    display: flex;
  }
}

tr {
  cursor: pointer;
}

.sort-icon-container {
  flex: 1;
  text-align: right;
}

.input-group-append {
  select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    option {
      background: white;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.075);
    }
  }
}

.unsortable {
  cursor: initial;
}

.row-header {
  user-select: none;
}

.row-filter,
.row-header {
  cursor: initial;

  &:active,
  &:focus {
    background: inherit;
  }
}

label.btn {
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  margin-left: 0.5rem !important;
  margin-right: 0.5rem !important;
  border: 0;
  border-radius: 0;
  border-bottom: 0.25rem transparent solid;

  &.active {
    font-weight: bold;
    border-bottom: 0.25rem $vitu-green solid;
  }
}

.status-icons {
  color: #aaa;
  margin-right: 1rem;

  .icon {
    min-width: 1.1rem;
  }
}

.highlight {
  background: rgba(0, 0, 0, 0.075);
}
</style>
