<template>
  <v-app>
    <v-app-bar class="app-bar-with-bg" app color="primary" height="200" dark>
      <v-toolbar-title>Тестовое задание для Square GPS</v-toolbar-title>

      <v-spacer />

      <v-menu offset-y left>
        <template v-slot:activator="{ on, attrs }">
          <!-- На мобиле иконка, на десктопе текст -->
          <v-btn text v-bind="attrs" v-on="on" class="ml-2">
            <span class="d-none d-sm-inline mr-1">Язык:</span>
            <strong class="text-uppercase">РУ</strong>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item @click="console.log('Русский')">
            <v-list-item-title>Русский</v-list-item-title>
          </v-list-item>
          <v-list-item @click="console.log('Английский')">
            <v-list-item-title>Английский</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-slot:extension>
        <v-tabs
          background-color="primary darken-1"
          dark
          show-arrows
          align-with-title
          slider-color="yellow"
        >
          <v-tab :to="{ name: 'about' }" exact> О Задании </v-tab>
          <v-tab :to="{ name: 'map' }" exact> Карта </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  }),
});
</script>
<style scoped>
.app-bar-with-bg {
  background-image: url("@/assets/forest_background.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* Если хочешь полупрозрачную затемняющую маску */
  position: relative;
}
.app-bar-with-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}
</style>
