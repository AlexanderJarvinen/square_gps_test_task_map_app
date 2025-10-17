import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export interface RootState {
  // We will describe it as we develop it.Click to apply
  count: 0;
}

export default new Vuex.Store({
  state: {} as RootState,
  getters: {},
  mutations: {},
  actions: {},
  modules: {},
});
