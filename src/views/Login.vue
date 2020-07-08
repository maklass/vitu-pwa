<template>
  <div>
    <navbar-login />
    <div class="login">
      <LoginCard :title="title" :subtitle="$t('login.subtitle')" :text="$t('login.text')" :buttonText="$t('login.buttonText')" v-on:click="onLoginClick" />
    </div>
  </div>
</template>

<script>
import NavbarLogin from "@/components/NavbarLogin";
import LoginCard from "@/components/LoginCard";
import config from "../config/config";

export default {
  name: "login",

  computed: {
    keycloak() {
      return this.$store.state.authentication.keycloak;
    },

    title() {
      if (config.VITU_BRANDING) {
        return this.$t("login.title");
      } else {
        return "MOLIT Conference";
      }
    }
  },

  components: {
    LoginCard,
    NavbarLogin
  },

  methods: {
    onLoginClick() {
      this.keycloak.login({
        redirectUri: window.location.origin + "/" + config.BASE_URL,
        locale: this.$i18n.locale,
        kcLocale: this.$i18n.locale
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient($vitu-angle, $vitu-green 0%, $vitu-green 50%, $vitu-light-green 50%);
}
</style>
