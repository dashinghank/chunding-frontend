import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

export default new Vuex.Store({
  state: {
    uid: "",
    role: "",
    exceptionalProducts: {},
  },
  mutations: {
    setUid(state, { uid = "", role = "", exceptionalProducts = {} }) {
      state.uid = uid;
      state.role = role;
      state.expectionalDefaults = exceptionalProducts;
    },
  },
  plugins: [createPersistedState()],
});
