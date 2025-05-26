<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Solo se registran los módulos que realmente usarás
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels)

defineProps({
  data: Object,
  options: Object
})
</script>

<template>
  <Bar :data="data" :options="options" :height="147" />
</template>
