<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { convertirFechaISOaDDMesYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la fecha
const abrilFecha = ref('');

// Función para validar que la fecha sea del mes de abril
const validarFechaAbril = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
    
  if (mes !== 3) { // 3 = abril
    return 'La fecha debe ser del mes de abril';
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
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p class="text-sm text-emerald-800 mb-2">
            <span v-if="mensajeErrorFecha" class="font-medium">❌ Estado actual:</span>
            <span v-else-if="abrilFecha" class="font-medium">✅ Fecha a registrar:</span>
            <span v-else class="font-medium">⚠️ Estado pendiente:</span>
        </p>
        <p class="text-2xl font-bold text-emerald-700 text-center">
            <span v-if="mensajeErrorFecha" class="text-red-600 font-semibold">{{ mensajeErrorFecha }}</span>
            <span v-else-if="abrilFecha" class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMesYYYY(abrilFecha) }}</span>
            <span v-else class="text-orange-600 font-semibold">Fecha no especificada</span>
        </p>
    </div>
    
  </div>
</template>
