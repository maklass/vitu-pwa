<template>
  <div class="conference">
    <Navbar />
    <b-container fluid>
      <main>
        <div v-if="!showVideoConference">
          <b-form-group>
            <b-form-input :placeholder="$t('planner.searchConference')"></b-form-input>
          </b-form-group>
          <div>
            <spinner v-if="!rooms || loadingDemo" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" :message="$t('data.loading')" />
            <div v-else class="conferences">
              <b-card no-body v-for="conference in filteredRooms" :key="conference.room" class="conference-card" @click="goToVideoConference(conference.tumorConference.entries)">
                <div class="headline text-muted">
                  {{ conference.tumorConference.description }}
                  <br />
                  {{ $d(new Date(conference.tumorConference.date), "long") }}
                </div>
                <div class="spacer" />
                <div class="conference-card-footer">
                  <div class="cases">
                    <span class="count">{{ conference.tumorConference.entries.length }}</span>
                    <br />
                    {{ $tc("planner.casesAssigned", conference.tumorConference.entries.length) }}
                  </div>
                </div>
              </b-card>
            </div>
          </div>
        </div>
        <div class="conference-center" v-else>
          <div :style="{ flex: currentView === VIEWS.CONFERENCE ? '1' : 'initial' }">
            <video-conference :threeD="threeD" :entries="entries" />
          </div>
          <div class="presentation" v-if="currentView === VIEWS.PRESENTATION && currentCase">
            <h6>{{ $t("conference.presentation") }}</h6>
            <div v-if="currentResource" style="border: lightgrey 1px solid">
              <div v-if="currentResource.resourceType === 'DiagnosticReport'">
                <diagnostic-report style="background: white;" :resource="currentResource" />
              </div>
              <div v-if="currentResource.resourceType === 'Procedure'">
                <procedure style="background: white;" :resource="currentResource" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import VideoConference from "@/components/video-conference/VideoConference";
import CaseNotes from "@/components/CaseNotes";
import draggable from "vuedraggable";
import { mapState } from "vuex";
import { getRooms, addRoom, addParticipantsToRoom } from "../api/video-api";
import DiagnosticReport from "@/components/fhir/DiagnosticReport";
import Procedure from "@/components/fhir/Procedure";
import Spinner from "vue-simple-spinner";
import config from "../config/config";

export default {
  data() {
    return {
      currentView: 1,
      VIEWS: Object.freeze({ CONFERENCE: 1, PRESENTATION: 2 }),
      currentCaseNumber: -1,
      currentResource: null,
      threeD: false,
      showVideoConference: false,
      loadingDemo: false,
      rooms: null,
      entries: []
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),

    filteredRooms() {
      if (!this.rooms || !this.demo) {
        return this.rooms;
      } else {
        return this.rooms.filter(room => room.tumorConference.description !== "Demo");
      }
    },

    demo() {
      return config.DEMO;
    }
  },

  methods: {
    toggleThreeD() {
      this.threeD = !this.threeD;
    },

    switchView(view) {
      this.currentView = view;
    },

    setCurrentResource(currentResource) {
      this.currentResource = currentResource;
    },

    nextCase() {
      this.currentCaseNumber++;
      this.currentCaseNumber = this.currentCaseNumber % this.cases.length;
    },

    goToVideoConference(entries) {
      if (!this.demo) {
        this.entries = entries;
        this.showVideoConference = true;
      } else {
        this.goToDemoConference();
      }
    },

    async goToDemoConference() {
      this.loadingDemo = true;
      const responseRoom = await addRoom("Demo");
      const janusId = responseRoom.data.janusId;
      const participants = [""];
      await addParticipantsToRoom(janusId, participants, this.token);
      this.$router.push({ name: "conference", params: { room: janusId } });
      this.showVideoConference = true;
      this.loadingDemo = false;
    },

    async initialize() {
      if (this.$route.params.room) {
        this.showVideoConference = true;
      } else {
        let response = await getRooms(this.token);
        if (response.status === 200) {
          this.rooms = response.data;
        }
      }
    }
  },

  mounted() {
    this.initialize();
  },

  components: {
    CaseNotes,
    DiagnosticReport,
    draggable,
    Navbar,
    Procedure,
    Spinner,
    VideoConference
  }
};
</script>

<style lang="scss">
h3 {
  color: map-get($theme-colors, "primary");
}

h4 {
  color: $vitu-blue;
}
</style>

<style lang="scss" scoped>
.container-fluid {
  padding-top: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.conference {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.conference-center {
  display: flex;
}

.group-item {
  margin: 0.125rem 0;
  padding: 0.75rem;
  user-select: none;
  cursor: move;

  h6 {
    color: $vitu-blue;
  }
}

.group-item.active {
  h6 {
    color: white;
  }
}

header {
  display: flex;
  flex-direction: column;
}

.menu {
  padding: 1rem 0;
}

main {
  flex: 1;
}

footer {
  margin-top: 15px;
}

.presentation {
  flex: 1;
  padding: 0 15px;
}

.conferences {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
  grid-gap: 0.25rem;
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

  .icon {
    color: map-get($theme-colors, "primary");
    font-size: 2.25rem;
  }
}

.headline {
  font-weight: bold;
  color: map-get($theme-colors, "primary");
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

@media (min-width: 576px) {
  .sidebar {
    width: 240px;
    grid-template-columns: 1fr;
  }
}
</style>
