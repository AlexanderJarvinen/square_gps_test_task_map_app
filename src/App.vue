<template>
  <v-app>
    <v-app-bar
      app
      dark
      height="102"
      extension-height="48"
      color="rgba(0, 0, 0, 1)"
      content-class="header-overlay"
    >
      <v-toolbar-title class="align-self-start mt-7 no-truncate"
        >Тестовое задание для Square GPS</v-toolbar-title
      >

      <v-spacer />

      <div class="align-self-start mt-7">
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
      </div>
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
.no-truncate {
  white-space: normal;
  word-break: break-word;
}
</style>
