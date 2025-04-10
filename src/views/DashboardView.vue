<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { clasificarPorEdadYSexo, ordenarPorGrupoEtario } from '@/helpers/dashboardDataProcessor';

const route = useRoute();
const empresasStore = useEmpresasStore();
const centrosTrabajoStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const centrosTrabajo = ref([]);
const centroSeleccionado = ref('Todos')
const sexosYFechasNacimientoActivos = ref([]);
const tablaGruposEtarios = ref([]);

const cargarDatos = async (empresaId) => {
  if (!empresaId) return;

  // 1. Empresa
  await empresasStore.fetchEmpresaById(empresaId);

  // 2. Centros
  centrosTrabajo.value = await centrosTrabajoStore.fetchCentrosTrabajo(empresaId);

  // 3. Info de Trabajadores para gráficos de grupos etarios
  sexosYFechasNacimientoActivos.value = await Promise.all(
    centrosTrabajo.value.map((centro) =>
      trabajadoresStore.fetchSexosYFechasNacimientoActivos(empresaId, centro._id)
    )
  );

  // Logs
  console.log('Empresa data fetched:', empresasStore.currentEmpresa);
  console.log('Centros de trabajo data fetched:', centrosTrabajo.value);
  console.log('Datos de sexos y fechas de nacimiento activos:', sexosYFechasNacimientoActivos.value);
};

// Llama la función al montar y si cambia el ID
watch(() => route.params.idEmpresa, cargarDatos, { immediate: true });

watch(sexosYFechasNacimientoActivos, (nuevoValor) => {
  if (nuevoValor.length) {
    const clasificados = clasificarPorEdadYSexo(nuevoValor);
    tablaGruposEtarios.value = ordenarPorGrupoEtario(clasificados);
  }
});

const centrosTrabajoOptions = computed(() => [
  'Todos',
  ...centrosTrabajo.value.map((centro) => centro.nombreCentro),
]);

const tablaGruposEtariosFiltrada = computed(() => {
  if (!sexosYFechasNacimientoActivos.value.length) return [];

  // Si se selecciona "Todos", usar toda la data
  if (centroSeleccionado.value === 'Todos') {
    const resultado = clasificarPorEdadYSexo(sexosYFechasNacimientoActivos.value);
    return ordenarPorGrupoEtario(resultado);
  }

  // Si se selecciona un centro específico
  const index = centrosTrabajo.value.findIndex(
    (centro) => centro.nombreCentro === centroSeleccionado.value
  );

  if (index === -1) return [];

  const resultado = clasificarPorEdadYSexo([sexosYFechasNacimientoActivos.value[index]]);
  return ordenarPorGrupoEtario(resultado);
});
</script>


<template>
  <div class="px-6 py-8 max-w-7xl mx-auto">
    <div v-if="!empresasStore.currentEmpresa" class="text-center py-8">
      <p class="text-gray-600 text-lg">Loading empresa data...</p>
    </div>

    <div v-else>
      <!-- Header con logo a la izquierda y datos a la derecha -->
      <div class="flex items-center gap-6 mb-4">
        <img
          v-if="empresasStore.currentEmpresa.logotipoEmpresa?.data"
          :src="'/uploads/logos/' + empresasStore.currentEmpresa.logotipoEmpresa.data + '?t=' + empresasStore.currentEmpresa.updatedAt"
          :alt="'Logo de ' + empresasStore.currentEmpresa.nombreComercial"
          class="w-24 h-24 object-contain rounded"
        />
        <div v-else class="w-1/4 h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
            <i class="fas fa-camera text-4xl mb-2"></i> <!-- Icono de FontAwesome -->
            <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ empresasStore.currentEmpresa.nombreComercial }}</h1>
          <h2 class="text-xl text-gray-600 mt-1">{{ empresasStore.currentEmpresa.razonSocial }}</h2>
        </div>

        <div class="mb-4 ml-auto">
          <label class="block text-sm font-medium text-gray-700">Centro de trabajo</label>
          <select
            v-model="centroSeleccionado"
            class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white transition duration-150 ease-in-out mt-1"
          >
            <option v-for="nombre in centrosTrabajoOptions" :key="nombre" :value="nombre">{{ nombre }}</option>
          </select>
        </div>

      </div>


      <!-- Grid de detalles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div class="bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Grupos Etarios</h3>
          <div class="overflow-x-auto mt-4">
            <table class="min-w-full text-sm border border-gray-300 rounded">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="py-2 px-4 text-left">Grupo Etario</th>
                  <th class="py-2 px-4 text-center">Hombres</th>
                  <th class="py-2 px-4 text-center">Mujeres</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="[grupo, datos] in tablaGruposEtariosFiltrada"
                  :key="grupo"
                  class="border-t hover:bg-gray-50 transition"
                >
                  <td class="py-1 px-4 font-medium text-gray-700">{{ grupo }}</td>
                  <td class="py-1 px-4 text-center text-blue-700">{{ datos.Masculino }}</td>
                  <td class="py-1 px-4 text-center text-pink-700">{{ datos.Femenino }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Índice de Masa Corporal</h3>

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
