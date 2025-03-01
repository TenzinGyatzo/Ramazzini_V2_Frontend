<script setup lang="ts">
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const emit = defineEmits(['closeModal', 'confirmDelete']);

// Definimos las propiedades genéricas
const props = defineProps({
  idRegistro: {
    type: String,
    required: true,
  },
  identificacion: {
    type: String,
    required: true,
  },
  tipoRegistro: {
    type: String,
    required: true,
  }
});


const handleDelete = () => {
  if (props.tipoRegistro === 'Trabajador') { // TODO: pasar el ID del centro de trabajo tambien
    emit('confirmDelete', empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, props.idRegistro); // Se requiere el ID de la empresa y del Centro de Trabajo
  } else if (props.tipoRegistro === 'Centro de Trabajo') {
    emit('confirmDelete', empresas.currentEmpresaId, props.idRegistro); // Se requiere el ID de la empresa
  } else {
    emit('confirmDelete', props.idRegistro); // Emitimos el ID del registro a eliminar
  }
  emit('closeModal');  // Cerramos el modal después de la confirmación
};
</script>

<template>
  <Transition name="fade">
    <div class="relative z-10">
      <!-- Background backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"></div>
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div @click="$emit('closeModal')" class="flex min-h-full justify-center p-8 text-center items-center">
          <Transition name="fade">
            <div
              class="modal-inner relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 class="text-lg font-semibold leading-6 text-gray-900">
                      CONFIRMAR ELIMINACIÓN
                    </h3>
                    <div class="mt-2">
                      <!-- Mensaje dinámico según el tipo de registro e identificación -->
                      <p class="text-md text-gray-500">
                        Parece que quieres eliminar el/la <strong>{{ tipoRegistro }}</strong> identificado(a) como
                        <strong>"{{ identificacion }}"</strong>. Esta acción no se puede deshacer. ¿Desea continuar?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="button" @click="handleDelete"
                  class="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-transform duration-300 transform hover:scale-105">
                  Eliminar
                </button>
                <button type="button" @click="$emit('closeModal')"
                  class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto transition-transform duration-300 transform hover:scale-105">
                  Cancelar
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>
