<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';

const props = defineProps(['formData']); // Recibe formData desde FormStepper

// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

// Asegurar que formData tenga un valor inicial para fechaHistoriaClinica
if (!props.formData.fechaHistoriaClinica) {
  props.formData.fechaHistoriaClinica = today;
}

// Inicializar la referencia local sincronizada con formData
const fechaHistoriaClinica = ref(props.formData.fechaHistoriaClinica);

// Mantener sincronizados los valores
watch(fechaHistoriaClinica, (newValue) => {
  props.formData.fechaHistoriaClinica = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha de realización de la prueba</h1>
    <FormKit
      type="date"
      name="fechaHistoriaClinica"
      placeholder="Seleccione una fecha"
      v-model="fechaHistoriaClinica"
    />
  </div>
</template>
