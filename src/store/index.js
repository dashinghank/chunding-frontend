import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

export default new Vuex.Store({
  state: {
    userInfo: {
      uid: "",
      role: "",
      docId: "",
      products: {},
    },
    allProducts: {},
    downlines: {},
  },
  mutations: {
    setClear(state) {
      state.userInfo = {
        uid: "",
        role: "",
        docId: "",
        products: {},
      };
      state.downlines = {};
      state.allProducts = {};
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
      state.downlines[data.urlsuffix].products[data.productId].percentage =
        data.percentage;
    },
  },
  plugins: [createPersistedState()],
});
