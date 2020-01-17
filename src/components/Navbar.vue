<template>
  <b-navbar toggleable="md" type="light" fixed="top">
    <b-navbar-brand :to="{ name: 'home' }">
      <img src="../assets/logo/VITU_72ppi.png" class="d-inline-block align-top vitu-logo" height="38" alt="VITU Logo" />
    </b-navbar-brand>
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'home' }">{{ $t("home.home") }}</b-nav-item>
        <!-- <b-nav-item v-if="isModerator || isAdmin" :to="{ name: 'worklist-old' }">{{ $tc("worklist.worklist", 1) }}_old</b-nav-item> -->
        <b-nav-item v-if="isModerator || isAdmin" :to="{ name: 'worklist' }" active-class="active">{{ $tc("worklist.worklist", 1) }}</b-nav-item>
        <b-nav-item v-if="isModerator || isAdmin" :to="{ name: 'planner' }">{{ $tc("planner.conferencePlanner", 1) }}</b-nav-item>
        <b-nav-item :to="{ name: 'conference-overview' }">{{ $tc("conference.videoConference", 1) }}</b-nav-item>
        <b-nav-item v-if="isModerator || isAdmin" :disabled="deactivateDocumentation" :to="{ name: 'documentation-overview' }">{{ $tc("documentation.documentation", 1) }}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="isAdmin" :to="{ name: 'admin' }" active-class="active"><wrench-icon /></b-nav-item>
        <locale-switcher />
        <b-nav-item-dropdown right class="dropdown-user">
          <template slot="button-content">
            <account-circle-icon class="account-icon" />
          </template>
          <b-dropdown-header v-if="keycloak && keycloak.idTokenParsed">
            <div>{{ fullUserName }}</div>
            <div v-if="isModerator">- {{ $t("roles.moderator") }}</div>
            <div v-if="isAdmin">- {{ $t("roles.administrator") }}</div>
          </b-dropdown-header>
          <b-dropdown-divider />
          <b-dropdown-item :href="changePasswordUrl" target="_blank">{{ $t("changePassword") }}</b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item @click="logout()">{{ $t("navbar.signOut") }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import WrenchIcon from "vue-material-design-icons/Wrench";
import config from "../config/config";
import roles from "../model/roles";

import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      keycloak: state => state.authentication.keycloak,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    changePasswordUrl() {
      return `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/account/password`;
    },

    fullUserName() {
      if (this.keycloak) {
        return this.keycloak.idTokenParsed.name;
      } else {
        return "";
      }
    },

    isAdmin() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.ADMINISTRATOR);
      } else {
        return false;
      }
    },

    deactivateDocumentation() {
      return config.DEACTIVATE_DOCUMENTATION;
    },

    isModerator() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.MODERATOR);
      } else {
        return false;
      }
    }
  },

  methods: {
    logout() {
      this.keycloak.logout({
        redirectUri: window.location.origin + "/" + config.BASE_URL + "/login"
      });
    }
  },

  components: {
    AccountCircleIcon,
    LocaleSwitcher,
    WrenchIcon
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 66px;
}

.account-icon {
  font-size: larger;
}

.vitu-logo {
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
</style>
