<script setup lang="ts">
  import CentroTrabajoItem from '@/components/CentroTrabajoItem.vue';
  import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
  import { useEmpresasStore } from '@/stores/empresas';
  import { defineComponent, onMounted, type DefineComponent } from 'vue';
  import { useRoute } from 'vue-router';
  import GreenButton from '@/components/GreenButton.vue';

  const centroTrabajo = useCentrosTrabajoStore();
  const empresas = useEmpresasStore();
  const route = useRoute();

  onMounted(() => {
    const empresaId = String(route.params.idEmpresa);
    centroTrabajo.fetchCentrosTrabajo(empresaId);

    // Setear el ID de empresa actual en el store
    empresas.currentEmpresaId = empresaId;
    empresas.fetchEmpresaById(empresaId);
  })
</script>

<template>
  <div class="w-full p-5 space-y-5">
    <div class="flex flex-col items-center">
      <GreenButton text="Nuevo Centro de Trabajo +" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="centroTrabajo.loading"><h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1></div>
      <div v-else class="w-full bg-white rounded-lg p-2 shadow-lg items-center grid grid-cols-1 gap-8">
        <CentroTrabajoItem 
          v-for="centro in centroTrabajo.centrosTrabajo" 
          :key="centro._id"
          :centro="centro"
        />
      </div>
    </Transition>
  </div>
</template>