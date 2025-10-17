import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomeView from "../views/HomeView.vue";
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
    component: HomeView,
  },
  {
    path: "/map",
    name: "map",
    component: MapView,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
