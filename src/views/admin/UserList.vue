<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.user') }]" />
      <div class="admin-header">
        <h5 class="headline">{{ $t("admin.user") }}</h5>
      </div>
      <div class="admin-body">
        <spinner v-if="!users && !error" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-else>
          <list-item class="list-item" v-for="user in users" :key="user.id" :title="getTitleForUser(user)" :subtitle="user.username">
            <template slot="icon">
              <account-circle-icon class="account-icon" />
            </template>
          </list-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { getUsers } from "@/api/security-api";
import { handleAxiosError } from "@/util/error-util";

import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import Spinner from "vue-simple-spinner";
import { mapState } from "vuex";

export default {
  data() {
    return {
      users: null,
      error: null
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
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
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

    getTitleForUser(user) {
      let title = `${user.firstName || ""} ${user.lastName || ""}`;

      if (title && title.trim() !== "") {
        return title;
      }
      return "-";
    }
  },

  mounted() {
    this.getUsers();
  },

  components: {
    AccountCircleIcon,
    Breadcrumps,
    ListItem,
    NotificationPanels,
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

.account-icon {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
}
</style>
