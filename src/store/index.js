import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

export default new Vuex.Store({
  state: {
    uid: "",
    role: "",
    exceptionalProducts: {},
    products: {},
    downlinesProducts: {},
    downlines: {},
  },
  mutations: {
    setUid(state, { uid = "", role = "" }) {
      state.uid = uid;
      state.role = role;
    },

    setProducts(state, products) {
      state.products = products;
    },

    setDownlinesProducts(state, downlinesProducts) {
      state.downlinesProducts = downlinesProducts;
    },

    setExceptionalProducts(state, data) {
      state.downlinesProducts[data.urlsuffix][data.productId].default =
        data.productDefault;
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
