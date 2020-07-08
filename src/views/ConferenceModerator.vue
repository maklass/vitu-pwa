<template>
  <div class="background pt-2">
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
    <spinner v-if="loading && !error" />
    <div v-if="!loading && !error">
      <div style="padding-right: 260px;">
        <div>
          <div class="case-overview" v-if="selectedEpisodeOfCare">
            <case-overview :caseId="selectedEpisodeOfCare"></case-overview>
          </div>
          <div v-else class="container">
            <div class="page-header">
              <h5 class="headline">{{ $t("planner.conferenceModerator") }}</h5>
              <div class="spacer"></div>
            </div>
            {{ $t("planner.selectACase") }}
          </div>
        </div>
      </div>
      <div class="case-list">
        <div class="list-header">
          <h5>{{ $t("worklist.cases") }}</h5>
        </div>
        <div v-if="filteredEntries && filteredEntries.length">
          <div
            class="list-item"
            v-for="(entry, index) in filteredEntries"
            :key="entry.vituID"
            :class="{ rowSelected: selectedEpisodeOfCare === entry.vituID, notSelected: selectedEpisodeOfCare !== entry.vituID }"
            @click="selectedEpisodeOfCare = entry.vituID"
          >
            <div class="list-icon-placement">
              <clipboard-icon class="list-item-icon"></clipboard-icon>
            </div>
            <div>
              <div class="list-item-title">#{{ index + 1 }} {{ entry.patient.firstName }} {{ entry.patient.lastName }}</div>
              <div class="list-item-subtitle">{{ $d(new Date(entry.patient.dateOfBirth)) }}</div>
            </div>
          </div>
        </div>
        <div class="pt-2 pl-2" v-else>
          {{ $t("planner.noCases") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import ClipboardIcon from "vue-material-design-icons/ClipboardText";
import CaseOverview from "@/components/CaseOverview";
import * as fhirUtil from "@molit/fhir-util";
import { getRoomsAccessible } from "@/api/video-api";
import Spinner from "@/components/ui/Spinner";
import { mapState } from "vuex";

export default {
  mixins: [notifications],

  data() {
    return {
      loading: true,
      selectedEpisodeOfCare: null,
      roomName: null,
      roomDate: null,
      entries: []
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),

    filteredEntries() {
      if (!this.entries) {
        return [];
      }

      return this.entries.filter(entry => entry);
    }
  },

  methods: {
    async loadVideoConference(id) {
      try {
        const roomId = parseInt(id);
        const rooms = (await getRoomsAccessible(this.token, 10000)).data.entity;
        const currentRoom = rooms.find(room => room.janusId === roomId);
        if (currentRoom && currentRoom.tumorConference) {
          this.roomName = currentRoom.tumorConference.description;
          this.roomDate = currentRoom.tumorConference.date;
          this.entries = currentRoom.tumorConference.entries;
        }
        this.loading = false;
      } catch (e) {
        this.handleError(e);
        this.loading = false;
      }
    },

    getName(name) {
      return fhirUtil.getStringFromHumanName(name, true);
    }
  },

  async created() {
    if (this.$route.params.room) {
      this.loadVideoConference(this.$route.params.room);
    } else {
      this.error = "No conference found.";
      this.loading = false;
    }
  },

  components: {
    Spinner,
    NotificationPanels,
    ClipboardIcon,
    CaseOverview
  }
};
</script>

<style lang="scss" scoped>
.case-overview {
  padding-top: 15px;
}

.rowSelected {
  border-left: 4px solid $vitu-green;

  .list-item-icon {
    color: $vitu-green;
  }
}

.notSelected {
  padding-left: 4px !important;
}

.list-header {
  font-weight: 500;
  padding: 15px;
  border-bottom: 1px solid $border-color;
}

.list-item {
  padding: 10px 0;
  display: flex;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
}

.list-item-title {
  font-weight: 500;
}

.list-icon-placement {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.list-item-icon {
  font-size: 30px;
  color: $vitu-grey;
}

.background {
  background-color: white;
  min-height: calc(100vh - 66px);
}

.case-list {
  position: fixed;
  height: 100%;
  right: 0;
  top: $navbar-height;
  bottom: 0;
  background: white;
  width: 260px;
  border-left: 1px solid $border-color;
}
</style>
