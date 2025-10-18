<template>
  <div class="map-wrap">
    <div class="map-toolbar">
      <v-btn small depressed @click="toggleAddMode">
        {{ addMode ? "Режим добавления: ВКЛ" : "Добавить маркер" }}
      </v-btn>
    </div>
    <div ref="map" class="map-el"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// чин для дефолтной иконки Leaflet (иначе не видно маркер)
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

type Marker = { id: string; title: string; lat: number; lng: number };

export default Vue.extend({
  name: "MapCanvas",
  props: {
    markers: { type: Array as () => Marker[], required: true },
    selectedId: { type: String, default: null },
  },
  data() {
    return {
      map: null as L.Map | null,
      layerGroup: null as L.LayerGroup | null,
      addMode: false,
    };
  },
  mounted() {
    // стартовый центр — Москва (как на скрине)
    this.map = L.map(this.$refs.map as HTMLElement, {
      center: [55.751244, 37.618423],
      zoom: 16,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);

    // обработчик клика по карте (добавление)
    this.map.on("click", (e: L.LeafletMouseEvent) => {
      if (!this.addMode) return;
      const { lat, lng } = e.latlng;
      this.$emit("add", { lat, lng });
      this.addMode = false;
    });

    this.renderMarkers();
    this.fitToMarkers();
  },
  watch: {
    markers: {
      deep: true,
      handler() {
        this.renderMarkers();
        this.fitToMarkers();
      },
    },
    selectedId() {
      this.highlightSelected();
    },
  },
  methods: {
    toggleAddMode() {
      this.addMode = !this.addMode;
    },
    renderMarkers() {
      if (!this.layerGroup) return;
      this.layerGroup.clearLayers();

      this.markers.forEach((m: Marker) => {
        const marker = L.marker([m.lat, m.lng]).addTo(this.layerGroup!);
        marker.bindPopup(
          `<strong>ID:</strong> ${m.id}<br/><strong>Lat:</strong> ${m.lat}<br/><strong>Lng:</strong> ${m.lng}`
        );
        marker.on("click", () => {
          this.$emit("select", m.id);
        });
        (marker as any)._markerId = m.id; // сохраним id для подсветки
      });

      this.highlightSelected();
    },
    highlightSelected() {
      if (!this.layerGroup) return;
      (this.layerGroup as any).eachLayer((layer: any) => {
        const isSelected = layer._markerId === this.selectedId;
        const icon = isSelected
          ? new L.Icon.Default({ className: "leaflet-marker-icon selected" })
          : new L.Icon.Default();
        layer.setIcon(icon);
        if (isSelected && this.map) {
          this.map.setView(layer.getLatLng(), this.map.getZoom(), {
            animate: true,
          });
          layer.openPopup();
        }
      });
    },
    fitToMarkers() {
      if (!this.map || this.markers.length === 0) return;
      const bounds = L.latLngBounds(
        this.markers.map((m: Marker) => [m.lat, m.lng] as [number, number])
      );
      this.map.fitBounds(bounds, { padding: [24, 24] });
    },
  },
});
</script>

<style scoped>
.map-wrap {
  position: relative;
  height: 100%;
}
.map-toolbar {
  position: absolute;
  z-index: 1000;
  top: 12px;
  right: 12px;
}
.map-el {
  height: 100%;
  width: 100%;
}

/* Небольшая визуальная подсветка выбранного маркера (ч/з класс иконки) */
.leaflet-marker-icon.selected {
  filter: hue-rotate(200deg) saturate(1.4);
}
</style>
