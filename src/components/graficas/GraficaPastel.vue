<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

defineProps({
  data: Object,
  options: Object
})
</script>

<template>
  <div class="relative h-full flex flex-col items-center justify-center">
    <div class="w-52 h-52 md:w-52 md:h-52 lg:w-56 lg:h-56 xl:w-60 xl:h-60 2xl:w-64 2xl:h-64 relative z-10">
      <Pie :data="data" :options="options" />
    </div>
  </div>
</template>

