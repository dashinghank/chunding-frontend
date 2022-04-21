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
    myOrders: {},
    downlinesOrders: {},
    myCommision: 0,
    downlinesCommisions: 0,
  },
  mutations: {
    setClear(state) {
      state.uid = "";
      state.role = "";
      state.exceptionalProducts = {};
      state.products = {};
      state.downlinesProducts = {};
      state.downlines = {};
      state.myOrders = {};
      state.downlinesOrders = {};
      state.myCommision = 0;
      state.downlinesCommisions = 0;
    },
    setDownlinesCommisions(state, downlinesCommisions) {
      state.downlinesCommisions = downlinesCommisions;
    },
    setMyCommision(state, myCommision) {
      state.myCommision = myCommision;
    },
    setMyOrders(state, myOrders) {
      state.myOrders = myOrders;
    },
    setDownlinesOrders(state, downlinesOrders) {
      state.downlinesOrders = downlinesOrders;
    },

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
