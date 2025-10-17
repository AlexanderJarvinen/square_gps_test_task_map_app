import Vue from "vue";

Vue.prototype.$t = (key: string) => key;

Vue.prototype.$i18n = {
  locale: "en",
  t: (key: string) => key,
};
