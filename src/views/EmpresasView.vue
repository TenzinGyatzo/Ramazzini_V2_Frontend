<script setup lang="ts">
import { onUnmounted, ref, watch, inject } from 'vue';
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import GreenButton from '@/components/GreenButton.vue';
import ModalEmpresas from '@/components/ModalEmpresas.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const proveedorSalud = useProveedorSaludStore();

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

    toast.open({ message: 'Empresa eliminada con éxito' });

    // Una vez eliminada, volvemos a hacer fetch para actualizar la lista
    await empresas.fetchEmpresas(proveedorSalud.proveedorSalud!._id);
  } catch (error) {
    console.log('Error al eliminar la empresa:', error);
    toast.open({ message: 'Error al eliminar la empresa, por favor intente nuevamente.', type: 'error' });
  }
};

watch(
    () => proveedorSalud.proveedorSalud,
    (nuevoProveedorSalud) => {
        if (nuevoProveedorSalud) {
          empresas.fetchEmpresas(proveedorSalud.proveedorSalud!._id);
        }
    },
    { immediate: true } // Ejecutar inmediatamente al montar el componente
);

onUnmounted(() => {
  if (proveedorSalud.proveedorSalud) {
    proveedorSalud.verificarPeriodoDePrueba(proveedorSalud.proveedorSalud!._id);  
  }
});
</script>

<template>
  <Transition appear name="fade">
    <ModalEmpresas v-if="showModal" @closeModal="closeModal"/>
  </Transition>
  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedEmpresaId && selectedEmpresaNombre" :idRegistro="selectedEmpresaId"
      :identificacion="selectedEmpresaNombre" tipoRegistro="Empresa" @closeModal="toggleDeleteModal"
      @confirmDelete="deleteEmpresaById" />
  </Transition>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col items-center">
      <GreenButton text="Nuevo Cliente +" @click="openModal(null)" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="empresas.loading">
        <h1 class="text-3xl sm:text-4xl md:text-5xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div>
      <div v-else>
        <!-- Si el array está vacío, mostramos el mensaje -->
        <div v-if="empresas.empresas.length === 0">
          <h2 class="text-2xl sm:text-3xl md:text-4xl py-10 text-center font-semibold text-gray-700">Aún no hay empresas de clientes registradas</h2>
        </div>
        <!-- Si hay empresas, mostramos los items -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <EmpresaItem v-for="empresa in empresas.empresas" :key="empresa._id" :empresa="empresa"
            @editarEmpresa="openModal" @eliminarEmpresa="toggleDeleteModal" />
        </div>
      </div>
    </Transition>
  </div>
</template>

