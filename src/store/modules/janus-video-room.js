import Janus from "@/assets/js/janus.js";
import * as videoApi from "../../api/video-api";
import * as janusApi from "../../api/janus-api";
import config from "../../config/config";
import { LocalParticipant } from "../../model/Participant";

const state = {
  opaqueIdVideo: "vitu-" + Janus.randomString(12),
  opaqueIdScreen: "vitu-" + Janus.randomString(12),
  localParticipant: null,
  remoteParticipants: [],
  iceServers: [],
  errors: [],
  room: 4321,
  janus: null,
  janusReady: false,
  consentDialog: false
};

const mutations = {
  addRemoteParticipant() {},

  setIceServers(state, iceServers) {
    state.iceServers = iceServers;
  },

  addError(state, error) {
    state.errors.push(error);
  },

  setJanus(state, janus) {
    state.janus = janus;
  },

  setJanusReady(state, janusReady) {
    state.janusReady = janusReady;
  },

  setConsentDialog(state, consentDialog) {
    state.consentDialog = consentDialog;
  },

  setLocalParticipant(state, localParticipant) {
    state.localParticipant = localParticipant;
  }
};

const actions = {
  async initVideoRoom({ rootState, state, commit }) {
    try {
      let res = await videoApi.getIceServers(rootState.authentication.keycloak.token);
      commit("setIceServers", res.data);

      await janusApi.initializeJanus();
      let janus = await janusApi.createJanus(config.JANUS_URL, state.iceServers);
      commit("setJanus", janus);

      let pluginHandle = await janusApi.attach(state.opaqueIdVideo, on => commit("setConsentDialog", on));

      let localParticipant = new LocalParticipant("eeeeh");
      localParticipant.pluginHandle = pluginHandle;
      commit("setLocalParticipant", localParticipant);
    } catch (error) {
      console.error(error);
      commit("addError", error);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
