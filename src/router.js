import Vue from "vue";
import Router from "vue-router";
import NotFound from "./views/404";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Login from "./views/Login.vue";
import WorkListOld from "@/views/WorkList";
import Worklist from "@/views/worklist/Worklist";
import ClinicalCaseList from "@/views/worklist/ClinicalCaseList";
import ClinicalCaseEdit from "@/views/worklist/ClinicalCaseEdit";
import PatientEdit from "@/views/worklist/PatientEdit";
import Planner from "@/views/Planner";
import Conference from "@/views/Conference";
import ConferenceOverview from "@/views/ConferenceOverview";
import Documentation from "@/views/Documentation";
import DocumentationOverview from "@/views/DocumentationOverview";
import DocumentationView from "@/views/DocumentationView";
import Admin from "@/views/admin/Admin";
import StatusEdit from "@/views/admin/StatusEdit";
import StatusList from "@/views/admin/StatusList";
import UserEdit from "@/views/admin/UserEdit";
import ConferenceSettings from "@/views/admin/ConferenceSettings";
import UserList from "@/views/admin/UserList";

import config from "./config/config";
import roles from "./model/roles";

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
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/worklist-old",
      name: "worklist-old",
      component: WorkListOld,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/worklist",
      name: "worklist",
      component: Worklist,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] },
      redirect: {
        name: "clinical-case-list"
      },
      children: [
        {
          path: "/worklist/clinical-case-list",
          name: "clinical-case-list",
          component: ClinicalCaseList,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
        },
        {
          path: "/worklist/clinical-case/:id?",
          name: "clinical-case",
          component: ClinicalCaseEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
        },
        {
          path: "/worklist/clinical-case/new",
          name: "clinical-case-new",
          component: ClinicalCaseEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
        },
        {
          path: "/worklist/patient/new",
          name: "patient-new",
          component: PatientEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
        }
      ]
    },
    {
      path: "/planner",
      name: "planner",
      component: Planner,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/conference/",
      name: "conference-overview",
      component: ConferenceOverview,
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/conference/:room",
      name: "conference",
      component: Conference,
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/documentation",
      name: "documentation-overview",
      component: DocumentationOverview,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/documentation/new",
      name: "documentation-new",
      component: Documentation,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/documentation/:id",
      name: "documentation",
      component: DocumentationView,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.ADMINISTRATOR] }
    },
    {
      path: "/admin",
      name: "admin",
      component: Admin,
      meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] },
      redirect: {
        name: "users"
      },
      children: [
        {
          path: "/admin/statuses",
          name: "statuses",
          component: StatusList,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/statuses/:id?",
          name: "status",
          component: StatusEdit,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/statuses/new",
          name: "status-new",
          component: StatusEdit,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/conference",
          name: "conference-settings",
          component: ConferenceSettings,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/users",
          name: "users",
          component: UserList,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/users/:id?",
          name: "user-edit",
          component: UserEdit,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/users/new",
          name: "user-new",
          component: UserEdit,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        }
      ]
    },
    {
      path: "/about",
      name: "about",
      component: About,
      meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR, roles.MODERATOR, roles.USER] }
    },
    {
      path: "/404",
      name: "404",
      component: NotFound
    },
    { path: "*", redirect: "/404" }
  ],
  linkExactActiveClass: "active"
});
