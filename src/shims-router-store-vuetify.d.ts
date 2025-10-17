import Vue from "vue";

// расширяем типы опций у new Vue({ ... })
declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    router?: import("vue-router").default;
    store?: import("vuex").Store<any>;
    vuetify?: import("vuetify").Vuetify;
  }
}

// (не обязательно, но полезно) — расширим инстанс
declare module "vue/types/vue" {
  interface Vue {
    $router: import("vue-router").default;
    $store: import("vuex").Store<any>;
    $vuetify: import("vuetify").Framework;
  }
}
