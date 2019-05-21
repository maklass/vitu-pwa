<template>
  <div>
    <Navbar />
    <b-container fluid>
      <b-row>
        <b-col class="sidebar">
          <h6>{{ $t("planner.schedulableCases") }}</h6>
          <div class="form-group">
            <input type="text" class="form-control" :placeholder="$t('planner.searchCase')" />
          </div>
          <spinner v-if="!schedulableCases" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" :message="$t('data.loading')" />
          <p v-if="schedulableCases && schedulableCases.length === 0">{{ $t("planner.noSchedulableCases") }}</p>
          <b-list-group v-if="schedulableCases">
            <draggable v-model="schedulableCases" v-bind="dragOptions" @start="drag = true" @end="drag = false">
              <b-list-group-item v-for="clinicalCase in schedulableCases" :key="clinicalCase.id" class="flex-column align-items-start group-item entry">
                <div class="headline text-muted">{{ $t("planner.case") }} {{ clinicalCase.caseId }}</div>
                <br />
                <div class="text-muted">{{ clinicalCase.patientName }}, {{ clinicalCase.patientBirthDate }}</div>
                <div class="text-muted">{{ clinicalCase.diagnosis }}</div>
              </b-list-group-item>
            </draggable>
          </b-list-group>
        </b-col>
        <b-col>
          <h6>{{ $t("planner.planner") }}</h6>
          <b-form-group>
            <b-form-input :placeholder="$t('planner.searchConference')"></b-form-input>
          </b-form-group>
          <spinner v-if="!rooms" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" :message="$t('data.loading')" />

          <div v-if="rooms" class="conferences">
            <b-card no-body :class="['conference-card', 'new', { ghost: drag }]" @click="openAddConferenceModal">
              <div class="headline">{{ $t("planner.scheduleNewConference") }}</div>
              <div class="spacer" />
              <div>
                <plus-icon class="icon" />
              </div>
            </b-card>
            <div no-body v-for="conference in filteredRooms" :key="conference.room">
              <draggable
                v-model="conference.tumorConference.entries"
                :options="dragOptions"
                @start="drag = true"
                @end="drag = false"
                @change="event => onChange(event, conference)"
                @choose="openRoomDetailsModal(conference)"
                class="draggable-rooms"
                :style="{ 'min-height': drag ? '' : '', border: drag ? 'lightgrey 2px dashed' : '' }"
              >
                <b-card no-body :class="['conference-card', { ghost: drag }]" @click="openRoomDetailsModal">
                  <div class="headline text-muted">
                    {{ conference.tumorConference.description }}
                    <br />
                    {{ $d(new Date(conference.tumorConference.date), "long") }}
                  </div>
                  <div class="spacer" />
                  <div class="conference-card-footer">
                    <pencil-icon class="icon" />
                    <div class="cases">
                      <span class="count">{{ conference.tumorConference.entries.length }}</span>
                      <br />
                      {{ $tc("planner.casesAssigned", conference.tumorConference.entries.length) }}
                    </div>
                  </div>
                </b-card>
              </draggable>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <b-modal
      id="modalAddConference"
      ref="modalAddConference"
      size="lg"
      @ok="addNewConference"
      @hide="resetAddConferenceModal"
      :title="$t('planner.scheduleNewConference')"
      :ok-title="$t('planner.create')"
      :cancel-title="$t('cancel')"
      :header-text-variant="'primary'"
    >
      <b-row>
        <b-col md="auto">
          <datepicker
            class="datepicker"
            v-model="newConference.date"
            :disabled-dates="datepickerState.disabledDates"
            :highlighted="datepickerState.highlighted"
            :inline="true"
            :language="datePickerLanguage"
            :bootstrap-styling="true"
            :monday-first="true"
          ></datepicker>
          <b-form-group horizontal breakpoint="md" :label="$t('planner.time')" label-cols="3">
            <b-form-input type="time" v-model="newConference.time"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <div class="conference-details">
            <b-form-group>
              <b-form-input required type="text" v-model="newConference.name" :placeholder="$t('planner.enterConferenceName')" />
            </b-form-group>
            <b-form-textarea v-model="newConference.description" :placeholder="$t('planner.description')" :rows="5" :max-rows="10"></b-form-textarea>
          </div>
        </b-col>
      </b-row>
    </b-modal>

    <b-modal
      id="modalAddCase"
      ref="modalAddCase"
      size="lg"
      :title="$t('planner.addCase')"
      :ok-title="$t('planner.addCase')"
      :cancel-title="$t('cancel')"
      :header-text-variant="'primary'"
      @ok="addCurrentEntryToConference"
    >
      <h5 v-if="item">{{ $t("worklist.case") }} {{ item.caseId }}</h5>
      <p v-if="item && currentConference">
        {{ item.patientName }}, {{ item.patientBirthDate }}
        <br />
        {{ currentConference.tumorConference.description }} - {{ $d(new Date(currentConference.tumorConference.date), "long") }}
      </p>
      <b-table hover :fields="fields" :items="getDocumentsForCase" :bordered="true" :small="true">
        <template slot="select">
          <div style="text-align: center;">
            <b-checkbox></b-checkbox>
          </div>
        </template>
      </b-table>
    </b-modal>

    <b-modal id="modalRoomDetails" ref="modalRoomDetails" size="lg" :title="$t('conference.videoConference')" ok-only :header-text-variant="'primary'">
      <div v-if="currentConference">
        <h5>{{ currentConference.tumorConference.description }}</h5>
        <p>
          {{ $d(new Date(currentConference.tumorConference.date), "long") }}
        </p>
        <h6>{{ $t("worklist.cases") }}</h6>
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
      </div>
    </b-modal>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import draggable from "vuedraggable";
import { mapState } from "vuex";
import { getRooms, addRoom, addEntryToConference } from "../api/video-api";
import { fetchEntries, fetchStatuses } from "../api/process-api";
import Spinner from "vue-simple-spinner";
import PlusIcon from "vue-material-design-icons/Plus";
import PencilIcon from "vue-material-design-icons/Pencil";
import Datepicker from "vuejs-datepicker";
import { de, en, es } from "vuejs-datepicker/dist/locale";
import config from "../config/config";

export default {
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

      drag: false,

      datepickerState: {
        disabledDates: {
          to: new Date(new Date().setDate(new Date().getDate() - 1))
        },
        highlighted: {
          // days: [1, 2, 3, 4, 5]
        }
      }
    };
  },

  computed: {
    ...mapState({
      cases: state => state.cases.cases,
      token: state => state.authentication.keycloak.token
    }),

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
      if (!this.rooms || !this.demo) {
        return this.rooms;
      } else {
        return this.rooms.filter(room => room.tumorConference.description !== "Demo");
      }
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
        if (!this.entries || !this.entries.entity) {
          return null;
        } else {
          return this.entries.entity
            .filter(entry => entry.status.description === "ASSIGN_TO_TUMOR_CONFERENCE")
            .map(entry => {
              return {
                id: entry.id,
                creationDate: entry.date_created,
                patientName: entry.patient.firstName + " " + entry.patient.lastName,
                patientBirthDate: entry.patient.dateOfBirth,
                caseId: entry.orbisCaseNo,
                diagnosis: entry.tumorDiagnose,
                status: entry.status,
                statusNumber: `${entry.status.orderNumber}/${this.statuses.length}`,
                statusLabel: this.$t(`worklist.statusCode.${entry.status.description}`)
              };
            });
        }
      },

      set(newEntries) {
        this.entries.entity = this.entries.entity.filter(entry => newEntries.find(newEntry => newEntry.id === entry.id));
      }
    },

    dragOptions() {
      return {
        animation: 50,
        group: {
          name: "cases",
          put: () => console.log(arguments)
        },
        ghostClass: "ghost"
      };
    }
  },

  methods: {
    openAddConferenceModal() {
      this.$refs.modalAddConference.show();
    },

    openAddCaseModal() {
      this.$refs.modalAddCase.show();
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
        date: null,
        time: null,
        numberOfCases: 0
      };
    },

    onChange(event, conference) {
      if (event && event.added) {
        this.currentCase = event.added.element;
        this.currentConference = conference;
        this.openAddCaseModal();
      }
    },

    addCurrentEntryToConference() {
      if (this.currentConference && this.currentConference.tumorConference) {
        addEntryToConference(this.currentConference.tumorConference.id, this.currentCase, this.token);
      }
    },

    async addNewConference() {
      this.rooms = null;
      let date = new Date(this.newConference.date);
      if (this.newConference.time) {
        date.setHours(this.newConference.time.split(":")[0]);
        date.setMinutes(this.newConference.time.split(":")[1]);
        this.newConference.date = date;
      }
      await addRoom(this.newConference.name, this.newConference.date, this.token);
      this.loadRooms();
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

    async loadRooms() {
      let response = await getRooms(this.token);
      if (response.status === 200) {
        this.rooms = response.data.map(room => {
          return {
            ...room,
            numberOfCases: 0
          };
        });
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
        }
        this.loadRooms();
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
    PlusIcon,
    PencilIcon,
    draggable,
    Datepicker
  }
};
</script>

<style lang="scss">
.vdp-datepicker__calendar {
  border: none !important;
}
</style>

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

.draggable-rooms {
  height: 100%;

  .entry {
    display: none;
  }
}

.conference-card-footer {
  display: flex;

  .icon {
    align-self: flex-end;
    font-size: 1.5rem;
  }

  .cases {
    text-align: right;
    flex: 1;

    color: map-get($theme-colors, "primary");
    .count {
      font-size: 1.5rem;
      font-weight: bold;
    }
  }
}

.datepicker {
  margin-bottom: 1rem;
}

.headline {
  font-weight: bold;
  color: map-get($theme-colors, "primary");
}

.conferences {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
  grid-gap: 0.25rem;
}

.container-fluid {
  padding-top: 15px;
}
@media (min-width: 576px) {
  .sidebar {
    max-width: 300px;
  }
}
</style>
