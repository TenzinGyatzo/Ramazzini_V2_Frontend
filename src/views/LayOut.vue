<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';  
import { useEmpresasStore } from '@/stores/empresas';

const empresas = useEmpresasStore();

onMounted(() => {
  empresas.fetchEmpresas();
})

</script>

<template>
  <main class="flex flex-col items-center">
    <a href="/" class="w-1/2 sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-3 mb-5">
      <img 
        src="/public/img/logosRamazzini/RamazziniLogoNoBg.png" 
        alt="Ramazzini-Logo" 
      />
    </a>

    <RouterView />
  </main>
</template>