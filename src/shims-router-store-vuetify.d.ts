declare module "vue/types/options" {
  interface ComponentOptions<Vue> {
    router?: import("vue-router").default;
    store?: import("vuex").Store<any>;
    vuetify?: import("vuetify").Vuetify;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $router: import("vue-router").default;
    $store: import("vuex").Store<any>;
    $vuetify: import("vuetify").Framework;
  }
}
