<script setup>
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'vue-chartjs';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title, ChartDataLabels);

defineProps({
  data: Object,
  options: Object
});
</script>

<template>
  <Bar :data="data" :options="options" :height="235" />
</template>
