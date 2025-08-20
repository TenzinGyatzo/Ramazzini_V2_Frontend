<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const septiembreFecha = ref('');

// Función para validar que la fecha sea del mes de septiembre
const validarFechaSeptiembre = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
  
  if (mes !== 8) { // 8 = septiembre
    return 'La fecha debe ser del mes de septiembre';
  }
  
  return '';
};

// Función para validar que la fecha no sea futura
const validarFechaNoFutura = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const fechaActual = new Date();
  
  if (fechaSeleccionada > fechaActual) {
    return 'La fecha no puede ser futura';
  }
  
  return '';
};

// Función para validar que la fecha sea requerida
const validarFechaRequerida = (fecha) => {
  if (!fecha || fecha === '') {
    return 'La fecha es requerida';
  }
  
  return '';
};

// Validación combinada
const mensajeErrorFecha = computed(() => {
  const errorRequerida = validarFechaRequerida(septiembreFecha.value);
  if (errorRequerida) return errorRequerida;
  
  const errorNoFutura = validarFechaNoFutura(septiembreFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorSeptiembre = validarFechaSeptiembre(septiembreFecha.value);
  if (errorSeptiembre) return errorSeptiembre;
  
  return '';
});

// Función para obtener el año actual
const obtenerAnoActual = () => {
  return new Date().getFullYear();
};

// Función para obtener el año anterior
const obtenerAnoAnterior = () => {
  return new Date().getFullYear() - 1;
};

onMounted(() => {
  // Verificar si formDataControlPrenatal.septiembreFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.septiembreFecha) {
    septiembreFecha.value = formDataControlPrenatal.septiembreFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para septiembreFecha
  if (!formDataControlPrenatal.septiembreFecha) {
    formDataControlPrenatal.septiembreFecha = septiembreFecha.value;
  }
});

// Sincronizar septiembreFecha con formData
watch(septiembreFecha, (newValue) => {
  formDataControlPrenatal.septiembreFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Septiembre</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de septiembre?</p>
      
      <FormKit 
        type="date" 
        name="septiembreFecha" 
        placeholder="Seleccione una fecha" 
        v-model="septiembreFecha"
        :min="`${obtenerAnoActual()}-09-01`"
        :max="`${obtenerAnoActual()}-09-30`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div v-if="septiembreFecha && !mensajeErrorFecha" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700">
        <span class="font-medium">Fecha seleccionada: </span> 
        <span class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMMYYYY(septiembreFecha) }}</span>
      </p>
    </div>
    
    <!-- Mensaje de error en caja roja -->
    <div v-else-if="septiembreFecha && mensajeErrorFecha" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700 text-center">
        ⚠️ {{ mensajeErrorFecha }}
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