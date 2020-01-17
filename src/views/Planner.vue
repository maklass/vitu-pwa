<template>
  <div>
    <notification-panels
      :showError="showError"
      :errorMessage="error"
      :showWarning="showWarning"
      :warning="warning"
      :showSuccess="showSuccess"
      :successMessage="$t('planner.caseAssignmentSuccessful')"
      @closeSuccess="closeSuccess"
      @closeWarning="closeWarning"
      @closeError="closeError"
      :fluid="true"
    />
    <div class="container-fluid planner">
      <div class="row">
        <div class="col sidebar">
          <h6>{{ $t("planner.schedulableCases") }}</h6>
          <div class="form-group">
            <input type="text" class="form-control" :placeholder="$t('planner.searchCase')" v-model="searchTermCases" />
          </div>
          <p v-if="schedulableCases && schedulableCases.length === 0">{{ $t("planner.noSchedulableCases") }}</p>
          <spinner v-if="!schedulableCases && !warning" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" :message="$t('data.loading')" />
          <div class="list-group" v-if="schedulableCases">
            <draggable class="draggable" v-model="schedulableCases" v-bind="dragOptions" @start="drag = true" @end="drag = false">
              <div class="list-group-item flex-column align-items-start group-item entry" v-for="clinicalCase in schedulableCases" :key="clinicalCase.id">
                <div class="headline text-muted">{{ $t("planner.case") }} {{ clinicalCase.caseId }}</div>
                <br />
                <div class="text-muted">{{ clinicalCase.patientName }}, {{ clinicalCase.patientBirthDate ? $d(new Date(clinicalCase.patientBirthDate)) : "" }}</div>
                <div class="text-muted">{{ clinicalCase.diagnosis }}</div>
              </div>
            </draggable>
          </div>
        </div>
        <div class="col">
          <h6>{{ $t("planner.planner") }}</h6>
          <div class="form-group">
            <input class="form-control" :placeholder="$t('planner.searchConference')" v-model="searchTermConference" />
          </div>

          <spinner v-if="!rooms" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" :message="$t('data.loading')" />
          <div v-if="rooms" class="conferences">
            <b-card no-body :class="['conference-card', 'new', { ghost: drag }]" @click="openAddConferenceModal">
              <div class="headline">{{ $t("planner.scheduleNewConference") }}</div>
              <div class="spacer" />
              <div>
                <plus-icon class="icon" />
              </div>
            </b-card>
            <div no-body v-for="conference in paginatedRooms" :key="conference.id">
              <draggable
                v-model="conference.tumorConference.entries"
                :options="dragOptions"
                @start="drag = true"
                @end="drag = false"
                @change="event => onChange(event, conference)"
                @choose="openRoomDetailsModal(conference)"
                class="draggable-rooms"
                :style="{ border: drag && dragOverConference != conference.id ? 'lightgrey 2px dashed' : 'transparent 2px solid' }"
                :id="conference.id"
              >
                <conference-card :conference="conference" @click="openRoomDetailsModal" :class="[{ ghost: drag && dragOverConference != conference.id }]">
                  <template slot="icon">
                    <pencil-icon />
                  </template>
                </conference-card>
              </draggable>
            </div>
          </div>
          <b-pagination v-if="filteredRooms" class="pagination" align="center" :total-rows="filteredRooms.length" :per-page="max" v-model="currentPage" />
        </div>
      </div>
    </div>

    <b-modal
      id="modalAddConference"
      ref="modalAddConference"
      footer-class="add-conference-footer"
      size="lg"
      @ok="addNewConference"
      @hide="resetAddConferenceModal"
      :title="$t('planner.scheduleNewConference')"
      :ok-title="$t('planner.create')"
      :cancel-title="$t('cancel')"
      :header-text-variant="'primary'"
      :ok-disabled="!addNewConferenceButtonEnabled"
    >
      <div class="conference-details">
        <div class="form-group">
          <input @keyup.enter="addNewConference" class="form-control" required type="text" v-model="newConference.name" :maxlength="maxLengthConferenceName" :placeholder="$t('planner.enterConferenceName')" />
        </div>
        <!-- <div class="form-check">
          <input class="form-check-input" type="checkbox" id="addEndDate" v-model="addEndDate" />
          <label class="form-check-label" for="addEndDate">
            {{ $t("planner.createAppointmentSeries") }}
          </label>
        </div> -->
        <div v-if="showHintDateTimeInPast" class="hint-past">
          <strong>{{ $t("hint") }}:</strong> {{ $t("planner.hintConferenceInPast") }}
        </div>
        <!-- <b-form-textarea v-model="newConference.description" :placeholder="$t('planner.description')" :rows="5" :max-rows="10"></b-form-textarea> -->
      </div>
      <div class="row">
        <b-col>
          <div class="form-group">
            <label>{{ $t("worklist.date") }}</label>
            <datepicker
              class="datepicker"
              v-model="newConference.date"
              :disabled-dates="datepickerState.disabledDates"
              :highlighted="datepickerState.highlighted"
              :inline="true"
              :language="datePickerLanguage"
              :bootstrap-styling="true"
              :monday-first="true"
            />
          </div>
          <div class="from-group" :label="$t('planner.time')" label-cols-md="3">
            <input @keyup.enter="addNewConference" class="form-control" type="time" v-model="newConference.time" />
          </div>
        </b-col>
        <div class="col-md-auto"></div>
        <b-col>
          <div v-if="addEndDate">
            <label>{{ $t("worklist.date") }}</label>
            <datepicker
              class="datepicker"
              v-model="newConference.endDate"
              :disabled-dates="datepickerState.disabledEndDates"
              :highlighted="datepickerState.highlighted"
              :inline="true"
              :language="datePickerLanguage"
              :bootstrap-styling="true"
              :monday-first="true"
            />
          </div>
        </b-col>
      </div>
    </b-modal>

    <b-modal
      id="modalAddCase"
      ref="modalAddCase"
      footer-class="add-case-footer"
      size="lg"
      :title="$t('planner.addCase')"
      :ok-title="$t('planner.addCase')"
      :cancel-title="$t('cancel')"
      :header-text-variant="'primary'"
      @ok="addCurrentEntryToConference"
      @hide="cancelAddEntry"
    >
      <div class="add-case-details">
        <div class="case-overview">
          <h6 v-if="item">{{ $t("worklist.case") }}</h6>
          <p v-if="item && currentConference">
            {{ $t("worklist.case") }} {{ item.caseId }} <br />
            {{ item.patientName }}, {{ item.patientBirthDate ? $d(new Date(item.patientBirthDate)) : "" }} <br />
            {{ $t("worklist.diagnosis") }}: {{ item.diagnosis }}
          </p>
        </div>
        <div class="conference-overview">
          <h6 v-if="currentConference">{{ $t("conference.conference") }}</h6>
          <p v-if="item && currentConference">
            {{ currentConference.tumorConference.description }} <br />
            {{ $d(new Date(currentConference.tumorConference.date), "long") }}
          </p>
        </div>
      </div>
      <b-table v-if="demo" hover :fields="fields" :items="getDocumentsForCase" :bordered="true" :small="true">
        <template slot="select">
          <div style="text-align: center;">
            <b-checkbox></b-checkbox>
          </div>
        </template>
      </b-table>
    </b-modal>

    <b-modal id="modalRoomDetails" ref="modalRoomDetails" size="lg" :title="$t('conference.videoConference')" ok-only :header-text-variant="'primary'">
      <div v-if="currentConference && !deleteInProgress">
        <div class="room-details-header">
          <div class="room-details-info">
            <h5 class="room-details-title">{{ currentConference.tumorConference.description }}</h5>
            <p v-if="currentConference.tumorConference && currentConference.tumorConference.date">
              {{ $d(new Date(currentConference.tumorConference.date), "long") }}
            </p>
          </div>
          <div>
            <b-dropdown id="dropdown-right" right text="" variant="secondary" class="m-2">
              <template slot="button-content">
                <!-- <delete-icon class="delete-icon" /> -->
              </template>
              <b-dropdown-item @click="cloneRoom(currentConference)">{{ $t("planner.cloneConference") }}</b-dropdown-item>
              <b-dropdown-item @click="deleteRoom(currentConference.janusId)" class="text-danger">{{ $t("planner.deleteConference") }}</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        <b-tabs card class="tabs">
          <b-tab class="tab-pane">
            <template slot="title">
              {{ $t("worklist.cases") }}
            </template>
            <table class="table table-sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{{ this.$i18n.t("worklist.patient") }}</th>
                  <th scope="col">{{ this.$i18n.t("worklist.birthDate") }}</th>
                  <th scope="col">{{ this.$i18n.t("worklist.diagnosis") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in currentConference.tumorConference.entries" :key="entry.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td v-if="entry.patient">{{ entry.patient.firstName }} {{ entry.patient.lastName }}</td>
                  <td v-if="entry.patient">{{ entry.patient.dateOfBirth }}</td>
                  <td v-if="entry.tumorDiagnose">{{ entry.tumorDiagnose }}</td>
                  <td v-if="!entry.patient">{{ entry.patientName }}</td>
                  <td v-if="!entry.patient">{{ entry.patientBirthDate }}</td>
                  <td v-if="!entry.tumorDiagnose">{{ entry.diagnosis }}</td>
                </tr>
              </tbody>
            </table>
          </b-tab>
          <b-tab active class="tab-pane">
            <template slot="title">
              {{ $t("conference.participants") }}
            </template>
            <room-participants :roomId="currentConference.janusId" />
          </b-tab>
        </b-tabs>
      </div>
      <spinner v-if="deleteInProgress" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
    </b-modal>

    <b-modal id="modalCaseAlreadyExists" ref="modalCaseAlreadyExists" :title="$t('planner.caseAlreadyExists')" ok-only :header-text-variant="'primary'">
      {{ $t("planner.caseAlreadyExistsDescription") }}
    </b-modal>
  </div>
</template>

<script>
import ConferenceCard from "@/components/ConferenceCard";
import NotificationPanels from "@/components/ui/NotificationPanels";
import RoomParticipants from "@/components/RoomParticipants";
import { addEntryToConference, addEntry } from "@/api/process-api";
import { fetchResources, mapFhirResponse, updateResource } from "@molit/fhir-api";
import { getRooms, addRoom, addRoomsBatch, addParticipantsToRoom, deleteRoom, getParticipantsInRoom } from "@/api/video-api";
import config from "../config/config";

import Datepicker from "vuejs-datepicker";
import DeleteIcon from "vue-material-design-icons/Delete";
import PencilIcon from "vue-material-design-icons/Pencil";
import PlusIcon from "vue-material-design-icons/Plus";
import Spinner from "vue-simple-spinner";
import draggable from "vuedraggable";
import { mapState } from "vuex";
import { de, en, es } from "vuejs-datepicker/dist/locale";
import { get } from "lodash";
import notifications from "@/mixins/notifications";

export default {
  mixins: [notifications],

  data() {
    return {
      rooms: null,
      entries: null,
      statuses: [],

      currentConference: null,
      currentCase: null,

      newConference: {
        id: 0,
        name: null,
        description: null,
        date: null,
        time: null,
        numberOfCases: 0
      },

      addEndDate: false,

      dragOverConference: null,
      drag: false,
      error: null,
      showSuccess: false,

      searchTermConference: null,
      searchTermCases: "",

      searchParams: {
        code: "http://molit.eu/fhir/NamingSystem/vitu-task|mtb-task",
        status: "in-progress",
        _sort: "-authored-on",
        _include: ["Task:patient", "Task:input.valueReference"]
      },

      currentPage: 1,
      max: 20,

      deleteInProgress: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      subject: state => state.authentication.keycloak.subject
    }),

    addNewConferenceButtonEnabled() {
      if (this.newConference && this.newConference.date && this.newConference.time && this.newConference.name) {
        return true;
      } else {
        return false;
      }
    },

    showHintDateTimeInPast() {
      if (!this.newConference || !this.newConference.date || !this.newConference.time) {
        return false;
      }

      const currentDate = new Date();
      const currentTime = currentDate.getHours() + ":" + currentDate.getMinutes();

      if (
        currentDate.getFullYear() === this.newConference.date.getFullYear() &&
        currentDate.getMonth() === this.newConference.date.getMonth() &&
        currentDate.getDate() === this.newConference.date.getDate() &&
        new Date("1970-01-01 " + currentTime) > new Date("1970-01-01 " + this.newConference.time)
      ) {
        return true;
      } else {
        return false;
      }
    },

    maxLengthConferenceName() {
      return config.MAX_LENGTH_CONFERENCE_NAME;
    },

    datepickerState() {
      let date = new Date();
      date.setHours(0, 0, 0, 0);

      return {
        disabledDates: {
          to: date
        },
        disabledEndDates: {
          to: this.newConference ? this.newConference.date : date
        },
        highlighted: {
          // days: [1, 2, 3, 4, 5]
        }
      };
    },

    demo() {
      return config.DEMO;
    },

    datePickerLanguage() {
      switch (this.$i18n.locale) {
        case "en":
          return en;
        case "de":
          return de;
        case "es":
          return es;
        default:
          return en;
      }
    },

    filteredRooms() {
      if (!this.rooms) {
        return this.rooms;
      }

      return this.rooms.filter(room => {
        if (room.tumorConference && room.tumorConference.id === -1) {
          return false;
        }

        if (this.demo && room.tumorConference.description !== "Demo") {
          return false;
        }

        if (room.tumorConference && room.tumorConference.date && new Date().getTime() > new Date(room.tumorConference.date).getTime() + 1000 * 60 * 60 * 48) {
          return false;
        }

        if (this.searchTermConference && room.tumorConference.description && !room.tumorConference.description.toLowerCase().includes(this.searchTermConference.toLowerCase())) {
          return false;
        }

        return true;
      });
      // .sort((c1, c2) => {
      //   if (c1 && c1.tumorConference && c1.tumorConference.description && c2 && c2.tumorConference && c2.tumorConference.description) {
      //     return c1.tumorConference.description.localeCompare(c2.tumorConference.description);
      //   }
      //   return 0;
      // });
    },

    paginatedRooms() {
      if (!this.filteredRooms) {
        return [];
      }

      return this.filteredRooms.slice((this.currentPage - 1) * this.max, this.currentPage * this.max);
    },

    item() {
      return this.currentCase;
    },

    fields() {
      return [
        {
          key: "select",
          label: ""
        },
        {
          key: "title",
          label: this.$i18n.t("planner.document"),
          sortable: true
        },
        {
          key: "date",
          label: this.$i18n.t("worklist.creationDate"),
          sortable: true,
          formatter: value => {
            return value ? this.$i18n.d(new Date(value)) : "";
          }
        }
      ];
    },

    schedulableCases: {
      get() {
        if (!this.entries) {
          return null;
        } else {
          return this.entries
            .filter(entry =>
              JSON.stringify(entry)
                .toLowerCase()
                .includes(this.searchTermCases.toLowerCase())
            )
            .map(entry => {
              return {
                id: entry.id,
                creationDate: entry.date_created,
                patientName: entry.patient.firstName + " " + entry.patient.lastName,
                patientBirthDate: entry.patient.dateOfBirth,
                caseId: entry.orbisCaseNo,
                diagnosis: entry.tumorDiagnose,
                status: entry.status,
                // statusNumber: `${entry.status.orderNumber}/${this.statuses.length}`,
                // statusLabel: this.$t(`worklist.statusCode.${entry.status.description}`),
                entry: entry
              };
            });
        }
      },

      set(newEntries) {
        this.entries = this.entries.filter(entry => newEntries.find(newEntry => newEntry.id === entry.id));
      }
    },

    dragOptions() {
      return {
        animation: 50,
        group: {
          name: "cases",
          put: this.dragOptionsPut
        },
        ghostClass: "ghost"
      };
    }
  },

  methods: {
    async fetchStatuses() {
      try {
        const valueSet = mapFhirResponse(await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/ValueSet/vitu-workinglist" }, this.token))[0];
        if (!valueSet) {
          throw new Error("ValueSet 'vitu-worklist' not found on server.");
        }
        this.statuses = valueSet.compose.include[0].concept;
      } catch (e) {
        this.loading = false;
        this.handleError(e, true);
      }
    },

    dragOptionsPut(component) {
      this.dragOverConference = component.el.id;
    },

    openAddConferenceModal() {
      this.$refs.modalAddConference.show();
    },

    openAddCaseModal() {
      this.$refs.modalAddCase.show();
    },

    openCaseAlreadyExistsModal() {
      this.$refs.modalCaseAlreadyExists.show();
    },

    openRoomDetailsModal(room) {
      this.currentConference = room;
      this.$refs.modalRoomDetails.show();
    },

    resetAddConferenceModal() {
      this.newConference = {
        id: 0,
        name: null,
        description: null,
        date: new Date(),
        time: null,
        numberOfCases: 0
      };
    },

    onChange(event, conference) {
      if (event && event.added) {
        this.currentCase = event.added.element;
        this.currentConference = conference;
        if (this.currentConference.tumorConference.entries.filter(e => e.id === this.currentCase.id).length < 2) {
          this.openAddCaseModal();
        } else {
          this.openCaseAlreadyExistsModal();
          this.reload();
        }
      }
    },

    async addCurrentEntryToConference() {
      try {
        if (this.currentConference && this.currentConference.tumorConference) {
          let entry = this.currentCase.entry;

          const tempStatus = {
            id: 1,
            description: "COMPLETE_RECOMMENDATION",
            icon: "FOLDER",
            orderNumber: 10,
            disabled: false
          };

          let response = await addEntry(1, 1, entry.patient.firstName, entry.patient.lastName, "", entry.patient.dateOfBirth, "UNKNOWN", tempStatus, entry.id, this.token);
          const tempEntry = response.data;

          await addEntryToConference(this.currentConference.tumorConference.id, tempEntry, this.token);

          const status = this.statuses.find(status => status.code === "wait-for-case-review");

          if (status) {
            const task = entry.task;
            task.businessStatus = status;
            await updateResource(config.FHIR_URL, task, this.token);
          }

          this.showSuccess = true;
          await this.reload();
        }
      } catch (e) {
        this.handleError(e);
      }
    },

    reload() {
      this.entries = null;
      this.rooms = null;
      this.fetchEntries();
      this.getRooms();
    },

    cancelAddEntry(event) {
      if (event && (event.trigger === "cancel" || event.trigger === "backdrop")) {
        this.reload();
      }
    },

    async addNewConference() {
      if (!this.newConference.date || !this.newConference.time || !this.newConference.name) {
        return;
      }
      let participantIds = [];
      if (this.newConference.participantIds) {
        participantIds = this.newConference.participantIds;
      }
      this.$refs.modalAddConference.hide();
      try {
        this.rooms = null;
        let date = new Date(this.newConference.date);
        if (this.newConference.time) {
          date.setHours(this.newConference.time.split(":")[0]);
          date.setMinutes(this.newConference.time.split(":")[1]);
          this.newConference.date = date;
        }
        if (this.addEndDate) {
          const room = (await addRoomsBatch(this.newConference.name, this.newConference.date, this.newConference.endDate, this.token)).data;
          console.log(room);
        } else {
          const room = (await addRoom(this.newConference.name, this.newConference.date, this.token)).data;
          if (participantIds.indexOf(this.subject) === -1) {
            participantIds.push(this.subject);
          }
          await addParticipantsToRoom(room.janusId, participantIds, this.token);
          this.newConference.participantIds = undefined;
        }

        this.getRooms();
      } catch (e) {
        this.handleError(e);
      }
    },

    async deleteRoom(roomId) {
      this.deleteInProgress = true;
      try {
        await deleteRoom(roomId, this.token);
        this.$refs.modalRoomDetails.hide();
        this.deleteInProgress = false;
        this.reload();
      } catch (e) {
        this.handleError(e);
        this.deleteInProgress = false;
      }
    },

    async cloneRoom(conference) {
      const participantIds = (await getParticipantsInRoom(conference.janusId, this.token)).data;
      const date = new Date(conference.tumorConference.date);

      this.newConference.name = conference.tumorConference.description;
      this.newConference.date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
      this.newConference.time = date.getHours() + ":" + date.getMinutes();

      this.newConference.participantIds = participantIds;

      this.$refs.modalRoomDetails.hide();
      this.$refs.modalAddConference.show();
    },

    getDocumentsForCase() {
      return [
        {
          title: "Befund Panel-Tumordiagnostik",
          date: new Date("2019-03-19")
        },
        {
          title: "Befund Pathologie",
          date: new Date("2019-03-13")
        }
      ];
    },

    async getRooms() {
      try {
        let response = await getRooms(this.token);
        if (response.status === 200 && response.data.entity) {
          this.rooms = response.data.entity.map(room => {
            return {
              ...room,
              numberOfCases: 0
            };
          });
        } else {
          this.rooms = [];
        }
      } catch (e) {
        this.handleError(e);
      }
    },

    async fetchEntries() {
      try {
        const searchParams = {
          code: "http://molit.eu/fhir/NamingSystem/vitu-task|mtb-task",
          "business-status": "tumor-conference-ready",
          _sort: "-authored-on",
          _include: ["Task:patient"]
        };

        const response = await fetchResources(config.FHIR_URL, "Task", searchParams, this.token);
        const resources = mapFhirResponse(response);

        this.entries = [];
        resources
          .filter(r => r.resourceType === "Task")
          .forEach(task => {
            const patient = resources.find(r => r.resourceType === "Patient" && r.id === task.for.reference.split("/")[1]);
            this.entries.push({
              id: task.id,
              patient: {
                dateOfBirth: patient.birthDate,
                firstName: get(patient, "name[0].given", []).join(", "),
                lastName: get(patient, "name[0].family", "")
              },
              task: task
            });
          });
      } catch (e) {
        this.handleError(e, true);
      }
    },

    async initialize() {
      try {
        await this.fetchStatuses();
        await this.fetchEntries();
        await this.getRooms();
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    this.initialize();
  },

  components: {
    draggable,
    ConferenceCard,
    Datepicker,
    DeleteIcon,
    NotificationPanels,
    PencilIcon,
    PlusIcon,
    RoomParticipants,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.conference-details {
  display: flex;
  flex-direction: column;
  height: 100%;

  textarea {
    flex: 1;
    margin-bottom: 1rem;
  }
}

.group-item {
  margin: 0.125rem 0;
  padding: 0.5rem;
  user-select: none;
  cursor: move;
}

.conference-card {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  cursor: pointer;
  height: 100%;

  .icon {
    color: map-get($theme-colors, "primary");
    font-size: 2.25rem;
  }
}

.delete-icon {
  color: rgba(0, 0, 0, 0.6);
}

.draggable-rooms {
  height: 100%;

  .entry {
    display: none;
  }
}

.datepicker {
  margin-bottom: 1rem;
}

.headline {
  font-weight: bold;
  color: map-get($theme-colors, "primary");
}

.conference-details {
  margin-bottom: 1rem;
}

.draggable {
  min-height: 8rem;
}

.conferences {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
  grid-gap: 0.25rem;
}

.planner {
  padding-top: 15px;
  padding-bottom: 15px;
}

.tabs {
  margin-left: -1rem;
  margin-right: -1rem;
}

.room-details-title {
  text-overflow: ellipsis;
  overflow: hidden;
}

.room-details-header {
  display: flex;
}

.room-details-info {
  flex: 1;
  overflow-x: hidden;
  margin-right: 1rem;
}

.list-group-item {
  .text-muted {
    font-size: 1rem;
  }
}

.add-case-details {
  display: flex;

  > div {
    width: 50%;
  }
}

.hint-past {
  color: red;
}

.pagination {
  margin-top: 1rem;
}

@media (min-width: 576px) {
  .sidebar {
    max-width: 300px;
  }
}
</style>

<style lang="scss">
.add-case-footer,
.add-conference-footer {
  .btn-secondary {
    background: white;
  }
}

.vdp-datepicker__calendar {
  border: none !important;
}

.btn.dropdown-toggle.btn-secondary {
  background: white;
}
</style>
