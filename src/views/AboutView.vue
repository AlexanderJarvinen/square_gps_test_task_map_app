<template>
  <about-page />
</template>

<script lang="ts">
import Vue from "vue";
import AboutPage from "../components/AboutPage.vue";

export default Vue.extend({
  name: "HomeView",

  components: {
    AboutPage,
  },
});
</script>
