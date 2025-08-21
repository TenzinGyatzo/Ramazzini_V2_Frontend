<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valores locales
const tensionArterialSistolica = ref('');
const tensionArterialDiastolica = ref('');
const tensionArterialCompleta = ref('');

// Función para validar y formatear tensión arterial
const validarTensionArterial = (sistolica, diastolica) => {
  if (!sistolica || !diastolica) return '';
  
  const sistolicaNum = parseInt(sistolica);
  const diastolicaNum = parseInt(diastolica);
  
  if (isNaN(sistolicaNum) || isNaN(diastolicaNum)) return '';
  
  // Validar que la sistólica sea mayor que la diastólica
  if (sistolicaNum <= diastolicaNum) return '';
  
  return `${sistolicaNum}/${diastolicaNum}`;
};

// Función para determinar categoría de tensión arterial (mismo algoritmo que Step3.vue)
const categoriaTensionArterial = computed(() => {
  if (!tensionArterialSistolica.value || !tensionArterialDiastolica.value) return '';
  
  const sistolica = parseInt(tensionArterialSistolica.value);
  const diastolica = parseInt(tensionArterialDiastolica.value);
  
  if (isNaN(sistolica) || isNaN(diastolica)) return '';
  
  let categoriaSistolica = '';
  let categoriaDiastolica = '';
  let categoria = '';

  // Clasificación sistólica (mismo que Step3.vue)
  if (sistolica <= 120) {
    categoriaSistolica = 'Óptima';
  } else if (sistolica >= 121 && sistolica <= 130) {
    categoriaSistolica = 'Normal';
  } else if (sistolica >= 131 && sistolica <= 139) {
    categoriaSistolica = 'Alta';
  } else if (sistolica >= 140 && sistolica <= 159) {
    categoriaSistolica = 'Hipertensión ligera';
  } else if (sistolica >= 160 && sistolica <= 179) {
    categoriaSistolica = 'Hipertensión moderada';
  } else {
    categoriaSistolica = 'Hipertensión severa';
  }

  // Clasificación diastólica (mismo que Step3.vue)
  if (diastolica <= 80) {
    categoriaDiastolica = 'Óptima';
  } else if (diastolica >= 81 && diastolica <= 85) {
    categoriaDiastolica = 'Normal';
  } else if (diastolica >= 86 && diastolica <= 89) {
    categoriaDiastolica = 'Alta';
  } else if (diastolica >= 90 && diastolica <= 99) {
    categoriaDiastolica = 'Hipertensión ligera';
  } else if (diastolica >= 100 && diastolica <= 109) {
    categoriaDiastolica = 'Hipertensión moderada';
  } else {
    categoriaDiastolica = 'Hipertensión severa';
  }

  // Determinación de categoría final (mismo que Step3.vue)
  if (categoriaSistolica === 'Hipertensión severa' || categoriaDiastolica === 'Hipertensión severa') {
    categoria = 'Hipertensión severa';
  } else if (categoriaSistolica === 'Hipertensión moderada' || categoriaDiastolica === 'Hipertensión moderada') {
    categoria = 'Hipertensión moderada';
  } else if (categoriaSistolica === 'Hipertensión ligera' || categoriaDiastolica === 'Hipertensión ligera') {
    categoria = 'Hipertensión ligera';
  } else if (categoriaSistolica === 'Alta' || categoriaDiastolica === 'Alta') {
    categoria = 'Alta';
  } else if (categoriaSistolica === 'Normal' || categoriaDiastolica === 'Normal') {
    categoria = 'Normal';
  } else {
    categoria = 'Óptima';
  }

  // Retornar con colores apropiados para la categoría
  let color, bgColor, borderColor;
  
  switch (categoria) {
    case 'Óptima':
      color = 'text-green-600';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      break;
    case 'Normal':
      color = 'text-blue-600';
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200';
      break;
    case 'Alta':
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      break;
    case 'Hipertensión ligera':
      color = 'text-orange-600';
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-200';
      break;
    case 'Hipertensión moderada':
      color = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      break;
    case 'Hipertensión severa':
      color = 'text-red-800';
      bgColor = 'bg-red-100';
      borderColor = 'border-red-300';
      break;
    default:
      color = 'text-gray-600';
      bgColor = 'bg-gray-50';
      borderColor = 'border-gray-200';
  }

  return { categoria, color, bgColor, borderColor };
});

onMounted(() => {
  // Verificar si formDataControlPrenatal tiene valores para abril y establecerlos
  if (formDataControlPrenatal.abrilTia) {
    // Extraer sistólica y diastólica del formato "120/80"
    const tensionCompleta = formDataControlPrenatal.abrilTia;
    const partes = tensionCompleta.split('/');
    if (partes.length === 2) {
      tensionArterialSistolica.value = partes[0];
      tensionArterialDiastolica.value = partes[1];
      tensionArterialCompleta.value = tensionCompleta;
    }
  }
});

onUnmounted(() => {
  // Guardar la tensión arterial completa en el campo de abril
  if (tensionArterialCompleta.value) {
    formDataControlPrenatal.abrilTia = tensionArterialCompleta.value;
  } else {
    formDataControlPrenatal.abrilTia = null;
  }
});

// Watch para sincronizar con formData y calcular tensión completa
watch([tensionArterialSistolica, tensionArterialDiastolica], ([sistolica, diastolica]) => {
  // Calcular tensión arterial completa
  const tensionCompleta = validarTensionArterial(sistolica, diastolica);
  tensionArterialCompleta.value = tensionCompleta;
  
  // Guardar en el campo de abril cuando se complete
  if (tensionCompleta) {
    formDataControlPrenatal.abrilTia = tensionCompleta;
  } else {
    formDataControlPrenatal.abrilTia = null;
  }
});

// Validaciones reactivas
const mensajeErrorSistolica = computed(() => {
  if (!tensionArterialSistolica.value || tensionArterialSistolica.value === '') return '';
  
  const sistolica = parseInt(tensionArterialSistolica.value);
  if (isNaN(sistolica)) return 'La presión sistólica debe ser un número válido';
  
  if (sistolica < 60) return 'Debe ser mínimo 60	';
  if (sistolica > 200) return 'Debe ser máximo 200';
  
  return '';
});

const mensajeErrorDiastolica = computed(() => {
  if (!tensionArterialDiastolica.value || tensionArterialDiastolica.value === '') return '';
  
  const diastolica = parseInt(tensionArterialDiastolica.value);
  if (isNaN(diastolica)) return 'La presión diastólica debe ser un número válido';
  
  if (diastolica < 40) return 'Debe ser mínimo 40';
  if (diastolica > 150) return 'Debe ser máximo 150';
  
  return '';
});

const mensajeErrorRelacion = computed(() => {
  if (!tensionArterialSistolica.value || !tensionArterialDiastolica.value) return '';
  
  const sistolica = parseInt(tensionArterialSistolica.value);
  const diastolica = parseInt(tensionArterialDiastolica.value);
  
  if (isNaN(sistolica) || isNaN(diastolica)) return '';
  
  if (sistolica <= diastolica) {
    return 'La presión sistólica debe ser mayor que la diastólica';
  }
  
  return '';
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Abril</h1>
    
         <!-- TENSIÓN ARTERIAL -->
     <div class="mb-6">
       <h2 class="font-semibold mb-3 text-gray-700">TENSIÓN ARTERIAL</h2>
       <div class="flex gap-4 mb-1">
         <div>
           <label for="tensionArterialSistolica">Sistólica (mmHg)</label>
           <input 
             type="number" 
             name="tensionArterialSistolica" 
             placeholder="Ej: 120" 
             v-model="tensionArterialSistolica"
             min="60"
             max="200"
             class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
           />
           <!-- Mensaje de error para sistólica -->
           <p v-if="mensajeErrorSistolica" class="text-red-500 text-sm mt-1">{{ mensajeErrorSistolica }}</p>
         </div>
         <div>
           <label for="tensionArterialDiastolica">Diastólica (mmHg)</label>
           <input 
             type="number" 
             name="tensionArterialDiastolica" 
             placeholder="Ej: 80" 
             v-model="tensionArterialDiastolica"
             min="40"
             max="150"
             class="w-full p-1.5 text-center mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
           />
           <!-- Mensaje de error para diastólica -->
           <p v-if="mensajeErrorDiastolica" class="text-red-500 text-sm mt-1">{{ mensajeErrorDiastolica }}</p>
         </div>
       </div>
     </div>

    <!-- MENSAJE DE ERROR DE RELACIÓN -->
    <div v-if="mensajeErrorRelacion" class="mb-6">
      <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">
          ⚠️ {{ mensajeErrorRelacion }}
        </p>
      </div>
    </div>

    <!-- TENSIÓN ARTERIAL COMPLETA -->
    <div class="mb-6">      
      <div v-if="tensionArterialCompleta" class="mb-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p class="text-sm text-emerald-800 mb-2">
            <span class="font-medium">✅ T.A. a registrar:</span>
          </p>
          <p class="text-2xl font-bold text-emerald-700 text-center">
            {{ tensionArterialCompleta }} mmHg
          </p>
        </div>
        
        <!-- Categoría de tensión arterial -->
        <div v-if="categoriaTensionArterial.categoria" class="mt-2 p-3 rounded-lg border" 
             :class="[categoriaTensionArterial.bgColor, categoriaTensionArterial.borderColor]">
          <p class="text-sm text-center" :class="categoriaTensionArterial.color">
            <span class="font-medium">{{ categoriaTensionArterial.categoria }}</span>
          </p>
        </div>
      </div>
      
      <div v-else class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-600 text-center">
          Complete ambos valores para ver la tensión arterial completa
        </p>
      </div>
    </div>

         <!-- INFORMACIÓN ADICIONAL -->
     <div class="mb-6">
       <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
         <h3 class="font-semibold mb-2 text-gray-700">📋 Clasificación de Tensión Arterial:</h3>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <h4 class="font-medium text-gray-700 mb-2">Presión Sistólica:</h4>
             <ul class="text-sm text-gray-600 space-y-1">
               <li><span class="font-normal text-green-600">Óptima:</span> ≤120 </li>
               <li><span class="font-normal text-blue-600">Normal:</span> 121-130 </li>
               <li><span class="font-normal text-yellow-600">Alta:</span> 131-139 </li>
               <li><span class="font-normal text-orange-600">H. ligera:</span> 140-159 </li>
               <li><span class="font-normal text-red-600">H. moderada:</span> 160-179</li>
               <li><span class="font-normal text-red-800">H. severa:</span> ≥180 </li>
             </ul>
           </div>
           <div>
             <h4 class="font-medium text-gray-700 mb-2">Presión Diastólica:</h4>
             <ul class="text-sm text-gray-600 space-y-1">
               <li><span class="font-normal text-green-600">Óptima:</span> ≤80 </li>
               <li><span class="font-normal text-blue-600">Normal:</span> 81-85 </li>
               <li><span class="font-normal text-yellow-600">Alta:</span> 86-89 </li>
               <li><span class="font-normal text-orange-600">H. ligera:</span> 90-99 </li>
               <li><span class="font-normal text-red-600">H. moderada:</span> 100-109</li>
               <li><span class="font-normal text-red-800">H. severa:</span> ≥110 </li>
             </ul>
           </div>
         </div>
         <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
           <p class="text-sm text-blue-800">
             <strong>💡 Nota:</strong> La categoría se asigna según el valor más alto entre la presión sistólica y la diastólica.
           </p>
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
