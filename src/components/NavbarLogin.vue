<template>
  <div>
    <b-navbar toggleable="md" fixed="top" type="light">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand>
        <img :src="logo" class="d-inline-block align-top vitu-logo" height="38" alt="Logo" />
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
import config from "@/config/config";
import logoMolit from "@/assets/logo/MOLIT_Logo_920.png";
import logoVitu from "@/assets/logo/VITU_72ppi.png";

export default {
  computed: {
    logo() {
      return config.VITU_BRANDING ? logoVitu : logoMolit;
    }
  },

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
