const fs = require('fs');
const path = require('path');

const meses = [
  'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const stepNumbers = [41, 48, 55, 62, 69, 76, 83, 90]; // 13 + (index * 7)

meses.forEach((mes, index) => {
  const stepNumber = stepNumbers[index];
  const mesCapitalized = mes.charAt(0).toUpperCase() + mes.slice(1);
  
  const stepContent = `// Step${stepNumber}.vue - Control Prenatal - ${mesCapitalized}
// Este archivo fue generado automáticamente

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - ${mesCapitalized}</h1>
    
    <!-- PESO -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">PESO (Kg)</h2>
      <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuál fue el peso registrado durante el control prenatal del mes de ${mes}?</p>
      
      <FormKit 
        type="number" 
        name="${mes}Peso" 
        placeholder="Ej: 69.5" 
        v-model="${mes}Peso"
        step="0.1"
        min="30"
        max="200"
        :validation="[
          ['required', 'El peso es requerido'],
          ['min:30', 'El peso no puede ser menor a 30 kg'],
          ['max:200', 'El peso no puede ser mayor a 200 kg']
        ]"
      />
    </div>

    <!-- IMC -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">ÍNDICE DE MASA CORPORAL (IMC)</h2>
      <p class="font-medium mb-2 text-gray-800 leading-5">El IMC se calcula automáticamente basándose en el peso y la talla registrada.</p>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-blue-800 mb-2">
          <strong>Fórmula IMC:</strong> Peso (kg) / Talla² (m²)
        </p>
        <p class="text-sm text-blue-700">
          Talla registrada: <span class="font-semibold">{{ formDataControlPrenatal.talla || 'No disponible' }}</span>
        </p>
      </div>

      <div class="font-light">
        <input type="number"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="${mes}Imc"
            step="0.1"
            min="10"
            max="60"
            :placeholder="'IMC calculado automáticamente'"
            :disabled="!${mes}Peso || !formDataControlPrenatal.talla"
            readonly>
      </div>
      
      <div v-if="!formDataControlPrenatal.talla" class="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <p class="text-sm text-orange-700">
          ⚠️ Para calcular el IMC, primero debe capturar la talla en el paso correspondiente.
        </p>
      </div>
    </div>

    <!-- Resumen de selección -->
    <div v-if="${mes}Peso || ${mes}Imc" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700 mb-2">
        <span class="font-medium">Peso registrado: </span> 
        <span class="text-emerald-700 font-semibold">{{ ${mes}Peso || 'No especificado' }} kg</span>
      </p>
      <p class="text-sm text-gray-700">
        <span class="font-medium">IMC calculado: </span> 
        <span v-if="${mes}Imc" class="text-emerald-700 font-semibold">{{ ${mes}Imc }}</span>
        <span v-else class="text-orange-600 font-semibold">Requiere talla para cálculo</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valores locales
const ${mes}Peso = ref('');
const ${mes}Imc = ref('');

// Función para calcular IMC
const calcularIMC = (peso, talla) => {
  if (!peso || !talla) return '';
  
  const pesoNum = parseFloat(peso);
  const tallaMetros = parseFloat(talla) / 100; // Convertir cm a metros
  
  if (isNaN(pesoNum) || isNaN(tallaMetros) || tallaMetros <= 0) return '';
  
  const imc = pesoNum / (tallaMetros * tallaMetros);
  return imc.toFixed(1);
};

onMounted(() => {
  // Verificar si formDataControlPrenatal tiene valores y establecerlos
  if (formDataControlPrenatal.${mes}Peso) {
    ${mes}Peso.value = formDataControlPrenatal.${mes}Peso;
  }
  if (formDataControlPrenatal.${mes}Imc) {
    ${mes}Imc.value = formDataControlPrenatal.${mes}Imc;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga los valores
  formDataControlPrenatal.${mes}Peso = ${mes}Peso.value || '';
  formDataControlPrenatal.${mes}Imc = ${mes}Imc.value || '';
});

// Sincronizar ${mes}Peso con formData
watch(${mes}Peso, (newValue) => {
  formDataControlPrenatal.${mes}Peso = newValue;
  
  // Calcular IMC automáticamente cuando cambie el peso
  if (newValue && formDataControlPrenatal.talla) {
    const imcCalculado = calcularIMC(newValue, formDataControlPrenatal.talla);
    ${mes}Imc.value = imcCalculado;
    formDataControlPrenatal.${mes}Imc = imcCalculado;
  } else {
    ${mes}Imc.value = '';
    formDataControlPrenatal.${mes}Imc = '';
  }
});

// Watch para recalcular IMC cuando cambie la talla
watch(() => formDataControlPrenatal.talla, (newTalla) => {
  if (newTalla && ${mes}Peso.value) {
    const imcCalculado = calcularIMC(${mes}Peso.value, newTalla);
    ${mes}Imc.value = imcCalculado;
    formDataControlPrenatal.${mes}Imc = imcCalculado;
  }
});

// Computed para determinar si se puede calcular IMC
const puedeCalcularIMC = computed(() => {
  return ${mes}Peso.value && formDataControlPrenatal.talla;
});
</script>

<style scoped>
.step-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6b7280;
  font-size: 1.125rem;
}

.step-content {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}
</style>`;

  const filePath = path.join(__dirname, '..', 'src', 'components', 'steps', 'controlPrenatalSteps', `Step${stepNumber}.vue`);
  
  fs.writeFileSync(filePath, stepContent);
  console.log(`✅ Generado: Step${stepNumber}.vue para ${mesCapitalized}`);
});

console.log('\\n🎉 Todos los steps han sido generados exitosamente!');
console.log('\\n📋 Resumen de steps generados:');
stepNumbers.forEach((stepNumber, index) => {
  console.log(`   Step${stepNumber}: ${meses[index].charAt(0).toUpperCase() + meses[index].slice(1)}`);
});
console.log('\\n💡 Recuerda que cada step captura tanto peso como IMC del mismo mes.');
console.log('💡 El IMC se calcula automáticamente cuando se ingresa el peso y existe la talla.');
