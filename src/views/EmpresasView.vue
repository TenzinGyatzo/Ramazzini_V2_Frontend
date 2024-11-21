<script setup lang="ts">
import { onMounted, ref } from 'vue';
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import GreenButton from '@/components/GreenButton.vue';
import ModalEmpresas from '@/components/ModalEmpresas.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import type { Empresa } from '@/interfaces/empresa.interface';

const empresas = useEmpresasStore();

const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedEmpresaId = ref<string | null>(null);
const selectedEmpresaNombre = ref<string | null>(null);

const openModal = async (empresa: Empresa | null = null) => {
  showModal.value = false;  // Cerramos el modal antes de cargar
  empresas.loadingModal = true;  // Iniciamos la carga del modal

  if (empresa) {
    try {
      await empresas.fetchEmpresaById(empresa._id);  // Esperamos a que se cargue la empresa
    } catch (error) {
      console.error('Error al cargar la empresa:', error);
    }
  } else {
    empresas.resetCurrentEmpresa();  // Resetear si es una nueva empresa
  }

  empresas.loadingModal = false;  // Terminamos la carga del modal
  showModal.value = true;  // Abrimos el modal
};

const closeModal = () => {
  showModal.value = false;
};

const toggleDeleteModal = (idEmpresa: string | null = null, nombreComercial: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedEmpresaId.value = idEmpresa;
  selectedEmpresaNombre.value = nombreComercial;
};

const deleteEmpresaById = async (id: string) => {
  try {
    // Esperamos a que la empresa sea eliminada
    await empresas.deleteEmpresaById(id);

    // Una vez eliminada, volvemos a hacer fetch para actualizar la lista
    await empresas.fetchEmpresas();
  } catch (error) {
    console.error('Error al eliminar la empresa:', error);
  }
};

onMounted(() => {
  empresas.fetchEmpresas();
});
</script>

<template>
  <Transition appear name="fade">
    <ModalEmpresas v-if="showModal" @closeModal="closeModal" />
  </Transition>
  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedEmpresaId && selectedEmpresaNombre" :idRegistro="selectedEmpresaId"
      :identificacion="selectedEmpresaNombre" tipoRegistro="Empresa" @closeModal="toggleDeleteModal"
      @confirmDelete="deleteEmpresaById" />
  </Transition>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col items-center">
      <GreenButton text="Nueva Empresa +" @click="openModal(null)" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="empresas.loading">
        <h1 class="text-3xl sm:text-4xl md:text-5xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <EmpresaItem v-for="empresa in empresas.empresas" :key="empresa._id" :empresa="empresa"
          @editarEmpresa="openModal" @eliminarEmpresa="toggleDeleteModal" />
      </div>
    </Transition>
  </div>
</template>
