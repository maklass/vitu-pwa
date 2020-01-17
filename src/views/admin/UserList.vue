<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="success" @closeSuccess="closeSuccess" @closeError="closeError" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.userList') }]" />
      <div class="page-header">
        <h5 class="headline">{{ $t("admin.userList") }}</h5>
        <div class="spacer"></div>
        <router-link class="btn btn-primary" tag="button" :to="{ name: 'user-new' }">{{ $t("admin.addUser") }}</router-link>
      </div>
      <div class="page-body">
        <spinner v-if="!users && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-else>
          <list-item class="list-item" v-for="user in users" :key="user.id" :title="getTitleForUser(user)" :subtitle="user.username" :to="!user.fromFederation ? { name: 'user-edit', params: { id: user.id } } : null">
            <template #icon>
              <account-circle-icon class="account-icon" />
            </template>
            <template #actions>
              <b-dropdown right variant="link" class="m-md-2" no-caret>
                <template slot="button-content">
                  <dots-vertical-icon />
                </template>
                <b-dropdown-item :disabled="user.fromFederation" :to="{ name: 'user-edit', params: { id: user.id } }">{{ $t("admin.editUser") }}</b-dropdown-item>
                <b-dropdown-item :disabled="user.fromFederation" @click="showDeleteUserModal(user)" variant="danger">{{ $t("admin.deleteUser") }}</b-dropdown-item>
              </b-dropdown>
            </template>
          </list-item>
          <b-pagination align="center" :total-rows="total" :per-page="max" v-model="currentPage" />
        </div>
      </div>
    </div>
    <b-modal id="delete-user-modal" okVariant="danger" :title="$t('admin.deleteUser')" header-text-variant="danger" :okTitle="$t('admin.deleteUser')" :cancelTitle="$t('cancel')" @ok="deleteUser(selectedUser.id)">
      {{ $t("admin.deleteUserConfirmation", { user: selectedUsername }) }}
    </b-modal>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { getUsers, getUserCount, deleteUser } from "@/api/security-api";
import notifications from "@/mixins/notifications";

import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical";
import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

export default {
  mixins: [notifications],

  data() {
    return {
      users: null,
      selectedUser: null,
      currentPage: 1,
      max: 20,
      total: 0
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    first() {
      return (this.currentPage - 1) * this.max;
    },

    selectedUsername() {
      let selectedUsername = "";

      if (this.selectedUser) {
        if (this.selectedUser.firstName) {
          selectedUsername += this.selectedUser.firstName + " ";
        }
        if (this.selectedUser.lastName) {
          selectedUsername += this.selectedUser.lastName;
        }
        if (!this.selectedUser.firstName && !this.selectedUser.lastName && this.selectedUser.username) {
          selectedUsername = this.selectedUser.username;
        }
      }

      return selectedUsername;
    }
  },

  methods: {
    async getUsers() {
      try {
        const totalResponse = await getUserCount(this.token);
        this.total = totalResponse.data;

        const userResponse = await getUsers(this.token, this.first, this.max);
        this.users = userResponse.data;
        // .sort((e1, e2) => {
        //   if (e1.firstName && typeof e1.firstName === "string" && e2.firstName && typeof e2.firstName === "string") {
        //     return e1.firstName.localeCompare(e2.firstName);
        //   }
        // });
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
    },

    showDeleteUserModal(user) {
      this.selectedUser = user;
      this.$bvModal.show("delete-user-modal");
    },

    async deleteUser(id) {
      if (!id) {
        console.error("No ID present.");
      }

      try {
        await deleteUser(id, this.token);
        this.success = this.$t("admin.deleteUserSuccessful");
        this.users = null;
        this.getUsers();
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    if (this.$route.query.success) {
      this.success = this.$t(this.$route.query.success);
    }
    this.getUsers();
  },

  watch: {
    currentPage() {
      this.users = null;
      this.getUsers();
    }
  },

  components: {
    AccountCircleIcon,
    Breadcrumps,
    DotsVerticalIcon,
    ListItem,
    NotificationPanels,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border: 0;
  }
}

.pagination {
  padding-top: 0.8rem;
  display: flex;
  justify-content: center;
}

.account-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}
</style>
