<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Sidebar from './components/sidebar/Sidebar.vue';
import { useSidebarStore } from './stores/sidebar';

const sidebar = useSidebarStore();
</script>

<template>
  <Sidebar />
  <div :style="{ 'margin-left': sidebar.sidebarWidthCollapsed}">
    <RouterView />
  </div>
</template>

<style>
body {
  font-family: 'kanit', sans-serif;
}
</style>
