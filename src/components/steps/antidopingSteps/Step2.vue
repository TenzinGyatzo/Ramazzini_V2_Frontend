<script setup>
import { reactive, watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataAntidoping } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const antidopingResult = ref('No'); // Por defecto "No"

const tipoPrueba = ref('5');

const todosLosParametros = {
  marihuana: "Negativo",
  cocaina: "Negativo",
  anfetaminas: "Negativo",
  metanfetaminas: "Negativo",
  opiaceos: "Negativo",
  benzodiacepinas: "Negativo",
  fenciclidina: "Negativo",
  metadona: "Negativo",
  barbituricos: "Negativo",
  antidepresivosTriciclicos: "Negativo",
};

// Objeto reactivo para los resultados de las sustancias
const drugResults = reactive({ ...todosLosParametros });

const camposVisibles = computed(() => {
  if (tipoPrueba.value === '5') {
    return ['marihuana', 'cocaina', 'anfetaminas', 'metanfetaminas', 'opiaceos'];
  } else if (tipoPrueba.value === '6') {
    return ['marihuana', 'cocaina', 'anfetaminas', 'metanfetaminas', 'opiaceos', 'benzodiacepinas'];
  } else {
    return Object.keys(todosLosParametros);
  }
});

onMounted(() => {
  const doc = documentos.currentDocument;

  if (doc) {
    // Rellenar datos existentes
    for (const key in todosLosParametros) {
      if (key in doc) {
        drugResults[key] = doc[key];
      }
    }

    // Detectar el tipo de prueba (por número de campos presentes)
    const camposPresentes = Object.keys(todosLosParametros).filter(
      (campo) => campo in doc
    );

    if (camposPresentes.length >= 10) {
      tipoPrueba.value = '10';
    } else if (camposPresentes.includes('benzodiacepinas')) {
      tipoPrueba.value = '6';
    } else {
      tipoPrueba.value = '5';
    }

    antidopingResult.value = 'Si';
  }
});

// Inicializar `formData` con valores por defecto al montar el componente
onUnmounted(() => {
  const datosFiltrados = Object.fromEntries(
    camposVisibles.value.map((campo) => [campo, drugResults[campo]])
  );
  Object.assign(formDataAntidoping, datosFiltrados);

  Object.keys(todosLosParametros).forEach((campo) => {
    if (!camposVisibles.value.includes(campo)) {
      delete formDataAntidoping[campo];
    }
  });
});

watch([drugResults, tipoPrueba], () => {
  const datosFiltrados = Object.fromEntries(
    camposVisibles.value.map((campo) => [campo, drugResults[campo]])
  );
  Object.assign(formDataAntidoping, datosFiltrados);

  // Elimina del formDataAntidoping los campos que ya no se deben enviar
  Object.keys(todosLosParametros).forEach((campo) => {
    if (!camposVisibles.value.includes(campo)) {
      delete formDataAntidoping[campo];
    }
  });
}, { deep: true });

watch(antidopingResult, (val) => {
  if (val === 'No') {
    camposVisibles.value.forEach((campo) => {
      drugResults[campo] = 'Negativo';
    });
  }
});

function formatoNombre(campo) {
  return campo
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Triciclicos', 'T.');
}

</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Prueba Antidoping</h1>

    <div class="mb-4">
      <label class="font-medium text-gray-800">Tipo de prueba antidoping:</label>
      <select v-model="tipoPrueba" class="mt-1 border rounded p-1">
        <option value="5">5 parámetros</option>
        <option value="6">6 parámetros</option>
        <option value="10">10 parámetros</option>
      </select>
    </div>

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
        <label
          v-for="parametro in camposVisibles"
          :key="parametro"
          class="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            v-model="drugResults[parametro]"
            :true-value="'Positivo'"
            :false-value="'Negativo'"
            class="form-checkbox accent-emerald-600"
          />
          <span>{{ formatoNombre(parametro) }}</span>
        </label>
      </div>

    </div>
  </div>
</template>
