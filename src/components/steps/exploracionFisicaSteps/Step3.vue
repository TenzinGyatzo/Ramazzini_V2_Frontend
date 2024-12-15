<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

const tensionArterialSistolica = ref(120);
const tensionArterialDiastolica = ref(80);
const categoriaTensionArterial = ref('Óptima');
const frecuenciaCardiaca = ref(80);
const categoriaFrecuenciaCardiaca = ref('Buena');
const frecuenciaRespiratoria = ref(17);
const categoriaFrecuenciaRespiratoria = ref('Normal');
const saturacionOxigeno = ref(97);
const categoriaSaturacionOxigeno = ref('Normal');

onMounted(() => {
  if (documentos.currentDocument) {
    tensionArterialSistolica.value = documentos.currentDocument.tensionArterialSistolica;
    tensionArterialDiastolica.value = documentos.currentDocument.tensionArterialDiastolica;
    categoriaTensionArterial.value = documentos.currentDocument.categoriaTensionArterial;
    frecuenciaCardiaca.value = documentos.currentDocument.frecuenciaCardiaca;
    categoriaFrecuenciaCardiaca.value = documentos.currentDocument.categoriaFrecuenciaCardiaca;
    frecuenciaRespiratoria.value = documentos.currentDocument.frecuenciaRespiratoria;
    categoriaFrecuenciaRespiratoria.value = documentos.currentDocument.categoriaFrecuenciaRespiratoria;
    saturacionOxigeno.value = documentos.currentDocument.saturacionOxigeno;
    categoriaSaturacionOxigeno.value = documentos.currentDocument.categoriaSaturacionOxigeno;
  }
});

onUnmounted(() => {
  formDataExploracionFisica.tensionArterialSistolica = tensionArterialSistolica.value;
  formDataExploracionFisica.tensionArterialDiastolica = tensionArterialDiastolica.value;
  formDataExploracionFisica.categoriaTensionArterial = categoriaTensionArterial.value;
  formDataExploracionFisica.frecuenciaCardiaca = frecuenciaCardiaca.value;
  formDataExploracionFisica.categoriaFrecuenciaCardiaca = categoriaFrecuenciaCardiaca.value;
  formDataExploracionFisica.frecuenciaRespiratoria = frecuenciaRespiratoria.value;
  formDataExploracionFisica.categoriaFrecuenciaRespiratoria = categoriaFrecuenciaRespiratoria.value;
  formDataExploracionFisica.saturacionOxigeno = saturacionOxigeno.value;
  formDataExploracionFisica.categoriaSaturacionOxigeno = categoriaSaturacionOxigeno.value;
});

watch([tensionArterialSistolica, tensionArterialDiastolica, frecuenciaCardiaca, frecuenciaRespiratoria, saturacionOxigeno], () => {
  formDataExploracionFisica.tensionArterialSistolica = tensionArterialSistolica.value;
  formDataExploracionFisica.tensionArterialDiastolica = tensionArterialDiastolica.value;
  setCategoriaTensionArterial();
  formDataExploracionFisica.frecuenciaCardiaca = frecuenciaCardiaca.value;
  setCategoriaFrecuenciaCardiaca();
  formDataExploracionFisica.frecuenciaRespiratoria = frecuenciaRespiratoria.value;
  setCategoriaFrecuenciaRespiratoria();
  formDataExploracionFisica.saturacionOxigeno = saturacionOxigeno.value;
  setCategoriaSaturacionOxigeno();
});

function setCategoriaTensionArterial() {
  let sistolica = formDataExploracionFisica.tensionArterialSistolica;
  let diastolica = formDataExploracionFisica.tensionArterialDiastolica;
  let categoriaSistolica = '';
  let categoriaDiastolica = '';
  let categoria = '';

  if (sistolica <= 120) {
    categoriaSistolica = 'Óptima';
  } else if (sistolica >= 121 && sistolica <= 130) {
    categoriaSistolica = 'Normal';
  } else if (sistolica >= 131 && sistolica <= 139) {
    categoriaSistolica = 'Alta';
  } else if (sistolica >= 140 && sistolica <= 159) {
    categoriaSistolica = 'Hipertensión ligera';
  } else if (sistolica >= 160 && sistolica <= 179) {
    categoriaSistolica = 'Hipertensión moderada';
  } else {
    categoriaSistolica = 'Hipertensión severa';
  }

  if (diastolica <= 80) {
    categoriaDiastolica = 'Óptima';
  } else if (diastolica >= 81 && diastolica <= 85) {
    categoriaDiastolica = 'Normal';
  } else if (diastolica >= 86 && diastolica <= 89) {
    categoriaDiastolica = 'Alta';
  } else if (diastolica >= 90 && diastolica <= 99) {
    categoriaDiastolica = 'Hipertensión ligera';
  } else if (diastolica >= 100 && diastolica <= 109) {
    categoriaDiastolica = 'Hipertensión moderada';
  } else {
    categoriaDiastolica = 'Hipertensión severa';
  }

  if (categoriaSistolica === 'Hipertensión severa' || categoriaDiastolica === 'Hipertensión severa') {
    categoria = 'Hipertensión severa';
  } else if (categoriaSistolica === 'Hipertensión moderada' || categoriaDiastolica === 'Hipertensión moderada') {
    categoria = 'Hipertensión moderada';
  } else if (categoriaSistolica === 'Hipertensión ligera' || categoriaDiastolica === 'Hipertensión ligera') {
    categoria = 'Hipertensión ligera';
  } else if (categoriaSistolica === 'Alta' || categoriaDiastolica === 'Alta') {
    categoria = 'Alta';
  } else if (categoriaSistolica === 'Normal' || categoriaDiastolica === 'Normal') {
    categoria = 'Normal';
  } else {
    categoria = 'Óptima';
  }

  categoriaTensionArterial.value = categoria;
  formDataExploracionFisica.categoriaTensionArterial = categoria;
}

function setCategoriaFrecuenciaCardiaca() {
  let frecuencia = formDataExploracionFisica.frecuenciaCardiaca;
  let categoria = '';

  if (frecuencia < 60) {
    categoria = 'Excelente';
  } else if (frecuencia >= 60 && frecuencia <= 80) {
    categoria = 'Buena';
  } else if (frecuencia >= 81 && frecuencia <= 100) {
    categoria = 'Normal';
  } else if (frecuencia >= 101 && frecuencia <= 120) {
    categoria = 'Elevada';
  } else if (frecuencia >= 121 && frecuencia <= 140) {
    categoria = 'Alta';
  } else {
    categoria = 'Muy Alta';
  }

  categoriaFrecuenciaCardiaca.value = categoria;
  formDataExploracionFisica.categoriaFrecuenciaCardiaca = categoria;
}

function setCategoriaFrecuenciaRespiratoria() {
  let frecuencia = formDataExploracionFisica.frecuenciaRespiratoria;
  let categoria = '';

  if (frecuencia < 12) {
    categoria = 'Bradipnea';
  } else if (frecuencia >= 12 && frecuencia <= 20) {
    categoria = 'Normal';
  } else if (frecuencia >= 21 && frecuencia <= 24) {
    categoria = 'Taquipnea';
  } else {
    categoria = 'Hiperventilación';
  }

  categoriaFrecuenciaRespiratoria.value = categoria;
  formDataExploracionFisica.categoriaFrecuenciaRespiratoria = categoria;
}

function setCategoriaSaturacionOxigeno() {
  let saturacion = formDataExploracionFisica.saturacionOxigeno;
  let categoria = '';

  if (saturacion >= 95 && saturacion <= 100) {
    categoria = 'Normal';
  } else if (saturacion >= 91 && saturacion <= 94) {
    categoria = 'Aceptable';
  } else if (saturacion >= 85 && saturacion <= 90) {
    categoria = 'Moderadamente baja';
  } else if (saturacion >= 81 && saturacion <= 84) {
    categoria = 'Hipoxemia leve';
  } else if (saturacion <= 80) {
    categoria = 'Hipoxemia grave';
  }

  categoriaSaturacionOxigeno.value = categoria;
  formDataExploracionFisica.categoriaSaturacionOxigeno = categoria;
}
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 ">Mediciones de las funciones más básicas del cuerpo</h1>
    <h2 class="mb-4">SIGNOS VITALES</h2>

    <h2>Tensión Arterial</h2>
    <div class="flex gap-4 mb-1">
      <div>
        <label for="tensionArterialSistolica">Sistólica (mmHg)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="tensionArterialSistolica" min="60" max="200">
      </div>
      <div>
        <label for="tensionArterialDiastolica">Diastólica (mmHg)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="tensionArterialDiastolica" min="40" max="150" />
      </div>
    </div>
    <input type="text"
      class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 mb-4"
      v-model="categoriaTensionArterial" readonly />

    <label for="frecuenciaCardiaca">Frecuencia Cardiáca (lpm)</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="frecuenciaCardiaca" min="40" max="150" />
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="categoriaFrecuenciaCardiaca" readonly />
      </div>
    </div>

    <label for="frecuenciaRespiratoria">Frecuencia Respiratoria (rpm)</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="frecuenciaRespiratoria" min="12" max="45" />
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="categoriaFrecuenciaRespiratoria" readonly />
      </div>
    </div>

    <label for="saturacionOxigeno">Saturación de Oxígeno (%)</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="saturacionOxigeno" min="80" max="100" />
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="categoriaSaturacionOxigeno" readonly />
      </div>
    </div>

  </div>
</template>
