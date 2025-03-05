<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

const peso = ref(80);
const altura = ref(1.7);
const indiceMasaCorporal = ref(27.68);
const categoriaIMC = ref('Sobrepeso');
const circunferenciaCintura = ref(89);
const categoriaCircunferenciaCintura = ref('Bajo Riesgo');

onMounted(() => {
  if (documentos.currentDocument) {
    peso.value = documentos.currentDocument.peso;
    altura.value = documentos.currentDocument.altura;
    indiceMasaCorporal.value = documentos.currentDocument.indiceMasaCorporal;
    categoriaIMC.value = documentos.currentDocument.categoriaIMC;
    circunferenciaCintura.value = documentos.currentDocument.circunferenciaCintura;
    categoriaCircunferenciaCintura.value = documentos.currentDocument.categoriaCircunferenciaCintura; 
  }
});

onUnmounted(() => {
  formDataExploracionFisica.peso = peso.value;
  formDataExploracionFisica.altura = altura.value;
  formDataExploracionFisica.indiceMasaCorporal = indiceMasaCorporal.value;
  formDataExploracionFisica.categoriaIMC = categoriaIMC.value;
  formDataExploracionFisica.circunferenciaCintura = circunferenciaCintura.value;
  formDataExploracionFisica.categoriaCircunferenciaCintura = categoriaCircunferenciaCintura.value;
})

watch([peso, altura, circunferenciaCintura], () => {
  formDataExploracionFisica.peso = peso.value;
  formDataExploracionFisica.altura = altura.value;
  calcularIMC(peso.value, altura.value); // Pasar los valores actuales
  formDataExploracionFisica.circunferenciaCintura = circunferenciaCintura.value;
  setCategoriaCircunferenciaCintura();
});

function calcularIMC(peso, altura) {
  if (peso > 0 && altura > 0) {
    const imc = peso / (altura ** 2); // Altura ya está en metros
    const imcRedondeado = Math.round(imc * 100) / 100;

    // Actualiza tanto el estado reactivo como el formData
    indiceMasaCorporal.value = imcRedondeado; // Esto actualizará dinámicamente el v-model
    formDataExploracionFisica.indiceMasaCorporal = imcRedondeado;

    setCategoriaIMC();
  } else {
    indiceMasaCorporal.value = null;
    formDataExploracionFisica.indiceMasaCorporal = null;
  }
}

function setCategoriaIMC() {
  let IMC = formDataExploracionFisica.indiceMasaCorporal
  let categoria = '';

  if (IMC < 18.5) {
    categoria = 'Bajo peso';
  } else if (IMC >= 18.5 && IMC <= 24.99) {
    categoria = 'Normal';
  } else if (IMC >= 25 && IMC <= 29.99) {
    categoria = 'Sobrepeso';
  } else if (IMC >= 30 && IMC <= 34.99) {
    categoria = 'Obesidad clase I';
  } else if (IMC >= 35 && IMC <= 39.99) {
    categoria = 'Obesidad clase II';
  } else if (IMC >= 40) {
    categoria = 'Obesidad clase III';
  }

  categoriaIMC.value = categoria;
  formDataExploracionFisica.categoriaIMC = categoria;
}

function setCategoriaCircunferenciaCintura() {
  let circunferencia = formDataExploracionFisica.circunferenciaCintura
  let categoria = '';
  if (trabajadores.currentTrabajador.sexo === 'Femenino') {
    if (circunferencia < 80) {
      categoria = 'Bajo Riesgo';
    } else if (circunferencia >= 80 && circunferencia <= 89) {
      categoria = 'Riesgo Aumentado';
    } else {
      categoria = 'Alto Riesgo';
    }
  } else if (trabajadores.currentTrabajador.sexo === 'Masculino') {
    if (circunferencia < 94) {
      categoria = 'Bajo Riesgo';
    } else if (circunferencia >= 94 && circunferencia <= 103) {
      categoria = 'Riesgo Aumentado';
    } else {
      categoria = 'Alto Riesgo';
    }
  }

  categoriaCircunferenciaCintura.value = categoria;
  formDataExploracionFisica.categoriaCircunferenciaCintura = categoria;
}

const mensajeErrorPeso = computed(() => {
  return peso.value < 45 
    ? 'Debe ser mínimo 45' 
    : peso.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

const mensajeErrorAltura = computed(() => {
  return altura.value < 1.40 
    ? 'Debe ser mínimo 1.40 m' 
    : altura.value > 2.20 
      ? 'Debe ser máximo 2.20 m' 
      : '';
});

const mensajeErrorCircunferenciaCintura = computed(() => {
  return circunferenciaCintura.value < 50 
    ? 'Debe ser mínimo 50 cm' 
    : circunferenciaCintura.value > 160 
      ? 'Debe ser máximo 160 cm' 
      : '';
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 ">Medidas del cuerpo</h1>
    <h2 class="mb-4">SOMATOMETRÍA</h2>

    <div class="flex gap-4 mb-4">
      <div>
        <label for="peso">Peso (Kg)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="peso" min="45" max="200" step="0.1">
        <p v-if="mensajeErrorPeso" class="text-red-500 text-sm mt-1">{{ mensajeErrorPeso }}</p>
      </div>
      <div>
        <label for="altura">Altura (m)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="altura" step="0.01" min="1.40" max="2.20" />
        <p v-if="mensajeErrorAltura" class="text-red-500 text-sm mt-1">{{ mensajeErrorAltura }}</p>
      </div>
    </div>

    <label for="indiceMasaCorporal">Índice de Masa Corporal</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
          v-model="indiceMasaCorporal" readonly title="El IMC se calcula automáticamente en función al peso y altura" />
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
          v-model="categoriaIMC" readonly title="La categoría se determina automáticamente según su IMC"/>
      </div>
    </div>

    <label for="circunferenciaCintura">Circunferencia de Cintura</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="circunferenciaCintura" min="50"/>
        <p v-if="mensajeErrorCircunferenciaCintura" class="text-red-500 text-sm mt-1">{{ mensajeErrorCircunferenciaCintura }}</p>
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
          v-model="categoriaCircunferenciaCintura" readonly title="Clasificación automática según el sexo y la circunferencia de cintura ingresada" />
      </div>
    </div>
  </div>
</template>
