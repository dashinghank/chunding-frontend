import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

export default new Vuex.Store({
  state: {
    uid: "",
    role: "",
    exceptionalProducts: {},
    products: {},
    downlines: {},
  },
  mutations: {
    setUid(state, { uid = "", role = "", exceptionalProducts = {} }) {
      state.uid = uid;
      state.role = role;
      state.exceptionalProducts = exceptionalProducts;
    },
    setProducts(state, products) {
      state.products = products;
    },

    setDownline(state, downline) {
      state.downlines[downline.urlsuffix] = {
        urlsuffix: downline.urlsuffix,
        nickname: downline.nickname,
        depth: downline.depth,
        exceptionalProducts: downline.exceptionalProducts,
      };
    },
  },

  plugins: [createPersistedState()],
});
