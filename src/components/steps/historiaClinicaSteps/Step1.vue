<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { format } from 'date-fns';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const motivoExamen = ref('Ingreso');
// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

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
