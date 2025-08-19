<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const eneroFecha = ref('');

// Función para validar que la fecha sea del mes de enero
const validarFechaEnero = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
  
  if (mes !== 0) { // 0 = enero
    return 'La fecha debe ser del mes de enero';
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
  const errorRequerida = validarFechaRequerida(eneroFecha.value);
  if (errorRequerida) return errorRequerida;
  
  const errorNoFutura = validarFechaNoFutura(eneroFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorEnero = validarFechaEnero(eneroFecha.value);
  if (errorEnero) return errorEnero;
  
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
  // Verificar si formDataControlPrenatal.eneroFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.eneroFecha) {
    eneroFecha.value = formDataControlPrenatal.eneroFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para eneroFecha
  if (!formDataControlPrenatal.eneroFecha) {
    formDataControlPrenatal.eneroFecha = eneroFecha.value;
  }
});

// Sincronizar eneroFecha con formData
watch(eneroFecha, (newValue) => {
  formDataControlPrenatal.eneroFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Enero</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de enero?</p>
      
      <FormKit 
        type="date" 
        name="eneroFecha" 
        placeholder="Seleccione una fecha" 
        v-model="eneroFecha"
        :min="`${obtenerAnoActual()}-01-01`"
        :max="`${obtenerAnoActual()}-01-31`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div v-if="eneroFecha && !mensajeErrorFecha" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700">
        <span class="font-medium">Fecha seleccionada: </span> 
        <span class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMMYYYY(eneroFecha) }}</span>
      </p>
    </div>
    
    <!-- Mensaje de error en caja roja -->
    <div v-else-if="eneroFecha && mensajeErrorFecha" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700 text-center">
        ⚠️ {{ mensajeErrorFecha }}
      </p>
    </div>
    
  </div>
</template>
