import Keycloak from "keycloak-js";
import config from "../../config/config";

export const SET_KEYCLOAK = "SET_KEYCLOAK";
export const INIT_KEYCLOAK = "INIT_KEYCLOAK";

const state = {
  keycloak: null
};

const mutations = {
  [SET_KEYCLOAK](state, { keycloak }) {
    state.keycloak = keycloak;
  }
};

const actions = {
  [INIT_KEYCLOAK]({ commit }) {
    let keycloak = Keycloak({
      url: config.KEYCLOAK_URL,
      realm: config.KEYCLOAK_REALM,
      clientId: config.KEYCLOAK_CLIENT_ID
    });
    return new Promise((resolve, reject) => {
      keycloak
        .init({ onLoad: "check-sso" })
        .success(authenticated => {
          console.log(keycloak.token);
          commit(SET_KEYCLOAK, { keycloak });
          resolve(authenticated);
        })
        .error(error => {
          reject(error);
        });
    });
  },

  updateToken({ state }) {
    return new Promise((resolve, reject) => {
      state.keycloak
        .updateToken(30)
        .success(refreshed => {
          resolve(refreshed);
        })
        .error(error => {
          reject(error);
        });
    });
  }
};

export default {
  state,
  mutations,
  actions
};
