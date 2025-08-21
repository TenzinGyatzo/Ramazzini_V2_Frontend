<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valores locales
const eneroSdg = ref('');

// Función para determinar categoría de semana de gestación
const determinarCategoriaGestacion = (semana) => {
  if (!semana || semana === '') return '';
  
  const semanaNum = parseInt(semana);
  if (isNaN(semanaNum)) return '';
  
  let categoria = '';
  let color = '';
  let bgColor = '';
  let borderColor = '';
  
  // Clasificación según estándares médicos
  if (semanaNum < 20) {
    categoria = 'Primer trimestre';
    color = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
  } else if (semanaNum >= 20 && semanaNum <= 36) {
    categoria = 'Segundo trimestre';
    color = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
  } else if (semanaNum >= 37 && semanaNum <= 40) {
    categoria = 'Tercer trimestre';
    color = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
  } else if (semanaNum > 40) {
    categoria = 'Postérmino';
    color = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
  }
  
  return { categoria, color, bgColor, borderColor };
};

// Función para calcular la edad gestacional en semanas y días
const calcularEdadGestacional = (fum) => {
  if (!fum || fum === 'No recuerda') return null;
  
  const fechaFUM = new Date(fum);
  const fechaActual = new Date();
  
  if (isNaN(fechaFUM.getTime())) return null;
  
  const diferenciaTiempo = fechaActual.getTime() - fechaFUM.getTime();
  const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
  const semanas = Math.floor(diferenciaDias / 7);
  const dias = diferenciaDias % 7;
  
  return { semanas, dias };
};

onMounted(() => {
  // Verificar si formDataControlPrenatal.eneroSdg tiene un valor y establecerlo
  if (formDataControlPrenatal.eneroSdg) {
    eneroSdg.value = formDataControlPrenatal.eneroSdg.toString();
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga los valores convertidos a números
  formDataControlPrenatal.eneroSdg = eneroSdg.value ? parseInt(eneroSdg.value) : null;
});

// Sincronizar eneroSdg con formData
watch(eneroSdg, (newValue) => {
  // Convertir a número antes de almacenar
  const sdgNum = newValue ? parseInt(newValue) : null;
  formDataControlPrenatal.eneroSdg = sdgNum;
});

// Computed para la categoría de gestación
const categoriaGestacionComputed = computed(() => {
  return determinarCategoriaGestacion(eneroSdg.value);
});

// Computed para la edad gestacional calculada
const edadGestacionalCalculada = computed(() => {
  return calcularEdadGestacional(formDataControlPrenatal.fum);
});

// Validaciones reactivas
const mensajeErrorSemana = computed(() => {
  if (!eneroSdg.value || eneroSdg.value === '') return '';
  
  const semana = parseInt(eneroSdg.value);
  if (isNaN(semana)) return 'La semana de gestación debe ser un número válido';
  
  if (semana < 1) return 'Debe ser mínimo 1 semana';
  if (semana > 45) return 'Debe ser máximo 45 semanas';
  
  return '';
});

// Función para seleccionar un preset común
const seleccionarPreset = (valor) => {
  eneroSdg.value = valor.toString();
};

// Presets de semanas de gestación comunes
const presetsSemanas = [
  { valor: 12, descripcion: '12 semanas', texto: '12 semanas (3 meses)' },
  { valor: 20, descripcion: '20 semanas', texto: '20 semanas (5 meses)' },
  { valor: 24, descripcion: '24 semanas', texto: '24 semanas (6 meses)' },
  { valor: 28, descripcion: '28 semanas', texto: '28 semanas (7 meses)' },
  { valor: 32, descripcion: '32 semanas', texto: '32 semanas (8 meses)' },
  { valor: 36, descripcion: '36 semanas', texto: '36 semanas (9 meses)' },
  { valor: 38, descripcion: '38 semanas', texto: '38 semanas (9.5 meses)' },
  { valor: 40, descripcion: '40 semanas', texto: '40 semanas (10 meses)' }
];
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Enero</h1>
    
    <!-- SEMANA DE GESTACIÓN -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">SEMANA DE GESTACIÓN</h2>
      
      <div class="mb-4">
        
        <!-- Presets de semanas comunes -->
        <div class="mb-4 mt-4">
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="preset in presetsSemanas"
              :key="preset.valor"
              @click="seleccionarPreset(preset.valor)"
              type="button"
              class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
              :class="eneroSdg === preset.valor.toString() 
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
            <label for="eneroSdg" class="font-medium text-gray-700">Personalizar:</label>
            <input
              id="eneroSdg"
              v-model="eneroSdg"
              type="number"
              min="1"
              max="45"
              placeholder="Ej: 25"
              class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
            />
            <span class="text-gray-600 text-sm">semanas</span>
          </div>
          
          <!-- Mensaje de error -->
          <p v-if="mensajeErrorSemana" class="text-red-500 text-sm mt-2 text-center">
            ⚠️ {{ mensajeErrorSemana }}
          </p>
        </div>
      </div>
    </div>

    <!-- RESULTADO DE SEMANA DE GESTACIÓN -->
    <div class="mb-6">
      <div v-if="eneroSdg && !mensajeErrorSemana" class="mb-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p class="text-sm text-emerald-800 mb-2">
            <span class="font-medium">✅ S.D.G. a registrar:</span>
          </p>
          <p class="text-2xl font-bold text-emerald-700 text-center">
            {{ eneroSdg }} semanas
          </p>
        </div>
        
        <!-- Categoría de gestación -->
        <div v-if="categoriaGestacionComputed.categoria" class="mt-2 p-3 rounded-lg border" 
             :class="[categoriaGestacionComputed.bgColor, categoriaGestacionComputed.borderColor]">
          <p class="text-sm text-center" :class="categoriaGestacionComputed.color">
            <span class="font-medium">{{ categoriaGestacionComputed.categoria }}</span>
          </p>
        </div>
      </div>
      
      <div v-else-if="eneroSdg && mensajeErrorSemana" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700 text-center">
          ⚠️ {{ mensajeErrorSemana }}
        </p>
      </div>
      
      <div v-else class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-600 text-center">
          Ingrese la semana de gestación para ver el resultado
        </p>
      </div>
    </div>

    <!-- CÁLCULO AUTOMÁTICO DE EDAD GESTACIONAL -->
    <div v-if="edadGestacionalCalculada" class="mb-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold mb-2 text-blue-800">📅 Cálculo automático de edad gestacional:</h3>
        <p class="text-sm text-blue-700 mb-2">
          Basado en la FUM registrada: 
          <span class="font-semibold">{{ convertirFechaISOaDDMMYYYY(formDataControlPrenatal.fum) || 'No disponible' }}</span>
        </p>
        <div class="text-center">
          <p class="text-lg font-bold text-blue-800">
            {{ edadGestacionalCalculada.semanas }} semanas y {{ edadGestacionalCalculada.dias }} días
          </p>
          <p class="text-sm text-blue-600 mt-1">
            ({{ Math.floor(edadGestacionalCalculada.semanas / 4) }} meses aproximadamente)
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
              <li><span class="font-normal text-blue-600">Primer trimestre:</span> 1-19 semanas</li>
              <li><span class="font-normal text-green-600">Segundo trimestre:</span> 20-36 semanas</li>
              <li><span class="font-normal text-orange-600">Tercer trimestre:</span> 37-40 semanas</li>
              <li><span class="font-normal text-red-600">Postérmino:</span> &gt;40 semanas</li>
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
