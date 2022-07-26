import moment from "moment";
import { createWebHistory, createRouter } from "vue-router";
import store from "../store";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/createDownline",
    name: "CreateDownline",
    component: () => import("@/views/CreateDownline.vue"),
  },

  {
    path: "/",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },

  {
    path: "/supervisorPage",
    name: "SupervisorPage",
    component: () => import("@/views/SupervisorPage.vue"),
  },
  {
    path: "/products",
    name: "Products",
    component: () => import("@/views/Products.vue"),
  },

  {
    path: "/configureDownline",
    name: "ConfigureDownline",
    component: () => import("@/views/ConfigureDownline.vue"),
  },
  {
    path: "/report",
    name: "Report",
    component: () => import("@/views/Report.vue"),
  },

  {
    path: "/veriflyKol",
    name: "VeriflyKol",
    component: () => import("@/views/VeriflyKol.vue"),
  },
  {
    path: "/customerService",
    name: "CustomerService",
    component: () => import("@/views/CustomerService.vue"),
  },
  {
    path: "/announcementPage",
    name: "AnnouncementPage",
    component: () => import("@/views/AnnouncementPage.vue"),
  },
  {
    path: "/carousel",
    name: "Carousel",
    component: () => import("@/views/Carousel.vue"),
  },
  {
    path: "/commissionManagement",
    name: "CommissionManagement",
    component: () => import("@/views/CommissionManagement.vue"),
  },
  {
    path: "/productDownline",
    name: "ProductDownline",
    component: () => import("@/views/ProductDownline.vue"),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  //檢查登入過期
  //超過三天後，自動登出
  console.log("router in");
  if (
    moment().valueOf() - store.state.lastLoginDatetime >
    1000 * 60 * 60 * 24 * 3
  ) {
    store.commit("setClear");
  }

  if (store.state.userInfo.urlsuffix == "") {
    console.log("尚未登入");
    if (to.name != "Login") next({ name: "Login" });
    else next();
    return;
  }

  console.log("before switch");
  switch (store.state.userInfo.role) {
    case "kol":
      switch (to.name) {
        case "SupervisorPage":
          next({ name: "Home" });
          return;

        case "Products":
          next({ name: "Home" });
          return;

        case "VeriflyKol":
          next({ name: "Home" });
          return;

        case "Carousel":
          next({ name: "Home" });
          return;

        case "CommissionManagement":
          next({ name: "Home" });
          return;
      }
      break;
    case "sub":
      switch (to.name) {
        case "SupervisorPage":
          next({ name: "Home" });
          return;

        case "Products":
          next({ name: "Home" });
          return;
      }
      break;
  }
  next();
});

export default router;
