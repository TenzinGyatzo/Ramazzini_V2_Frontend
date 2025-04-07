<script setup>
import { onMounted } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { convertirFechaISOaYYYYMMDD } from '@/helpers/dates';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const proveedorSaludStore = useProveedorSaludStore();
const emit = defineEmits(['closeModal', 'openSubscriptionModal'])

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

const nivelesEscolaridad = [
  "Primaria", "Secundaria", "Preparatoria",
  "Licenciatura", "Maestría", "Doctorado",
  "Nula",
];

const estadosCiviles = [
  "Soltero/a", "Casado/a", "Unión libre",
  "Separado/a", "Divorciado/a", "Viudo/a",
];

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

  const trabajadorData = {
    nombre: data.nombre,
    fechaNacimiento: data.fechaNacimiento,
    sexo: data.sexo,
    escolaridad: data.escolaridad,
    puesto: data.puesto,
    fechaIngreso: data.fechaIngreso,
    telefono: data.telefono,
    estadoCivil: data.estadoCivil,
    hijos: Number(data.hijos),
    idCentroTrabajo: data.idCentroTrabajo,
    createdBy: data.createdBy, // TODO: Obtener el ID del usuario actual
    updatedBy: data.updatedBy // TODO: Obtener el ID del usuario actual
  };

  // Agregar estadoLaboral solo si es un nuevo registro
  if (!trabajadores.currentTrabajador?._id) {
    trabajadorData.estadoLaboral = "Activo";
  }

  try {
    if (trabajadores.currentTrabajador?._id) {
      // Actualizar Trabajador
      await trabajadores.updateTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadores.currentTrabajador._id, trabajadorData);
    } else {
      // Registrar Trabajador
      await trabajadores.createTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadorData);
    }
    emit('closeModal');
    trabajadores.fetchTrabajadores(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId);
  } catch (error) {
    console.error('Error al crear o actualizar al trabajador:', error);
    alert('Hubo un error al crear o actualizar al trabajador, por favor intente nuevamente.');
  }
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
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

        <div v-if="trabajadores.loadingModal">
          <h1 class="text-3xl text-center">Cargando trabajador...</h1>
        </div>
        <!-- Contenido del modal -->
        <div v-else>
          <h1 class="text-3xl">{{ trabajadores.currentTrabajador._id ? 'Editar Trabajador' : 'Registrar Trabajador' }}
          </h1>
          <hr class="mt-2 mb-3">

          <FormKit type="form" :actions="false" incomplete-message="Por favor complete todos los campos"
            @submit="handleSubmit">
            <div class="lg:grid gap-4 lg:grid-cols-2">
              <div class="col-span-2">
                <FormKit type="text" label="Nombre completo del trabajador*" name="nombre" placeholder="Nombre completo"
                  validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }"
                  :value="trabajadores.currentTrabajador?.nombre || ''" />
              </div>

              <FormKit type="date" label="Fecha de Nacimiento*" name="fechaNacimiento" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaNacimiento) || ''" />
              <FormKit type="select" label="Sexo*" name="sexo" placeholder="Seleccione un sexo"
                :options="['Masculino', 'Femenino']" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.sexo || ''" />
              <FormKit type="select" label="Escolaridad*" name="escolaridad"
                placeholder="Último nivel de escolaridad concluida" :options="nivelesEscolaridad" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.escolaridad || ''" />
              <FormKit type="text" label="Puesto*" name="puesto" placeholder="Puesto Laboral" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.puesto || ''" />
              <FormKit type="date" label="Fecha de Ingreso*" name="fechaIngreso" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaIngreso) || ''" />
              <FormKit type="text" label="Teléfono" name="telefono" placeholder="10 dígitos"
                validation="optional|length:10" :validation-messages="{ length: 'El teléfono debe tener 10 dígitos' }"
                :value="trabajadores.currentTrabajador?.telefono || ''" />
              <FormKit type="select" label="Estado Cívil*" name="estadoCivil" placeholder="Seleccione un estado civil"
                :options="estadosCiviles" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.estadoCivil || ''" />
              <FormKit type="number" label="Número de Hijos*" name="hijos" placeholder="0"
                validation="required|between:0,10"
                :validation-messages="{ required: 'Este campo es obligatorio', between: 'El número de hijos debe estar entre 0 y 10' }"
                min="0" max="10" step="1" :value="trabajadores.currentTrabajador?.hijos || 0" />
            </div>

            <!-- Campos ocultos y botón de enviar -->
            <FormKit type="hidden" name="idCentroTrabajo" :value="centrosTrabajo.currentCentroTrabajoId" />
            <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" />
            <FormKit type="hidden" name="updatedBy" :value="'6650f38308ac3beedf5ac41b'" />

            <hr class="my-3">
            <FormKit type="submit" :disabled="trabajadores.loadingModal">
              <span v-if="trabajadores.loadingModal">Guardando...</span>
              <span v-else>{{ trabajadores.currentTrabajador._id ? 'Actualizar Trabajador' : 'Guardar Trabajador'
                }}</span>
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