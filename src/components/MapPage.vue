<template>
  <v-container class="py-6">
    <v-card elevation="2" class="pa-6">
      <v-card-title class="text-h5 font-weight-medium mb-4">
        Карта
      </v-card-title>

      <v-card-text>
        <p>
          Ниже будет отображаться карта с маркерами и список добавленных точек.
        </p>
        <p>Нажмите кнопку «Добавить маркер», чтобы выбрать точку на карте.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MapPage",

  data: () => ({
    //
  }),
});
</script>
