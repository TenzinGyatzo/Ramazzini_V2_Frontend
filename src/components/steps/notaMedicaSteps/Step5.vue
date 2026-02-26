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

// CEX NOM-024: "Se desconoce" por campo (valor 0 en export)
const seDesconoceSistolica = ref(false);
const seDesconoceDiastolica = ref(false);
const seDesconoceFrecuenciaCardiaca = ref(false);
const seDesconoceFrecuenciaRespiratoria = ref(false);
const seDesconoceTemperatura = ref(false);
const seDesconoceSaturacionOxigeno = ref(false);

onMounted(() => {
  // Prioridad: formData > documentos.currentDocument > valores por defecto
  if (formDataNotaMedica.tensionArterialSistolica !== undefined) {
    tensionArterialSistolica.value = formDataNotaMedica.tensionArterialSistolica ?? 120;
    tensionArterialDiastolica.value = formDataNotaMedica.tensionArterialDiastolica ?? 80;
    frecuenciaCardiaca.value = formDataNotaMedica.frecuenciaCardiaca ?? 80;
    frecuenciaRespiratoria.value = formDataNotaMedica.frecuenciaRespiratoria ?? 17;
    saturacionOxigeno.value = formDataNotaMedica.saturacionOxigeno ?? 97;
    temperatura.value = formDataNotaMedica.temperatura ?? 36.5;
  } else if (documentos.currentDocument) {
    tensionArterialSistolica.value = documentos.currentDocument.tensionArterialSistolica ?? 120;
    tensionArterialDiastolica.value = documentos.currentDocument.tensionArterialDiastolica ?? 80;
    frecuenciaCardiaca.value = documentos.currentDocument.frecuenciaCardiaca ?? 80;
    frecuenciaRespiratoria.value = documentos.currentDocument.frecuenciaRespiratoria ?? 17;
    saturacionOxigeno.value = documentos.currentDocument.saturacionOxigeno ?? 97;
    temperatura.value = documentos.currentDocument.temperatura ?? 36.5;
  }
  // Detectar "se desconoce" si valor es 0
  seDesconoceSistolica.value = tensionArterialSistolica.value === 0;
  seDesconoceDiastolica.value = tensionArterialDiastolica.value === 0;
  seDesconoceFrecuenciaCardiaca.value = frecuenciaCardiaca.value === 0;
  seDesconoceFrecuenciaRespiratoria.value = frecuenciaRespiratoria.value === 0;
  seDesconoceTemperatura.value = temperatura.value === 0;
  seDesconoceSaturacionOxigeno.value = saturacionOxigeno.value === 0;
});

onUnmounted(() => {
  formDataNotaMedica.tensionArterialSistolica = tensionArterialSistolica.value;
  formDataNotaMedica.tensionArterialDiastolica = tensionArterialDiastolica.value;
  formDataNotaMedica.frecuenciaCardiaca = frecuenciaCardiaca.value;
  formDataNotaMedica.frecuenciaRespiratoria = frecuenciaRespiratoria.value;
  formDataNotaMedica.saturacionOxigeno = saturacionOxigeno.value;
  formDataNotaMedica.temperatura = temperatura.value;
});

// CEX: si diastolica=0, sistolica debe ser 0; si sistolica=0, diastolica debe ser 0
watch(seDesconoceSistolica, (v) => {
  if (v) {
    tensionArterialSistolica.value = 0;
    seDesconoceDiastolica.value = true;
    tensionArterialDiastolica.value = 0;
  } else {
    tensionArterialSistolica.value = 120;
    tensionArterialDiastolica.value = 80;
    seDesconoceDiastolica.value = false;
  }
});
watch(seDesconoceDiastolica, (v) => {
  if (v) {
    tensionArterialDiastolica.value = 0;
    if (!seDesconoceSistolica.value) {
      // CEX: si diastolica=0, sistolica debe ser 0
      seDesconoceSistolica.value = true;
      tensionArterialSistolica.value = 0;
    }
  } else {
    tensionArterialDiastolica.value = 80;
    tensionArterialSistolica.value = 120;
    seDesconoceSistolica.value = false;
  }
});

watch(seDesconoceFrecuenciaCardiaca, (v) => { if (v) frecuenciaCardiaca.value = 0; else frecuenciaCardiaca.value = 80; });
watch(seDesconoceFrecuenciaRespiratoria, (v) => { if (v) frecuenciaRespiratoria.value = 0; else frecuenciaRespiratoria.value = 17; });
watch(seDesconoceTemperatura, (v) => { if (v) temperatura.value = 0; else temperatura.value = 36.5; });
watch(seDesconoceSaturacionOxigeno, (v) => { if (v) saturacionOxigeno.value = 0; else saturacionOxigeno.value = 97; });

// Rangos CEX NOM-024. Si valor=0 (desconoce), no mostrar error
const mensajeErrorTensionSistolica = computed(() => {
  if (tensionArterialSistolica.value === 0) return '';
  return tensionArterialSistolica.value < 50
    ? 'CEX: mínimo 50 mmHg'
    : tensionArterialSistolica.value > 300
      ? 'CEX: máximo 300 mmHg'
      : '';
});

const mensajeErrorTensionDiastolica = computed(() => {
  if (tensionArterialDiastolica.value === 0) return '';
  return tensionArterialDiastolica.value < 20
    ? 'CEX: mínimo 20 mmHg'
    : tensionArterialDiastolica.value > 200
      ? 'CEX: máximo 200 mmHg'
      : '';
});

const mensajeErrorFrecuenciaCardiaca = computed(() => {
  if (frecuenciaCardiaca.value === 0) return '';
  return frecuenciaCardiaca.value < 40
    ? 'CEX: mínimo 40 lpm'
    : frecuenciaCardiaca.value > 220
      ? 'CEX: máximo 220 lpm'
      : '';
});

const mensajeErrorFrecuenciaRespiratoria = computed(() => {
  if (frecuenciaRespiratoria.value === 0) return '';
  return frecuenciaRespiratoria.value < 10
    ? 'CEX: mínimo 10 rpm'
    : frecuenciaRespiratoria.value > 99
      ? 'CEX: máximo 99 rpm'
      : '';
});

const mensajeErrorTempertura = computed(() => {
  if (temperatura.value === 0) return '';
  return temperatura.value < 30
    ? 'CEX: mínimo 30 °C'
    : temperatura.value > 44
      ? 'CEX: máximo 44 °C'
      : '';
});

const mensajeErrorSaturacionOxigeno = computed(() => {
  if (saturacionOxigeno.value === 0) return '';
  return saturacionOxigeno.value < 1
    ? 'CEX: mínimo 1 %'
    : saturacionOxigeno.value > 100
      ? 'CEX: máximo 100 %'
      : '';
});
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-4 uppercase">Signos Vitales</h2>
    <p class="text-sm text-gray-600 mb-4">Marque "Se desconoce" si no se registró el dato.</p>

    <h2>Tensión Arterial</h2>
    <div class="flex gap-4 mb-4 flex-wrap">
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="tensionArterialSistolica">Sistólica (mmHg)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="tensionArterialSistolica"
            :min="0"
            :max="300"
            :disabled="seDesconoceSistolica">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceSistolica" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorTensionSistolica" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorTensionSistolica }}
        </p>
      </div>
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="tensionArterialDiastolica">Diastólica (mmHg)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="tensionArterialDiastolica"
            :min="0"
            :max="200"
            :disabled="seDesconoceDiastolica">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceDiastolica" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorTensionDiastolica" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorTensionDiastolica }}
        </p>
      </div>
    </div>

    <div class="flex gap-4 mb-4 flex-wrap">
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="frecuenciaCardiaca">F. Cardíaca (lpm)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="frecuenciaCardiaca"
            :min="0"
            :max="220"
            :disabled="seDesconoceFrecuenciaCardiaca">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceFrecuenciaCardiaca" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorFrecuenciaCardiaca" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorFrecuenciaCardiaca }}
        </p>
      </div>
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="frecuenciaRespiratoria">F. Respiratoria (rpm)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="frecuenciaRespiratoria"
            :min="0"
            :max="99"
            :disabled="seDesconoceFrecuenciaRespiratoria">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceFrecuenciaRespiratoria" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorFrecuenciaRespiratoria" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorFrecuenciaRespiratoria }}
        </p>
      </div>
    </div>

    <div class="flex gap-4 mb-4 flex-wrap">
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="temperatura">Temperatura (°C)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="temperatura"
            step="0.1"
            :min="0"
            :max="44"
            :disabled="seDesconoceTemperatura">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceTemperatura" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorTempertura" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorTempertura }}
        </p>
      </div>
      <div class="w-full sm:w-[calc(50%-0.5rem)]">
        <label for="saturacionOxigeno">Sat. Oxígeno (%)</label>
        <div class="flex items-center gap-2 mt-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            v-model="saturacionOxigeno"
            :min="0"
            :max="100"
            :disabled="seDesconoceSaturacionOxigeno">
          <label class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input type="checkbox" v-model="seDesconoceSaturacionOxigeno" class="rounded">
            Se desconoce
          </label>
        </div>
        <p v-if="mensajeErrorSaturacionOxigeno" class="text-red-500 text-sm mt-1">
          {{ mensajeErrorSaturacionOxigeno }}
        </p>
      </div>
    </div>

  </div>
</template>
