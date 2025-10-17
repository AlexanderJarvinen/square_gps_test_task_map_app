import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import AboutView from "../views/AboutView.vue";
import MapView from "../views/MapView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/about",
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/map/:id?",
    name: "map",
    component: MapView,
    props: (route) => ({
      selectedId: route.params.id ?? (route.query.id as string | null) ?? null,
    }),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
