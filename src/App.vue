<template>
  <div id="app">
    <navbar v-if="!isLoginPage && keycloak.authenticated" />
    <div :class="{ content: !isLoginPage }">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";

import { mapState } from "vuex";

export default {
  computed: {
    isLoginPage() {
      return this.$route.name === "login";
    },

    ...mapState({
      keycloak: state => state.authentication.keycloak
    })
  },

  components: {
    Navbar
  }
};
</script>

<style lang="scss" scoped>
.content {
  padding-top: 66px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss">
@import "scss/styles.scss";
</style>
