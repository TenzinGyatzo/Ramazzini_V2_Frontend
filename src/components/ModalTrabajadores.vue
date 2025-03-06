<script setup>
import { ref, inject } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { convertirFechaISOaYYYYMMDD, formatDateYYYYMMDD } from '@/helpers/dates';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const toast = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const proveedorSaludStore = useProveedorSaludStore();

const fechaNacimiento = ref(trabajadores.currentTrabajador?.fechaNacimiento ? new Date(trabajadores.currentTrabajador.fechaNacimiento) : null);
const fechaIngreso = ref(trabajadores.currentTrabajador?.fechaIngreso ? new Date(trabajadores.currentTrabajador.fechaIngreso) : null);

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

const emit = defineEmits(['closeModal', 'openSubscriptionModal']);

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
    ...data,
    fechaNacimiento: fechaNacimiento.value ? formatDateYYYYMMDD(fechaNacimiento.value) : null,
    fechaIngreso: fechaIngreso.value ? formatDateYYYYMMDD(fechaIngreso.value) : null
  };

  /* const trabajadorData = {
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
  }; */

  try {
    if (trabajadores.currentTrabajador?._id) {
      // Actualizar Trabajador
      await trabajadores.updateTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadores.currentTrabajador._id, trabajadorData);
      toast.open({ message: 'Trabajador actualizado con éxito' });
    } else {
      // Registrar Trabajador
      await trabajadores.createTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadorData);
      toast.open({ message: 'Trabajador creado con éxito' });
    }
    emit('closeModal');
    trabajadores.fetchTrabajadores(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId);
  } catch (error) {
    console.log('Error al crear o actualizar al trabajador:', error);
    toast.open({ message: 'Hubo un error, por favor intente nuevamente.', type: 'error' });
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

              <div>
                <label class="block mt-4 font-medium text-lg text-gray-700">Fecha de Nacimiento*</label>
                <VueDatePicker v-model="fechaNacimiento" locale="es" cancelText="Cancelar" selectText="Seleccionar" format="dd/MM/yyyy" required text-input :enable-time-picker="false" :teleport="true" placeholder="Selecciona Fecha" class="w-full p-1.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 mt-1"/>
              </div>
              <!-- <FormKit type="date" label="Fecha de Nacimiento*" name="fechaNacimiento" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaNacimiento) || ''" /> -->
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
              <div>
                <label class="block mt-4 font-medium text-lg text-gray-700">Fecha de Ingreso*</label>
                <VueDatePicker v-model="fechaIngreso" locale="es" cancelText="Cancelar" selectText="Seleccionar" format="dd/MM/yyyy" required text-input :enable-time-picker="false" :teleport="true" placeholder="Selecciona Fecha" class="w-full p-1.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 mt-1"/>
              </div>
              <!-- <FormKit type="date" label="Fecha de Ingreso*" name="fechaIngreso" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }" title="Fecha de ingreso a la empresa"
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaIngreso) || ''" /> -->
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

.dp__theme_light {
    --dp-background-color: #fff;
    --dp-text-color: #212121;
    --dp-hover-color: #f3f3f3;
    --dp-hover-text-color: #212121;
    --dp-hover-icon-color: #959595;
    --dp-primary-color: #1976d2;
    --dp-primary-disabled-color: #6bacea;
}
</style>