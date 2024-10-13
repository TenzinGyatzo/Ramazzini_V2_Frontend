<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const route = useRoute();
const router = useRouter();

watch(
    () => route.params, // Observamos los parámetros idEmpresa e idCentroTrabajo
    (newParams) => {
      const { idEmpresa, idCentroTrabajo } = newParams;
      if (idEmpresa && idCentroTrabajo) {
        // Cuando ambos parámetros están definidos, realizamos las llamadas necesarias
        empresas.fetchEmpresaById(String(idEmpresa)); // Obtenemos los detalles de la empresa
        centrosTrabajo.fetchCentroTrabajoById(String(idEmpresa), String(idCentroTrabajo)); // Obtenemos los detalles del centro de trabajo
        trabajadores.fetchTrabajadores(String(idEmpresa), String(idCentroTrabajo)); // Obtenemos los trabajadores del centro de trabajo
        empresas.currentEmpresaId = String(idEmpresa); // Seteamos el id de la empresa actual en el store
        centrosTrabajo.currentCentroTrabajoId = String(idCentroTrabajo); // Seteamos el id del centro de trabajo actual en el store
      }
    },
    { immediate: true } // Esto asegura que el watch se ejecute inmediatamente con el valor actual
  );

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
        <DataTableDT class="table-auto">
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
                @click="router.push({ name: 'expediente-medico', params: { idEmpresa: empresas.currentEmpresaId, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })"
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
