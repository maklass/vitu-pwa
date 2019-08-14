<template>
  <div>
    <div v-if="users && participants">
      <div class="form-row">
        <div class="col">
          <div class="form-group">
            <select class="form-control" v-model="selectedUser">
              <option selected disabled value="null">{{ $t("pleaseSelect") }}</option>
              <option v-for="user in users" :key="user.id" :value="user">{{ getTitleForUser(user) }}</option>
            </select>
          </div>
        </div>
        <div class="col-md-auto">
          <button class="btn btn-secondary btn-add" :disabled="!selectedUser" @click="addParticipantsToRoom(selectedUser.id)">{{ $t("add") }}</button>
        </div>
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
      selectedUser: null
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    })
  },

  methods: {
    handleError(error) {
      this.$emit("error", error);
    },

    async getUsers() {
      try {
        this.users = (await getUsers(this.token)).data.sort((e1, e2) => {
          if (e1.firstName && typeof e1.firstName === "string" && e2.firstName && typeof e2.firstName === "string") {
            return e1.firstName.localeCompare(e2.firstName);
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
          if (e1.firstName && e2.firstName) {
            return e1.firstName.localeCompare(e2.firstName);
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

    getTitleForUser(user) {
      let title = `${user.firstName || ""} ${user.lastName || ""}`;

      if (title && title.trim() !== "") {
        return title;
      }
      return "-";
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
