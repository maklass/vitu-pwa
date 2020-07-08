import Keycloak from "keycloak-js";
import config from "@/config/config";

export const SET_KEYCLOAK = "SET_KEYCLOAK";
export const INIT_KEYCLOAK = "INIT_KEYCLOAK";
export const UPDATE_TOKEN = "UPDATE_TOKEN";

const keycloakOptions = {
  url: config.KEYCLOAK_URL,
  realm: config.KEYCLOAK_REALM,
  clientId: config.KEYCLOAK_CLIENT_ID
};

const initOptions = {
  checkLoginIframe: false,
  onLoad: "check-sso",
  promiseType: "native"
};

const state = {
  keycloak: null
};

const mutations = {
  [SET_KEYCLOAK](state, { keycloak }) {
    state.keycloak = keycloak;
  }
};

const actions = {
  [INIT_KEYCLOAK]({ commit, dispatch }) {
    let keycloak = new Keycloak(keycloakOptions);
    return new Promise((resolve, reject) => {
      keycloak
        .init(initOptions)
        .then(authenticated => {
          commit(SET_KEYCLOAK, { keycloak });
          resolve(authenticated);
        })
        .catch(error => {
          reject(error);
        });
      keycloak.onTokenExpired = () => {
        dispatch(UPDATE_TOKEN);
      };
    });
  },

  [UPDATE_TOKEN]({ state }) {
    return state.keycloak.updateToken(5).then(refreshed => {
      console.log("Token refreshed", refreshed);
    });
  }
};

export default {
  state,
  mutations,
  actions
};
