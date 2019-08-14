<template>
  <div>
    <b-navbar toggleable="md" fixed="top" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand>
        <img src="../assets/logo/VITU_72ppi.png" class="d-inline-block align-top vitu-logo" height="38" alt="VITU Logo" />
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <LocaleSwitcher />
          <b-nav-item :href="$t('login.imprintLink')" target="_blank">{{ $t("navbar.imprint") }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default {
  components: {
    LocaleSwitcher
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  background: white;
}

.vitu-logo {
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
</style>
