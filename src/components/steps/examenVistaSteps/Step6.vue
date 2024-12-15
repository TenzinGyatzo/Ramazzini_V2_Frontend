<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExamenVista } = useFormDataStore();
const documentos = useDocumentosStore();

const placasCorrectas = ref(14);
const porcentajeIshihara = ref(100);
const interpretacionIshihara = ref('Normal');

onMounted(() => {
  if(documentos.currentDocument) {
    placasCorrectas.value = documentos.currentDocument.placasCorrectas;
    porcentajeIshihara.value = documentos.currentDocument.porcentajeIshihara;
    interpretacionIshihara.value = documentos.currentDocument.interpretacionIshihara;
  }
});

onUnmounted(() => {
  formDataExamenVista.placasCorrectas = placasCorrectas.value;
  formDataExamenVista.porcentajeIshihara = porcentajeIshihara.value;
  formDataExamenVista.interpretacionIshihara = interpretacionIshihara.value;
})

// Observa los cambios y actualiza el store y los campos relacionados
watch([placasCorrectas], () => {
  formDataExamenVista.placasCorrectas = placasCorrectas.value;
  interpretarIshihara();
});

// Función para interpretar la agudeza visual
function interpretarIshihara() {
  porcentajeIshihara.value = Math.round(formDataExamenVista.placasCorrectas * 100 / 14)
  formDataExamenVista.porcentajeIshihara = porcentajeIshihara.value
  if (formDataExamenVista.porcentajeIshihara >= 80) {
    interpretacionIshihara.value = "Normal";
    formDataExamenVista.interpretacionIshihara = interpretacionIshihara.value;
  } else {
    interpretacionIshihara.value = "Daltonismo";
    formDataExamenVista.interpretacionIshihara = interpretacionIshihara.value;
  }
}
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 ">Visión Cromática</h1>
    <h2 class="mb-4">PRUEBA DE ISHIHARA</h2>

    <label for="placasCorrectas">Placas Correctas</label>
    <div class="flex space-x-4 mt-1 mb-4">
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="placasCorrectas" step="1" min="0" max="14" />
      </div>
      <p class="text-3xl">de 14</p>
    </div>

    <div class="flex gap-4">
      <div>
        <label for="porcentajeIshihara">Porcentaje (%)</label>
            <input type="number"
              class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              v-model="porcentajeIshihara" readonly />

      </div>

      <div>
        <label for="interpretacionIshihara">Interpretación</label>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="interpretacionIshihara" readonly>
      </div>
    </div>
  </div>
</template>
