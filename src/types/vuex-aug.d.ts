import { Store } from "vuex";
import { RootState } from "@/types/index";
import VueRouter, { Route } from "vue-router";
import type { Framework } from "vuetify";
import { IVueI18n } from "vue-i18n";

declare module "vue/types/vue" {
  interface Vue {
    $store: Store<RootState>;
    $vuetify: Framework;
    $router: VueRouter;
    $route: Route;
    $t(key: string, ...args: unknown[]): string;
    $i18n: IVueI18n;
  }
}
