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
@import "~bootstrap/scss/bootstrap";
@import "~bootstrap-vue/src/index.scss";

:focus {
  outline: none;
}

.info-box {
  background: $vitu-blue;
  color: #eee;
  padding: 0.8rem 1rem;
  border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px);
  margin-bottom: 1rem;

  a {
    color: #eee;
    font-weight: bold;
  }

  a:hover,
  a:active,
  a:focus {
    color: white;
  }
}

body {
  background: $vitu-background;
}

.ghost {
  opacity: 0.5;
  // border: 2px dashed $vitu-green;
  // box-shadow: inset 0px 0px 0px 1px map-get($theme-colors, "primary");
}

.spacer {
  flex: 1;
}

.admin-header {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  align-items: center;
  min-height: 4rem;

  h5 {
    margin-bottom: 0;
  }
}

.admin-body {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.admin-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.info-header {
  background: $vitu-blue;
  color: #eee;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;

  a {
    color: #eee;
    font-weight: bold;
  }

  a:hover,
  a:active,
  a:focus {
    color: white;
  }
}

.vdp-datepicker__calendar .cell.selected,
.vdp-datepicker__calendar .cell.selected.highlighted,
.vdp-datepicker__calendar .cell.selected:hover {
  background: map-get($theme-colors, "primary") !important;
  color: white;
}

.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year:hover {
  border-color: map-get($theme-colors, "secondary") !important;
}

.form-control:focus {
  box-shadow: initial;
  -webkit-box-shadow: initial;
  border-color: map-get($theme-colors, "secondary");
}

.btn-cancel,
.btn-secondary {
  background: white;

  &:hover {
    background: rgba(0, 0, 0, 0.075);
  }
}

@media print {
  @page {
    margin-top: 2cm;
    margin-bottom: 1.5cm;
    margin-left: 1.2cm;
    margin-right: 1.2cm;
  }

  body {
    padding: 0 !important;
    margin: 0 !important;
  }

  .content {
    margin: 0 !important;
    padding: 0 !important;
  }

  .container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  button,
  .breadcrumps,
  .navbar {
    display: none !important;
  }

  // Firefox specific styls
  @-moz-document url-prefix() {
    div {
      display: block !important;
    }

    .list-item .avatar {
      display: none !important;
    }
  }
}
</style>
