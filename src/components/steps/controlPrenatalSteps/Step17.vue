<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valores locales
const eneroFondoUterino = ref('');

// Función para determinar categoría del fondo uterino según semana de gestación
const determinarCategoriaFondoUterino = (fondoUterino, semanaGestacion) => {
  if (!fondoUterino || fondoUterino === '') return '';
  
  const fondoUterinoNum = parseFloat(fondoUterino);
  if (isNaN(fondoUterinoNum)) return '';
  
  let categoria = '';
  let color = '';
  let bgColor = '';
  let borderColor = '';
  
  // Si no hay semana de gestación, solo validar rango general
  if (!semanaGestacion) {
    if (fondoUterinoNum < 0) {
      categoria = 'Valor inválido';
      color = 'text-red-800';
      bgColor = 'bg-red-100';
      borderColor = 'border-red-300';
    } else if (fondoUterinoNum >= 0 && fondoUterinoNum <= 40) {
      categoria = 'Rango normal';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
    } else {
      categoria = 'Fuera de rango';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
    return { categoria, color, bgColor, borderColor };
  }
  
  const semanaNum = parseInt(semanaGestacion);
  if (isNaN(semanaNum)) return '';
  
  // Clasificación según estándares médicos por semana de gestación
  if (semanaNum >= 12 && semanaNum <= 16) {
    // Primer trimestre
    if (fondoUterinoNum >= 0 && fondoUterinoNum <= 3) {
      categoria = 'Normal para 12-16 semanas';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
    } else if (fondoUterinoNum > 3 && fondoUterinoNum <= 5) {
      categoria = 'Ligeramente elevado';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else {
      categoria = 'Fuera de rango esperado';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
  } else if (semanaNum >= 20 && semanaNum <= 24) {
    // Segundo trimestre temprano
    if (fondoUterinoNum >= 16 && fondoUterinoNum <= 24) {
      categoria = 'Normal para 20-24 semanas';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
    } else if (fondoUterinoNum >= 12 && fondoUterinoNum < 16) {
      categoria = 'Ligeramente bajo';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else if (fondoUterinoNum > 24 && fondoUterinoNum <= 28) {
      categoria = 'Ligeramente elevado';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else {
      categoria = 'Fuera de rango esperado';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
  } else if (semanaNum >= 28 && semanaNum <= 32) {
    // Segundo trimestre tardío
    if (fondoUterinoNum >= 24 && fondoUterinoNum <= 32) {
      categoria = 'Normal para 28-32 semanas';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
    } else if (fondoUterinoNum >= 20 && fondoUterinoNum < 24) {
      categoria = 'Ligeramente bajo';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else if (fondoUterinoNum > 32 && fondoUterinoNum <= 36) {
      categoria = 'Ligeramente elevado';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else {
      categoria = 'Fuera de rango esperado';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
  } else if (semanaNum >= 36 && semanaNum <= 40) {
    // Tercer trimestre
    if (fondoUterinoNum >= 32 && fondoUterinoNum <= 40) {
      categoria = 'Normal para 36-40 semanas';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
    } else if (fondoUterinoNum >= 28 && fondoUterinoNum < 32) {
      categoria = 'Ligeramente bajo';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else if (fondoUterinoNum > 40 && fondoUterinoNum <= 44) {
      categoria = 'Ligeramente elevado';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
    } else {
      categoria = 'Fuera de rango esperado';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
  } else {
    // Otras semanas
    if (fondoUterinoNum >= 0 && fondoUterinoNum <= 40) {
      categoria = 'Rango general normal';
      color = 'text-blue-600';
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200';
    } else {
      categoria = 'Fuera de rango general';
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
    }
  }
  
  return { categoria, color, bgColor, borderColor };
};

// Función para calcular fondo uterino esperado según semana de gestación
const calcularFondoUterinoEsperado = (semana) => {
  if (!semana || semana === '') return null;
  
  const semanaNum = parseInt(semana);
  if (isNaN(semanaNum)) return null;
  
  // Fórmula aproximada: fondo uterino ≈ semana de gestación
  let fondoEsperado = semanaNum;
  let rangoMin = Math.max(0, semanaNum - 2);
  let rangoMax = semanaNum + 2;
  
  return { fondoEsperado, rangoMin, rangoMax };
};

onMounted(() => {
  // Verificar si formDataControlPrenatal.eneroFondoUterino tiene un valor y establecerlo
  if (formDataControlPrenatal.eneroFondoUterino) {
    eneroFondoUterino.value = formDataControlPrenatal.eneroFondoUterino.toString();
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para eneroFondoUterino
  if (!formDataControlPrenatal.eneroFondoUterino) {
    formDataControlPrenatal.eneroFondoUterino = eneroFondoUterino.value ? parseFloat(eneroFondoUterino.value) : undefined;
  }
});

// Sincronizar eneroFondoUterino con formData
watch(eneroFondoUterino, (newValue) => {
  if (newValue && newValue !== '') {
    formDataControlPrenatal.eneroFondoUterino = parseFloat(newValue);
  } else {
    formDataControlPrenatal.eneroFondoUterino = undefined;
  }
});

// Computed para la categoría del fondo uterino
const categoriaFondoUterinoComputed = computed(() => {
  return determinarCategoriaFondoUterino(eneroFondoUterino.value, formDataControlPrenatal.eneroSdg);
});

// Computed para el fondo uterino esperado
const fondoUterinoEsperadoComputed = computed(() => {
  return calcularFondoUterinoEsperado(formDataControlPrenatal.eneroSdg);
});

// Validaciones reactivas
const mensajeErrorFondoUterino = computed(() => {
  if (!eneroFondoUterino.value || eneroFondoUterino.value === '') return '';
  
  const fondoUterino = parseFloat(eneroFondoUterino.value);
  if (isNaN(fondoUterino)) return 'El fondo uterino debe ser un número válido';
  
  if (fondoUterino < 0) return 'Debe ser mínimo 0 centímetros';
  if (fondoUterino > 50) return 'Debe ser máximo 50 centímetros';
  
  return '';
});

// Función para seleccionar un preset común
const seleccionarPreset = (valor) => {
  eneroFondoUterino.value = valor.toString();
};

// Presets de fondo uterino comunes según semanas de gestación
const presetsFondoUterino = [
  { valor: 3, descripcion: '3 cm', texto: '3 cm (12-16 semanas)' },
  { valor: 20, descripcion: '20 cm', texto: '20 cm (20-24 semanas)' },
  { valor: 28, descripcion: '28 cm', texto: '28 cm (28-32 semanas)' },
  { valor: 32, descripcion: '32 cm', texto: '32 cm (32-36 semanas)' },
  { valor: 36, descripcion: '36 cm', texto: '36 cm (36-40 semanas)' },
  { valor: 40, descripcion: '40 cm', texto: '40 cm (40+ semanas)' }
];
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Enero</h1>
    
    <!-- FONDO UTERINO -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">FONDO UTERINO</h2>
      
      <div class="mb-4">
        
        <!-- Presets de fondo uterino comunes -->
        <div class="mb-4 mt-4">
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="preset in presetsFondoUterino"
              :key="preset.valor"
              @click="seleccionarPreset(preset.valor)"
              type="button"
              class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
              :class="eneroFondoUterino === preset.valor.toString() 
                ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
            >
              {{ preset.descripcion }}
            </button>
          </div>
        </div>

        <hr class="my-4 border-gray-300">

        <!-- Input personalizado -->
        <div class="mb-4">
          <div class="flex items-center justify-center gap-3">
            <label for="eneroFondoUterino" class="font-medium text-gray-700">Personalizar:</label>
            <input
              id="eneroFondoUterino"
              v-model="eneroFondoUterino"
              type="number"
              min="0"
              max="50"
              step="0.5"
              placeholder="Ej: 25.5"
              class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
            />
            <span class="text-gray-600 text-sm">centímetros</span>
          </div>
          
          <!-- Mensaje de error -->
          <p v-if="mensajeErrorFondoUterino" class="text-red-500 text-sm mt-2 text-center">
            ⚠️ {{ mensajeErrorFondoUterino }}
          </p>
        </div>
      </div>
    </div>

    <!-- RESULTADO DEL FONDO UTERINO -->
    <div class="mb-4">
      <div v-if="eneroFondoUterino && !mensajeErrorFondoUterino" class="mb-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p class="text-sm text-emerald-800 mb-2">
            <span class="font-medium">✅ F. UT. a registrar:</span>
          </p>
          <p class="text-2xl font-bold text-emerald-700 text-center">
            {{ eneroFondoUterino }} cm
          </p>
        </div>
        
        <!-- Categoría del fondo uterino -->
        <div v-if="categoriaFondoUterinoComputed.categoria" class="mt-3 p-3 rounded-lg border" 
             :class="[categoriaFondoUterinoComputed.bgColor, categoriaFondoUterinoComputed.borderColor]">
          <p class="text-sm text-center" :class="categoriaFondoUterinoComputed.color">
            <span class="font-medium">{{ categoriaFondoUterinoComputed.categoria }}</span>
          </p>
        </div>
      </div>
      
      <div v-else-if="eneroFondoUterino && mensajeErrorFondoUterino" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700 text-center">
          ⚠️ {{ mensajeErrorFondoUterino }}
        </p>
      </div>
      
      <div v-else class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-600 text-center">
          Ingrese la altura del fondo uterino para ver el resultado
        </p>
      </div>
    </div>

    <!-- CÁLCULO ESPERADO DEL FONDO UTERINO -->
    <div v-if="fondoUterinoEsperadoComputed && formDataControlPrenatal.eneroSdg" class="mb-2">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold mb-2 text-blue-800">📏 Fondo uterino esperado según SDG:</h3>
        <div class="text-center">
          <p class="text-lg font-bold text-blue-800">
            {{ fondoUterinoEsperadoComputed.fondoEsperado }} cm
          </p>
          <p class="text-sm text-blue-600 mt-1">
            Rango esperado: {{ fondoUterinoEsperadoComputed.rangoMin }}-{{ fondoUterinoEsperadoComputed.rangoMax }} cm
          </p>
        </div>
      </div>
    </div>

    <!-- INFORMACIÓN ADICIONAL -->
    <div class="mb-6">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-semibold mb-2 text-gray-700">📋 Clasificación por trimestres:</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><span class="font-normal text-blue-600">Primer trimestre:</span> 0-3 cm</li>
              <li><span class="font-normal text-green-600">Segundo trimestre:</span> 12-24 cm</li>
              <li><span class="font-normal text-orange-600">Tercer trimestre:</span> 32-40 cm</li>
              <li><span class="font-normal text-purple-600">Postérmino:</span> 40+ cm</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Consideraciones:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Se mide desde la sínfisis púbica</li>
              <li>• Generalmente ≈ semana de gestación</li>
              <li>• Varía según constitución materna</li>
            </ul>
          </div>
        </div>
        
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
</style>
