<script setup>
import { ref, watch, inject, onMounted } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

const toast = inject('toast');

const empresas = useEmpresasStore();
const proveedorSaludStore = useProveedorSaludStore();
const emit = defineEmits(['closeModal', 'openSubscriptionModal']);

// Propiedades reactivas para el logotipo
const logotipoPreview = ref(null);  // Para la vista previa de la imagen
const logotipoArchivo = ref(null);  // Para el archivo cargado

const user = ref(
    JSON.parse(localStorage.getItem('user')) || null // Recuperar usuario guardado o establecer null si no existe
);

watch(
    () => user.user,
    (user) => {
        if (user?.idProveedorSalud) {
            proveedorSaludStore.loadProveedorSalud(user.idProveedorSalud);
        }
        if (user?._id){
          medicoFirmanteStore.loadMedicoFirmante(user._id);
        }
    },
    { immediate: true } // Ejecutar inmediatamente si ya hay datos cargados
);

// Función que se ejecuta cuando el usuario selecciona un archivo
const handleFileChange = (event) => {
  const file = event?.target?.files?.[0]; // Verificamos si el archivo existe
  if (file && file instanceof File) {
    logotipoArchivo.value = file;  // Almacenamos el archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      logotipoPreview.value = e.target.result; // Guardar la URL de la imagen
    };
    reader.readAsDataURL(file);  // Leer el archivo como URL
  } else {
    logotipoPreview.value = null; // Limpiar la vista previa si no hay archivo
    logotipoArchivo.value = null; // Limpiar el archivo cargado
  }
};

const proveedorSalud = ref(
    JSON.parse(localStorage.getItem('proveedorSalud')) || null // Recuperar usuario guardado o establecer null si no existe
);

// Función para manejar el envío del formulario
const handleSubmit = async (data) => {

  const formData = new FormData();

  // Añadir los datos del formulario al FormData 
  formData.append('nombreComercial', data.nombreComercial);
  formData.append('razonSocial', data.razonSocial);
  formData.append('RFC', data.RFC);
  formData.append('giroDeEmpresa', data.giroDeEmpresa);
  formData.append('createdBy', '6650f38308ac3beedf5ac41b'); // TODO: Obtener el ID del usuario actual
  formData.append('updatedBy', '6650f38308ac3beedf5ac41b'); // TODO: Obtener el ID del usuario actual
  formData.append('idProveedorSalud', proveedorSaludStore.proveedorSalud._id);

  // Añadir el archivo del logotipo si existe
  if (logotipoArchivo.value) {
    formData.append('logotipoEmpresa', logotipoArchivo.value);
  }

  // Depuramos el contenido de FormData
  // for (let [key, value] of formData.entries()) {
  //     console.log(`${key}:`, value);
  // }

  try {
    if (empresas.currentEmpresa?._id) {
      await empresas.updateEmpresaById(empresas.currentEmpresa._id, formData);
      toast.open({ message: 'Empresa actualizada con éxito' });	
    } else {
      await empresas.createEmpresa(formData);
      toast.open({ message: 'Empresa creada exitosamente' });	
    }
    emit('closeModal');
    empresas.fetchEmpresas(proveedorSaludStore.proveedorSalud._id);
  } catch (error) {
    console.log('Error al crear o actualizar la empresa:', error);
    toast.open({ message: 'Hubo un error, por favor intente nuevamente.', type: 'error' });
  }
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  logotipoPreview.value = null;  // Limpiar la vista previa
  logotipoArchivo.value = null;  // Limpiar el archivo cargado
  emit('closeModal');
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

        <div v-if="empresas.loadingModal">
          <h1 class="text-3xl text-center">Cargando empresa...</h1>
        </div>
        <!-- Contenido del modal -->
        <div v-else>
          <h1 class="text-3xl">{{ empresas.currentEmpresa._id ? 'Editar Empresa' : 'Registrar Empresa' }}</h1>
          <hr class="mt-2 mb-3">

          <FormKit type="form" :actions="false" incomplete-message="Por favor complete todos los campos"
            @submit="handleSubmit">
            <FormKit type="text" label="Nombre Comercial*" name="nombreComercial"
              placeholder="Nombre comercial de la empresa" validation="required"
              :validation-messages="{ required: 'Este campo es obligatorio' }"
              :value="empresas.currentEmpresa?.nombreComercial || ''" />
            <FormKit type="text" label="Razón Social" name="razonSocial" placeholder="Razón social de la empresa"
              :value="empresas.currentEmpresa?.razonSocial || ''" />
            <FormKit type="text" label="RFC" name="RFC" placeholder="RFC" validation="rfcValidation" :validation-messages="{
                  rfcValidation: 'El RFC ingresado no es válido.',
                }" :value="empresas.currentEmpresa?.RFC || ''" />
            <FormKit type="text" label="Giro de la empresa" name="giroDeEmpresa" placeholder="Giro de la Empresa"
              :value="empresas.currentEmpresa?.giroDeEmpresa || ''" />

            <!-- Input del archivo con v-model y evento change -->
            <FormKit type="file" label="Logotipo" name="logotipoEmpresa" accept=".png, .jpg, .jpeg, .svg"
              multiple="false" @change="handleFileChange" />

            <!-- Mostrar la vista previa del logotipo -->
            <div class="flex flex-row justify-center items-center gap-4">
              <div class="w-1/2 flex flex-col items-center" v-if="empresas.currentEmpresa?.logotipoEmpresa?.data">
                <p class="font-medium text-lg text-gray-700">Logotipo actual:</p>
                <img
                  :src="'/uploads/logos/' + empresas.currentEmpresa?.logotipoEmpresa?.data + '?t=' + empresas.currentEmpresa?.updatedAt"
                  :alt="'Logo de ' + empresas.currentEmpresa?.nombreComercial"
                  class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
              </div>
              <Transition appear name="fade-slow">
                <div v-if="logotipoPreview" class="w-1/2 flex flex-col items-center">
                  <p v-if="empresas.currentEmpresa?.logotipoEmpresa?.data" class="font-medium text-lg text-gray-700">
                    Logotipo nuevo:</p>
                  <p v-else class="font-medium text-lg text-gray-700">Logotipo:</p>
                  <img :src="logotipoPreview" alt="Vista previa del logotipo"
                    class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                </div>
              </Transition>
            </div>
            <hr class="my-3">
            <FormKit type="submit" :disabled="empresas.loadingModal">
              <span v-if="empresas.loadingModal">Guardando...</span>
              <span v-else>{{ empresas.currentEmpresa._id ? 'Actualizar Empresa' : 'Guardar Empresa' }}</span>
            </FormKit>
          </FormKit>
        </div>

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