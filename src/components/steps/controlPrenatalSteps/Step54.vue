<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const agostoFecha = ref('');

// Función para validar que la fecha sea del mes de agosto
const validarFechaAgosto = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
  
  if (mes !== 7) { // 7 = agosto
    return 'La fecha debe ser del mes de agosto';
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
  const errorRequerida = validarFechaRequerida(agostoFecha.value);
  if (errorRequerida) return errorRequerida;
  
  const errorNoFutura = validarFechaNoFutura(agostoFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorAgosto = validarFechaAgosto(agostoFecha.value);
  if (errorAgosto) return errorAgosto;
  
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
  // Verificar si formDataControlPrenatal.agostoFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.agostoFecha) {
    agostoFecha.value = formDataControlPrenatal.agostoFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para agostoFecha
  if (!formDataControlPrenatal.agostoFecha) {
    formDataControlPrenatal.agostoFecha = agostoFecha.value;
  }
});

// Sincronizar agostoFecha con formData
watch(agostoFecha, (newValue) => {
  formDataControlPrenatal.agostoFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Agosto</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de agosto?</p>
      
      <FormKit 
        type="date" 
        name="agostoFecha" 
        placeholder="Seleccione una fecha" 
        v-model="agostoFecha"
        :min="`${obtenerAnoActual()}-08-01`"
        :max="`${obtenerAnoActual()}-08-31`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div v-if="agostoFecha && !mensajeErrorFecha" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700">
        <span class="font-medium">Fecha seleccionada: </span> 
        <span class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMMYYYY(agostoFecha) }}</span>
      </p>
    </div>
    
    <!-- Mensaje de error en caja roja -->
    <div v-else-if="agostoFecha && mensajeErrorFecha" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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