<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';
import ModalTrabajadores from '@/components/ModalTrabajadores.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import ModalCargaMasiva from '@/components/ModalCargaMasiva.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';
import type { Trabajador } from '../interfaces/trabajador.interface';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const route = useRoute();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const showImportModal = ref(false);
const showSubscriptionModal = ref(false);
const selectedTrabajadorId = ref<string | null>(null);
const selectedTrabajadorNombre = ref<string | null>(null);

const openModal = async (empresa: Empresa | null = null, centroTrabajo: CentroTrabajo | null = null, trabajador: Trabajador | null = null) => {
  showModal.value = false;
  trabajadores.loadingModal;

  if (empresa && centroTrabajo && trabajador) {
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
};

const closeModal = () => {
  showModal.value = false;
};

const toggleDeleteModal = (idTrabajador: string | null = null, nombreTrabajador: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedTrabajadorId.value = idTrabajador;
  selectedTrabajadorNombre.value = nombreTrabajador;
};

const deleteTrabajadorById = async (empresaId: string, centroTrabajoId: string, trabajadorId: string) => {
  try {
    // Esperamos a que el trabjador sea eliminado
    await trabajadores.deleteTrabajadorById(empresaId, centroTrabajoId, trabajadorId);

    toast.open({ message: 'Trabajador eliminado con éxito' });

    // Una vez eliminado, volvemos a hacer fetch para actualizar la lista
    await trabajadores.fetchTrabajadores(empresaId, centroTrabajoId);

    trabajadores.resetCurrentTrabajador();
    
  } catch (error) {
    console.log('Error al eliminar al trabajador', error);
    toast.open({ message:  'No se pudo eliminar el trabajador. Por favor, elimine primero sus documentos y vuelva a intentarlo', type: 'error' });
  }
};

const toggleImportModal = () => {
  showImportModal.value = !showImportModal.value;
};

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  // trabajadores.fetchTrabajadores(empresaId, centroTrabajoId);
  trabajadores.fetchTrabajadoresConHistoria(empresaId, centroTrabajoId);

  // Setear los ID actuales en el store
  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
});

const exportTrabajadores = async () => {
  try {
    const empresaId = String(route.params.idEmpresa);
    const centroTrabajoId = String(route.params.idCentroTrabajo);
    await trabajadores.exportTrabajadores(empresaId, centroTrabajoId);
  } catch (error) {
    console.error('Error al exportar los trabajadores', error);
  }
};


</script>

<template>
  <Transition appear name="fade">
    <ModalTrabajadores v-if="showModal" @closeModal="closeModal" @openSubscriptionModal="showSubscriptionModal = true" />
  </Transition>

  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" 
      @closeModal="showSubscriptionModal = false"/>
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedTrabajadorId && selectedTrabajadorNombre"
      :idRegistro="selectedTrabajadorId" :identificacion="selectedTrabajadorNombre" tipoRegistro="Trabajador"
      @closeModal="toggleDeleteModal" @confirmDelete="deleteTrabajadorById" />
  </Transition>

  <Transition appear name="fade">
    <ModalCargaMasiva v-if="showImportModal" @openSubscriptionModal="showSubscriptionModal = true" @closeModal="toggleImportModal" />
  </Transition>

  <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-8">
    <GreenButton text="Nuevo Trabajador +" @click="openModal(null)" />
    <GreenButton text="Carga Masiva" @click="toggleImportModal" />
    <GreenButton text="Exportar a Excel" @click="exportTrabajadores" />
  </div>

  <Transition appear mode="out-in" name="slide-up">
    <div v-if="trabajadores.loading">
      <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">
        Cargando...
      </h1>
    </div>
    <div v-else>
      <!-- Usar el componente DataTableDT -->
      <DataTableDT v-if="trabajadores.trabajadores.length > 0" class="table-auto z-1">
        <tr v-for="(trabajador, index) in trabajadores.trabajadores" :key="trabajador._id"
          class="hover:bg-gray-200 cursor-pointer">
          <td>{{ index + 1 }}</td>
          <td>{{ trabajador.nombre }}</td>
          <td>{{ convertirFechaISOaDDMMYYYY(trabajador.createdAt) }}</td>
          <td>{{ calcularEdad(trabajador.fechaNacimiento) }} años</td>
          <td>{{ trabajador.sexo }}</td>
          <td>{{ trabajador.escolaridad }}</td>
          <td>{{ trabajador.puesto }}</td>
          <td>{{ calcularAntiguedad(trabajador.fechaIngreso) }}</td>
          <td>{{ trabajador.telefono ? trabajador.telefono : '-' }}</td>
          <td>{{ trabajador.estadoCivil }}</td>
          <td>{{ trabajador.hijos }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.diabeticosPP === 'Si' ? 'Sí' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.alergicos === 'Si' ? 'Sí' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.hipertensivosPP === 'Si' ? 'Sí' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.accidenteLaboral === 'Si' ? 'Sí' : 'No') : '-' }}</td>
          <td>
            <button type="button"
              class="bg-emerald-600 text-white rounded-full px-2 py-1 transition-transform duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600"
              @click="router.push({ name: 'expediente-medico', params: { idEmpresa: empresas.currentEmpresaId, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })">
              Expediente
            </button>
          </td>
          <td>
            <div class="flex gap-1">
              <button type="button" class="p-2 px-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm"
                @click="openModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, trabajador)">
                <i class="fa-regular fa-pen-to-square fa-lg"></i>
              </button>
              <button type="button" class="p-2 px-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm"
                @click="toggleDeleteModal(trabajador._id, trabajador.nombre)">
                <i class="fa-solid fa-trash-can fa-lg" ></i>
              </button>
            </div>
          </td>
        </tr>
      </DataTableDT>
      <h1 v-else
        class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700 mt-10">
        Este centro de trabajo aún no tiene trabajadores registrados</h1>
    </div>
  </Transition>
</template>
