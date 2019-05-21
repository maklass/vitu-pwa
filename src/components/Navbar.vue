<template>
  <b-navbar toggleable="md" type="light">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand :to="{ name: 'home' }">
      <img src="../assets/logo/VITU_72ppi.png" class="d-inline-block align-top vitu-logo" height="42" alt="VITU Logo" />
    </b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'home' }" exact-active-class="active">{{ $t("home.home") }}</b-nav-item>
        <b-nav-item :to="{ name: 'worklist' }" exact-active-class="active">{{ $tc("worklist.worklist", 1) }}</b-nav-item>
        <b-nav-item :to="{ name: 'planner' }" exact-active-class="active">{{ $tc("planner.conferencePlanner", 1) }}</b-nav-item>
        <b-nav-item :to="{ name: 'conference' }" exact-active-class="active">{{ $tc("conference.videoConference", 1) }}</b-nav-item>
        <b-nav-item :to="{ name: 'documentation' }" exact-active-class="active">{{ $tc("documentation.documentation", 1) }}</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <locale-switcher />
        <b-nav-item-dropdown right class="dropdown-user">
          <!-- Using button-content slot -->
          <template slot="button-content">
            <account-circle-icon class="account-icon" />
          </template>
          <b-dropdown-header v-if="keycloak.idTokenParsed">{{ fullUserName }}</b-dropdown-header>
          <b-dropdown-divider />
          <!-- <b-dropdown-item href="#">{{$t('navbar.profile')}}</b-dropdown-item> -->
          <b-dropdown-item @click="logout()">{{ $t("navbar.signOut") }}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import LocaleSwitcher from "@/components/LocaleSwitcher";
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import config from "../config/config";

export default {
  computed: {
    keycloak() {
      return this.$store.state.authentication.keycloak;
    },
    fullUserName() {
      return this.keycloak.idTokenParsed.name;
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
    LocaleSwitcher,
    AccountCircleIcon
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  background: white;
}

.account-icon {
  font-size: larger;
}

.vitu-logo {
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
</style>
