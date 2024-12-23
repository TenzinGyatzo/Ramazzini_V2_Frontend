<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';
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
const tipoDocumento = ref('');
const idTrabajador = ref('');

// Inicialización de datos con valores precargados
watch(
  () => documentos.currentDocument,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      idDocumento.value = newData._id || '';
      nombreDocumento.value = newData.nombreDocumento || '';
      fechaDocumento.value = convertirFechaISOaYYYYMMDD(newData.fechaDocumento) || '';
      notasDocumento.value = newData.notasDocumento || '';
      tipoDocumento.value = newData.tipoDocumento || '';
      idTrabajador.value = newData.idTrabajador || '';
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
  const fechaISO = convertirYYYYMMDDaISO(fechaDocumento.value);

  const updatedData = {
    _id: idDocumento.value,
    nombreDocumento: nombreDocumento.value,
    fechaDocumento: fechaISO,
    notasDocumento: notasDocumento.value,
    tipoDocumento: tipoDocumento.value,
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