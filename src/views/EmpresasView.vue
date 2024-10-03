<script setup lang="ts">
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';

const empresas = useEmpresasStore();
</script>

<template>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col items-center">
      <button
        type="button"
        class="text-xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase  font-extrabold rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
      >
        Nueva Empresa +
      </button>
    </div>
    <div v-if="empresas.loading"><h1 class="text-4xl py-5 text-center">Cargando...</h1></div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <EmpresaItem 
        v-for="empresa in empresas.empresas" 
        :key="empresa._id"
        :empresa="empresa"
      />
    </div>
  </div>
</template>