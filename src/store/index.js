import Vue from "vue";
import Vuex from "vuex";

import authentication from "./modules/authentication";
import janusVideoRoom from "./modules/janus-video-room";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    authentication,
    janusVideoRoom
  }
});
