<script setup>
import { ref, watch, computed } from 'vue';
import { convertirYYYYMMDDaISO, convertirFechaISOaYYYYMMDD } from '@/helpers/dates';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();

// Emit para cerrar modal y actualizar datos
const emit = defineEmits(['closeModalUpdate', 'updateData']);

// Referencias para campos editables
const idDocumento = ref('');
const nombreDocumento = ref('');
const fechaDocumento = ref('');
const notasDocumento = ref('');
const idTrabajador = ref('');
const estadoDocumento = ref('');

// Computed para verificar si el documento está finalizado
const isFinalizado = computed(() => {
  return estadoDocumento.value?.toLowerCase() === 'finalizado';
});

// Computed para verificar si el documento está anulado
const isAnulado = computed(() => {
  return estadoDocumento.value?.toLowerCase() === 'anulado';
});

// Computed para verificar si el documento está bloqueado (finalizado o anulado)
const isBloqueado = computed(() => {
  return isFinalizado.value || isAnulado.value;
});

// Inicialización de datos con valores precargados
watch(
  () => documentos.currentDocument,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      idDocumento.value = newData._id || '';
      nombreDocumento.value = newData.nombreDocumento || '';
      fechaDocumento.value = convertirFechaISOaYYYYMMDD(newData.fechaDocumento) || '';
      notasDocumento.value = newData.notasDocumento || '';
      idTrabajador.value = newData.idTrabajador || '';
      estadoDocumento.value = newData.estado || '';
    }
  },
  { immediate: true }
);

// Función para manejar el envío del formulario
const handleSubmit = async () => {
  // Prevenir edición si el documento está bloqueado (finalizado o anulado)
  if (isBloqueado.value) {
    return;
  }

  const fechaISO = convertirYYYYMMDDaISO(fechaDocumento.value);

  const updatedData = {
    _id: idDocumento.value,
    nombreDocumento: nombreDocumento.value,
    fechaDocumento: fechaISO,
    notasDocumento: notasDocumento.value,
    idTrabajador: idTrabajador.value
  };

  await documentos.updateDocument(
    'documentoExterno',
    trabajadores.currentTrabajadorId,
    updatedData._id,
    updatedData
  );

  emit('updateData');
  closeModal(); 
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  emit('closeModalUpdate');
};
</script>

<template>
  <div class="modal fixed top-0 left-0 z-10 p-8 h-screen w-full grid place-items-center">
    <!-- Fondo oscuro transparente -->
    <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="closeModal">
    </div>
    <Transition appear name="fade">
      <!-- Modal centrado con desplazamiento interno -->
      <div
        class="modal-inner relative bg-white text-gray-900 w-full sm:w-4/5 md:w-3/5 xl:w-2/5 2xl:w-1/3 p-10 rounded-lg shadow-md shadow-slate-900 max-h-[90vh] overflow-y-auto">
        <!-- Botón para cerrar el modal -->
        <div
          class="modal-close absolute h-16 w-16 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer"
          @click="closeModal">
          &times;
        </div>

        <div class="flex items-center justify-between mb-3">
          <h1 class="text-3xl">{{ isBloqueado ? 'Datos del Documento' : 'Editar Documento' }}</h1>
          <span v-if="isFinalizado" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <i class="fas fa-check-circle mr-2"></i>
            Finalizado
          </span>
          <span v-if="isAnulado" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <i class="fas fa-times-circle mr-2"></i>
            Anulado
          </span>
        </div>
        <hr class="mt-2 mb-3">

        <FormKit type="form" :actions="false" @submit="handleSubmit">
          <FormKit 
            type="text" 
            label="Nombre del Documento" 
            name="nombreDocumento" 
            v-model="nombreDocumento" 
            :disabled="isBloqueado"
            :validation="isBloqueado ? '' : 'required'"
            :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit 
            type="date" 
            label="Fecha de emisión del documento" 
            name="fechaDocumento" 
            v-model="fechaDocumento" 
            :disabled="isBloqueado"
            :validation="isBloqueado ? '' : 'required'"
            :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit 
            type="text" 
            label="Agregar notas (opcional)" 
            name="notasDocumento" 
            v-model="notasDocumento"
            :disabled="isBloqueado" />

          <hr class="my-3">
          <FormKit v-if="!isBloqueado" type="submit">
            <span>Guardar</span>
          </FormKit>

          <div v-if="isBloqueado" class="text-xs md:text-sm mt-6 mb-4 font-medium flex items-center justify-center gap-2"
               :class="isAnulado ? 'text-rose-600' : 'text-amber-600'">
            <i class="fas fa-lock"></i>
            <span v-if="isAnulado">Documento anulado - Edición bloqueada</span>
            <span v-else>Documento finalizado - Edición bloqueada</span>
          </div>

          <button
            class="text-xl mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1"
            @click="closeModal">
            Cerrar
          </button>
        </FormKit>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}

.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: all 500ms ease-out;
}

.fade-slow-leave-active {
  transition-delay: 250ms;
}
</style>