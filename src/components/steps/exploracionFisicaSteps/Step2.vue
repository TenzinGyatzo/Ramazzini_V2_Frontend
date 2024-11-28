<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';

const trabajadores = useTrabajadoresStore();
const { formDataExploracionFisica } = useFormDataStore();

const peso = ref(80);
const altura = ref(1.7);
const indiceMasaCorporal = ref(27.68);
const categoriaIMC = ref('Sobrepeso');
const circunferenciaCintura = ref(90);
const categoriaCircunferenciaCintura = ref('Bajo Riesgo');

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
    const imc = peso / ((altura / 100) ** 2); // Altura en cm convertida a m
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
  if (IMC < 18.5) {
    categoriaIMC.value = 'Bajo peso';
    formDataExploracionFisica.categoriaIMC = 'Bajo peso';
  } else if (IMC >= 18.5 && IMC <= 24.9) {
    categoriaIMC.value = 'Normal';
    formDataExploracionFisica.categoriaIMC = 'Normal';
  } else if (IMC >= 25 && IMC <= 29.9) {
    categoriaIMC.value = 'Sobrepeso';
    formDataExploracionFisica.categoriaIMC = 'Sobrepeso';
  } else if (IMC >= 30 && IMC <= 34.9) {
    categoriaIMC.value = 'Obesidad clase I';
    formDataExploracionFisica.categoriaIMC = 'Obesidad clase I';
  } else if (IMC >= 35 && IMC <= 39.9) {
    categoriaIMC.value = 'Obesidad clase II';
    formDataExploracionFisica.categoriaIMC = 'Obesidad clase II';
  } else if (IMC >= 40) {
    categoriaIMC.value = 'Obesidad clase III';
    formDataExploracionFisica.categoriaIMC = 'Obesidad clase III';
  }
}

function setCategoriaCircunferenciaCintura() {
  let circunferencia = formDataExploracionFisica.circunferenciaCintura
  if (trabajadores.currentTrabajador.sexo === 'Femenino') {
    if (circunferencia < 80) {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Bajo Riesgo';
    } else if (circunferencia >= 80 && circunferencia <= 89) {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Riesgo Aumentado';
    } else {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Alto Riesgo';
    }
  } else if (trabajadores.currentTrabajador.sexo === 'Masculino') {
    if (circunferencia < 94) {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Bajo Riesgo';
    } else if (circunferencia >= 94 && circunferencia <= 103) {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Riesgo Aumentado';
    } else {
      formDataExploracionFisica.categoriaCircunferenciaCintura = 'Alto Riesgo';
    }
  }
}
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
          v-model="peso" min="45" max="200">
      </div>
      <div>
        <label for="altura">Altura (m)</label>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="altura" step="0.01" min="1.40" max="2.20" />
      </div>
    </div>

    <label for="indiceMasaCorporal">Índice de Masa Corporal</label>
    <div class="flex gap-4 mb-4">
      <div>
        <input type="number"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="indiceMasaCorporal" readonly />
      </div>
      <div>
        <input type="text"
          class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="categoriaIMC" readonly />
      </div>
    </div>
  </div>
</template>
