<template>
  <map-page />
</template>

<script lang="ts">
import Vue from "vue";
import MapPage from "../components/MapPage.vue";

export default Vue.extend({
  name: "MapView",

  components: {
    MapPage,
  },
});
</script>
