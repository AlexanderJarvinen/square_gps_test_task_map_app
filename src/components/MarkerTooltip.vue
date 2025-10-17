<template>
  <div class="popup">
    <div class="popup-title">
      {{ marker.title || $t("tooltip.point") }}
    </div>

    <div v-if="marker.address" class="popup-addr">
      {{ marker.address }}
    </div>

    <div class="popup-coords">
      <small>
        {{ $t("tooltip.lat") }}: {{ lat.toFixed(5) }}, {{ $t("tooltip.lng") }}:
        {{ lng.toFixed(5) }}
      </small>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { MarkerDTO } from "@/types";

export default Vue.extend({
  name: "MarkerTooltip",
  props: {
    marker: { type: Object as () => MarkerDTO, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});
</script>

<style scoped>
.popup {
  font-family: "Roboto", sans-serif;
  max-width: 220px;
}
.popup-title {
  font-weight: 600;
  margin-bottom: 4px;
}
.popup-addr {
  opacity: 0.85;
  font-size: 12px;
  margin-bottom: 4px;
}
.popup-coords {
  font-size: 11px;
  color: #555;
}
</style>
