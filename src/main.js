import Vue from "vue";
import VueHighlightJS from "vue-highlightjs";
import BootstrapVue from "bootstrap-vue";
import vSelect from "vue-select";
import VueClipboard from "vue-clipboard2";

import adapter from "webrtc-adapter";
import "./registerServiceWorker";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n/i18n";
import config from "./config/config";
import { intersection } from "./util/array-util";

import "vue-material-design-icons/styles.css";
import "highlight.js/styles/github-gist.css";
import "@molit/fhir-components/dist/@molit/fhir-components.css";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueHighlightJS);
Vue.use(VueClipboard);

Vue.component("v-select", vSelect);

window.adapter = adapter;

router.beforeEach((to, from, next) => {
  //Shows login if authentication is set to true in config
  if (config.AUTHENTICATION) {
    const keycloak = store.state.authentication.keycloak;
    if (to.meta.requiresAuth) {
      // Check if user is logged in
      if (!keycloak.authenticated) {
        if (to.name === "home") {
          next({ name: "login" });
          return;
        }
        keycloak.login({
          locale: i18n.locale,
          kcLocale: i18n.locale
        });
        return;
      }

      // Check roles of user
      if (!intersection(keycloak.realmAccess.roles, to.meta.roles).length) {
        next({ name: "404" });
      }
    }
  }

  next();
});

let initializeVue = function() {
  new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
};

let initialize = async function() {
  try {
    if (config.AUTHENTICATION) {
      const authenticated = await store.dispatch("INIT_KEYCLOAK");
      if (authenticated) {
        await store.dispatch("getConferenceSettings", { token: store.state.authentication.keycloak.token });
      }
    }
    initializeVue();
  } catch (e) {
    console.error(e);
  }
};

initialize();
