<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';
import ModalTrabajadores from '@/components/ModalTrabajadores.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';
import type { Trabajador } from '../interfaces/trabajador.interface';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const route = useRoute();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedTrabajadorId = ref<string | null>(null);
const selectedTrabajadorNombre = ref<string | null>(null);

const openModal = async (empresa: Empresa | null = null, centroTrabajo: CentroTrabajo | null = null, trabajador: Trabajador | null = null) => {
  showModal.value = false;
  trabajadores.loadingModal

  if(empresa && centroTrabajo && trabajador) {
    try {
      await trabajadores.fetchTrabajadorById(empresa._id, centroTrabajo._id, trabajador._id);
    } catch (error) {
      console.error('Error al cargar el trabajador:', error);
    }
  } else {
    trabajadores.resetCurrentTrabajador();
  }

  trabajadores.loadingModal = false;
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
}

const toggleDeleteModal = (idTrabajador: string | null = null, nombreTrabajador: string | null = null) => {
    showDeleteModal.value = !showDeleteModal.value;
    selectedTrabajadorId.value = idTrabajador;
    selectedTrabajadorNombre.value = nombreTrabajador;
}

const deleteTrabajadorById = async (empresaId: string, centroTrabajoId: string, trabajadorId: string) => {
    try {
    // Esperamos a que el trabjador sea eliminado
    await trabajadores.deleteTrabajadorById(empresaId, centroTrabajoId, trabajadorId);

    // Una vez eliminado, volvemos a hacer fetch para actualizar la lista
    await trabajadores.fetchTrabajadores(empresaId, centroTrabajoId);
  } catch (error) {
    console.error('Error al eliminar al trabajador', error);
  }
};

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
    <Transition appear name="fade">
      <ModalTrabajadores v-if="showModal" @closeModal="closeModal" />
    </Transition>

    <Transition appear name="fade">
      <ModalEliminar 
        v-if="showDeleteModal && selectedTrabajadorId && selectedTrabajadorNombre" 
        :idRegistro="selectedTrabajadorId"
        :identificacion="selectedTrabajadorNombre"
        tipoRegistro="Trabajador"
        @closeModal="toggleDeleteModal"
        @confirmDelete="deleteTrabajadorById" 
      />
    </Transition>
  
    <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-8">
      <GreenButton text="Nuevo Trabajador +" @click="openModal(null)"/>
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
        <DataTableDT 
          v-if="trabajadores.trabajadores.length > 0"
          class="table-auto z-1"
        >
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
                <button 
                  type="button" 
                  class="hover:scale-110 transition-all duration-100 ease-in-out transform"
                  @click="openModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, trabajador)"
                >
                  <i class="fa-regular fa-pen-to-square fa-lg" style="color: #696969"></i>
                </button>
                <button 
                  type="button" 
                  class="hover:scale-110 transition-all duration-100 ease-in-out transform"
                  @click="toggleDeleteModal(trabajador._id, trabajador.nombre)"
                >
                  <i class="fa-solid fa-trash-can fa-lg" style="color: #c43117"></i>
                </button>
              </div>
            </td>
          </tr>
        </DataTableDT>
        <h1 v-else
          class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700 mt-10"
        >Este centro de trabajo aún no tiene trabajadores registrados</h1>
      </div>
    </Transition>
</template>
