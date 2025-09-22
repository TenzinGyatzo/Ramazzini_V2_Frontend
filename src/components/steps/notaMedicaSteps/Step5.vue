<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();

const tensionArterialSistolica = ref(120);
const tensionArterialDiastolica = ref(80);
const frecuenciaCardiaca = ref(80);
const frecuenciaRespiratoria = ref(17);
const temperatura = ref(36.5);
const saturacionOxigeno = ref(97);

onMounted(() => {
  // Prioridad: formData > documentos.currentDocument > valores por defecto
  if (formDataNotaMedica.tensionArterialSistolica !== undefined) {
    tensionArterialSistolica.value = formDataNotaMedica.tensionArterialSistolica;
    tensionArterialDiastolica.value = formDataNotaMedica.tensionArterialDiastolica;
    frecuenciaCardiaca.value = formDataNotaMedica.frecuenciaCardiaca;
    frecuenciaRespiratoria.value = formDataNotaMedica.frecuenciaRespiratoria;
    saturacionOxigeno.value = formDataNotaMedica.saturacionOxigeno;
    temperatura.value = formDataNotaMedica.temperatura;
  } else if (documentos.currentDocument) {
    tensionArterialSistolica.value = documentos.currentDocument.tensionArterialSistolica;
    tensionArterialDiastolica.value = documentos.currentDocument.tensionArterialDiastolica;
    frecuenciaCardiaca.value = documentos.currentDocument.frecuenciaCardiaca;
    frecuenciaRespiratoria.value = documentos.currentDocument.frecuenciaRespiratoria;
    saturacionOxigeno.value = documentos.currentDocument.saturacionOxigeno;
    temperatura.value = documentos.currentDocument.temperatura;
  }
  // Si no hay formData ni currentDocument, se mantienen los valores por defecto
});

onUnmounted(() => {
  formDataNotaMedica.tensionArterialSistolica = tensionArterialSistolica.value;
  formDataNotaMedica.tensionArterialDiastolica = tensionArterialDiastolica.value;
  formDataNotaMedica.frecuenciaCardiaca = frecuenciaCardiaca.value;
  formDataNotaMedica.frecuenciaRespiratoria = frecuenciaRespiratoria.value;
  formDataNotaMedica.saturacionOxigeno = saturacionOxigeno.value;
  formDataNotaMedica.temperatura = temperatura.value;
});

// Computed para mostrar mensajes de error
const mensajeErrorTensionSistolica = computed(() => {
  return tensionArterialSistolica.value < 60 
    ? 'Debe ser mínimo 60' 
    : tensionArterialSistolica.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

const mensajeErrorTensionDiastolica = computed(() => {
  return tensionArterialDiastolica.value < 40 
    ? 'Debe ser mínimo 40' 
    : tensionArterialDiastolica.value > 150 
      ? 'Debe ser máximo 150' 
      : '';
});

const mensajeErrorFrecuenciaCardiaca = computed(() => {
  return frecuenciaCardiaca.value < 40 
    ? 'Debe ser mínimo 40' 
    : frecuenciaCardiaca.value > 150 
      ? 'Debe ser máximo 150' 
      : '';
});

const mensajeErrorFrecuenciaRespiratoria = computed(() => {
  return frecuenciaRespiratoria.value < 12 
    ? 'Debe ser mínimo 12' 
    : frecuenciaRespiratoria.value > 45 
      ? 'Debe ser máximo 45' 
      : '';
});

const mensajeErrorTempertura = computed(() => {
  return temperatura.value < 35 
    ? 'Debe ser mínimo 35' 
    : temperatura.value > 42 
      ? 'Debe ser máximo 42' 
      : '';
});

const mensajeErrorSaturacionOxigeno = computed(() => {
  return saturacionOxigeno.value < 80 
    ? 'Debe ser mínimo 80' 
    : saturacionOxigeno.value > 100 
      ? 'Debe ser máximo 100' 
      : '';
});

</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 ">Mediciones de las funciones más básicas del cuerpo</h1>
    <h2 class="mb-4">SIGNOS VITALES</h2>

    <h2>Tensión Arterial</h2>
    <div class="flex gap-4 mb-4">
      <div class="w-full">
        <label for="tensionArterialSistolica">Sistólica (mmHg)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="tensionArterialSistolica" min="60" max="200">
        <p v-if="mensajeErrorTensionSistolica" class="text-red-500 text-sm mt-1">
        {{ mensajeErrorTensionSistolica }}
        </p>
      </div>
      <div class="w-full">
        <label for="tensionArterialDiastolica">Diastólica (mmHg)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="tensionArterialDiastolica" min="40" max="150" />
        <p v-if="mensajeErrorTensionDiastolica" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorTensionDiastolica }}
        </p>
      </div>
    </div>

    <div class="flex gap-4 mb-4">
      <div class="w-full">
        <label for="frecuenciaCardiaca">F. Cardiáca (lpm)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="frecuenciaCardiaca" min="40" max="150">
        <p v-if="mensajeErrorFrecuenciaCardiaca" class="text-red-500 text-sm mt-1">
        {{ mensajeErrorFrecuenciaCardiaca }}
        </p>
      </div>
      <div class="w-full">
        <label for="frecuenciaRespiratoria">F. Respiratoria (rpm)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="frecuenciaRespiratoria" min="12" max="45" />
        <p v-if="mensajeErrorFrecuenciaRespiratoria" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorFrecuenciaRespiratoria }}
        </p>
      </div>
    </div>

    <div class="flex gap-4 mb-4">
      <div class="w-full">
        <label for="temperatura">Temperatura (°C)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="temperatura" step="0.1" min="35" max="42">
        <p v-if="mensajeErrorTempertura" class="text-red-500 text-sm mt-1">
        {{ mensajeErrorTempertura }}
        </p>
      </div>
      <div class="w-full">
        <label for="saturacionOxigeno">Sat. Oxígeno (%)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="saturacionOxigeno" min="80" max="100">
        <p v-if="mensajeErrorSaturacionOxigeno" class="text-red-500 text-sm mt-1">
        {{ mensajeErrorSaturacionOxigeno }}
        </p>
      </div>
    </div>

  </div>
</template>
