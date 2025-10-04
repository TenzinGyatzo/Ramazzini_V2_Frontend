<script setup>
import { computed } from "vue";

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  },
  mostrarEstadoActividad: {
    type: Boolean,
    default: true
  },
  mostrarProveedor: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['ver-detalles']);

// Computed para formatear la fecha del último informe
const fechaUltimoInforme = computed(() => {
  if (!props.usuario.productividad?.ultimoInforme) return 'N/A';
  
  const fecha = new Date(props.usuario.productividad.ultimoInforme);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Computed para mostrar tiempo relativo (hace X tiempo)
const tiempoRelativo = computed(() => {
  if (!props.usuario.productividad?.ultimoInforme) return 'Sin actividad';
  
  const fechaUltimo = new Date(props.usuario.productividad.ultimoInforme);
  const ahora = new Date();
  const diferenciaMs = ahora - fechaUltimo;
  const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
  const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  
  if (diferenciaMinutos < 60) {
    return diferenciaMinutos <= 1 ? 'Hace 1 minuto' : `Hace ${diferenciaMinutos} minutos`;
  } else if (diferenciaHoras < 24) {
    return diferenciaHoras === 1 ? 'Hace 1 hora' : `Hace ${diferenciaHoras} horas`;
  } else if (diferenciaDias < 999999) {
    return diferenciaDias === 1 ? 'Hace 1 día' : `Hace ${diferenciaDias} días`;
  } else {
    return fechaUltimo.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});

// Computed para determinar el estado de actividad basado en la fecha del último informe
const estadoActividad = computed(() => {
  if (!props.usuario.productividad?.ultimoInforme) return 'inactivo';
  
  const fechaUltimo = new Date(props.usuario.productividad.ultimoInforme);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - fechaUltimo) / (1000 * 60 * 60 * 24));
  
  if (diferenciaDias <= 1) return 'reciente';
  if (diferenciaDias <= 7) return 'regular';
  return 'inactivo';
});

// Computed para obtener el color del estado
const colorEstado = computed(() => {
  switch (estadoActividad.value) {
    case 'reciente': return 'text-green-600 bg-green-100';
    case 'regular': return 'text-yellow-600 bg-yellow-100';
    case 'inactivo': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
});

// Computed para obtener el texto del estado
const textoEstado = computed(() => {
  switch (estadoActividad.value) {
    case 'reciente': return 'Reciente';
    case 'regular': return 'Regular';
    case 'inactivo': return 'Inactivo';
    default: return 'Desconocido';
  }
});

const verDetalles = () => {
  emit('ver-detalles', props.usuario._id);
};
</script>

<template>
  <tr class="hover:bg-gray-50 transition-colors">
    <!-- Usuario -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-8 w-8">
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="fas fa-user text-blue-600 text-xs"></i>
          </div>
        </div>
        <div class="ml-3">
          <div class="text-sm font-medium text-gray-900 truncate max-w-[170px]">
            {{ usuario.username }}
          </div>
          <div class="text-xs text-gray-500 truncate max-w-[170px]">
            {{ usuario.email }}
          </div>
        </div>
      </div>
    </td>

    <!-- Aptitudes -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalAptitudes || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-user-check text-green-500"></i>
        </div>
      </div>
    </td>

    <!-- Historias Clínicas -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalHistoriasClinicas || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-notes-medical text-teal-500"></i>
        </div>
      </div>
    </td>

    <!-- Exploraciones Físicas -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalExploracionesFisicas || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-heartbeat text-indigo-500"></i>
        </div>
      </div>
    </td>

    <!-- Exámenes de la Vista -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalExamenesVista || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-eye text-yellow-500"></i>
        </div>
      </div>
    </td>

    <!-- Audiometrías -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalAudiometrias || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-volume-up text-purple-500"></i>
        </div>
      </div>
    </td>

    <!-- Antidopings -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalAntidopings || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-flask text-red-500"></i>
        </div>
      </div>
    </td>

    <!-- Notas Médicas -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalNotasMedicas || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-stethoscope text-orange-500"></i>
        </div>
      </div>
    </td>

    <!-- Documentos Externos -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">
          {{ usuario.productividad?.totalDocumentosExternos || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-file-upload text-gray-600"></i>
        </div>
      </div>
    </td>

    <!-- Total Documentos -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-bold text-gray-900">
          {{ usuario.productividad?.totalDocumentos || 0 }}
        </div>
        <div class="ml-2">
          <i class="fas fa-folder text-gray-500"></i>
        </div>
      </div>
    </td>

    <!-- Último Informe -->
    <td class="px-3 py-3 whitespace-nowrap">
      <div class="flex flex-col">
        <div class="text-xs text-gray-900 font-medium">
          {{ fechaUltimoInforme }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ tiempoRelativo }}
        </div>
        <!-- <span 
          v-if="mostrarEstadoActividad"
          class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mt-1 w-fit"
          :class="colorEstado"
        >
          <i 
            class="fas mr-1 text-xs"
            :class="{
              'fa-circle': estadoActividad === 'reciente',
              'fa-exclamation-triangle': estadoActividad === 'regular',
              'fa-times-circle': estadoActividad === 'inactivo'
            }"
          ></i>
          {{ textoEstado }}
        </span> -->
      </div>
    </td>

    <!-- Proveedor (solo para administradores) -->
    <td v-if="mostrarProveedor" class="px-3 py-3 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {{ usuario.proveedorNombre || 'Sin proveedor' }}
        </div>
      </div>
    </td>

  </tr>
</template>

<style scoped>
/* Animaciones suaves para las transiciones */
.transition-colors {
  transition: color 0.2s ease-in-out;
}

/* Hover effects para los botones */
button:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease-in-out;
}
</style>
