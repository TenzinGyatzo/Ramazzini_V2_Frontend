<script lang="ts" setup>
import { RouterView, useRoute } from 'vue-router'

const route = useRoute();
</script>

<template>
  <main class="flex flex-col items-center">
    <a href="/" class="w-full sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-3 mb-5">
      <img 
        src="/img/logosRamazzini/RamazziniLogoNoBg.png" 
        alt="Ramazzini-Logo" 
      />
    </a>
    <div v-if="route.path === '/'">
      <h1 class="text-4xl py-5 text-center">Bienvenido a Ramazzini</h1>
      <p class="text-2xl py-2 text-center">Esta aplicación te permite crear y gestionar expedientes médicos de trabajadores.</p>
      <a href="/empresas" class="flex justify-center mt-10">
        <button
          class="text-4xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-lg px-8 py-6 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
        >
          VER EMPRESAS
        </button>
      </a>
    </div>
    <div v-else>
      <RouterView />
    </div>
  </main>
</template>