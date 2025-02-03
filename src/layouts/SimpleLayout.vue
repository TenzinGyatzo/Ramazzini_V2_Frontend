<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="h-screen grid grid-cols-1 lg:grid-cols-2">
    <!-- Mitad izquierda (blanca) -->
    <div class="bg-white p-8 flex items-center justify-center">
      <RouterView />
    </div>

    <!-- Mitad derecha (gradiente) - Oculto en pantallas pequeñas -->
    <div class="hidden lg:flex static-background p-8 items-center justify-center text-white">
      <h1 class="text-2xl font-bold">Contenido en el lado derecho</h1>
    </div>
  </div>
</template>

<style scoped>
.static-background {
  background-image: linear-gradient(120deg, #059669 40%, #6EE7B7 110%);
}
</style>
