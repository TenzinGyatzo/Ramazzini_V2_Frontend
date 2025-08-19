import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const meses = [
  'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const stepNumbers = [20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90];

meses.forEach((mes, index) => {
  const stepNumber = stepNumbers[index];
  const mesCapitalized = mes.charAt(0).toUpperCase() + mes.slice(1);
  const mesPeso = `${mes}Peso`;
  const mesImc = `${mes}Imc`;
  
  const stepContent = `<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal, formDataExploracionFisica } = useFormDataStore();

// Valores locales
const ${mesPeso} = ref('');
const ${mesImc} = ref('');
const alturaLocal = ref('');

// Computed para determinar la altura disponible y su fuente
const alturaDisponible = computed(() => {
  return formDataExploracionFisica.altura || formDataControlPrenatal.altura || alturaLocal.value;
});

const alturaParaIMC = computed(() => {
  return formDataExploracionFisica.altura || formDataControlPrenatal.altura || alturaLocal.value;
});

const fuenteAltura = computed(() => {
  if (formDataExploracionFisica.altura) return 'exploracion';
  if (formDataControlPrenatal.altura) return 'controlPrenatal';
  if (alturaLocal.value) return 'local';
  return null;
});

// Función para calcular IMC
const calcularIMC = (peso, altura) => {
  if (!peso || !altura) return '';
  
  const pesoNum = parseFloat(peso);
  const alturaMetros = parseFloat(altura); // Ya está en metros
  
  if (isNaN(pesoNum) || isNaN(alturaMetros) || alturaMetros <= 0) return '';
  
  const imc = pesoNum / (alturaMetros * alturaMetros);
  return imc.toFixed(1);
};

onMounted(() => {
  // Verificar si formDataControlPrenatal tiene valores y establecerlos
  if (formDataControlPrenatal.${mesPeso}) {
    ${mesPeso}.value = formDataControlPrenatal.${mesPeso};
  }
  if (formDataControlPrenatal.${mesImc}) {
    ${mesImc}.value = formDataControlPrenatal.${mesImc};
  }
  if (formDataControlPrenatal.altura) {
    alturaLocal.value = formDataControlPrenatal.altura;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga los valores
  formDataControlPrenatal.${mesPeso} = ${mesPeso}.value || '';
  formDataControlPrenatal.${mesImc} = ${mesImc}.value || '';
  if (alturaLocal.value) {
    formDataControlPrenatal.altura = alturaLocal.value;
  }
});

// Sincronizar ${mesPeso} con formData
watch(${mesPeso}, (newValue) => {
  formDataControlPrenatal.${mesPeso} = newValue;
  
  // Calcular IMC automáticamente cuando cambie el peso
  if (newValue && alturaDisponible.value) {
    const imcCalculado = calcularIMC(newValue, alturaDisponible.value);
    ${mesImc}.value = imcCalculado;
    formDataControlPrenatal.${mesImc} = imcCalculado;
  } else {
    ${mesImc}.value = '';
    formDataControlPrenatal.${mesImc} = '';
  }
});

// Watch para recalcular IMC cuando cambie la altura
watch(alturaLocal, (newAltura) => {
  if (newAltura) {
    formDataControlPrenatal.altura = newAltura;
    
    // Recalcular IMC si ya existe peso
    if (${mesPeso}.value) {
      const imcCalculado = calcularIMC(${mesPeso}.value, newAltura);
      ${mesImc}.value = imcCalculado;
      formDataControlPrenatal.${mesImc} = imcCalculado;
    }
  }
});

// Watch para recalcular IMC cuando cambie la altura de exploración física
watch(() => formDataExploracionFisica.altura, (newAltura) => {
  if (newAltura && ${mesPeso}.value) {
    const imcCalculado = calcularIMC(${mesPeso}.value, newAltura);
    ${mesImc}.value = imcCalculado;
    formDataControlPrenatal.${mesImc} = imcCalculado;
  }
});

// Computed para determinar si se puede calcular IMC
const puedeCalcularIMC = computed(() => {
  return ${mesPeso}.value && alturaDisponible.value;
});

// Validaciones reactivas similares a Step2.vue
const mensajeErrorPeso = computed(() => {
  if (!${mesPeso}.value || ${mesPeso}.value === '') return '';
  
  const peso = parseFloat(${mesPeso}.value);
  if (isNaN(peso)) return 'El peso debe ser un número válido';
  
  if (peso < 45) return 'Debe ser mínimo 45 kg';
  if (peso > 200) return 'Debe ser máximo 200 kg';
  
  return '';
});

const mensajeErrorAltura = computed(() => {
  if (!alturaLocal.value || alturaLocal.value === '') return '';
  
  const altura = parseFloat(alturaLocal.value);
  if (isNaN(altura)) return 'La altura debe ser un número válido';
  
  if (altura < 1.4) return 'Debe ser mínimo 1.40 m';
  if (altura > 2.2) return 'Debe ser máximo 2.20 m';
  
  return '';
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - ${mesCapitalized}</h1>
    
    <!-- ALTURA -->
    <div class="mb-6">
      
      <!-- Si no hay altura disponible en ninguna fuente -->
      <div v-if="!formDataExploracionFisica.altura && !formDataControlPrenatal.altura && !alturaLocal" class="mb-4">
        <p class="font-medium mb-2 text-gray-800 leading-5">
          <span class="font-semibold mb-3 text-gray-700">ALTURA (m) - </span>
          <span class="text-orange-600 font-semibold">No se encontró altura previa registrada en la exploración física.</span>
          <br>
          Registre la altura de la trabajadora. 
        </p>
      </div>
      
      <!-- Si hay altura disponible pero se puede modificar -->
      <div v-else-if="formDataExploracionFisica.altura || formDataControlPrenatal.altura" class="mb-4">
        <p class="font-semibold mb-3 text-gray-700">
          ALTURA (m) - 
          <span class="font-semibold text-green-700">
            {{ formDataExploracionFisica.altura || formDataControlPrenatal.altura }} m
          </span>
          <span v-if="formDataExploracionFisica.altura" class="text-xs text-gray-600 ml-2">(de exploración física)</span>
          <span v-else class="text-xs text-gray-600 ml-2">(del control prenatal)</span>
        </p>
      </div>
      
      <!-- Campo de altura siempre visible cuando no hay en exploración física -->
      <input 
        v-if="!formDataExploracionFisica.altura"
        type="number" 
        name="altura" 
        placeholder="Ej: 1.65" 
        v-model="alturaLocal"
        step="0.01"
        min="1.4"
        max="2.2"
        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      />
      
      <!-- Mensaje de error para altura -->
      <p v-if="mensajeErrorAltura" class="text-red-500 text-sm mt-1">{{ mensajeErrorAltura }}</p>
    </div>
    
    <!-- PESO -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">PESO (Kg)</h2>
      <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuál fue el peso registrado durante el control prenatal del mes de ${mes}?</p>
      
      <input 
        type="number" 
        name="${mesPeso}" 
        placeholder="Ej: 65.5" 
        v-model="${mesPeso}"
        step="0.1"
        min="45"
        max="200"
        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      />
      
      <!-- Mensaje de error para peso -->
      <p v-if="mensajeErrorPeso" class="text-red-500 text-sm mt-1">{{ mensajeErrorPeso }}</p>
    </div>

    <!-- IMC -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">ÍNDICE DE MASA CORPORAL (IMC)</h2>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
        <p class="text-sm text-blue-800 mb-2">
          <strong>Fórmula IMC:</strong> Peso (kg) / Altura² (m²)
        </p>
        <p class="text-sm text-blue-700">
          <span v-if="alturaDisponible">
            Altura registrada: <span class="font-semibold text-green-700">{{ alturaParaIMC }} m</span>
            <span v-if="fuenteAltura === 'exploracion'" class="text-xs text-gray-600 ml-2">(de exploración física)</span>
            <span v-else class="text-xs text-gray-600 ml-2">(del control prenatal)</span>
          </span>
          <span v-else class="text-orange-600 font-semibold">No hay altura registrada</span>
        </p>
      </div>
      <div v-if="!alturaDisponible" class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <p class="text-sm text-orange-700">
          ⚠️ Para calcular el IMC, debe ingresar una altura en el campo superior.
        </p>
      </div>
      <div v-else-if="${mesImc}" class="mt-1 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p class="text-sm text-emerald-700">
              ✅ IMC calculado: <span class="font-semibold">{{ ${mesImc} }}</span>
          </p>
      </div>

      <p class="font-medium my-4 text-gray-800">Índice de Masa Corporal (IMC):</p>
      <div class="font-light mt-2">
        <input type="number"
            class="w-full p-3 border bg-gray-100 border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="${mesImc}"
            step="0.1"
            min="10"
            max="60"
            :placeholder="'IMC calculado automáticamente'"
            :disabled="!${mesPeso} || !alturaDisponible"
            readonly>
      </div>
      
    </div>

  </div>
</template>

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

  const fileName = `Step${stepNumber}.vue`;
  const filePath = path.join(__dirname, '..', 'src', 'components', 'steps', 'controlPrenatalSteps', fileName);
  
  fs.writeFileSync(filePath, stepContent);
  console.log(`✅ Generado: ${fileName}`);
});

console.log('🎉 Todos los steps han sido generados exitosamente!');
