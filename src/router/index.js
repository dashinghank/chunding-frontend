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
  console.log(store.state);
  if (store.state.uid === "") {
    if (to.name !== "Login") {
      next({ name: "Login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
