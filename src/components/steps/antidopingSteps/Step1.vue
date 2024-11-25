<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataAntidoping } = useFormDataStore();

// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

// Asegurar que formData tenga un valor inicial para fechaAntidoping
if (!formDataAntidoping.fechaAntidoping) {
  formDataAntidoping.fechaAntidoping = today;
}

// Inicializar la referencia local sincronizada con formData
const fechaAntidoping = ref(formDataAntidoping.fechaAntidoping);

// Mantener sincronizados los valores
watch(fechaAntidoping, (newValue) => {
  formDataAntidoping.fechaAntidoping = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha de realización de la prueba</h1>
    <FormKit
      type="date"
      name="fechaAntidoping"
      placeholder="Seleccione una fecha"
      v-model="fechaAntidoping"
    />
  </div>
</template>
