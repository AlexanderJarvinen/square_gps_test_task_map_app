declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    vuetify?: import("vuetify").Vuetify;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $vuetify: import("vuetify").Framework;
  }
}
