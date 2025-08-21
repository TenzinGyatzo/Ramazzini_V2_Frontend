<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { convertirFechaISOaDDMesYYYY, formatDateYYYYMMDD } from '@/helpers/dates';

const { formDataControlPrenatal } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la fecha
const octubreFecha = ref('');

// Computed para sincronización bidireccional
const fechaSincronizada = computed({
  get() {
    // Prioridad 1: Si hay datos locales en formData, usarlos
    if (formDataControlPrenatal.octubreFecha && formDataControlPrenatal.octubreFecha.trim() !== '') {
      return formDataControlPrenatal.octubreFecha;
    }
    // Prioridad 2: Si no hay datos locales pero sí en BD, usar BD
    if (documentos.currentDocument && documentos.currentDocument.octubreFecha) {
      return formatDateYYYYMMDD(documentos.currentDocument.octubreFecha);
    }
    // Prioridad 3: Usar valor local (puede ser vacío)
    return octubreFecha.value;
  },
  set(value) {
    octubreFecha.value = value;
    
    // Sincronizar con formData solo si es válida
    if (value && value.trim() !== '' && value.length === 10) {
      const fecha = new Date(value + 'T00:00:00');
      if (!isNaN(fecha.getTime())) {
        formDataControlPrenatal.octubreFecha = value;
      } else {
        formDataControlPrenatal.octubreFecha = null;
      }
    } else {
      formDataControlPrenatal.octubreFecha = null;
    }
  }
});

// Sincronizar octubreFecha con formData cuando cambie localmente
watch(octubreFecha, (newValue) => {
  if (newValue && newValue.trim() !== '' && newValue.length === 10) {
    const fecha = new Date(newValue + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.octubreFecha = newValue;
    } else {
      formDataControlPrenatal.octubreFecha = null;
    }
  } else {
    formDataControlPrenatal.octubreFecha = null;
  }
});

// Watch adicional para asegurar sincronización inmediata
watch(octubreFecha, (newValue) => {
  // Si el campo está vacío, asignar null inmediatamente al formData
  if (!newValue || newValue.trim() === '' || newValue.length !== 10) {
    formDataControlPrenatal.octubreFecha = null;
  }
}, { immediate: true });

onMounted(() => {
  // Inicializar el valor local con la fecha sincronizada
  octubreFecha.value = fechaSincronizada.value;
});

onUnmounted(() => {
  // Confirmar el estado final del campo octubreFecha
  // Ahora que el backend acepta null, usarlo en lugar de delete
  if (octubreFecha.value && octubreFecha.value.trim() !== '' && octubreFecha.value.length === 10) {
    const fecha = new Date(octubreFecha.value + 'T00:00:00');
    if (!isNaN(fecha.getTime())) {
      formDataControlPrenatal.octubreFecha = octubreFecha.value;
    } else {
      formDataControlPrenatal.octubreFecha = null;
    }
  } else {
    formDataControlPrenatal.octubreFecha = null;
  }
});

// Función para validar que la fecha sea del mes de octubre
const validarFechaOctubre = (fecha) => {
  if (!fecha) return '';
  
  // Crear la fecha y asegurar que se interprete correctamente
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  const mes = fechaSeleccionada.getMonth(); // 0 = enero, 1 = febrero, etc.
    
  if (mes !== 9) { // 9 = octubre
    return 'La fecha debe ser del mes de octubre';
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
  const errorNoFutura = validarFechaNoFutura(octubreFecha.value);
  if (errorNoFutura) return errorNoFutura;
  
  const errorOctubre = validarFechaOctubre(octubreFecha.value);
  if (errorOctubre) return errorOctubre;
  
  return '';
});

// Función para obtener el año actual
const obtenerAnoActual = () => {
  return new Date().getFullYear();
};

</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Control Prenatal - Octubre</h1>
    <h2 class="font-semibold mb-3 text-gray-700">FECHA</h2>
    
    <div class="mb-4">
      <p class="font-medium mb-2 text-gray-800 leading-5">¿En qué fecha se realizó el control prenatal durante el mes de octubre?</p>
      
      <FormKit 
        type="date" 
        name="octubreFecha" 
        placeholder="Seleccione una fecha" 
        v-model="fechaSincronizada"
        :min="`${obtenerAnoActual()}-10-01`"
        :max="`${obtenerAnoActual()}-10-31`"
      />
      
    </div>

    <!-- Resumen de selección -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p class="text-sm text-emerald-800 mb-2">
            <span v-if="mensajeErrorFecha" class="font-medium">❌ Estado actual:</span>
            <span v-else-if="octubreFecha" class="font-medium">✅ Fecha a registrar:</span>
            <span v-else class="font-medium">⚠️ Estado pendiente:</span>
        </p>
        <p class="text-2xl font-bold text-emerald-700 text-center">
            <span v-if="mensajeErrorFecha" class="text-red-600 font-semibold">{{ mensajeErrorFecha }}</span>
            <span v-else-if="octubreFecha" class="text-emerald-700 font-semibold">{{ convertirFechaISOaDDMesYYYY(octubreFecha) }}</span>
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