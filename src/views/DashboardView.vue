<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';

const route = useRoute();
const empresasStore = useEmpresasStore();
const centrosTrabajoStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const centrosTrabajo = ref([]);
const trabajadores = ref([]);

const cargarDatos = async (empresaId) => {
  if (!empresaId) return;

  // 1. Empresa
  await empresasStore.fetchEmpresaById(empresaId);

  // 2. Centros
  centrosTrabajo.value = await centrosTrabajoStore.fetchCentrosTrabajo(empresaId);

  // 3. Trabajadores
  trabajadores.value = await Promise.all(
    centrosTrabajo.value.map((centro) =>
      trabajadoresStore.fetchTrabajadores(empresaId, centro._id)
    )
  );

  // Logs
  console.log('Empresa data fetched:', empresasStore.currentEmpresa);
  console.log('Centros de trabajo data fetched:', centrosTrabajo.value);
  console.log('Trabajadores data fetched:', trabajadores.value);
};

// Llama la función al montar y si cambia el ID
watch(() => route.params.id, cargarDatos, { immediate: true });
</script>


<template>
  <div class="px-6 py-8 max-w-7xl mx-auto">
    <div v-if="!empresasStore.currentEmpresa" class="text-center py-8">
      <p class="text-gray-600 text-lg">Loading empresa data...</p>
    </div>

    <div v-else>
      <!-- Header con logo a la izquierda y datos a la derecha -->
      <div class="flex items-center gap-6 mb-2">
        <img
          v-if="empresasStore.currentEmpresa.logotipoEmpresa?.data"
          :src="'/uploads/logos/' + empresasStore.currentEmpresa.logotipoEmpresa.data + '?t=' + empresasStore.currentEmpresa.updatedAt"
          :alt="'Logo de ' + empresasStore.currentEmpresa.nombreComercial"
          class="w-36 h-36 object-contain rounded"
        />
        <div v-else class="w-1/4 h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
            <i class="fas fa-camera text-4xl mb-2"></i> <!-- Icono de FontAwesome -->
            <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ empresasStore.currentEmpresa.nombreComercial }}</h1>
          <h2 class="text-xl text-gray-600 mt-1">{{ empresasStore.currentEmpresa.razonSocial }}</h2>
        </div>
      </div>

      <!-- Grid de detalles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Información General</h3>
          <p><strong>RFC:</strong> {{ empresasStore.currentEmpresa.RFC }}</p>
          <p><strong>Giro de Empresa:</strong> {{ empresasStore.currentEmpresa.giroDeEmpresa }}</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Estadísticas de Salud Ocupacional</h3>
          <p class="text-gray-600">Próximamente: Estadísticas y métricas de salud ocupacional</p>
          <p>{{ centrosTrabajo }}</p>
          <p>{{ trabajadores }}</p>
        </div>
      </div>

      <router-link
        :to="`/empresas/${empresasStore.currentEmpresa._id}/centros-trabajo`"
        class="inline-block text-gray-700 hover:text-green-500 font-medium"
      >
        ← Ir a Centros de Trabajo
      </router-link>
    </div>
  </div>
</template>
