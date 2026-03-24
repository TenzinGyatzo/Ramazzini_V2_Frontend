<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useTrabajadoresStore } from '@/stores/trabajadores';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();
const trabajadores = useTrabajadoresStore();

const genero = ref(0);
const derechohabienciaSeleccion = ref([]);

const generoOptions = [
  { value: 0, label: 'No especificado' },
  { value: 1, label: 'Masculino' },
  { value: 2, label: 'Femenino' },
  { value: 3, label: 'Transgénero' },
  { value: 4, label: 'Transexual' },
  { value: 5, label: 'Travesti' },
  { value: 6, label: 'Intersexual' },
  { value: 88, label: 'Otro' },
];

const derechohabienciaOptions = [
  { value: '0', label: 'No especificado' },
  { value: '1', label: 'Ninguna' },
  { value: '2', label: 'IMSS' },
  { value: '3', label: 'ISSSTE' },
  { value: '4', label: 'PEMEX' },
  { value: '5', label: 'SEDENA' },
  { value: '6', label: 'SEMAR' },
  { value: '8', label: 'Otra' },
  { value: '10', label: 'IMSS Bienestar' },
  { value: '11', label: 'ISSFAM' },
  { value: '14', label: 'OPD IMSS BIENESTAR' },
  { value: '99', label: 'Se ignora' },
];

const exclusiveValues = ['0', '1', '99'];

function getValFromSource(field, defaultVal) {
  const formVal = formDataNotaMedica[field];
  const docVal = documentos.currentDocument?.[field];
  if (formVal !== undefined) return formVal;
  if (docVal !== undefined) return docVal;
  return defaultVal;
}

function syncFormData() {
  formDataNotaMedica.genero = genero.value;
  formDataNotaMedica.derechohabiencia =
    derechohabienciaSeleccion.value.length > 0
      ? derechohabienciaSeleccion.value.join('&')
      : '0';
}

function handleDerechohabienciaChange(clickedValue) {
  if (exclusiveValues.includes(clickedValue)) {
    if (derechohabienciaSeleccion.value.includes(clickedValue)) {
      derechohabienciaSeleccion.value = [clickedValue];
    }
  } else {
    derechohabienciaSeleccion.value = derechohabienciaSeleccion.value.filter(
      (v) => !exclusiveValues.includes(v)
    );
    if (derechohabienciaSeleccion.value.length > 9) {
      derechohabienciaSeleccion.value = derechohabienciaSeleccion.value.slice(0, 9);
    }
  }
}

onMounted(() => {
  const sexo = trabajadores.currentTrabajador?.sexo;
  const defaultGenero = sexo === 'Masculino' ? 1 : sexo === 'Femenino' ? 2 : 0;

  const savedGenero = getValFromSource('genero', defaultGenero);
  genero.value = savedGenero;

  const savedDerecho = getValFromSource('derechohabiencia', '0');
  if (typeof savedDerecho === 'string' && savedDerecho !== '0') {
    derechohabienciaSeleccion.value = savedDerecho.split('&').filter(Boolean);
  } else {
    derechohabienciaSeleccion.value = [];
  }

  syncFormData();
});

watch(genero, () => syncFormData());
watch(derechohabienciaSeleccion, () => syncFormData(), { deep: true });

onUnmounted(() => {
  syncFormData();
});
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-4 uppercase">Género y Derechohabiencia</h2>

    <div class="mb-6">
      <label for="genero" class="block text-base font-medium text-gray-800 mb-2">
        Género <span class="text-red-500">*</span>
      </label>
      <select
        id="genero"
        v-model="genero"
        class="w-full p-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      >
        <option v-for="opt in generoOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-base font-medium text-gray-800 mb-2">
        Derechohabiencia <span class="text-red-500">*</span>
      </label>
      <p class="text-sm text-gray-600 mb-3">Seleccione una o más opciones (máx. 9). "No especificado", "Ninguna" y "Se ignora" son exclusivas.</p>
      <div class="grid grid-cols-2 gap-2">
        <label
          v-for="opt in derechohabienciaOptions"
          :key="opt.value"
          class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            :value="opt.value"
            v-model="derechohabienciaSeleccion"
            class="rounded text-emerald-600 focus:ring-emerald-500"
            @change="handleDerechohabienciaChange(opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>
  </div>
</template>
