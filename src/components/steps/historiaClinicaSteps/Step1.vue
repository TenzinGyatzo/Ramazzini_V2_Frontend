<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { format } from 'date-fns';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const motivoExamen = ref('Ingreso');
// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');
const todayDDMMYYYY = format(new Date(), 'dd-MM-yyyy');

onMounted(() => {
  // Establece rutaPDF en formData
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataHistoriaClinica.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/Historia-Clinica ${todayDDMMYYYY}.pdf`;

  // Establece idTrabajador en formData
  formDataHistoriaClinica.idTrabajador = trabajadores.currentTrabajadorId;

  // Establece usuario creador y/o actualizador en formData
  formDataHistoriaClinica.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataHistoriaClinica.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
});

onUnmounted(() => {
  // Asignar defaults de formulario en caso de que no se haya interactuado con el componente
  if (!formDataHistoriaClinica.motivoExamen) {
    formDataHistoriaClinica.motivoExamen = motivoExamen.value;
  }

  if (!formDataHistoriaClinica.fechaHistoriaClinica) {
    formDataHistoriaClinica.fechaHistoriaClinica = today;
  }
});

// Inicializar la referencia local sincronizada con formData
const fechaHistoriaClinica = ref(today);

// Sincronizar motivoExamen con formData
watch(motivoExamen, (newValue) => {
  formDataHistoriaClinica.motivoExamen = newValue;
});

// Mantener sincronizados los valores
watch(fechaHistoriaClinica, (newValue) => {
  formDataHistoriaClinica.fechaHistoriaClinica = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Historia Clínica</h1>
    <!-- Pregunta principal -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800 leading-5">¿Motivo del examen médico?</p>
      <div class="flex items-center space-x-6 font-light">
        <label class="flex items-center space-x-2">
          <input type="radio" value="Ingreso" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Ingreso</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Inicial" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Inicial</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Periódico" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Periódico</span>
        </label>
      </div>
    </div>
    <div class="mt-6">
      <h1 class="font-medium mb-2 text-gray-800 leading-5">Fecha de Historia Clínica</h1>
      <FormKit type="date" name="fechaHistoriaClinica" placeholder="Seleccione una fecha"
        v-model="fechaHistoriaClinica" />
    </div>
  </div>
</template>
