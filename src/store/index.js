import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

// interface IProductDefault {
//   [key: string]: number;
// }

export default new Vuex.Store({
  state: {
    uid: "",
    role: "",
    exceptionalProducts: {},
    products: {},
    downlinesProducts: {},
  },
  mutations: {
    setUid(state, uid, role) {
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
  },
  plugins: [createPersistedState()],
});
