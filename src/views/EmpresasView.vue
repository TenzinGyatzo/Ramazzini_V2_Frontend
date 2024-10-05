<script setup lang="ts">
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import { onMounted } from 'vue';

const empresas = useEmpresasStore();

onMounted(() => {
  empresas.fetchEmpresas();
})
</script>

<template>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col items-center">
      <button
        type="button"
        class="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        Nueva Empresa +
      </button>
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="empresas.loading"><h1 class="text-3xl sm:text-4xl md:text-5xl py-20 text-center font-semibold text-gray-700">Cargando...</h1></div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <EmpresaItem 
          v-for="empresa in empresas.empresas" 
          :key="empresa._id"
          :empresa="empresa"
        />
      </div>
    </Transition>
  </div>
</template>
