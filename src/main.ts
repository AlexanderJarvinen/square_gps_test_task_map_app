import Vue, { CreateElement } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import type VueRouter from "vue-router";
import type { Store } from "vuex";
import type Vuetify from "vuetify";
import { RootState } from "@/types";
import Vuex from "vuex";
import PortalVue from "portal-vue";
import i18n from "./i18n";

Vue.use(Vuex);
Vue.use(PortalVue);

Vue.config.productionTip = false;

const options: Vue.ComponentOptions<Vue> & {
  router: VueRouter;
  store: Store<RootState>;
  vuetify: Vuetify;
  render: (h: CreateElement) => Vue.VNode;
} = {
  router,
  store,
  vuetify,
  i18n,
  render: (h: CreateElement) => h(App),
};

new Vue(options).$mount("#app");
