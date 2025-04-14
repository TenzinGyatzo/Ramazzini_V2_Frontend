<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

defineProps({
  data: Object,
  options: Object,
  centro: String,
  cantidad: Number,
  porcentaje: Number
})
</script>

<template>
  <div class="relative h-full flex flex-col items-center justify-center">
    <div class="w-52 h-52 md:w-52 md:h-52 lg:w-56 lg:h-56 xl:w-60 xl:h-60 2xl:w-64 2xl:h-64">
      <Doughnut :data="data" :options="options" />
    </div>

    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <p class="text-6xl font-medium text-gray-700">{{ cantidad }}</p>
      <p class="text-base text-gray-500">({{ porcentaje }}%)</p>
    </div>
  </div>
</template>
