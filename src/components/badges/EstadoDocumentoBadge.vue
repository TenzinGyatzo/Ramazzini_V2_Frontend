<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatDateDDMMYYYY } from '@/helpers/dates';

interface Props {
  estado?: string;
  fechaFinalizacion?: string | Date;
  finalizadoPor?: string | { username: string };
  fechaAnulacion?: string | Date;
  anuladoPor?: string | { username: string };
  razonAnulacion?: string;
  tipoDocumento?: string;
}

const props = defineProps<Props>();

const showTooltip = ref(false);
const badgeRef = ref<HTMLElement | null>(null);
const tooltipPosition = ref({ top: 0, left: 0 });

const updateTooltipPosition = () => {
  if (!badgeRef.value) return;
  const rect = badgeRef.value.getBoundingClientRect();
  tooltipPosition.value = {
    top: rect.top - 8,
    left: rect.left + rect.width / 2
  };
};

const handleMouseEnter = () => {
  updateTooltipPosition();
  showTooltip.value = true;
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};

const estadoDisplay = computed(() => {
  if (!props.estado) return 'BORRADOR';
  return props.estado.toUpperCase();
});

const badgeConfig = computed(() => {
  const estado = estadoDisplay.value;
  
  if (estado === 'FINALIZADO') {
    return {
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: 'fas fa-check-circle',
      label: 'Finalizado'
    };
  } else if (estado === 'ANULADO') {
    return {
      classes: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: 'fas fa-times-circle',
      label: 'Anulado'
    };
  } else {
    // Lógica para determinar el label del borrador según el tipo
    let label = 'Borrador';
    if (props.tipoDocumento) {
      const tipoSinEspacios = props.tipoDocumento.toLowerCase().replace(/\s+/g, '');
      if (tipoSinEspacios === 'documentoexterno') {
        label = 'En revisión';
      }
    }
    
    return {
      classes: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'fas fa-edit',
      label: label
    };
  }
});

const metadata = computed(() => {
  if (estadoDisplay.value !== 'FINALIZADO') return null;
  
  const parts: string[] = [];
  if (props.fechaFinalizacion) {
    parts.push(`el ${formatDateDDMMYYYY(props.fechaFinalizacion)}`);
  }
  if (props.finalizadoPor) {
    const nombreUsuario = typeof props.finalizadoPor === 'object' 
      ? props.finalizadoPor.username 
      : props.finalizadoPor;
    
    if (nombreUsuario) {
      parts.push(`por ${nombreUsuario}`);
    }
  }
  
  if (parts.length === 0) return null;
  return `Finalizado ${parts.join(' ')}`;
});

const tooltipText = computed(() => {
  const estado = estadoDisplay.value;
  
  if (estado === 'FINALIZADO') {
    return metadata.value;
  } else if (estado === 'ANULADO') {
    const parts: string[] = [];
    if (props.fechaAnulacion) {
      parts.push(`el ${formatDateDDMMYYYY(props.fechaAnulacion)}`);
    }
    if (props.anuladoPor) {
      const nombreUsuario = typeof props.anuladoPor === 'object' 
        ? props.anuladoPor.username 
        : props.anuladoPor;
      
      if (nombreUsuario) {
        parts.push(`por ${nombreUsuario}`);
      }
    }
    
    if (parts.length > 0) {
      let tooltip = `Anulado ${parts.join(' ')}`;
      if (props.razonAnulacion) {
        tooltip += `\nMotivo: ${props.razonAnulacion}`;
      }
      return tooltip;
    }
    return 'Documento anulado';
  } else if (estado === 'BORRADOR') {
    // Personalizar el tooltip según el tipo
    if (props.tipoDocumento) {
      const tipoSinEspacios = props.tipoDocumento.toLowerCase().replace(/\s+/g, '');
      if (tipoSinEspacios === 'documentoexterno') {
        return 'Documento en revisión - Puede ser editado';
      }
    }
    return 'Documento en borrador - Puede ser editado';
  }
  
  return null;
});
</script>

<template>
  <div class="hidden sm:flex items-center relative" :aria-label="`Estado del documento: ${badgeConfig.label}`">
    <span 
      ref="badgeRef"
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors duration-200 cursor-help"
      :class="badgeConfig.classes"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <i v-if="badgeConfig.icon" :class="[badgeConfig.icon, 'mr-1']"></i>
      {{ badgeConfig.label }}
    </span>
  </div>

  <!-- Tooltip con metadata usando Teleport -->
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div 
        v-if="tooltipText && showTooltip"
        class="fixed z-[9999] pointer-events-none"
        :style="{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(-50%, -100%)',
          marginBottom: '8px'
        }">
        <div class="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700 whitespace-pre-line max-w-xs">
          {{ tooltipText }}
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>

