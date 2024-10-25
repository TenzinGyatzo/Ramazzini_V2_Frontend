<script setup>
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const emit = defineEmits(['closeModal']);

const estadosDeMexico = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Estado de México", "Michoacán", "Morelos", "Nayarit", "Nuevo León",
  "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

// Función para manejar el envío del formulario
const handleSubmit = async (data) => {
    const centroTrabajoData = {
        nombreCentro: data.nombreCentro,
        direccionCentro: data.direccionCentro,
        codigoPostal: data.codigoPostal,
        estado: data.estado,
        municipio: data.municipio,
        idEmpresa: data.idEmpresa,
        createdBy: data.createdBy, // TODO: Obtener el ID del usuario actual
        updatedBy: data.updatedBy // TODO: Obtener el ID del usuario actual
    };

    console.log('Centro de trabajo:', centroTrabajoData);

    try {
        if (centrosTrabajo.currentCentroTrabajo?._id) {
            // Actualizar centro de trabajo
            await centrosTrabajo.updateCentroTrabajoById(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajo._id, centroTrabajoData);
        } else {
            // Crear nuevo centro de trabajo
            await centrosTrabajo.createCentroTrabajo(empresas.currentEmpresaId, centroTrabajoData);
        }
        emit('closeModal');
        centrosTrabajo.fetchCentrosTrabajo(empresas.currentEmpresaId);
    } catch (error) {
        console.error('Error al crear o actualizar el centro:', error);
        alert('Hubo un error al crear o actualizar el centro, por favor intente nuevamente.');
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
    <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="closeModal"></div>
    <Transition appear name="fade">
      <!-- Modal centrado con desplazamiento interno -->  
      <div class="modal-inner relative bg-white text-gray-900 w-full sm:w-4/5 md:w-3/5 xl:w-2/5 2xl:w-1/3 p-10 rounded-lg shadow-md shadow-slate-900 max-h-[90vh] overflow-y-auto">
        <!-- Botón para cerrar el modal -->
        <div class="modal-close absolute h-16 w-16 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer" @click="closeModal">
          &times;
        </div>

        <div v-if="centrosTrabajo.loadingModal">
          <h1 class="text-3xl text-center">Cargando centro de trabajo...</h1>
        </div>
        <!-- Contenido del modal -->
        <div v-else>
          <h1 class="text-3xl">{{ centrosTrabajo.currentCentroTrabajo._id ? 'Editar Centro de Trabajo' : 'Registrar Centro de Trabajo' }}</h1>
          <hr class="mt-2 mb-3">
          
          <FormKit
            type="form"
            :actions="false"
            incomplete-message="Por favor complete todos los campos"
            @submit="handleSubmit"
          >
            <FormKit 
              type="text"
              label="Nombre Centro de Trabajo*"
              name="nombreCentro"
              placeholder="Nombre del centro de trabajo o proyecto"
              validation="required"
              :validation-messages="{ required: 'Este campo es obligatorio'}"
              :value="centrosTrabajo.currentCentroTrabajo?.nombreCentro || ''"
            />
            <FormKit 
              type="text"
              label="Dirección*"
              name="direccionCentro"
              placeholder="Calle, número y colonia"
              validation="required"
              :validation-messages="{ required: 'Este campo es obligatorio'}"
              :value="centrosTrabajo.currentCentroTrabajo?.direccionCentro || ''"
            />
            <FormKit 
              type="text"
              label="Código Postal*"
              name="codigoPostal"
              placeholder="5 dígitos"
              validation="required|length:5"
              :validation-messages="{ required: 'Este campo es obligatorio', length: 'El código postal debe tener 5 dígitos'}"
              :value="centrosTrabajo.currentCentroTrabajo?.codigoPostal || ''"
            />
            <FormKit 
              type="select"
              label="Estado*"
              name="estado"
              placeholder="Seleccione un estado"
              :options="estadosDeMexico"
              validation="required"
              :validation-messages="{ required: 'Este campo es obligatorio'}"
              :value="centrosTrabajo.currentCentroTrabajo?.estado || ''"
            />

            <FormKit 
              type="text"
              label="Municipio*"
              name="municipio"
              placeholder="Ej. Ahome"
              validation="required"
              :validation-messages="{ required: 'Este campo es obligatorio'}"
              :value="centrosTrabajo.currentCentroTrabajo?.municipio || ''"
            />

            <FormKit 
              type="hidden"
              name="idEmpresa"
              :value="empresas.currentEmpresaId"
            />
            <FormKit 
              type="hidden"
              name="createdBy"
              :value="'6650f38308ac3beedf5ac41b'" 
            />
            <FormKit 
              type="hidden"
              name="updatedBy"
              :value="'6650f38308ac3beedf5ac41b'"
            />
            
            <hr class="my-3">
            <FormKit 
              type="submit"
              :disabled="centrosTrabajo.loadingModal" 
            >
              <span v-if="centrosTrabajo.loadingModal">Guardando...</span>
              <span v-else>{{ centrosTrabajo.currentCentroTrabajo._id ? 'Actualizar Centro' : 'Guardar Centro' }}</span>
            </FormKit>
          </FormKit>
        </div>

        <button 
          class="text-xl mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1"
          @click="closeModal"
        >
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