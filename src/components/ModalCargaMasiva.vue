<script setup>
import { ref, inject, onMounted } from 'vue';	
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

const toast = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const proveedorSaludStore = useProveedorSaludStore();
const emit = defineEmits(['closeModal', 'openSubscriptionModal']);

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;
const maxTrabajadoresPermitidos = proveedorSaludStore.proveedorSalud?.maxTrabajadoresPermitidos;
let empresaConMasTrabajadores = ""; // Nombre de la empresa con más trabajadores
let trabajadoresCreados = 0;

onMounted(async () => {
  const top3Empresas = await proveedorSaludStore.getTopEmpresasByWorkers();
  if (top3Empresas?.length > 0) {
    empresaConMasTrabajadores = top3Empresas[0].nombreComercial;
    trabajadoresCreados = top3Empresas[0].totalTrabajadores;
  } else {
    console.log("No se encontraron empresas con trabajadores registrados.");
  }
});

// Función para manejar el envío del formulario
const handleSubmit = async (data) => {
  if (!proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado) {
    // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
    if (!estadoSuscripcion || estadoSuscripcion === 'inactive') {
      emit('openSubscriptionModal');
      return;
    }

    // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
    if (estadoSuscripcion === 'cancelled' && finDeSuscripcion && new Date() > finDeSuscripcion) {
      emit('openSubscriptionModal');
      return;
    }
  }

  if(trabajadoresCreados >= maxTrabajadoresPermitidos) {
    emit('openSubscriptionModal');
    return;
  }
  
  const fileInput = data.file[0].file;

  const formData = new FormData();
  formData.append('file', fileInput);
  formData.append('idCentroTrabajo', centrosTrabajo.currentCentroTrabajoId);
  formData.append('createdBy', '6650f38308ac3beedf5ac41b'); // TODO: Obtener el ID del usuario actual
  formData.append('updatedBy', '6650f38308ac3beedf5ac41b'); // TODO: Obtener el ID del usuario actual
  
  try {
    await trabajadores.importTrabajadores(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, formData);
    emit('closeModal');
    toast.open({ message: 'Trabajadores importados con éxito' });	
    trabajadores.fetchTrabajadores(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId);
  } catch (error) {
    console.log('Error en la petición:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'Hubo un error, por favor utilice la plantilla.';
    toast.open({ message: errorMessage, type: 'error' });
  }
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  emit('closeModal');
};
</script>

<template>
  <div class="modal fixed top-0 left-0 z-50 p-8 h-screen w-full grid place-items-center">
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


        <h1 class="text-3xl">Importar Trabajadores</h1>
        <hr class="mt-2 mb-3">

        <FormKit type="form" :actions="false" incomplete-message="Por favor complete todos los campos"
          @submit="handleSubmit">
          <FormKit type="file" label="Seleccionar archivo a importar" name="file" accept=".xlsx, .xls, .csv"
            multiple="false" validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }" />

          <!-- Campos ocultos y botón de enviar -->
          <FormKit type="hidden" name="idCentroTrabajo" :value="centrosTrabajo.currentCentroTrabajoId" />
          <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" />
          <FormKit type="hidden" name="updatedBy" :value="'6650f38308ac3beedf5ac41b'" />

          <hr class="my-3">
          <FormKit type="submit">
            <span>Importar</span>
          </FormKit>
        </FormKit>

        <div class="grid grid-cols-2 gap-4">
          <a href="/template/Plantilla para Importar Trabajadores.xlsx"
            download="Plantilla para Importar Trabajadores.xlsx">
            <button
              class="text-lg mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-1 ring-inset ring-gray-800 hover:bg-gray-800 hover:text-white p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1">
              Descargar Plantilla
            </button>
          </a>

          <button
            class="text-xl mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1"
            @click="closeModal">
            Cerrar
          </button>
        </div>
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