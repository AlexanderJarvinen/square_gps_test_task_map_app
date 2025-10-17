<template>
  <v-container class="py-6">
    <h1 class="text-h5 font-weight-medium mb-6">
      {{ $t("about.title") }}
    </h1>

    <section class="text-body-1 about-text">
      <p v-html="$t('about.intro')"></p>

      <h2 class="text-h6 mt-6 mb-2">{{ $t("about.sectionAbout.title") }}</h2>
      <p>{{ $t("about.sectionAbout.text") }}</p>

      <h2 class="text-h6 mt-6 mb-2">{{ $t("about.sectionMap.title") }}</h2>
      <p>{{ $t("about.sectionMap.text") }}</p>

      <ol>
        <li>{{ $t("about.sectionMap.list.addMode") }}</li>
        <li>{{ $t("about.sectionMap.list.highlightOnMarkerClick") }}</li>
        <li>{{ $t("about.sectionMap.list.centerOnListClick") }}</li>
        <li>{{ $t("about.sectionMap.list.persistMarkers") }}</li>
        <li>{{ $t("about.sectionMap.list.showIdInUrl") }}</li>
      </ol>

      <h2 class="text-h6 mt-6 mb-2">{{ $t("about.extra.title") }}</h2>
      <ul>
        <li>{{ $t("about.extra.mobile") }}</li>
        <li>{{ $t("about.extra.i18n") }}</li>
        <li>{{ $t("about.extra.test") }}</li>
      </ul>

      <br />
      <p>
        <strong>{{ $t("about.reminder.lead") }}</strong>
        {{ $t("about.reminder.text") }}
      </p>
    </section>

    <v-img src="../assets/map_example.jpeg" aspect-ratio="1.7"></v-img>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AboutPage",
});
</script>
