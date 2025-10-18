<template>
  <v-container fluid class="py-0">
    <v-row no-gutters class="map-layout">
      <!-- Список -->
      <v-col cols="12" md="4" class="pa-0">
        <marker-list
          :markers="markers"
          :selected-id="selectedId"
          @select="onSelect"
        />
      </v-col>

      <!-- Карта -->
      <v-col cols="12" md="8" class="pa-0">
        <map-canvas
          :markers="markers"
          :selected-id="selectedId"
          @select="onSelect"
          @add="onAddMarker"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import MarkerList from "@/components/MarkerList.vue";
import MapCanvas from "@/components/MapCanvas.vue";
import Router, { Route } from "vue-router";

type Marker = { id: string; title: string; lat: number; lng: number };

type MapViewThis = Vue & {
  $route: Route;
  $router: Router;
  selectedId: string | null;
  markers: Marker[];
};

export default Vue.extend({
  name: "MapView",
  components: { MarkerList, MapCanvas },
  data() {
    return {
      markers: [
        { id: "1", title: "Маркер № 1", lat: 55.750606, lng: 37.615771 },
        { id: "2", title: "Маркер № 2", lat: 55.749597, lng: 37.614977 },
        { id: "3", title: "Маркер № 3", lat: 55.751336, lng: 37.617177 },
        { id: "4", title: "Маркер № 4", lat: 55.751741, lng: 37.615181 },
      ] as Marker[],
      selectedId: null as string | null,
    };
  },
  created(this: MapViewThis) {
    // Если хочешь иметь id в URL: /map/:id?
    const id = this.$route.params.id as string | undefined;
    if (id) this.selectedId = id;
  },
  watch: {
    selectedId(this: MapViewThis, id: string | null) {
      // синхронизация с адресной строкой
      if (this.$route.name === "map") {
        this.$router.replace({
          path: id ? `/map/${encodeURIComponent(id)}` : "/map",
        });
      }
    },
  },
  methods: {
    onSelect(id: string) {
      this.selectedId = id;
    },
    onAddMarker(payload: { lat: number; lng: number }) {
      const id = String(Date.now());
      this.markers.push({
        id,
        title: `Маркер № ${this.markers.length + 1}`,
        lat: payload.lat,
        lng: payload.lng,
      });
      this.selectedId = id;
    },
  },
});
</script>

<style scoped>
/* высота: 100vh минус шапка (152 + 48) */
.map-layout {
  height: calc(100vh - 200px);
  min-height: 420px; /* чтобы на маленьких экранах было удобно */
}
</style>
