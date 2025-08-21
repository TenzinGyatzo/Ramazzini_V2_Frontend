<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { convertirFechaISOaDDMesYYYY } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();
const documentos = useDocumentosStore();

// Función para validar que la fecha sea del mes de enero
const validarFechaEnero = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
    
  if (mes !== 0) { // 0 = enero
    return 'La fecha debe ser del mes de enero';
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

// Valor local para la fecha
const eneroFecha = ref('');

// Computed para sincronización bidireccional
const fechaSincronizada = computed({
  get() {
    // Prioridad 1: Si hay datos locales en formData, usarlos
    if (formDataControlPrenatal.eneroFecha && formDataControlPrenatal.eneroFecha.trim() !== '') {
      return formDataControlPrenatal.eneroFecha;
    }
    // Prioridad 2: Si no hay datos locales pero sí en BD, usar BD
    if (documentos.currentDocument && documentos.currentDocument.eneroFecha) {
      return formatDateYYYYMMDD(documentos.currentDocument.eneroFecha);
    }
    // Prioridad 3: Usar valor local (puede ser vacío)
    return eneroFecha.value;
  },
  set(value) {
    eneroFecha.value = value;
    
    // Sincronizar con formData solo si es válida
    if (value && value.trim() !== '' && value.length === 10) {
      const fecha = new Date(value + 'T00:00:00');
      if (!isNaN(fecha.getTime())) {
        formDataControlPrenatal.eneroFecha = value;
      } else {
        formDataControlPrenatal.eneroFecha = null;
      }
    } else {
      formDataControlPrenatal.eneroFecha = null;
    }
  }
});

// Sincronizar eneroFecha con formData cuando cambie localmente
watch(eneroFecha, (newValue) => {
  if (newValue && newValue.trim() !== '' && newValue.length === 10) {
    const fecha = new Date(newValue + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.eneroFecha = newValue;
    } else {
      formDataControlPrenatal.eneroFecha = null;
    }
  } else {
    formDataControlPrenatal.eneroFecha = null;
  }
});

// Watch adicional para asegurar sincronización inmediata
watch(eneroFecha, (newValue) => {
  // Si el campo está vacío, asignar null inmediatamente al formData
  if (!newValue || newValue.trim() === '' || newValue.length !== 10) {
    formDataControlPrenatal.eneroFecha = null;
  }
}, { immediate: true });

onMounted(() => {
  // Inicializar el valor local con la fecha sincronizada
  eneroFecha.value = fechaSincronizada.value;
});

onUnmounted(() => {
  // Confirmar el estado final del campo eneroFecha
  // Ahora que el backend acepta null, usarlo en lugar de delete
  if (eneroFecha.value && eneroFecha.value.trim() !== '' && eneroFecha.value.length === 10) {
    const fecha = new Date(eneroFecha.value + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.eneroFecha = eneroFecha.value;
    } else {
      formDataControlPrenatal.eneroFecha = null;
    }
  } else {
    formDataControlPrenatal.eneroFecha = null;
  }
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
        v-model="fechaSincronizada"
        :min="`${obtenerAnoActual()}-01-01`"
        :max="`${obtenerAnoActual()}-01-31`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p class="text-sm text-emerald-800 mb-2">
            <span v-if="mensajeErrorFecha" class="font-medium">❌ Estado actual:</span>
            <span v-else-if="eneroFecha" class="font-medium">✅ Fecha a registrar:</span>
            <span v-else class="font-medium">⚠️ Estado pendiente:</span>
        </p>
        <p class="text-2xl font-bold text-emerald-700 text-center">
            <span v-if="mensajeErrorFecha" class="text-red-600 font-semibold">{{ mensajeErrorFecha }}</span>
            <span v-else-if="eneroFecha" class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMesYYYY(eneroFecha) }}</span>
            <span v-else class="text-orange-600 font-semibold">Fecha no especificada</span>
        </p>
    </div>
    
  </div>
</template>
