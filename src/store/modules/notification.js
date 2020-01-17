const state = {
  errors: []
};

const mutations = {
  addError(state, { error }) {
    state.errors.push(error);
  }
};

export default {
  state,
  mutations
};
