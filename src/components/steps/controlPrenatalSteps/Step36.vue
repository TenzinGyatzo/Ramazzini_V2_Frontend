<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { convertirFechaISOaDDMesYYYY, formatDateYYYYMMDD } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la fecha
const mayoFecha = ref('');

// Computed para sincronización bidireccional
const fechaSincronizada = computed({
  get() {
    // Prioridad 1: Si hay datos locales en formData, usarlos
    if (formDataControlPrenatal.mayoFecha && formDataControlPrenatal.mayoFecha.trim() !== '') {
      return formDataControlPrenatal.mayoFecha;
    }
    // Prioridad 2: Si no hay datos locales pero sí en BD, usar BD
    if (documentos.currentDocument && documentos.currentDocument.mayoFecha) {
      return formatDateYYYYMMDD(documentos.currentDocument.mayoFecha);
    }
    // Prioridad 3: Usar valor local (puede ser vacío)
    return mayoFecha.value;
  },
  set(value) {
    mayoFecha.value = value;
    
    // Sincronizar con formData solo si es válida
    if (value && value.trim() !== '' && value.length === 10) {
      const fecha = new Date(value + 'T00:00:00');
      if (!isNaN(fecha.getTime())) {
        formDataControlPrenatal.mayoFecha = value;
      } else {
        formDataControlPrenatal.mayoFecha = null;
      }
    } else {
      formDataControlPrenatal.mayoFecha = null;
    }
  }
});

// Sincronizar mayoFecha con formData cuando cambie localmente
watch(mayoFecha, (newValue) => {
  if (newValue && newValue.trim() !== '' && newValue.length === 10) {
    const fecha = new Date(newValue + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.mayoFecha = newValue;
    } else {
      formDataControlPrenatal.mayoFecha = null;
    }
  } else {
    formDataControlPrenatal.mayoFecha = null;
  }
});

// Watch adicional para asegurar sincronización inmediata
watch(mayoFecha, (newValue) => {
  // Si el campo está vacío, asignar null inmediatamente al formData
  if (!newValue || newValue.trim() === '' || newValue.length !== 10) {
    formDataControlPrenatal.mayoFecha = null;
  }
}, { immediate: true });

onMounted(() => {
  // Inicializar el valor local con la fecha sincronizada
  mayoFecha.value = fechaSincronizada.value;
});

onUnmounted(() => {
  // Confirmar el estado final del campo mayoFecha
  // Ahora que el backend acepta null, usarlo en lugar de delete
  if (mayoFecha.value && mayoFecha.value.trim() !== '' && mayoFecha.value.length === 10) {
    const fecha = new Date(mayoFecha.value + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.mayoFecha = mayoFecha.value;
    } else {
      formDataControlPrenatal.mayoFecha = null;
    }
  } else {
    formDataControlPrenatal.mayoFecha = null;
  }
});

// Función para validar que la fecha sea del mes de mayo
const validarFechaMayo = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
    
  if (mes !== 4) { // 4 = mayo
    return 'La fecha debe ser del mes de mayo';
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
  const errorNoFutura = validarFechaNoFutura(mayoFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorMayo = validarFechaMayo(mayoFecha.value);
  if (errorMayo) return errorMayo;
  
  return '';
});

// Función para obtener el año actual
const obtenerAnoActual = () => {
  return new Date().getFullYear();
};

</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Mayo</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de mayo?</p>
      
      <FormKit 
        type="date" 
        name="mayoFecha" 
        placeholder="Seleccione una fecha" 
        v-model="fechaSincronizada"
        :min="`${obtenerAnoActual()}-05-01`"
        :max="`${obtenerAnoActual()}-05-31`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p class="text-sm text-emerald-800 mb-2">
            <span v-if="mensajeErrorFecha" class="font-medium">❌ Estado actual:</span>
            <span v-else-if="fechaSincronizada" class="font-medium">✅ Fecha a registrar:</span>
            <span v-else class="font-medium">⚠️ Estado pendiente:</span>
        </p>
        <p class="text-2xl font-bold text-emerald-700 text-center">
            <span v-if="mensajeErrorFecha" class="text-red-600 font-semibold">{{ mensajeErrorFecha }}</span>
            <span v-else-if="fechaSincronizada" class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMesYYYY(fechaSincronizada) }}</span>
            <span v-else class="text-orange-600 font-semibold">Fecha no especificada</span>
        </p>
    </div>
    
  </div>
</template>
