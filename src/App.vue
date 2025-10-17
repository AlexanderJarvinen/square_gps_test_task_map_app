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
      <v-toolbar-title class="align-self-start mt-7 no-truncate">
        {{ $t("app.header.title") }}
      </v-toolbar-title>

      <v-spacer />

      <div class="align-self-start mt-7">
        <v-menu offset-y left style="z-index: 1100">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on" class="ml-2">
              <span class="d-none d-sm-inline mr-1">{{
                $t("app.lang.label")
              }}</span>
              <strong class="text-uppercase">{{ currentLangCode }}</strong>
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list dense class="lang-menu">
            <v-list-item @click="changeLocale('ru')">
              <v-list-item-title>{{
                $t("app.lang.option.ru")
              }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeLocale('en')">
              <v-list-item-title>{{
                $t("app.lang.option.en")
              }}</v-list-item-title>
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
          <v-tab :to="{ name: 'about' }" exact>
            {{ $t("app.tabs.about") }}
          </v-tab>
          <v-tab :to="{ name: 'map' }" exact>
            {{ $t("app.tabs.map") }}
          </v-tab>
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
import "@/assets/styles/main.scss";
import { setLocale } from "@/i18n";

export default Vue.extend({
  name: "App",
  computed: {
    currentLang(): "ru" | "en" {
      return (this.$i18n.locale as "ru" | "en") || "ru";
    },
    currentLangCode(): string {
      const code = this.$t(`app.lang.code.${this.currentLang}`) as string;
      return code || this.currentLang.toUpperCase();
    },
  },
  methods: {
    changeLocale(next: "ru" | "en") {
      if (next === this.currentLang) return;
      setLocale(next);
    },
  },
});
</script>

<style scoped>
.no-truncate {
  white-space: normal;
  word-break: break-word;
}

.lang-menu {
  position: relative;
  z-index: 1100 !important;
}
</style>
