import Vue from "vue";
import VueHighlightJS from "vue-highlightjs";
import BootstrapVue from "bootstrap-vue";
import VueClipboard from "vue-clipboard2";

import adapter from "webrtc-adapter";
import "./registerServiceWorker";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n/i18n";
import config from "./config/config";

import "vue-material-design-icons/styles.css";
import "highlight.js/styles/github-gist.css";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueHighlightJS);
Vue.use(VueClipboard);

window.adapter = adapter;

router.beforeEach((to, from, next) => {
  let keycloak = store.state.authentication.keycloak;
  if (to.meta.requiresAuth) {
    if (!keycloak.authenticated) {
      keycloak.login();
      return;
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
      await store.dispatch("INIT_KEYCLOAK");
    }
    initializeVue();
  } catch (e) {
    console.error(e);
  }
};

initialize();
