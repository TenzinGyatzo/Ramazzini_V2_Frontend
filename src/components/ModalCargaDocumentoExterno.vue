<script setup>
import { ref } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { format } from 'date-fns';
import { convertirYYYYMMDDaISO } from '@/helpers/dates';

const { currentEmpresa } = useEmpresasStore();
const { currentCentroTrabajo } = useCentrosTrabajoStore();
const { currentTrabajador } = useTrabajadoresStore();
const documentos = useDocumentosStore();

const fileExtension = ref('');
const today = ref(format(new Date(), 'yyyy-MM-dd'));

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

const emit = defineEmits(['closeDocumentoExternoModal', 'updateData']);

const updateFileExtension = (event) => {
  const file = event.target.files[0];
  if (file) {
    const extension = file.name.split(".").pop();
    fileExtension.value = `.${extension}`;
  } else {
    fileExtension.value = "";
    console.warn("No se seleccionó ningún archivo.");
  }
};

// Función para manejar el envío del formulario
const handleSubmit = async (data) => {

  // Convertir la fecha del campo fechaDocumento a formato ISO
  if (data.fechaDocumento) {
    data.fechaDocumento = convertirYYYYMMDDaISO(data.fechaDocumento);
  }

  // Asegurarse de que 'notasDocumento' sea una cadena vacía si está indefinida o null
  if (!data.notasDocumento) {
    data.notasDocumento = '';
  } else {
  }

  // Crear una instancia de FormData
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  // Verificar si el archivo está presente y agregarlo a FormData
  const fileInput = document.querySelector('input[name="file"]');
  if (fileInput && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  } else {
  }

  // Mostrar el contenido de FormData para depuración
  for (let pair of formData.entries()) {
  }

  try {
    // Llamar a la función en el store
    await documentos.uploadExternalDocument(currentTrabajador._id, formData);

    emit('updateData');

    closeModal();
  } catch (error) {
    console.error('Error al subir el documento:', error);
  }
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  emit('closeDocumentoExternoModal');
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


        <h1 class="text-3xl">Subir Documento</h1>
        <hr class="mt-2 mb-3">

        <FormKit type="form" :actions="false" incomplete-message="Por favor complete todos los campos"
          @submit="handleSubmit">
          <FormKit type="select" label="Tipo de Documento" name="tipoDocumento"
            placeholder="Seleccione un tipo de documento" :options="tiposDocumentos" validation="required"
            :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit type="text" label="Nombre del Documento" name="nombreDocumento" validation="required"
            :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <FormKit type="date" label="Fecha de emisión del documento" name="fechaDocumento" validation="required"
            :validation-messages="{ required: 'Este campo es obligatorio' }" v-model="today" />

          <FormKit type="text" label="Agregar notas (opcional)" name="notasDocumento" />

          <FormKit type="file" label="Seleccionar documento a subir (.pdf, .jpg, .jpeg, .png)" name="file"
            accept=".pdf, .jpg, .jpeg, .png" multiple="false" validation="required"
            :validation-messages="{ required: 'Este campo es obligatorio' }" @change="updateFileExtension" />

          <!-- Campos ocultos y botón de enviar -->
          <FormKit type="hidden" name="extension" v-model="fileExtension" />
          <FormKit type="hidden" name="rutaDocumento"
            :value="`expedientes-medicos/${currentEmpresa.nombreComercial}/${currentCentroTrabajo.nombreCentro}/${currentTrabajador.nombre}`" />
          <FormKit type="hidden" name="idTrabajador" :value="currentTrabajador._id" />
          <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" />
          <FormKit type="hidden" name="updatedBy" :value="'6650f38308ac3beedf5ac41b'" />

          <hr class="my-3">
          <FormKit type="submit">
            <span>Guardar</span>
          </FormKit>
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