<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="false" :fluid="true" />
    <div class="conference">
      <div v-if="!showVideoConference" class="container">
        <div v-if="loading && !error">
          <spinner line-fg-color="#148898" line-bg-color="#99bfbf" size="large" :speed="1.5" />
          <div class="loading-information">{{ $t("conference.initializing") }}..</div>
        </div>
        <div class="card-wrapper" v-if="!loading">
          <div class="card" v-if="!error">
            <div class="card-body">
              <h5 class="card-title">{{ roomName }}</h5>
              <h6 v-if="roomDate && conferenceSettings.showDateTimeInTitle" class="card-subtitle mb-2 text-muted">{{ $d(new Date(roomDate), "long") }}</h6>
              <!-- <h6 class="card-subtitle mb-2 text-muted">{{ $t("conference.roomNumber") }}: {{ roomId }}</h6> -->
              <p class="card-text">
                {{ $t("conference.tutorial") }}
              </p>
              <button autofocus class="btn btn-primary" @click="goToConference">{{ $t("conference.enterConference") }}</button>
            </div>
          </div>
          <div class="card" v-if="error">
            <div class="card-body">
              <h5 class="card-title">{{ roomName }}</h5>
              <h6 v-if="roomDate && conferenceSettings.showDateTimeInTitle" class="card-subtitle mb-2 text-muted">{{ $d(new Date(roomDate), "long") }}</h6>
              <p class="card-text">
                {{ $t("conference.notAllowed") }}
              </p>
              <router-link tag="button" class="btn btn-primary" :to="{ name: 'conference-overview' }">{{ $t("conference.backToOverview") }}</router-link>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showVideoConference" class="container-fluid">
        <video-conference
          :showEntries="showEntries"
          :entries="entries"
          :ratioX="ratioX"
          :ratioY="ratioY"
          :cutVideoStreams="conferenceSettings.cutVideoStreams"
          :bitrate="conferenceSettings.bitrate"
          :room="roomId"
          :roomToken="roomToken"
          :roomName="roomName"
          :roomDate="roomDate"
          :showRoomDate="conferenceSettings.showDateTimeInTitle"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NotificationPanels from "@/components/ui/NotificationPanels";
import VideoConference from "@/components/video-conference/VideoConference";
import config from "@/config/config";
import { addRoom, addParticipantsToRoom, getAdhocRoom, addUserToAdhocRoomByToken, getRoomsAccessible, getAccessTokenForRoom } from "@/api/video-api";
import { handleAxiosError } from "@/util/error-util";

import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

export default {
  data() {
    return {
      loading: true,
      entries: [],
      error: null,
      roomId: null,
      roomName: null,
      roomDate: null,
      roomToken: null,
      showVideoConference: false,
      showEntries: true,
      rooms: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      conferenceSettings: state => state.settings.conferenceSettings
    }),

    demo() {
      return config.DEMO;
    },

    ratioX() {
      if (this.conferenceSettings && this.conferenceSettings.aspectRatio && typeof this.conferenceSettings.aspectRatio === "string") {
        let ratioX = this.conferenceSettings.aspectRatio.split(":")[0];
        if (ratioX && parseInt(ratioX)) {
          return parseInt(ratioX);
        }
      }
      return 16;
    },

    ratioY() {
      if (this.conferenceSettings && this.conferenceSettings.aspectRatio && typeof this.conferenceSettings.aspectRatio === "string") {
        let ratioY = this.conferenceSettings.aspectRatio.split(":")[1];
        if (ratioY && parseInt(ratioY)) {
          return parseInt(ratioY);
        }
      }
      return 10;
    }
  },

  methods: {
    handleError(error) {
      this.error = handleAxiosError(error, this);
      this.loading = false;
      window.scrollTo(0, 0);
    },

    async loadAdhocConference() {
      try {
        this.roomName = this.conferenceSettings.persistentRoomName;
        this.showEntries = false;
        this.roomId = (await getAdhocRoom(this.token)).data.room;
        await addUserToAdhocRoomByToken(this.token);
        this.roomToken = (await getAccessTokenForRoom(this.roomId, this.token)).data.token;
        this.loading = false;
      } catch (e) {
        this.handleError(e);
      }
    },

    async loadVideoConference() {
      try {
        this.roomId = parseInt(this.$route.params.room);
        this.rooms = (await getRoomsAccessible(this.token)).data.entity;
        const currentRoom = this.rooms.find(room => room.janusId === this.roomId);
        if (currentRoom && currentRoom.tumorConference) {
          this.roomName = currentRoom.tumorConference.description;
          this.roomDate = currentRoom.tumorConference.date;
          this.entries = currentRoom.tumorConference.entries;
        }
        this.roomToken = (await getAccessTokenForRoom(this.roomId, this.token)).data.token;
        this.loading = false;
      } catch (e) {
        this.handleError(e);
      }
    },

    async goToVideoConference(conference) {
      let entries = conference.tumorConference.entries;

      if (!this.demo) {
        this.entries = entries;
        const participants = [
          "e2e25d6d-0281-4b29-a022-fd8a05d29fb4",
          "34cc73df-63e8-46d9-93bf-5586f8340976",
          "088b694b-9fba-4999-b57e-14a70738dd56",
          "e1eaa4be-ef25-4dbe-88ab-c13751e43ab1",
          "7b65fb08-b33a-4c91-9f1d-127927cd0cb0",
          "fb7aceab-b5d3-431c-a523-96abbe0ac99c",
          "e00a58a3-d721-4de4-b026-b0c2d23e11a3"
        ];
        await addParticipantsToRoom(conference.janusId, participants, this.token);
        this.$router.push({ name: "conference", params: { room: conference.janusId } });
        this.showVideoConference = true;
      } else {
        this.goToDemoConference();
      }
    },

    async goToDemoConference() {
      this.loadingDemo = true;
      const responseRoom = await addRoom("Demo", new Date(), this.token);
      const janusId = responseRoom.data.janusId;
      const participants = [
        "e2e25d6d-0281-4b29-a022-fd8a05d29fb4",
        "34cc73df-63e8-46d9-93bf-5586f8340976",
        "088b694b-9fba-4999-b57e-14a70738dd56",
        "e1eaa4be-ef25-4dbe-88ab-c13751e43ab1",
        "7b65fb08-b33a-4c91-9f1d-127927cd0cb0",
        "fb7aceab-b5d3-431c-a523-96abbe0ac99c",
        "e00a58a3-d721-4de4-b026-b0c2d23e11a3"
      ];
      await addParticipantsToRoom(janusId, participants, this.token);
      this.$router.push({ name: "conference", params: { room: janusId } });
      this.showVideoConference = true;
      this.loadingDemo = false;
    },

    goToConference() {
      this.showVideoConference = true;
    },

    async initialize() {
      if (this.$route.params.room) {
        if (this.$route.params.room === "adhoc") {
          this.loadAdhocConference();
        } else {
          await this.loadVideoConference();
        }
      } else {
        this.$router.push({ name: "conference-overview" });
      }
    }
  },

  mounted() {
    this.initialize();
  },

  components: {
    Spinner,
    NotificationPanels,
    VideoConference
  }
};
</script>

<style lang="scss" scoped>
.conference {
  padding-top: 15px;
}

.card-wrapper {
  display: flex;
  justify-content: center;

  .card {
    max-width: 32rem;

    .card-title {
      color: $vitu-green;
    }
  }
}

.loading-information {
  display: flex;
  justify-content: center;
  padding-top: 15px;
  font-size: 1.2rem;
}
</style>
