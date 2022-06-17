import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import moment from "moment";

export default new Vuex.Store({
  state: {
    allCarousels: [],
    userInfo: {
      docId: "",
      account: "",
      nickname: "",
      urlsuffix: "",
      commissionPercentage: 0,
      registerDatetime: 0,
      depth: -1,
      parent: "",
      ancestors: [],
      role: "",
      qrCodeUrl: "",
    },
    commissionInfo: {},
    allProducts: {},
    downlines: {},
    lastLoginDatetime: 0,
    systems: {
      products: 0,
      orders: 0,
      members: 0,
    },
  },
  mutations: {
    setAllCarousels(state, payload) {
      state.allCarousels = payload;
    },
    setClear(state) {
      state.userInfo = {
        account: "",
        docId: "",
        nickname: "",
        urlsuffix: "",
        commissionPercentage: 0,
        registerDatetime: 0,
        depth: -1,
        ancestors: [],
        parent: "",
        role: "",
        qrCodeUrl: "",
      };
      state.commissionInfo = {};
      state.systems = {};
      state.allProducts = {};
      state.downlines = {};
      state.lastLoginDatetime = 0;
    },

    setAllProducts(state, allProducts) {
      state.allProducts = allProducts;
    },
    setSystems(state, systems) {
      state.systems = systems;
    },
    setDownline(state, downline) {
      state.downlines[downline.urlsuffix] = {
        docId: downline.id,
        urlsuffix: downline.urlsuffix,
        nickname: downline.nickname,
        depth: downline.depth,
        parent: downline.parent,
        ancestors: downline.ancestors,
        commissionPercentage: downline.commissionPercentage,
        phoneNumber: downline.phonenumber,
        instaId: downline.instaId,

        lineId: downline.lineid,
        role: downline.role,
      };
    },

    setUserInfo(state, userInfo) {
      state.userInfo.account = userInfo.account;
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
      state.userInfo.qrCodeUrl = userInfo.qrCodeUrl;
      state.userInfo.lineid = userInfo.lineid;
      state.userInfo.instaId = userInfo.instaId;
      state.userInfo.phonenumber = userInfo.phonenumber;
      state.lastLoginDatetime = moment().valueOf();
    },
    setCommissionInfo(state, commissionInfo) {
      state.commissionInfo = commissionInfo;
    },
  },
  plugins: [createPersistedState()],
});
