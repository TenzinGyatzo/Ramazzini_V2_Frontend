<script setup>
import { reactive, watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataAntidoping } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const antidopingResult = ref('No'); // Por defecto "No"

// Objeto reactivo para los resultados de las sustancias
const drugResults = reactive({
  marihuana: "Negativo",
  cocaina: "Negativo",
  anfetaminas: "Negativo",
  metanfetaminas: "Negativo",
  opiaceos: "Negativo",
});

onMounted(() => {
  if (documentos.currentDocument) {
    drugResults.marihuana = documentos.currentDocument.marihuana;
    drugResults.cocaina = documentos.currentDocument.cocaina;
    drugResults.anfetaminas = documentos.currentDocument.anfetaminas;
    drugResults.metanfetaminas = documentos.currentDocument.metanfetaminas;
    drugResults.opiaceos = documentos.currentDocument.opiaceos;
    antidopingResult.value = 'Si';
  }
});

// Inicializar `formData` con valores por defecto al montar el componente
onUnmounted(() => {
  Object.assign(formDataAntidoping, drugResults);
});

// Sincronizar solo drugResults con formData
watch(drugResults, (newValues) => {
  Object.assign(formDataAntidoping, newValues);
});

watch(antidopingResult, (newValue) => {
  if (newValue === 'No') {
    Object.assign(drugResults, {
      marihuana: "Negativo",
      cocaina: "Negativo",
      anfetaminas: "Negativo",
      metanfetaminas: "Negativo",
      opiaceos: "Negativo",
    });
  }
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Prueba Antidoping</h1>

    <!-- Pregunta principal -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800 leading-5">¿La prueba del trabajador dio resultados positivos?</p>
      <div class="flex items-center space-x-6 font-light">
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            value="No"
            v-model="antidopingResult"
            class="form-radio accent-emerald-600"
          />
          <span>No</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            value="Si"
            v-model="antidopingResult"
            class="form-radio accent-emerald-600"
          />
          <span>Sí</span>
        </label>
      </div>
    </div>

    <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
    <div v-if="antidopingResult === 'Si'" class="mt-4">
      <p class="font-medium mb-2 text-gray-800">Especifique:</p>
      <div class="grid grid-cols-2 gap-1 font-light">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="drugResults.marihuana"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>Marihuana</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="drugResults.cocaina"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>Cocaína</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="drugResults.anfetaminas"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>Anfetaminas</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="drugResults.metanfetaminas"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>Metanfetaminas</span>
        </label>
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="drugResults.opiaceos"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>Opiáceos</span>
        </label>
      </div>
    </div>
  </div>
</template>
