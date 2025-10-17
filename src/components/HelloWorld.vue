<template>
  <v-container class="py-6">
    <v-card elevation="2" class="pa-6">
      <v-card-title class="text-h5 font-weight-medium mb-4">
        О задании
      </v-card-title>

      <v-card-text>
        <p>
          Это тестовое задание для SquareGPS. Необходимо с помощью Vue.js, Vuex,
          Vue Router и Vuetify создать приложение с двумя разделами: «О задании»
          и «Карта».
        </p>
        <p>
          В разделе «Карта» реализовать добавление, отображение и сохранение
          маркеров на карте, получение адреса через API геокодирования и
          хранение данных в localStorage.
        </p>
        <p>
          Также требуется предусмотреть адаптивную верстку, локализацию и
          написать один тест с Jest.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "HelloWorld",

  data: () => ({
    //
  }),
});
</script>
