import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

export default new Vuex.Store({
  state: {
    userInfo: {
      products: {},
      docId: "",
      role: "",
      uid: "",
    },
    allProducts: {},
    downlines: {},
  },
  mutations: {
    setClear(state) {
      state.userInfo = {
        products: {},
        docId: "",
        role: "",
        uid: "",
      };
      state.allProducts = {};
      state.downlines = {};
    },

    setAllProducts(state, allProducts) {
      state.allProducts = allProducts;
    },

    setDownlines(state, downline) {
      state.downlines[downline.urlsuffix] = {
        docId: downline.docId,
        urlsuffix: downline.urlsuffix,
        nickname: downline.nickname,
        depth: downline.depth,
        products: downline.products,
      };
    },

    setUserInfo(state, userInfo) {
      state.userInfo.docId = userInfo.docId;
      state.userInfo.uid = userInfo.uid;
      state.userInfo.role = userInfo.role;
      state.userInfo.products = userInfo.products;
    },

    setDownlineProduct(state, data) {
      state.downlines[data.urlsuffix].products[data.productId].commision =
        data.commision;
      state.downlines[data.urlsuffix].products[data.productId].percentage =
        data.percentage;
    },
  },
  plugins: [createPersistedState()],
});
