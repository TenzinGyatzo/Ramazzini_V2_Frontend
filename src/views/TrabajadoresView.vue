<script setup lang="ts">
import { onMounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useRoute, useRouter } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';

const trabajadores = useTrabajadoresStore();
const centrosTrabajo = useCentrosTrabajoStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  trabajadores.fetchTrabajadores(empresaId, centroTrabajoId);

  // Setear el ID del centro de trabajo actual en el store
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
});
</script>

<template>  
    <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-8">
      <GreenButton text="Nuevo Trabajador +" />
      <GreenButton text="Carga Masiva" />
      <GreenButton text="Exportar a Excel" />
    </div>

    <Transition appear mode="out-in" name="slide-up">
      <div v-if="trabajadores.loading">
        <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">
          Cargando...
        </h1>
      </div>
      <div v-else>
        <!-- Usar el componente DataTableDT -->
        <DataTableDT class="table-auto w-full">
          <tr v-for="(trabajador, index) in trabajadores.trabajadores" :key="trabajador._id" class="hover:bg-gray-200 cursor-pointer">
            <td>{{ index + 1 }}</td>
            <td>{{ trabajador.nombre }}</td>
            <td>{{ convertirFechaISOaDDMMYYYY(trabajador.createdAt) }}</td>
            <td>{{ calcularEdad(trabajador.fechaNacimiento)}} años</td>
            <td>{{ trabajador.sexo }}</td>
            <td>{{ trabajador.escolaridad }}</td>
            <td>{{ trabajador.puesto }}</td>
            <td>{{ calcularAntiguedad(trabajador.fechaIngreso) }}</td>
            <td>{{ trabajador.telefono ? trabajador.telefono : '-' }}</td>
            <td>{{ trabajador.estadoCivil }}</td>
            <td>{{ trabajador.hijos }}</td>
            <td>
              <button 
                type="button" 
                class="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 text-white rounded-lg px-2 py-1 transition-all duration-300 ease-in-out transform"
                @click="router.push({ name: 'expediente-medico', params: { idEmpresa: trabajador._id, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })"
              >
                Expediente
              </button>
            </td>
            <td>
              <div class="flex gap-1">
                <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                  <i class="fa-regular fa-pen-to-square fa-lg" style="color: #696969"></i>
                </button>
                <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                  <i class="fa-solid fa-trash-can fa-lg" style="color: #c43117"></i>
                </button>
              </div>
            </td>
          </tr>
        </DataTableDT>
      </div>
    </Transition>
</template>
