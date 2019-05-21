<template>
  <div>
    <Navbar />
    <b-container fluid>
      <b-card no-body>
        <b-tabs card v-model="tabIndex">
          <b-tab :title="$t('worklist.current')" active no-body />
          <b-tab :title="$t('worklist.completed')" no-body />
          <b-tab :title="$t('worklist.canceled')" no-body />
          <div class="card-body">
            <b-row>
              <b-col md="auto">
                <b-form-group horizontal :label="$t('worklist.filterEntries')" label-cols="5">
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
                <b-form-group horizontal :label="$t('worklist.entriesPerPage')" label-cols="8">
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
              @filtered="onFiltered"
              @row-clicked="onRowClicked"
              stacked="md"
            >
              <template slot="statusIcons" slot-scope="row">
                <div class="status">
                  <div class="status-icons">
                    <timer-sand-empty-icon :style="{ color: row.item.status.icon === 'TIMER' ? '#D06800' : '' }" />
                    <calendar-range-icon :style="{ color: row.item.status.icon === 'CALENDAR' ? '#7A9814' : '' }" />
                    <folder-account-icon :style="{ color: row.item.status.icon === 'FOLDER' ? '#148898' : '' }" />
                  </div>
                  <div class="status-number">
                    {{ row.item.statusNumber }}
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
          <h5>{{ $t("worklist.case") }} {{ item.caseId }}</h5>
          <p>
            {{ item.patientName }}, {{ item.patientBirthDate }}<br />
            {{ $t("worklist.currentStatus") }}: {{ item.statusLabel }}
          </p>
          <div class="form-group">
            <label>{{ $t("worklist.changeStatus") }}</label>
            <select class="form-control" v-model="item.status.id">
              <option v-for="status in statuses" :key="status.id" :value="status.id">{{ $t(`worklist.statusCode.${status.description}`) }}</option>
            </select>
          </div>
          <div class="button-panel">
            <button class="btn btn-secondary cancel-button" @click="hideDetailsModal">{{ $t("cancel") }}</button>
            <button class="btn btn-primary" @click="changeStatus(item.id, item.status.id)">{{ $t("worklist.changeStatus") }}</button>
          </div>
        </div>
        <div v-else-if="changingStatus">
          <spinner line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
        </div>
        <div v-else-if="statusChanged">
          {{ $t("worklist.statusChangedSuccessfully") }}
          <div class="button-panel">
            <button class="btn btn-primary cancel-button" @click="hideDetailsModal">OK</button>
          </div>
        </div>
        <div v-else-if="!item">
          {{ $t("worklist.noItemSelected") }}
          <div class="button-panel">
            <button class="btn btn-primary cancel-button" @click="hideDetailsModal">OK</button>
          </div>
        </div>
      </b-modal>

      <b-modal id="modalAddEntry" ref="modalAddEntry" size="lg" :title="$t('planner.addCase')" :header-text-variant="'primary'" hide-footer>
        <form-add-case :statuses="statuses" @cancel="hideAddCaseModal" @success="reload" />
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import FormAddCase from "@/components/FormAddCase";
import Patient from "@/components/fhir/Patient";
import DiagnosticReport from "@/components/fhir/DiagnosticReport";
import Procedure from "@/components/fhir/Procedure";
import { mapState } from "vuex";
import { fetchStatuses, fetchEntries, updateEntry } from "../api/process-api";
import Spinner from "vue-simple-spinner";
import TimerSandEmptyIcon from "vue-material-design-icons/TimerSandEmpty";
import CalendarRangeIcon from "vue-material-design-icons/CalendarRange";
import FolderAccountIcon from "vue-material-design-icons/FolderAccount";

export default {
  data() {
    return {
      filter: null,
      pageOptions: [5, 25, 50, 100, 500],
      currentPage: 1,
      perPage: 25,
      totalRows: 0,
      item: null,
      entries: null,
      changingStatus: false,
      statusChanged: false,
      tabIndex: 0,
      statuses: []
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),

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
              patientName: entry.patient.firstName + " " + entry.patient.lastName,
              patientBirthDate: entry.patient.dateOfBirth,
              caseId: entry.orbisCaseNo,
              diagnosis: entry.tumorDiagnose,
              status: entry.status,
              statusNumber: `${entry.status.orderNumber}/${this.statuses.length - 1}`,
              statusLabel: this.$t(`worklist.statusCode.${entry.status.description}`)
            };
          })
          .sort((e1, e2) => e1.statusNumber.localeCompare(e2.statusNumber));
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
          sortable: true
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
              sortable: true
            }
          : "",
        {
          key: "statusLabel",
          label: this.$i18n.t("worklist.statusDescription"),
          sortable: true
        }
      ];
    }
  },

  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
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

    reload() {
      this.hideAddCaseModal();
      this.initialize();
    },

    getNextStatus(description) {
      let index = this.statuses.findIndex(status => status.description === description);
      return this.statuses[index + 1];
    },

    async changeStatus(entryId, statusId) {
      let entry = this.entries.entity.find(entry => entry.id === entryId);
      if (entry) {
        entry.status.id = statusId;
        this.changingStatus = true;
        await updateEntry(entry, this.token);
        this.changingStatus = false;
        this.statusChanged = true;
        this.reload();
      }
    },

    async initialize() {
      try {
        let response = await fetchStatuses({}, this.token);
        if (response.status === 200) {
          this.statuses = response.data.sort((e1, e2) => e1.orderNumber - e2.orderNumber);
        }
        response = await fetchEntries({}, this.token);
        if (response.status === 200) {
          this.entries = response.data;
          this.totalRows = this.items.length;
        }
      } catch (e) {
        console.error(e);
      }
    }
  },

  mounted() {
    this.initialize();
  },

  components: {
    Navbar,
    Spinner,
    Patient,
    DiagnosticReport,
    Procedure,
    TimerSandEmptyIcon,
    CalendarRangeIcon,
    FolderAccountIcon,
    FormAddCase
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

.button-panel {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .cancel-button {
    margin-right: 0.5rem;
  }
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

.vue-simple-spinner-text {
  font-size: 1.2rem !important;
}
</style>
