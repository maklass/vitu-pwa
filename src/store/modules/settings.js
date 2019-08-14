import { getConferenceSettings, updateConferenceSettings } from "@/api/video-api";
import config from "@/config/config";

const state = {
  conferenceSettings: null
};

const mutations = {
  setSettings(state, { conferenceSettings }) {
    state.conferenceSettings = conferenceSettings;
  }
};

const actions = {
  async getConferenceSettings({ commit }, { token }) {
    try {
      let response = await getConferenceSettings(token);
      commit("setSettings", { conferenceSettings: response.data });
    } catch (e) {
      console.error("Could not load settings from server, using default settings.");
      commit("setSettings", { conferenceSettings: config.DEFAULT_CONFERENCE_SETTINGS });
    }
  },

  async updateConferenceSettings({ commit }, { token, settings }) {
    await updateConferenceSettings(settings, token);
    commit("setSettings", { conferenceSettings: settings });
  }
};

export default {
  actions,
  mutations,
  state
};
