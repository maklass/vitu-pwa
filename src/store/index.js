import Vue from "vue";
import Vuex from "vuex";

import authentication from "./modules/authentication";
import error from "./modules/error";
import janusVideoRoom from "./modules/janus-video-room";
import settings from "./modules/settings";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    authentication,
    error,
    janusVideoRoom,
    settings
  }
});
