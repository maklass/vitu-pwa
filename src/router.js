import Vue from "vue";
import Router from "vue-router";
import NotFound from "./views/404";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Login from "./views/Login.vue";
import Worklist from "@/views/worklist/Worklist";
import ClinicalCase from "@/views/worklist/ClinicalCase";
import ClinicalCaseList from "@/views/worklist/ClinicalCaseList";
import ClinicalCaseEdit from "@/views/worklist/ClinicalCaseEdit";
import Patient from "@/views/worklist/Patient";
import PatientEdit from "@/views/worklist/PatientEdit";
import PatientList from "@/views/worklist/PatientList";
import Planner from "@/views/Planner";
import Conference from "@/views/Conference";
import ConferenceOverview from "@/views/ConferenceOverview";
import Documentation from "@/views/Documentation";
import DocumentationOverview from "@/views/DocumentationOverview";
import DocumentationView from "@/views/DocumentationView";
import Admin from "@/views/admin/Admin";
import AuditEvents from "@/views/admin/AuditEvents";
import StatusEdit from "@/views/admin/StatusEdit";
import StatusList from "@/views/admin/StatusList";
import UserEdit from "@/views/admin/UserEdit";
import ConferenceSettings from "@/views/admin/ConferenceSettings";
import UserList from "@/views/admin/UserList";
import Organization from "@/views/admin/Organization";
import Organizations from "@/views/admin/Organizations";
import ConferenceModerator from "@/views/ConferenceModerator.vue";
import TempUpload from "@/views/worklist/TempUpload";

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
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR, roles.ADMINISTRATOR, roles.FREIGEBER, roles.CASE_MANAGER] }
    },
    {
      path: "/worklist",
      name: "worklist",
      component: Worklist,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER, roles.ADMINISTRATOR] },
      redirect: {
        name: "clinical-cases"
      },
      children: [
        {
          path: "/worklist/clinical-cases",
          name: "clinical-cases",
          component: ClinicalCaseList,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/clinical-cases/:id?",
          name: "clinical-case",
          component: ClinicalCase,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/clinical-cases/edit/new",
          name: "clinical-case-new",
          component: ClinicalCaseEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/clinical-cases/edit/:id?",
          name: "clinical-case-edit",
          component: ClinicalCaseEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/patients/new",
          name: "patient-new",
          component: PatientEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/patients/:id",
          name: "patient",
          component: Patient,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/patients",
          name: "patients",
          component: PatientList,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/patients/edit/:id?",
          name: "patient-edit",
          component: PatientEdit,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        },
        {
          path: "/worklist/upload",
          name: "temp-upload",
          component: TempUpload,
          meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.CASE_MANAGER] }
        }
      ]
    },
    {
      path: "/planner",
      name: "planner",
      component: Planner,
      meta: { requiresAuth: true, roles: [roles.MODERATOR] }
    },
    {
      path: "/conference/:room/moderator",
      name: "conference-moderator",
      component: ConferenceModerator,
      meta: { requiresAuth: true, roles: [roles.MODERATOR, roles.USER] }
    },
    {
      path: "/conference/",
      name: "conference-overview",
      component: ConferenceOverview,
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR] }
    },
    {
      path: "/conference/:room",
      name: "conference",
      component: Conference,
      meta: { requiresAuth: true, roles: [roles.USER, roles.MODERATOR] }
    },
    {
      path: "/documentation",
      name: "documentation-overview",
      component: DocumentationOverview,
      meta: { requiresAuth: true, roles: [roles.MODERATOR] }
    },
    {
      path: "/documentation/new",
      name: "documentation-new",
      component: Documentation,
      meta: { requiresAuth: true, roles: [roles.MODERATOR] }
    },
    {
      path: "/documentation/:id",
      name: "documentation",
      component: DocumentationView,
      meta: { requiresAuth: true, roles: [roles.MODERATOR] }
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
          path: "/admin/auditevents",
          name: "auditevents",
          component: AuditEvents,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
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
          path: "/admin/statuses/new-status",
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
          path: "/admin/organizations",
          name: "organizations",
          component: Organizations,
          meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
        },
        {
          path: "/admin/organizations/:id",
          name: "organization",
          component: Organization,
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
      meta: { requiresAuth: true, roles: [roles.ADMINISTRATOR] }
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
