import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import moment from "moment";

export default new Vuex.Store({
  state: {
    userInfo: {
      docId: "",
      nickname: "",
      urlsuffix: "",
      commissionPercentage: 0,
      registerDatetime: 0,
      depth: -1,
      parent: "",
      ancestors: [],
      role: "",
    },
    allProducts: {},
    downlines: {},
    lastLoginDatetime: 0,
  },
  mutations: {
    setClear(state) {
      state.userInfo = {
        docId: "",
        nickname: "",
        urlsuffix: "",
        commissionPercentage: 0,
        registerDatetime: 0,
        depth: -1,
        ancestors: [],
        parent: "",
        role: "",
      };
      state.allProducts = {};
      state.downlines = {};
      state.lastLoginDatetime = 0;
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
        parent: downline.parent,
        ancestors: downline.ancestors,
        commissionPercentage: downline.commissionPercentage,
      };
    },

    setUserInfo(state, userInfo) {
      state.userInfo.docId = userInfo.docId;
      state.userInfo.urlsuffix = userInfo.urlsuffix;
      state.userInfo.role = userInfo.role;
      state.userInfo.nickname = userInfo.nickname;
      state.userInfo.commissionPercentage = userInfo.commissionPercentage;
      state.userInfo.registerDatetime = userInfo.registerDatetime;
      state.userInfo.depth = userInfo.depth;
      state.userInfo.ancestors = userInfo.ancestors;
      state.userInfo.parent = userInfo.parent;
      state.userInfo.role = userInfo.role;
      state.lastLoginDatetime = moment().valueOf();
    },
  },
  plugins: [createPersistedState()],
});
