<template>
  <div>
    <b-navbar toggleable="md" fixed="top" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand>
        <img src="../assets/logo/VITU_72ppi.png" class="d-inline-block align-top vitu-logo" height="42" alt="VITU Logo" />
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <LocaleSwitcher />
          <b-nav-item href="https://molit.eu/impressum/" target="_blank">{{ $t("navbar.imprint") }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="login">
      <LoginCard :title="$t('login.title')" :subtitle="$t('login.subtitle')" :text="$t('login.text')" :buttonText="$t('login.buttonText')" v-on:click="onLoginClick" />
    </div>
  </div>
</template>

<script>
import LoginCard from "@/components/LoginCard";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import config from "../config/config";

export default {
  name: "login",

  computed: {
    keycloak() {
      return this.$store.state.authentication.keycloak;
    }
  },
  components: {
    LoginCard,
    LocaleSwitcher
  },

  methods: {
    onLoginClick() {
      this.keycloak.login({
        redirectUri: window.location.origin + "/" + config.BASE_URL
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  background: white;
}

.login {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient($vitu-angle, $vitu-green 0%, $vitu-green 50%, $vitu-light-green 50%);
}

.vitu-logo {
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
</style>
