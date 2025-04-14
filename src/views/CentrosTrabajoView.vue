<script setup lang="ts">
import CentroTrabajoItem from '@/components/CentroTrabajoItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { ref, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GreenButton from '@/components/GreenButton.vue';
import ModalCentros from '@/components/ModalCentros.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const route = useRoute();
const router = useRouter();

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

    centrosTrabajo.resetCurrentCentroTrabajo();
    
  } catch (error) {
    console.error('Error al eliminar el centro de trabajo', error);
    toast.open({ message: 'Hubo un error. Algunos documentos no se pudieron eliminar. Elimínalos directamente y vuelve a intentarlo', type: 'error' });
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
      <div>
        <div v-if="empresas.currentEmpresa && centrosTrabajo.centrosTrabajo.length > 0">
          <div v-for="centro in centrosTrabajo.centrosTrabajo" :key="centro._id">
          <CentroTrabajoItem :centro="centro"
          :empresa="empresas.currentEmpresa" class="mb-2" @editarCentro="openModal"
          @eliminarCentro="toggleDeleteModal" />
          </div>
          <button type="button" @click="router.push({ name: 'dashboard-empresa', params: { idEmpresa: empresas.currentEmpresa._id } })"
                class="block mx-auto text-sm w-1/8 mt-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 p-2 transition duration-300">
              <i class="fas fa-chart-line mr-2"></i> Ver estadísticas de la empresa
          </button>
        </div>
        <h1 v-else
          class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700">Esta
          empresa aún no tiene centros de trabajo registrados</h1>
      </div>
    </Transition>
  </div>
</template>