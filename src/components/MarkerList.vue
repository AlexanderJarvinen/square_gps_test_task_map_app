<template>
  <v-card flat class="marker-list">
    <v-toolbar flat dense class="list-header">
      <v-toolbar-title>{{ $t("markers.title") }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn small color="error" text @click="onClearAll">
        {{ $t("markers.deleteAll") }}
      </v-btn>
    </v-toolbar>
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

        <v-list-item-action class="row-actions">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click.stop="onRemove(m.id)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("markers.deleteOne") }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MarkerList",
  props: {
    markers: { type: Array, required: true },
    selectedId: { type: String, default: null },
  },
  methods: {
    onClearAll() {
      if (confirm(this.$t("markers.confirm.deleteAll") as string)) {
        this.$emit("clear-all");
      }
    },
    onRemove(id: string) {
      if (confirm(this.$t("markers.confirm.deleteOne") as string)) {
        this.$emit("remove", id);
      }
    },
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
