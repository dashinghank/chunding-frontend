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
    path: "/report",
    name: "Report",
    component: () => import("@/views/Report.vue"),
  },
  {
    path: "/reportDownline",
    name: "ReportDownline",
    component: () => import("@/views/ReportDownline.vue"),
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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // console.log(store.state);
  if (store.state.userInfo.uid === "") {
    if (to.name !== "Login") {
      console.log("第1入口");
      next({ name: "Login" });
    } else {
      console.log("第2入口");
      next();
    }
  } else if (to.name == "Login") {
    console.log("已經登入還要去登入");
    next({ name: "Home" });
  } else {
    console.log("第三入口");
    next();
  }
});

export default router;
