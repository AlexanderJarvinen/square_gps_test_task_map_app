<template>
  <v-container fluid class="py-0">
    <v-btn
      v-if="isMdAndDown"
      class="list-toggle"
      small
      elevation="6"
      @click="drawer = !drawer"
    >
      {{ drawer ? $t("map.toggle.hide") : $t("map.toggle.show") }}
    </v-btn>

    <v-row no-gutters class="map-layout">
      <v-col v-show="!isMdAndDown" cols="12" md="4" class="pa-0">
        <portal-target name="marker-sidebar" slim />
      </v-col>

      <v-col :cols="12" :md="isMdAndDown ? 12 : 8" class="pa-0">
        <map-canvas
          ref="canvas"
          :markers="markers"
          :selected-id="selectedId"
          @select="onSelect"
          @add="onAddMarker"
        />
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-if="isMdAndDown"
      v-model="drawer"
      temporary
      app
      left
      width="360"
    >
      <portal-target name="marker-drawer" slim />
    </v-navigation-drawer>

    <portal :to="isMdAndDown ? 'marker-drawer' : 'marker-sidebar'">
      <marker-list
        :markers="markers"
        :selected-id="selectedId"
        @select="onSelect"
        @clear-all="onClearAllMarkers"
        @remove="onRemoveMarker"
      />
    </portal>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import MarkerList from "@/components/MarkerList.vue";
import MapCanvas from "@/components/MapCanvas.vue";
import { Marker, NextWithVm } from "@/types";
import { Route, NavigationGuardNext } from "vue-router";

export default Vue.extend({
  name: "MapView",
  components: { MarkerList, MapCanvas },

  data(): { drawer: boolean } {
    return { drawer: false };
  },

  beforeRouteEnter(to: Route, from: Route, next: NextWithVm): void {
    next((vm) => {
      (vm as Vue & { focusSelectedOnMap?: () => void }).focusSelectedOnMap?.();
    });
  },

  beforeRouteUpdate(to: Route, from: Route, next: NavigationGuardNext): void {
    (this as Vue & { focusSelectedOnMap?: () => void }).focusSelectedOnMap?.();
    next();
  },

  async created() {
    await this.$store.dispatch("fetchMarkers");
    await this.$store.dispatch("hydrateSelectedId");

    const routeId = (this.$route.params.id as string | undefined) ?? null;
    const storeId = this.$store.getters.getSelectedId as string | null;

    if (routeId) {
      if (routeId !== storeId)
        await this.$store.dispatch("setSelectedId", routeId);
    } else if (storeId) {
      this.$router
        .replace({ path: `/map/${encodeURIComponent(storeId)}` })
        .catch((e: Error) => {
          if (!e || e.name !== "NavigationDuplicated") throw e;
        });
    }
  },

  computed: {
    isMdAndDown(): boolean {
      return this.$vuetify.breakpoint.mdAndDown;
    },
    markers() {
      return this.$store.getters.getAllMarkers;
    },
    selectedId: {
      get() {
        return this.$store.getters.getSelectedId;
      },
      set(value: string | null) {
        this.$store.dispatch("setSelectedId", value);
      },
    },
  },

  watch: {
    selectedId(id: string | null) {
      const current = this.$route.params.id || null;
      if (id === current) return;

      this.$router
        .replace({ path: id ? `/map/${encodeURIComponent(id)}` : "/map" })
        .catch((err: Error) => {
          if (err && err.name !== "NavigationDuplicated") throw err;
        });
    },
    "$route.params.id"(id?: string) {
      const next = id ?? null;
      const cur = this.$store.getters.getSelectedId as string | null;
      if (next !== cur) this.$store.dispatch("setSelectedId", next);
    },
  },

  methods: {
    onSelect(id: string) {
      this.selectedId = id;
      if (this.isMdAndDown) this.drawer = false;
    },
    async onAddMarker(payload: { lat: number; lng: number }) {
      const created: Marker = await this.$store.dispatch("addMarker", payload);
      this.selectedId = created.id;
    },
    onClearAllMarkers() {
      this.$store.dispatch("clearAllMarkers");
      this.drawer = false;

      if (this.$route.name === "map" && this.$route.params.id) {
        this.$router.replace({ name: "map" }).catch((e: Error) => {
          if (!e || e.name !== "NavigationDuplicated") throw e;
        });
      }
    },
    async onRemoveMarker(id: string) {
      await this.$store.dispatch("removeMarker", id);
    },
  },
});
</script>

<style scoped>
.map-layout {
  height: calc(100vh - 200px);
  min-height: 420px;
}
.list-toggle {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
}
:deep(.v-navigation-drawer.v-navigation-drawer--temporary.drawer-temp) {
  z-index: 1000;
}
</style>
