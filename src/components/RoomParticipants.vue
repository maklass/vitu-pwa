<template>
  <div>
    <div v-if="users && participants">
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <v-select v-model="selectedUser" label="name" :options="annotatedUsers" :placeholder="$t('pleaseSelect')" @search:blur="onBlur">
              <div slot="no-options">{{ $t("noEntriesFound") }}</div>
            </v-select>
          </div>
        </div>
        <div class="col-md-auto">
          <button ref="addButton" class="btn btn-secondary btn-add" :disabled="!selectedUser" @click="addParticipantsToRoom(selectedUser.id)">{{ $t("add") }}</button>
        </div>
      </div>
      <div class="form-row">
        <div class="col-md-auto">
          <button class="btn btn-secondary btn-add" @click="addAllParticipantsToRoom">{{ $t("addAll") }}</button>
        </div>
        <div class="col-md-auto">
          <button class="btn btn-secondary btn-add" @click="deleteAllParticipantsFromRoom">{{ $t("deleteAll") }}</button>
        </div>
        <div class="col-md-auto" v-if="participants" style="align-self: center;">{{ participants.length }} {{ $tc("participant", participants.length) }}</div>
      </div>
      <list-item class="list-item" v-for="user in participants" :key="user.id" :title="getTitleForUser(user)" :subtitle="user.username">
        <template slot="icon">
          <account-circle-icon class="account-icon" />
        </template>
        <template slot="actions">
          <delete-icon @click="deleteParticipantsFromRoom(user.id)" />
        </template>
      </list-item>
    </div>
    <spinner v-else line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
  </div>
</template>

<script>
import ListItem from "@/components/ui/ListItem";
import { getUsers } from "@/api/security-api";
import { getParticipantsInRoom, addParticipantsToRoom, deleteParticipantsFromRoom } from "../api/video-api";

import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import DeleteIcon from "vue-material-design-icons/Delete";
import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

export default {
  props: {
    roomId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      users: null,
      participants: null,
      selectedUser: null,
      first: 0,
      max: 10000
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    annotatedUsers() {
      if (this.users) {
        return this.users.map(user => {
          return { ...user, name: this.getTitleForUser(user) };
        });
      }

      return [];
    }
  },

  methods: {
    handleError(error) {
      this.$emit("error", error);
    },

    async getUsers() {
      try {
        this.users = (await getUsers(this.token, this.first, this.max)).data.sort((e1, e2) => {
          if (e1.lastName && typeof e1.lastName === "string" && e2.lastName && typeof e2.lastName === "string") {
            return e1.lastName.localeCompare(e2.lastName);
          }
        });
      } catch (e) {
        this.handleError(e);
      }
    },

    async getParticipantsInRoom() {
      try {
        const participantIds = (await getParticipantsInRoom(this.roomId, this.token)).data;
        this.participants = this.users.filter(user => participantIds.includes(user.id));

        this.participants.sort((e1, e2) => {
          if (e1.lastName && e2.lastName) {
            return e1.lastName.localeCompare(e2.lastName);
          }
        });
      } catch (e) {
        this.handleError(e);
      }
    },

    async addParticipantsToRoom(participants) {
      if (!participants) {
        return;
      }

      try {
        this.participants = null;
        await addParticipantsToRoom(this.roomId, participants, this.token);
        await this.getParticipantsInRoom();
      } catch (e) {
        this.handleError(e);
      }
    },

    async addAllParticipantsToRoom() {
      if (!this.users) {
        return;
      }

      const participants = this.users.map(user => user.id);
      this.addParticipantsToRoom(participants);
    },

    async deleteParticipantsFromRoom(participants) {
      if (!participants) {
        return;
      }

      try {
        this.participants = null;
        await deleteParticipantsFromRoom(this.roomId, participants, this.token);
        await this.getParticipantsInRoom();
      } catch (e) {
        this.handleError(e);
      }
    },

    async deleteAllParticipantsFromRoom() {
      if (!this.participants) {
        return;
      }

      const participants = this.participants.map(participant => participant.id);
      this.deleteParticipantsFromRoom(participants);
    },

    getTitleForUser(user) {
      let title = `${user.lastName || ""} ${user.firstName || ""}`;

      if (title && title.trim() !== "") {
        return title;
      }
      return "-";
    },

    onBlur() {
      if (this.$refs.addButton) {
        this.$refs.addButton.focus();
      }
    }
  },

  async mounted() {
    await this.getUsers();
    await this.getParticipantsInRoom();
  },

  components: {
    AccountCircleIcon,
    DeleteIcon,
    ListItem,
    Spinner
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

.delete-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: rgba(0, 0, 0, 0.7);
  }
}

.btn-add {
  background: white;

  &:disabled {
    background: white;
  }
}

.account-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}
</style>
