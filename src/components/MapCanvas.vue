<template>
  <div class="map-wrap">
    <div class="map-toolbar">
      <transition name="fade">
        <v-autocomplete
          ref="autocomplete"
          v-if="addMode"
          v-model="selectedSuggestion"
          :items="suggestions"
          :loading="searching"
          :search-input.sync="addressQuery"
          return-object
          dense
          outlined
          clearable
          hide-details
          item-text="label"
          item-value="value"
          class="address-ac"
          placeholder="Введите адрес"
          autofocus
          open-on-clear
          @input="onPickSuggestion"
        >
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  v-if="!$store.getters.getSuggestionError"
                  class="text--disabled"
                >
                  {{ searching ? "Поиск..." : "Нет совпадений" }}
                </v-list-item-title>
                <v-list-item-title v-else class="error--text">
                  {{ $store.getters.getSuggestionError }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-autocomplete>
      </transition>
      <v-btn small depressed @click="toggleAddMode">
        {{ addMode ? "Режим добавления: ВКЛ" : "Добавить маркер" }}
      </v-btn>
    </div>
    <div ref="map" class="map-el"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import L, {
  Map as LMap,
  Marker as LMarker,
  LeafletMouseEvent,
  LayerGroup,
  LatLngExpression,
  DivIcon,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, MarkerDTO, GeoSuggestion, VAutocompleteRef } from "@/types";
import MarkerTooltip from "@/components/MarkerTooltip.vue";
import i18n from "@/i18n";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default Vue.extend({
  name: "MapCanvas",
  props: {
    markers: { type: Array as PropType<Marker[]>, required: true },
    selectedId: { type: String, default: null },
  },
  data() {
    return {
      addMode: false as boolean,
      addressQuery: "" as string,
      searching: false as boolean,
      suggestions: [] as GeoSuggestion[],
      selectedSuggestion: null as GeoSuggestion | null,
      idleHandle: null as number | null,
      idleToken: 0 as number,
      map: null as LMap | null,
      tempMarker: null as LMarker | null,
      addClickHandlerBound: null as ((e: LeafletMouseEvent) => void) | null,
      markerLayer: null as LayerGroup | null,
      markerIndex: {} as Record<string, LMarker>,
    };
  },
  mounted() {
    this.map = L.map(this.$refs.map as HTMLDivElement, {
      center: [55.7506, 37.617],
      zoom: 15,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.renderMarkers();

    this.addClickHandlerBound = (e: LeafletMouseEvent) =>
      this.handleAddClick(e);

    if (this.addMode) {
      this.enableAddMode();
    }
  },
  beforeDestroy() {
    this.cancelIdle(this.idleHandle);
    this.idleHandle = null;
    this.disableAddMode();
    if (this.map) {
      this.map.remove();
    }
  },
  watch: {
    markers: {
      handler() {
        this.renderMarkers();
      },
      deep: true,
      immediate: true,
    },
    addMode(active: boolean) {
      active ? this.enableAddMode() : this.disableAddMode();
    },
    selectedId() {
      this.updateSelectionStyling();
      this.flyToSelected();
    },
    addressQuery(q: string) {
      if (!this.addMode) {
        return;
      }
      this.cancelIdle(this.idleHandle);
      this.idleHandle = null;

      const query = (q || "").trim();
      if (query.length === 0) {
        this.suggestions = [];
        this.searching = false;
        const ac = this.$refs.autocomplete as unknown as
          | VAutocompleteRef
          | undefined;
        if (ac && typeof ac.blur === "function") {
          ac.isMenuActive = false;
        }
        return;
      }

      this.searching = true;
      const localQuery = query;
      this.idleHandle = this.scheduleIdle(async () => {
        try {
          const items: GeoSuggestion[] = await this.$store.dispatch(
            "fetchSuggestions",
            {
              query: localQuery,
              limit: 10,
            }
          );
          if ((this.addressQuery || "").trim().startsWith(localQuery)) {
            this.suggestions = items;
          }
        } finally {
          this.searching = false;
          this.idleHandle = null;
        }
      }, 1500);
    },
  },
  methods: {
    scheduleIdle(cb: IdleRequestCallback, timeout = 1500): number {
      if (window.requestIdleCallback) {
        return window.requestIdleCallback(cb, { timeout });
      }

      const token = ++this.idleToken;
      const run = () => {
        if (token !== this.idleToken) {
          return;
        }
        const deadline: IdleDeadline = {
          didTimeout: false,
          timeRemaining: () => 0,
        };
        cb(deadline);
      };
      if (typeof queueMicrotask === "function") {
        queueMicrotask(run);
      } else {
        Promise.resolve().then(run);
      }
      return token as number;
    },
    cancelIdle(handle: number | null) {
      if (handle == null) {
        return;
      }

      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        this.idleToken++;
      }
    },
    createPopupComponent(m: MarkerDTO): HTMLElement {
      const div = document.createElement("div");
      const vm = new (Vue.extend(MarkerTooltip))({
        i18n: this.$i18n ?? i18n,
        propsData: { marker: m, lat: m.lat, lng: m.lng },
      }).$mount(div);
      return vm.$el as HTMLElement;
    },
    toggleAddMode() {
      this.addMode = !this.addMode;
    },

    async onPickSuggestion(s: GeoSuggestion | null) {
      if (!s || !this.map) {
        return;
      }

      const { lat, lng, display } = s.value;

      if (this.tempMarker) {
        this.map.removeLayer(this.tempMarker);
        this.tempMarker = null;
      }

      this.$emit("add", { lat, lng, address: display });

      this.map.flyTo([lat, lng], Math.max(this.map.getZoom(), 16), {
        duration: 0.4,
      });

      this.addMode = false;
      this.disableAddMode();

      const ac = this.$refs.autocomplete as unknown as
        | VAutocompleteRef
        | undefined;
      if (ac) {
        ac.isMenuActive = false;
      }

      this.addressQuery = "";
      this.suggestions = [];
      this.selectedSuggestion = null;
    },
    renderMarkers() {
      if (!this.map || !this.markerLayer) {
        return;
      }

      const nextIds = new Set((this.markers as MarkerDTO[]).map((m) => m.id));
      const prevIds = new Set(Object.keys(this.markerIndex));

      for (const id of prevIds) {
        if (!nextIds.has(id)) {
          const mk = this.markerIndex[id];
          if (mk) {
            this.markerLayer.removeLayer(mk);
            delete this.markerIndex[id];
          }
        }
      }

      for (const m of this.markers as MarkerDTO[]) {
        const existing = this.markerIndex[m.id];
        const latlng: LatLngExpression = [m.lat, m.lng];

        if (!existing) {
          const marker = L.marker(latlng, {
            icon: this.getIcon(m.id === this.selectedId),
            title: m.title,
          }).on("click", () => this.$emit("select", m.id));

          marker.addTo(this.markerLayer);
          marker.bindPopup(this.createPopupComponent(m), {
            closeButton: false,
          });
          this.markerIndex[m.id] = marker;
        } else {
          const old = existing.getLatLng();
          if (old.lat !== m.lat || old.lng !== m.lng) {
            existing.setLatLng(latlng);
          }
          if ((existing.options.title ?? "") !== (m.title ?? "")) {
            existing.options.title = m.title;
            existing.bindPopup(this.createPopupComponent(m), {
              closeButton: false,
            });
          }
          existing.setIcon(this.getIcon(m.id === this.selectedId));
        }
      }
    },
    updateSelectionStyling() {
      for (const [id, mk] of Object.entries(this.markerIndex)) {
        mk.setIcon(this.getIcon(id === this.selectedId));
      }
    },

    flyToSelected(zoomIfLow = 16) {
      if (!this.map || !this.selectedId) {
        return;
      }
      const mk = this.markerIndex[this.selectedId];
      if (!mk) {
        return;
      }
      const target = mk.getLatLng();
      const nextZoom = Math.max(this.map.getZoom(), zoomIfLow);
      this.map.flyTo(target, nextZoom, { duration: 0.4 });
      mk.openPopup();
    },

    enableAddMode() {
      if (!this.map || !this.addClickHandlerBound) {
        return;
      }
      this.map.getContainer().classList.add("cursor-crosshair");
      this.map.on("click", this.addClickHandlerBound);
    },
    disableAddMode() {
      if (!this.map || !this.addClickHandlerBound) {
        return;
      }
      this.map.getContainer().classList.remove("cursor-crosshair");
      this.map.off("click", this.addClickHandlerBound);
      if (this.tempMarker) {
        this.map.removeLayer(this.tempMarker);
        this.tempMarker = null;
      }
    },

    async handleAddClick(e: LeafletMouseEvent) {
      if (!this.map) {
        return;
      }
      const { lat, lng } = e.latlng;

      if (this.tempMarker) {
        this.map.removeLayer(this.tempMarker);
      }
      this.tempMarker = L.marker([lat, lng], {
        icon: this.getIcon(true),
      }).addTo(this.map);

      try {
        const address = await this.$store.dispatch("reverseGeocode", {
          lat,
          lon: lng,
        });
        this.$emit("add", { lat, lng, address });
        this.addMode = false;
        this.disableAddMode();
      } catch (err) {
        if (this.tempMarker) {
          this.map.removeLayer(this.tempMarker);
          this.tempMarker = null;
        }
        const msg =
          err instanceof Error
            ? err.message
            : "Ошибка обратного геокодирования";
        this.$emit("adderror", msg);
      }
    },

    getIcon(active: boolean): DivIcon {
      return L.divIcon({
        className: active ? "pin pin--active" : "pin",
        iconSize: [18, 18],
        iconAnchor: [9, 18],
        popupAnchor: [0, -18],
        html: `<span class="pin-dot"></span>`,
      });
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
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 12px;
  height: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.map-el {
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.map-el >>> .pin,
.map-el ::v-deep .pin {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3f51b5;
  box-shadow: 0 0 0 2px #fff, 0 1px 6px rgba(0, 0, 0, 0.3);
  transform: translateY(-6px);
}
.map-el >>> .pin--active,
.map-el ::v-deep .pin--active {
  background: #e53935;
  box-shadow: 0 0 0 2px #fff, 0 2px 10px rgba(0, 0, 0, 0.4);
}
.map-el >>> .pin-dot,
.map-el ::v-deep .pin-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  background: #fff;
  border-radius: 50%;
}
</style>
