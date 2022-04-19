import { createWebHistory, createRouter } from "vue-router";

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
    path: "/inforo",
    name: "Inforo",
    component: () => import("@/views/Inforo.vue"),
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

export default router;
