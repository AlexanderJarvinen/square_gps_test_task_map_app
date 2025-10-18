<template>
  <div class="marker-list">
    <div class="list-header px-4 py-3 text-subtitle-1 font-weight-medium">
      Маркеры:
    </div>
    <v-divider />

    <v-list two-line dense class="py-0">
      <v-list-item
        v-for="m in markers"
        :key="m.id"
        :input-value="m.id === selectedId"
        @click="$emit('select', m.id)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ m.title }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ m.lat.toFixed(6) }}, {{ m.lng.toFixed(6) }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MarkerList",
  props: {
    markers: { type: Array, required: true },
    selectedId: { type: String, default: null },
  },
});
</script>

<style scoped>
.marker-list {
  height: 100%;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  overflow: auto;
}
.list-header {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
