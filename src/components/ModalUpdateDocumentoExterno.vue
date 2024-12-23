<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { convertirYYYYMMDDaISO } from '@/helpers/dates';
import { useDocumentosStore } from '@/stores/documentos';

const documentos = useDocumentosStore();

// Emit para cerrar modal y actualizar datos
const emit = defineEmits(['closeModalUpdate', 'updateData']);

// Referencias para campos editables
const nombreDocumento = ref('');
const fechaDocumento = ref('');
const notasDocumento = ref('');
const tipoDocumento = ref('');

// Inicialización de datos con valores precargados
watch(
  () => documentos.currentDocument,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      nombreDocumento.value = newData.nombreDocumento || '';
      tipoDocumento.value = newData.tipoDocumento || '';
      fechaDocumento.value = format(newData.fechaDocumento, 'yyyy-MM-dd') || '';
      notasDocumento.value = newData.notasDocumento || '';
    }
  },
  { immediate: true }
);

const tiposDocumentos = [
  "Prueba(s) de laboratorio",
  "Estudio de Gabinete",
  "Imagenología",
  "Fotografía de prueba rápida",
  "Identificación",
  "Receta médica",
  "Formato específico",
  "Otro",
];

// Función para manejar el envío del formulario
const handleSubmit = async () => {

  fechaDocumento.value = convertirYYYYMMDDaISO(fechaDocumento.value);

  const updatedData = {
    nombreDocumento: nombreDocumento.value,
    fechaDocumento: fechaDocumento.value,
    notasDocumento: notasDocumento.value,
    tipoDocumento: tipoDocumento.value,
  };

  // Log para verificar datos antes de enviar
  console.log('Datos enviados:', updatedData);

  // Lógica para actualizar el documento en el store
  // Llamar a la función en el store o servicio
  // Ejemplo:
  // await documentos.updateDocument(currentTrabajador._id, updatedData);

  closeModal();
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  emit('closeModalUpdate');
  emit('updateData');
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

        <h1 class="text-3xl">Editar Documento</h1>
        <hr class="mt-2 mb-3">

        <FormKit type="form" :actions="false" @submit="handleSubmit">
          <FormKit type="select" label="Tipo de Documento" name="tipoDocumento" v-model="tipoDocumento"
            placeholder="Seleccione un tipo de documento" :options="tiposDocumentos" validation="required"
            :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit type="text" label="Nombre del Documento" name="nombreDocumento" v-model="nombreDocumento"
            validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit type="date" label="Fecha de emisión del documento" name="fechaDocumento" v-model="fechaDocumento"
            validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit type="text" label="Agregar notas (opcional)" name="notasDocumento" v-model="notasDocumento" />

          <hr class="my-3">
          <FormKit type="submit">
            <span>Guardar Cambios</span>
          </FormKit>
        </FormKit>
        <button
          class="text-xl mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1"
          @click="closeModal">
          Cerrar
        </button>
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