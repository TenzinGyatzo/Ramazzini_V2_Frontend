<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const junioFecha = ref('');

// Función para validar que la fecha sea del mes de junio
const validarFechaJunio = (fecha) => {
  if (!fecha) return '';
  
  const fechaSeleccionada = new Date(fecha);
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
  
  if (mes !== 5) { // 5 = junio
    return 'La fecha debe ser del mes de junio';
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
  const errorRequerida = validarFechaRequerida(junioFecha.value);
  if (errorRequerida) return errorRequerida;
  
  const errorNoFutura = validarFechaNoFutura(junioFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorJunio = validarFechaJunio(junioFecha.value);
  if (errorJunio) return errorJunio;
  
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
  // Verificar si formDataControlPrenatal.junioFecha tiene un valor y establecerlo
  if (formDataControlPrenatal.junioFecha) {
    junioFecha.value = formDataControlPrenatal.junioFecha;
  }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para junioFecha
  if (!formDataControlPrenatal.junioFecha) {
    formDataControlPrenatal.junioFecha = junioFecha.value;
  }
});

// Sincronizar junioFecha con formData
watch(junioFecha, (newValue) => {
  formDataControlPrenatal.junioFecha = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Junio</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de junio?</p>
      
      <FormKit 
        type="date" 
        name="junioFecha" 
        placeholder="Seleccione una fecha" 
        v-model="junioFecha"
        :min="`${obtenerAnoActual()}-06-01`"
        :max="`${obtenerAnoActual()}-06-30`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div v-if="junioFecha && !mensajeErrorFecha" class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-sm text-gray-700">
        <span class="font-medium">Fecha seleccionada: </span> 
        <span class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMMYYYY(junioFecha) }}</span>
      </p>
    </div>
    
    <!-- Mensaje de error en caja roja -->
    <div v-else-if="junioFecha && mensajeErrorFecha" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700 text-center">
        ⚠️ {{ mensajeErrorFecha }}
      </p>
    </div>
    
  </div>
</template>
