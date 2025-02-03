<script setup lang="ts">
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import SimpleLayout from './layouts/SimpleLayout.vue';

const route = useRoute();
</script>

<template>
  <component :is="route.meta.hideSidebar ? SimpleLayout : MainLayout" />
</template>

<style>
body {
  font-family: 'kanit', sans-serif;
}
</style>
