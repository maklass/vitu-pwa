<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="showSuccess" :successMessage="successMessage" :fluid="true" />
    <b-container fluid>
      <div class="info-box" v-if="showInfoBox">
        <strong>{{ $t("hint") }}</strong> {{ $t("worklist.deactivatedStateInfo") }}
      </div>
      <b-card no-body>
        <b-tabs card v-model="tabIndex">
          <b-tab :title="$t('worklist.current')" active no-body />
          <b-tab :title="$t('worklist.completed')" no-body />
          <b-tab :title="$t('worklist.canceled')" no-body />
          <div class="card-body">
            <b-row>
              <b-col md="auto">
                <b-form-group :label="$t('worklist.filterEntries')" label-cols="5">
                  <b-form-input id="input-filter" v-model="filter" type="text" :placeholder="$t('worklist.filterEntries')"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col md="auto" align-self="center" style="margin-bottom: 1rem">
                <button class="btn btn-primary" @click="showAddCaseModal">{{ $t("planner.addCase") }}</button>
              </b-col>
              <b-col align="right" class="ml-auto" align-self="center" style="margin-bottom: 1rem">{{ totalRows }} {{ $tc("worklist.entry", totalRows) }}</b-col>
              <b-col md="auto">
                <b-pagination align="right" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" />
              </b-col>
              <b-col md="auto">
                <b-form-group :label="$t('worklist.entriesPerPage')" label-cols="8">
                  <b-form-select :options="pageOptions" v-model="perPage" />
                </b-form-group>
              </b-col>
            </b-row>
            <b-table
              hover
              :fields="fields"
              :items="items"
              :bordered="true"
              :small="true"
              :current-page="currentPage"
              :per-page="perPage"
              :filter="filter"
              @row-clicked="onRowClicked"
              :sort-compare="sortCompare"
              stacked="md"
              sort-by="statusNumber"
            >
              <template slot="statusIcons" slot-scope="row">
                <div class="status">
                  <div class="status-icons">
                    <timer-sand-empty-icon :style="{ color: row.item.status.icon === 'TIMER' ? '#D06800' : '' }" />
                    <calendar-range-icon :style="{ color: row.item.status.icon === 'CALENDAR' ? '#7A9814' : '' }" />
                    <folder-account-icon :style="{ color: row.item.status.icon === 'FOLDER' ? '#148898' : '' }" />
                  </div>
                </div>
              </template>
            </b-table>
            <spinner v-if="!items" class="spinner" line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" :message="$t('data.loading')" />
          </div>
        </b-tabs>
      </b-card>

      <b-modal id="modalDetails" ref="modalDetails" size="lg" @hide="resetModal" :title="$t('worklist.details')" :header-text-variant="'primary'" hide-footer>
        <div v-if="item && !changingStatus && !statusChanged">
          <div class="case-details-header">
            <div class="case-details-info">
              <h5 class="case-details-title">{{ $t("worklist.case") }} {{ item.caseId }}</h5>
              <p>
                {{ item.patientName }}, {{ item.patientBirthDate ? $d(new Date(item.patientBirthDate)) : "" }}<br />
                {{ $t("worklist.currentStatus") }}: {{ item.statusLabel }}<br />
                {{ $t("worklist.diagnosis") }}: {{ item.diagnosis }}
              </p>
            </div>
            <div>
              <b-dropdown id="dropdown-right" right text="" variant="secondary" class="m-2">
                <template slot="button-content">
                  <delete-icon class="delete-icon" />
                </template>
                <b-dropdown-item @click="deleteEntry(item.id)">{{ $t("worklist.deleteCase") }}</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <div class="form-group">
            <label>{{ $t("worklist.changeStatus") }}</label>
            <select class="form-control" v-model="item.status.id">
              <option v-for="status in statusesWithoutDisabled" :key="status.id" :value="status.id">{{ status.orderNumber }} - {{ $t(`worklist.statusCode.${status.description}`) }}</option>
            </select>
          </div>
          <div class="form-group" v-if="statuses && getStatusById(item.status.id) && getStatusById(item.status.id).description === 'CANCELED'">
            <label>{{ $t("worklist.reasonForCancellation") }}</label>
            <select class="form-control" v-model="item.reasonForCancellation">
              <option selected disabled value="undefined">{{ $t("pleaseSelect") }}</option>
              <option v-for="reason in reasonsForCancellation" :key="reason.code" :value="reason.code">{{ reason.display }}</option>
            </select>
          </div>
          <div class="form-group" v-if="statuses && getStatusById(item.status.id) && getStatusById(item.status.id).description === 'CANCELED' && item.reasonForCancellation === 'other'">
            <label>{{ $t("worklist.reason") }}</label>
            <input class="form-control" v-model="item.reasonForCancellationOther" v-on:keyup.enter="changeStatus(item.id, item.status.id, item.reasonForCancellation, item.reasonForCancellationOther)" />
          </div>
          <div class="button-panel">
            <button class="btn btn-secondary btn-cancel" @click="hideDetailsModal">{{ $t("cancel") }}</button>
            <button class="btn btn-primary" @click="changeStatus(item.id, item.status.id, item.reasonForCancellation, item.reasonForCancellationOther)">{{ $t("worklist.changeStatus") }}</button>
          </div>
        </div>
        <div v-else-if="changingStatus">
          <spinner line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
        </div>
        <div v-else-if="statusChanged">
          {{ $t("worklist.statusChangedSuccessfully") }}
          <div class="button-panel">
            <button class="btn btn-primary" @click="hideDetailsModal">OK</button>
          </div>
        </div>
        <div v-else-if="!item">
          {{ $t("worklist.noItemSelected") }}
          <div class="button-panel">
            <button class="btn btn-primary" @click="hideDetailsModal">OK</button>
          </div>
        </div>
      </b-modal>

      <b-modal id="modalAddEntry" ref="modalAddEntry" size="lg" :title="$t('planner.addCase')" :header-text-variant="'primary'" hide-footer>
        <form-add-case :statuses="statuses" @cancel="hideAddCaseModal" @success="onCaseAddSuccess" />
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import DiagnosticReport from "@/components/fhir/DiagnosticReport";
import FormAddCase from "@/components/FormAddCase";
import Procedure from "@/components/fhir/Procedure";
import { getStatuses, fetchEntries, updateEntry, deleteEntry } from "../api/process-api";
import { handleAxiosError } from "@/util/error-util";
import { toString } from "@/util/util";
import * as fhirApi from "@molit/fhir-api";
import config from "../config/config";

import CalendarRangeIcon from "vue-material-design-icons/CalendarRange";
import DeleteIcon from "vue-material-design-icons/Delete";
import FolderAccountIcon from "vue-material-design-icons/FolderAccount";
import Spinner from "vue-simple-spinner";
import TimerSandEmptyIcon from "vue-material-design-icons/TimerSandEmpty";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { mapState } from "vuex";

export default {
  data() {
    return {
      filter: null,
      pageOptions: [5, 25, 50, 100, 500],
      currentPage: 1,
      perPage: 25,
      successMessage: null,
      item: null,
      entries: null,
      changingStatus: false,
      statusChanged: false,
      tabIndex: 0,
      statuses: [],
      reasonsForCancellation: [{ value: "deceased", display: this.$t("worklist.reasonCode.deceased") }, { value: "other", display: this.$t("worklist.reasonCode.other") }],
      showInfoBox: false,
      error: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),

    showSuccess() {
      if (this.successMessage) {
        return true;
      } else {
        return false;
      }
    },

    statusesWithoutDisabled() {
      if (this.statuses) {
        return this.statuses.filter(status => !status.disabled);
      }
    },

    totalRows() {
      if (this.items) {
        return this.items.length;
      }
      return 0;
    },

    items() {
      if (!this.entries || !this.entries.entity) {
        return null;
      } else {
        return this.entries.entity
          .filter(entry => {
            if (this.tabIndex === 0) {
              return entry.status.description !== "COMPLETED" && entry.status.description !== "CANCELED";
            } else if (this.tabIndex === 1) {
              return entry.status.description === "COMPLETED";
            } else {
              return entry.status.description === "CANCELED";
            }
          })
          .map(entry => {
            return {
              id: entry.id,
              creationDate: entry.date_created,
              creationDateLocale: entry.date_created ? this.$i18n.d(new Date(entry.date_created)) : "",
              patientName: entry.patient.firstName + " " + entry.patient.lastName,
              patientBirthDate: entry.patient.dateOfBirth,
              patientBirthDateLocale: entry.patient.dateOfBirth ? this.$i18n.d(new Date(entry.patient.dateOfBirth)) : "",
              caseId: entry.orbisCaseNo,
              diagnosis: entry.tumorDiagnose,
              status: entry.status,
              _rowVariant: !this.isStatusActive(entry.status) ? "danger" : "",
              statusNumber: `${entry.status.orderNumber}/${this.statuses.length - 1}`,
              orderNumber: entry.status.orderNumber,
              reasonForCancellation: entry.reasonForCancellation,
              reasonForCancellationOther: entry.reasonForCancellationOther,
              reasonForCancellationLabel: this.getReasonForCancellationLabelByEntry(entry),
              statusLabel: this.$t(`worklist.statusCode.${entry.status.description}`)
            };
          })
          .sort((e1, e2) => e1.orderNumber - e2.orderNumber);
      }
    },

    fields() {
      return [
        {
          key: "creationDate",
          label: this.$i18n.t("worklist.creationDate"),
          sortable: true,
          formatter: value => {
            return value ? this.$i18n.d(new Date(value)) : "";
          }
        },
        {
          key: "caseId",
          label: this.$i18n.t("worklist.caseId"),
          sortable: true
        },
        {
          key: "patientName",
          label: this.$i18n.t("worklist.patient"),
          sortable: true
        },
        {
          key: "patientBirthDate",
          label: this.$i18n.t("worklist.birthDate"),
          sortable: true,
          formatter: value => {
            return value ? this.$i18n.d(new Date(value)) : "";
          }
        },
        {
          key: "diagnosis",
          label: this.$i18n.t("worklist.diagnosis"),
          sortable: true
        },
        this.tabIndex === 0
          ? {
              key: "statusIcons",
              label: this.$i18n.t("worklist.status"),
              sortable: false
            }
          : "",
        this.tabIndex === 0
          ? {
              key: "statusNumber",
              label: "",
              sortable: true,
              class: "align-right"
            }
          : "",
        {
          key: "statusLabel",
          label: this.$i18n.t("worklist.statusDescription"),
          sortable: true
        },
        this.tabIndex === 2
          ? {
              key: "reasonForCancellationLabel",
              label: this.$i18n.t("worklist.reasonForCancellation"),
              sortable: true
            }
          : ""
      ];
    }
  },

  methods: {
    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    },

    isStatusActive(status) {
      if (!this.statuses) {
        return false;
      }

      const s = this.statuses.find(s => s.id === status.id);
      if (!s) {
        this.showInfoBox = true;
      }
      return s;
    },

    sortCompare(aRow, bRow, key) {
      if (key === "patientBirthDate" || key === "creationDate") {
        const a = aRow[key];
        const b = bRow[key];

        return toString(a).localeCompare(toString(b), undefined, {
          numeric: true
        });
      } else {
        // Let b-table handle sorting other fields (other than `date` fields)
        return false;
      }
    },

    onRowClicked(item) {
      this.item = item;
      this.$refs.modalDetails.show();
    },

    showAddCaseModal() {
      this.$refs.modalAddEntry.show();
    },

    hideAddCaseModal() {
      this.$refs.modalAddEntry.hide();
    },

    hideDetailsModal() {
      this.$refs.modalDetails.hide();
    },

    resetModal() {
      this.item = null;
      this.statusChanged = false;
    },

    onCaseAddSuccess() {
      this.reload();
      this.successMessage = this.$t("worklist.successfullyAddedCase");
      setTimeout(() => {
        this.successMessage = null;
      }, config.SUCCESS_HEADER_TIMEOUT);
    },

    reload() {
      this.hideAddCaseModal();
      this.initialize();
    },

    getNextStatus(description) {
      let index = this.statuses.findIndex(status => status.description === description);
      return this.statuses[index + 1];
    },

    getReasonForCancellationLabelByEntry(entry) {
      if (!entry || !entry.reasonForCancellation) {
        return "";
      }

      let reason = this.reasonsForCancellation.find(reason => reason.code === entry.reasonForCancellation);
      let label = "";

      if (reason && reason.display) {
        label = reason.display;
      } else {
        label = entry.reasonForCancellation;
      }

      if (entry.reasonForCancellation === "other" && entry.reasonForCancellationOther) {
        label += ": " + entry.reasonForCancellationOther;
      }

      return label;
    },

    getStatusById(id) {
      if (!id || !this.statuses) {
        return undefined;
      }
      return this.statuses.find(status => status.id === id);
    },

    switchTabByStatus(status) {
      if (!status) {
        return;
      }

      switch (status.description) {
        case "COMPLETED":
          this.tabIndex = 1;
          break;
        case "CANCELED":
          this.tabIndex = 2;
          break;
        default:
          this.tabIndex = 0;
      }
    },

    async changeStatus(entryId, statusId, reasonForCancellation, reasonForCancellationOther) {
      try {
        let entry = this.entries.entity.find(entry => entry.id === entryId);
        if (entry) {
          entry.status = this.statuses.find(status => status.id === statusId);
          entry.reasonForCancellation = reasonForCancellation;
          entry.reasonForCancellationOther = reasonForCancellationOther;
          this.changingStatus = true;
          await updateEntry(entry, this.token);
          this.switchTabByStatus(entry.status);
          this.changingStatus = false;
          this.statusChanged = true;
          this.reload();
        }
      } catch (e) {
        this.handleError(e);
      }
    },

    async deleteEntry(entryId) {
      try {
        await deleteEntry(entryId, this.token);
        this.successMessage = this.$t("worklist.successfullyAddedCase");
        setTimeout(() => {
          this.successMessage = null;
        }, config.SUCCESS_HEADER_TIMEOUT);
        this.hideDetailsModal();
        this.reload();
      } catch (e) {
        this.handleError(e);
      }
    },

    async initialize() {
      try {
        let response = await getStatuses({}, this.token);
        if (response.status === 200) {
          this.statuses = response.data.filter(status => !status.disabled).sort((e1, e2) => e1.orderNumber - e2.orderNumber);
        }
        response = await fhirApi.fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/genomics/ValueSet/tumorboard-abbruchgrund" });
        let reasons = fhirApi.mapFhirData(response.data);
        if (reasons && reasons.length) {
          this.reasonsForCancellation = reasons[0].expansion.contains;
        }
        response = await fetchEntries({}, this.token);
        if (response.status === 200) {
          this.entries = response.data;
        }
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    this.initialize();
  },

  components: {
    CalendarRangeIcon,
    DeleteIcon,
    DiagnosticReport,
    FolderAccountIcon,
    FormAddCase,
    NotificationPanels,
    Procedure,
    Spinner,
    TimerSandEmptyIcon
  }
};
</script>

<style lang="scss" scoped>
.container-fluid {
  padding-top: 15px;
}

.table {
  background: white;
  margin-bottom: 0;
}

.spinner {
  margin-top: 2rem;
}

.status {
  display: flex;
  justify-content: space-between;
}

.status-icons {
  color: #aaa;
}

.delete-icon {
  color: rgba(0, 0, 0, 0.6);
}

.button-panel {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .btn-cancel {
    margin-right: 0.5rem;
  }
}

.case-details-title {
  text-overflow: ellipsis;
  overflow: hidden;
}

.case-details-header {
  display: flex;
}

.case-details-info {
  flex: 1;
  overflow-x: hidden;
  margin-right: 1rem;
}
</style>

<style lang="scss">
.table .sorting::after,
.table .sorting::before {
  color: map-get($theme-colors, "primary");
}

.table .sorting::before {
  content: "\02c4" !important;
  right: 0.5em !important;
  top: -0.25em;
}

.table .sorting::after {
  content: "\02c5" !important;
  right: 0.5em !important;
  top: 0.5em;
}

.table tr {
  cursor: pointer;
}

.table tr:focus,
.table tr:active {
  background: rgba(0, 0, 0, 0.075);
}

.table .align-right {
  text-align: right;
}

.card-header {
  background: white;
}

.vue-simple-spinner-text {
  font-size: 1.2rem !important;
}
</style>
