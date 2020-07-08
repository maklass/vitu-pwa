<template>
  <b-navbar toggleable="md" type="light" fixed="top">
    <b-navbar-brand :to="{ name: 'home' }">
      <img :src="logo" class="d-inline-block align-top vitu-logo" alt="Logo" />
    </b-navbar-brand>
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'home' }">{{ $t("home.home") }}</b-nav-item>
        <b-nav-item v-if="isModerator || isCaseManager" :to="{ name: 'worklist' }" active-class="active">{{ $tc("worklist.worklist", 1) }}</b-nav-item>
        <b-nav-item v-if="isModerator" :to="{ name: 'planner' }">{{ $tc("planner.conferencePlanner", 1) }}</b-nav-item>
        <b-nav-item v-if="isParticipant" :to="{ name: 'conference-overview' }">{{ $tc("conference.videoConference", 1) }}</b-nav-item>
        <b-nav-item v-if="isModerator || isFreigeber" :disabled="deactivateDocumentation" :to="{ name: 'documentation-overview' }">{{ $tc("documentation.documentation", 1) }}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="isAdmin" id="navbar-admin" :to="{ name: 'admin' }" active-class="active"><wrench-icon title=""/></b-nav-item>
        <b-tooltip v-if="isAdmin" target="navbar-admin" triggers="hover" :title="$t('admin.adminArea')" />
        <locale-switcher />
        <b-nav-item-dropdown right class="dropdown-user">
          <template slot="button-content">
            <account-circle-icon class="account-icon" />
          </template>
          <b-dropdown-header v-if="keycloak && keycloak.idTokenParsed">
            <div>{{ fullUserName }}</div>
            <div v-if="isModerator">- {{ $t("roles.moderator") }}</div>
            <div v-if="isAdmin">- {{ $t("roles.administrator") }}</div>
            <div v-if="isCaseManager">- {{ $t("roles.caseManager") }}</div>
            <div v-if="isFreigeber">- {{ $t("roles.freigeber") }}</div>
            <div v-if="isParticipant">- {{ $t("roles.participant") }}</div>
          </b-dropdown-header>
          <b-dropdown-divider />
          <b-dropdown-item :href="changePasswordUrl" target="_blank">{{ $t("changePassword") }}</b-dropdown-item>
          <b-dropdown-item @click="copyTokenToClipbard" v-if="isAdmin">{{ $t("copyToken") }}</b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item @click="logout">{{ $t("navbar.signOut") }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import WrenchIcon from "vue-material-design-icons/Wrench";
import config from "@/config/config";
import roles from "@/model/roles";
import logoMolit from "@/assets/logo/MOLIT_Logo_920.png";
import logoVitu from "@/assets/logo/VITU_72ppi.png";

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

    deactivateDocumentation() {
      return config.DEACTIVATE_DOCUMENTATION;
    },

    isAdmin() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.ADMINISTRATOR);
      } else {
        return false;
      }
    },

    isModerator() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.MODERATOR);
      } else {
        return false;
      }
    },

    isCaseManager() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.CASE_MANAGER);
      } else {
        return false;
      }
    },

    isFreigeber() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.FREIGEBER);
      } else {
        return false;
      }
    },

    isParticipant() {
      if (this.keycloak) {
        return this.keycloak.hasRealmRole(roles.USER);
      } else {
        return false;
      }
    },

    logo() {
      return config.VITU_BRANDING ? logoVitu : logoMolit;
    }
  },

  methods: {
    async copyTokenToClipbard() {
      try {
        await this.$copyText(this.keycloak.token);
        this.$bvToast.toast(this.$tc("tokenSuccessfullyCopied"), {
          title: this.$tc("message"),
          autoHideDelay: 5000,
          appendToast: false,
          toaster: "b-toaster-bottom-right"
        });
      } catch (e) {
        alert("Token could not be copied.");
      }
    },

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
  min-height: $navbar-height;
}

.account-icon {
  font-size: larger;
}

.vitu-logo {
  height: 30px;
}
</style>
