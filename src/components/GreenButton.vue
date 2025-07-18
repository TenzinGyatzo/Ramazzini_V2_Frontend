<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true,
    default: 'Button',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'outline'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);
</script>

<template>
  <button 
    type="button"
    :disabled="disabled || loading"
    @click="$emit('click')"
    :class="[
      'inline-flex items-center justify-center gap-2 font-normal rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      // Tamaños
      size === 'small' && 'px-4 py-2 text-sm min-w-32',
      size === 'medium' && 'px-6 py-3 text-base min-w-40',
      size === 'large' && 'px-8 py-4 text-lg min-w-48',
      // Variantes
      variant === 'primary' && 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
      variant === 'secondary' && 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
      variant === 'outline' && 'bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50'
    ]"
  >
    <!-- Spinner de carga -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    
    <!-- Icono personalizado desde slot -->
    <slot name="icon" v-else-if="!loading">
      <!-- Icono por defecto basado en el texto -->
      <i v-if="text.toLowerCase().includes('entidad')" class="fas fa-plus text-sm"></i>
      <i v-else-if="text.toLowerCase().includes('cliente')" class="fas fa-building text-sm"></i>
      <i v-else-if="text.toLowerCase().includes('nuevo')" class="fas fa-user-plus text-sm"></i>
      <i v-else-if="text.toLowerCase().includes('carga')" class="fas fa-upload text-sm"></i>
      <i v-else-if="text.toLowerCase().includes('exportar')" class="fas fa-download text-sm"></i>
    </slot>
    
    <!-- Texto del botón -->
    <span>{{ text }}</span>
  </button>
</template>

<style scoped>
/* Animación personalizada para el spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Efectos de hover mejorados */
button:not(:disabled):hover {
  transform: translateY(-1px) scale(1.02);
}

/* Efecto de presión al hacer clic */
button:not(:disabled):active {
  transform: translateY(0) scale(0.98);
}

/* Transición suave para todos los estados */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de focus mejorado */
button:focus {
  outline: none;
}

/* Gradiente animado para la variante primary */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Efecto de brillo en hover para primary */
/* button:not(:disabled):hover.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 2s ease infinite;
} */

/* Responsive design */
@media (max-width: 640px) {
  .min-w-32 {
    min-width: 8rem;
  }
  .min-w-40 {
    min-width: 10rem;
  }
  .min-w-48 {
    min-width: 12rem;
  }
}

/* Mejoras para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  button,
  .animate-spin {
    animation: none;
    transition: none;
  }
}
</style>
