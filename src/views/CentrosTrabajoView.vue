<script setup lang="ts">
import CentroTrabajoItem from '@/components/CentroTrabajoItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import GreenButton from '@/components/GreenButton.vue';
import ModalCentros from '@/components/ModalCentros.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const route = useRoute();

const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedCentroTrabajoId = ref<string | null>(null);
const selectedCentroTrabajoNombre = ref<string | null>(null);

const openModal = async (empresa: Empresa | null = null, centroTrabajo: CentroTrabajo | null = null) => {
  showModal.value = false;
  centrosTrabajo.loadingModal;

  if (empresa && centroTrabajo) {
    try {
      await centrosTrabajo.fetchCentroTrabajoById(empresa._id, centroTrabajo._id);
    } catch (error) {
      console.error('Error al cargar el centro de trabajo:', error);
    }
  } else {
    centrosTrabajo.resetCurrentCentroTrabajo();
  }

  centrosTrabajo.loadingModal = false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const toggleDeleteModal = (idCentroTrabajo: string | null = null, nombreCentro: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedCentroTrabajoId.value = idCentroTrabajo;
  selectedCentroTrabajoNombre.value = nombreCentro;
};

const deleteCentroTrabajoById = async (empresaId: string, centroTrabajoId: string) => {
  try {
    // Esperamos a que el centro de trabajo sea eliminado
    await centrosTrabajo.deleteCentroTrabajoById(empresaId, centroTrabajoId);

    toast.open({ message: 'Centro de trabajo eliminado con éxito' });

    // Una vez eliminada, volvemos a hacer fetch para actualizar la lista
    await centrosTrabajo.fetchCentrosTrabajo(String(route.params.idEmpresa));
  } catch (error) {
    console.error('Error al eliminar el centro de trabajo', error);
    toast.open({ message: 'Hubo un error, por favor intente nuevamente.', type: 'error' });
  }
};

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  centrosTrabajo.fetchCentrosTrabajo(empresaId);

  // Setear el ID de empresa actual en el store
  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
});
</script>

<template>
  <Transition appear name="fade">
    <ModalCentros v-if="showModal" @closeModal="closeModal" />
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedCentroTrabajoId && selectedCentroTrabajoNombre"
      :idRegistro="selectedCentroTrabajoId" :identificacion="selectedCentroTrabajoNombre"
      tipoRegistro="Centro de Trabajo" @closeModal="toggleDeleteModal" @confirmDelete="deleteCentroTrabajoById" />
  </Transition>

  <div class="w-full p-5 space-y-5">
    <div class="flex flex-col items-center">
      <GreenButton text="Nuevo Centro +" @click="openModal(null)" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
<!--  <div v-if="centrosTrabajo.loading">
        <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div> -->
      <div>
        <CentroTrabajoItem v-if="empresas.currentEmpresa && centrosTrabajo.centrosTrabajo.length > 0"
          v-for="centro in centrosTrabajo.centrosTrabajo" :key="centro._id" :centro="centro"
          :empresa="empresas.currentEmpresa" class="mb-5" @editarCentro="openModal"
          @eliminarCentro="toggleDeleteModal" />
        <h1 v-else
          class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700">Esta
          empresa aún no tiene centros de trabajo registrados</h1>
      </div>
    </Transition>
  </div>
</template>