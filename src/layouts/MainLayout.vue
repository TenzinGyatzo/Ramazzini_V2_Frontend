<script setup lang="ts">
import Sidebar from '../components/sidebar/Sidebar.vue';
import { useSidebarStore } from '@/stores/sidebar';
import { RouterView } from 'vue-router';

const sidebar = useSidebarStore();
</script>

<template>
  <Sidebar />
  <div :style="{ 'margin-left': sidebar.isSmallScreen ? sidebar.sidebarWidthCollapsed : sidebar.sidebarWidth }">
    <RouterView />
  </div>
</template>
