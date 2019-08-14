<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="false" :fluid="true" />
    <div class="container-fluid conference-overview">
      <spinner v-if="!rooms" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      <div v-if="rooms">
        <div>
          <h6>{{ $t("conference.scheduledConferences") }}</h6>
          <div class="conferences">
            <div class="form-group">
              <input type="text" class="form-control" :placeholder="$t('planner.searchConference')" v-model="searchTerm" />
            </div>
          </div>
          <div class="conferences">
            <!-- FIXME: USE ID AS INDEX -->
            <router-link v-for="(conference, index) in filteredRooms" :key="index" tag="div" :to="{ name: 'conference', params: { room: conference.janusId } }">
              <conference-card :conference="conference" />
            </router-link>
          </div>
        </div>
        <div class="other-conferences" v-if="conferenceSettings && conferenceSettings.persistentRoomEnabled">
          <h6>{{ $t("conference.otherConferences") }}</h6>
          <div class="conferences">
            <router-link tag="div" class="conference-card" :to="{ name: 'conference', params: { room: 'adhoc' } }">
              <div class="headline text-muted">
                <conference-card :conference="{ tumorConference: { description: conferenceSettings.persistentRoomName, entries: [] } }" :showEntries="false" />
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ConferenceCard from "@/components/ConferenceCard";
import NotificationPanels from "@/components/ui/NotificationPanels";
import config from "../config/config";
import { getRoomsAccessible } from "@/api/video-api";
import { handleAxiosError } from "@/util/error-util";

import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

export default {
  data() {
    return {
      error: null,
      rooms: null,
      searchTerm: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      conferenceSettings: state => state.settings.conferenceSettings
    }),

    filteredRooms() {
      if (!this.rooms) {
        return this.rooms;
      }

      return this.rooms.filter(room => {
        if (room.description === config.ADHOC_ROOM_DESCRIPTION) {
          return false;
        }

        if (room.tumorConference && room.tumorConference.id === -1) {
          return false;
        }

        if (this.demo && this.getDescriptionForRoom(room) !== "Demo") {
          return false;
        }

        if (room.tumorConference && room.tumorConference.date && new Date().getTime() > new Date(room.tumorConference.date).getTime() + 1000 * 60 * 60 * 12) {
          return false;
        }

        if (room.tumorConference && room.tumorConference.entries) {
          room.tumorConference.entries = room.tumorConference.entries.filter(entry => entry);
        }

        if (
          this.searchTerm &&
          !this.getDescriptionForRoom(room)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    },

    demo() {
      return config.DEMO;
    }
  },

  methods: {
    async getRooms() {
      try {
        this.rooms = (await getRoomsAccessible(this.token)).data.entity;
      } catch (e) {
        this.handleError(e);
      }
    },

    getDescriptionForRoom(room) {
      if (room) {
        if (room.tumorConference && room.tumorConference.description) {
          return room.tumorConference.description;
        } else if (room.description) {
          return room.description;
        }
      }
      return "";
    },

    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    }
  },

  mounted() {
    this.getRooms();
  },

  components: {
    ConferenceCard,
    NotificationPanels,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.conferences {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
  grid-gap: 0.25rem;
}

.other-conferences {
  padding-top: 30px;
}

.conference-overview {
  padding-top: 15px;
  padding-bottom: 15px;
}
</style>
