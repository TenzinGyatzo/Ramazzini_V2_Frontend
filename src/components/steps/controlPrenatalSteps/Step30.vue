<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const abrilFecha = ref('');

// Función para validar que la fecha sea del mes de abril
const validarFechaAbril = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
  
  if (mes !== 3) { // 3 = abril
    return 'La fecha debe ser del mes de abril';
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
  const errorRequerida = validarFechaRequerida(abrilFecha.value);
  if (errorRequerida) return errorRequerida;
  
  const errorNoFutura = validarFechaNoFutura(abrilFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorAbril = validarFechaAbril(abrilFecha.value);
  if (errorAbril) return errorAbril;
  
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
  // Verificar si formDataControlPrenatal.abrilFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.abrilFecha) {
    abrilFecha.value = formDataControlPrenatal.abrilFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para abrilFecha
  if (!formDataControlPrenatal.abrilFecha) {
    formDataControlPrenatal.abrilFecha = abrilFecha.value;
  }
});

// Sincronizar abrilFecha con formData
watch(abrilFecha, (newValue) => {
  formDataControlPrenatal.abrilFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Abril</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de abril?</p>
      
      <FormKit 
        type="date" 
        name="abrilFecha" 
        placeholder="Seleccione una fecha" 
        v-model="abrilFecha"
        :min="`${obtenerAnoActual()}-04-01`"
        :max="`${obtenerAnoActual()}-04-30`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div v-if="abrilFecha && !mensajeErrorFecha" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700">
        <span class="font-medium">Fecha seleccionada: </span> 
        <span class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMMYYYY(abrilFecha) }}</span>
      </p>
    </div>
    
    <!-- Mensaje de error en caja roja -->
    <div v-else-if="abrilFecha && mensajeErrorFecha" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700 text-center">
        ⚠️ {{ mensajeErrorFecha }}
      </p>
    </div>
    
  </div>
</template>
