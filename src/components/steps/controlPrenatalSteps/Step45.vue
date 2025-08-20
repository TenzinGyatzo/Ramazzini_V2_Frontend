<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valores locales
const junioFcf = ref('');
const categoriaFcf = ref('');

// Función para determinar categoría de FCF
const determinarCategoriaFcf = (fcf) => {
  if (!fcf || fcf === '') return '';
  
  const fcfNum = parseInt(fcf);
  if (isNaN(fcfNum)) return '';
  
  let categoria = '';
  let color = '';
  let bgColor = '';
  let borderColor = '';
  
  // Clasificación según estándares médicos
  if (fcfNum < 110) {
    categoria = 'Bradicardia';
    color = 'text-red-800';
    bgColor = 'bg-red-100';
    borderColor = 'border-red-300';
  } else if (fcfNum >= 110 && fcfNum <= 160) {
    categoria = 'Normal';
    color = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
  } else if (fcfNum > 160 && fcfNum <= 180) {
    categoria = 'Taquicardia leve';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
  } else if (fcfNum > 180) {
    categoria = 'Taquicardia severa';
    color = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
  }
  
  return { categoria, color, bgColor, borderColor };
};

onMounted(() => {
  // Verificar si formDataControlPrenatal.junioFcf tiene un valor y establecerlo
  if (formDataControlPrenatal.junioFcf) {
    junioFcf.value = formDataControlPrenatal.junioFcf.toString();
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para junioFcf
  if (!formDataControlPrenatal.junioFcf) {
    formDataControlPrenatal.junioFcf = junioFcf.value ? parseInt(junioFcf.value) : undefined;
  }
});

// Sincronizar junioFcf con formData
watch(junioFcf, (newValue) => {
  if (newValue && newValue !== '') {
    formDataControlPrenatal.junioFcf = parseInt(newValue);
  } else {
    formDataControlPrenatal.junioFcf = undefined;
  }
});

// Computed para la categoría de FCF
const categoriaFcfComputed = computed(() => {
  return determinarCategoriaFcf(junioFcf.value);
});

// Validaciones reactivas
const mensajeErrorFcf = computed(() => {
  if (!junioFcf.value || junioFcf.value === '') return '';
  
  const fcf = parseInt(junioFcf.value);
  if (isNaN(fcf)) return 'La frecuencia cardíaca fetal debe ser un número válido';
  
  if (fcf < 60) return 'Debe ser mínimo 60 latidos por minuto';
  if (fcf > 250) return 'Debe ser máximo 250 latidos por minuto';
  
  return '';
});

// Función para seleccionar un preset común
const seleccionarPreset = (valor) => {
  junioFcf.value = valor.toString();
};

// Presets de FCF comunes
const presetsFcf = [
  { valor: 120, descripcion: '120 lpm', texto: '120 latidos por minuto' },
  { valor: 130, descripcion: '130 lpm', texto: '130 latidos por minuto' },
  { valor: 140, descripcion: '140 lpm', texto: '140 latidos por minuto' },
  { valor: 150, descripcion: '150 lpm', texto: '150 latidos por minuto' },
  { valor: 160, descripcion: '160 lpm', texto: '160 latidos por minuto' }
];
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Junio</h1>
    
    <!-- FRECUENCIA CARDIACA FETAL -->
    <div class="mb-6">
      <h2 class="font-semibold mb-3 text-gray-700">FRECUENCIA CARDIACA FETAL (FCF)</h2>
      
      <div class="mb-4">
        
        <!-- Presets de FCF comunes -->
        <div class="mb-4 mt-4">
          <div class="grid grid-cols-5 gap-3">
            <button
              v-for="preset in presetsFcf"
              :key="preset.valor"
              @click="seleccionarPreset(preset.valor)"
              type="button"
              class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
              :class="junioFcf === preset.valor.toString() 
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
            <label for="junioFcf" class="font-medium text-gray-700">Personalizar:</label>
            <input
              id="junioFcf"
              v-model="junioFcf"
              type="number"
              min="60"
              max="250"
              placeholder="Ej: 135"
              class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
            />
            <span class="text-gray-600 text-sm">lpm</span>
          </div>
          
          <!-- Mensaje de error -->
          <p v-if="mensajeErrorFcf" class="text-red-500 text-sm mt-2 text-center">
            ⚠️ {{ mensajeErrorFcf }}
          </p>
        </div>
      </div>
    </div>

    <!-- RESULTADO DE FCF -->
    <div class="mb-6">
      <div v-if="junioFcf && !mensajeErrorFcf" class="mb-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p class="text-sm text-emerald-800 mb-2">
            <span class="font-medium">✅ F.C.F. a registrar:</span>
          </p>
          <p class="text-2xl font-bold text-emerald-700 text-center">
            {{ junioFcf }} latidos por minuto
          </p>
        </div>
        
        <!-- Categoría de FCF -->
        <div v-if="categoriaFcfComputed.categoria" class="mt-2 p-3 rounded-lg border" 
             :class="[categoriaFcfComputed.bgColor, categoriaFcfComputed.borderColor]">
          <p class="text-sm text-center" :class="categoriaFcfComputed.color">
            <span class="font-medium">{{ categoriaFcfComputed.categoria }}</span>
          </p>
        </div>
      </div>
      
      <div v-else-if="junioFcf && mensajeErrorFcf" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700 text-center">
          ⚠️ {{ mensajeErrorFcf }}
        </p>
      </div>
      
      <div v-else class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-600 text-center">
          Ingrese la frecuencia cardíaca fetal para ver el resultado
        </p>
      </div>
    </div>

    <!-- INFORMACIÓN ADICIONAL -->
    <div class="mb-6">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-semibold mb-2 text-gray-700">📋 Clasificación de F. C. F.</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><span class="font-normal text-red-800">Bradicardia:</span> &lt;110 lpm</li>
              <li><span class="font-normal text-green-600">Normal:</span> 110-160 lpm</li>
              <li><span class="font-normal text-yellow-600">Taquicardia leve:</span> 161-180 lpm</li>
              <li><span class="font-normal text-red-600">Taquicardia severa:</span> &gt;180 lpm</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Consideraciones:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Puede variar según la edad gestacional</li>
              <li>• Se mide con doppler fetal</li>
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
