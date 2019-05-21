import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Login from "./views/Login.vue";
import WorkingList from "@/views/WorkingList";
import Planner from "@/views/Planner";
import Conference from "@/views/Conference";
import Documentation from "@/views/Documentation";

import config from "./config/config";

Vue.use(Router);

export default new Router({
  base: config.BASE_URL,
  mode: "history",
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    },
    {
      path: "/worklist",
      name: "worklist",
      component: WorkingList,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    },
    {
      path: "/planner",
      name: "planner",
      component: Planner,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    },
    {
      path: "/conference/:room?",
      name: "conference",
      component: Conference,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    },
    {
      path: "/documentation",
      name: "documentation",
      component: Documentation,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    },
    {
      path: "/about",
      name: "about",
      component: About,
      meta: { requiresAuth: true, roleAdmin: true, roleUser: true }
    }
  ]
});
