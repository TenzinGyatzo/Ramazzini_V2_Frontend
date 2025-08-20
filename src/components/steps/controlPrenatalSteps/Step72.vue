<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMesYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const noviembreFecha = ref('');

// Función para validar que la fecha sea del mes de noviembre
const validarFechaNoviembre = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
    
  if (mes !== 10) { // 10 = noviembre
    return 'La fecha debe ser del mes de noviembre';
  }
  
  return '';
};

// Función para validar que la fecha no sea futura
const validarFechaNoFutura = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const fechaActual = new Date();
  
  // Resetear la hora de la fecha actual para comparar solo fechas
  fechaActual.setHours(0, 0, 0, 0);
  
  if (fechaSeleccionada > fechaActual) {
    return 'La fecha no puede ser futura';
  }
  
  return '';
};

// Validación combinada
const mensajeErrorFecha = computed(() => {
  const errorNoFutura = validarFechaNoFutura(noviembreFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorNoviembre = validarFechaNoviembre(noviembreFecha.value);
  if (errorNoviembre) return errorNoviembre;
  
  return '';
});

// Función para obtener el año actual
const obtenerAnoActual = () => {
  return new Date().getFullYear();
};

onMounted(() => {
  // Verificar si formDataControlPrenatal.noviembreFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.noviembreFecha) {
    noviembreFecha.value = formDataControlPrenatal.noviembreFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para noviembreFecha
  if (!formDataControlPrenatal.noviembreFecha) {
    formDataControlPrenatal.noviembreFecha = noviembreFecha.value;
  }
});

// Sincronizar noviembreFecha con formData
watch(noviembreFecha, (newValue) => {
  formDataControlPrenatal.noviembreFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Noviembre</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de noviembre?</p>
      
      <FormKit 
        type="date" 
        name="noviembreFecha" 
        placeholder="Seleccione una fecha" 
        v-model="noviembreFecha"
        :min="`${obtenerAnoActual()}-11-01`"
        :max="`${obtenerAnoActual()}-11-30`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p class="text-sm text-emerald-800 mb-2">
            <span v-if="mensajeErrorFecha" class="font-medium">❌ Estado actual:</span>
            <span v-else-if="noviembreFecha" class="font-medium">✅ Fecha a registrar:</span>
            <span v-else class="font-medium">⚠️ Estado pendiente:</span>
        </p>
        <p class="text-2xl font-bold text-emerald-700 text-center">
            <span v-if="mensajeErrorFecha" class="text-red-600 font-semibold">{{ mensajeErrorFecha }}</span>
            <span v-else-if="noviembreFecha" class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMesYYYY(noviembreFecha) }}</span>
            <span v-else class="text-orange-600 font-semibold">Fecha no especificada</span>
        </p>
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