import Vue from "vue";
import Vuex from "vuex";
import { markersBackend } from "@/services/markerBackend";
import { GeoSuggestion, Marker, RootState } from "@/types";
import { GeoService } from "@/services/GeoService";
import i18n from "@/i18n";

Vue.use(Vuex);

const t = (key: string, params?: Record<string, unknown>) =>
  String(i18n.t(key, params));

export default new Vuex.Store<RootState>({
  state: {
    markers: [],
    selectedId: localStorage.getItem("selectedId") || null,
    loading: false,
    error: null,
    lastAddress: null,
    suggestionError: null as string | null,
  },
  getters: {
    getSelectedId: (state) => state.selectedId,
    getAllMarkers: (state) => state.markers,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    getLastAddress: (state) => state.lastAddress,
    getSuggestionError: (state) => state.suggestionError,
  },
  mutations: {
    setMarkers(state, items: Marker[]) {
      state.markers = items;
    },
    updateMarkers(state, item: Marker) {
      state.markers = [...state.markers, item];
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
    setError(state, msg: string | null) {
      state.error = msg;
    },
    updateSelectedId(state, id: string | null) {
      state.selectedId = id;
    },
    removeMarker(state, id: string) {
      state.markers = state.markers.filter((m) => m.id !== id);
      if (state.selectedId === id) state.selectedId = null;
    },
    setLastAddress(state, payload: string | null) {
      state.lastAddress = payload;
    },
    setSuggestionError(state, msg: string | null) {
      state.suggestionError = msg;
    },
  },
  actions: {
    async fetchMarkers({ commit }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        const list = await markersBackend.list();
        commit("setMarkers", list);
        return list;
      } catch (e) {
        commit(
          "setError",
          e instanceof Error ? e.message : t("store.error.unknown")
        );
      } finally {
        commit("setLoading", false);
      }
    },

    async addMarker(
      { commit },
      payload: { lat: number; lng: number; address: string }
    ): Promise<Marker> {
      commit("setError", null);
      const idSuffix = Date.now().toString().slice(-5);
      const title = t("store.marker.titleTemplate", { idSuffix });
      const created = await markersBackend.create({
        title,
        lat: payload.lat,
        lng: payload.lng,
        address: payload.address,
      } as Omit<Marker, "id">);
      commit("updateMarkers", created);
      return created;
    },

    async fetchSuggestions(
      { commit },
      { query, limit = 10 }: { query: string; limit?: number }
    ): Promise<GeoSuggestion[]> {
      commit("setLoading", true);
      commit("setError", null);

      try {
        const res = await markersBackend.fetchSuggestions(query, limit);
        if (res.error) {
          commit("setSuggestionError", res.error);
        } else {
          commit("setSuggestionError", null);
        }
        return res.items || [];
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : t("store.error.suggestions");
        commit("setError", msg);
        commit("setSuggestionError", msg);
        return [];
      } finally {
        commit("setLoading", false);
      }
    },

    async clearAllMarkers({ commit }) {
      await markersBackend.clear();
      commit("setMarkers", []);
      commit("updateSelectedId", null);
    },

    async removeMarker({ commit }, id: string) {
      await markersBackend.remove(id);
      commit("removeMarker", id);
    },

    async hydrateSelectedId({ commit }) {
      const saved = await markersBackend.getSelectedId();
      commit("updateSelectedId", saved);
    },

    async setSelectedId({ commit }, id: string | null) {
      commit("updateSelectedId", id);
      if (id) {
        await markersBackend.setSelectedId(id);
      } else {
        await markersBackend.setSelectedId(null);
      }
    },

    async reverseGeocode(
      { commit },
      { lat, lon }: { lat: number; lon: number }
    ) {
      const address = await GeoService.reverseGeocode(lat, lon);
      commit("setLastAddress", address);
      return address;
    },
  },
});
