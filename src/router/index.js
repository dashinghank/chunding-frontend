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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // console.log(store.state);
  if (store.state.userInfo.urlsuffix === "") {
    if (to.name !== "Login") {
      console.log("第1入口");
      next({ name: "Login" });
    } else {
      console.log("第2入口");
      next();
    }
  } else if (to.name == "Login") {
    console.log("已登入並且有使用者資料");
    next({ name: "Home" });
  } else {
    console.log("第三入口");
    next();
  }
});

export default router;
