<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDateDDMMYYYY } from '@/helpers/dates';

interface Props {
  documentType: string;
  documentId: string;
  documentLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['closeModal', 'confirmAnular']);

const loading = ref(false);
const fechaActual = computed(() => formatDateDDMMYYYY(new Date()));

// Razones predefinidas comunes
const razonesPredefinidas = [
  { id: 'error_datos', label: 'Error en los datos capturados' },
  { id: 'duplicado', label: 'Documento duplicado' },
  { id: 'paciente_incorrecto', label: 'Paciente incorrecto' },
  { id: 'fecha_incorrecta', label: 'Fecha incorrecta' },
  { id: 'error_diagnostico', label: 'Error en diagnóstico o conclusión' },
  { id: 'solicitud_paciente', label: 'Solicitud del paciente' },
  { id: 'otro', label: 'Otro (especificar)' },
];

const razonSeleccionada = ref('');
const razonPersonalizada = ref('');

const mostrarCampoPersonalizado = computed(() => razonSeleccionada.value === 'otro');

const razonFinal = computed(() => {
  if (razonSeleccionada.value === 'otro') {
    return razonPersonalizada.value.trim();
  }
  const razon = razonesPredefinidas.find(r => r.id === razonSeleccionada.value);
  return razon?.label || '';
});

const puedeConfirmar = computed(() => {
  if (!razonSeleccionada.value) return false;
  if (razonSeleccionada.value === 'otro' && !razonPersonalizada.value.trim()) return false;
  return true;
});

const handleConfirm = async () => {
  if (!puedeConfirmar.value) return;
  
  loading.value = true;
  try {
    emit('confirmAnular', razonFinal.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" 
    @click.self="$emit('closeModal')"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-file-circle-xmark text-rose-600 text-xl" aria-hidden="true"></i>
          </div>
          <div>
            <h3 id="modal-title" class="text-xl font-bold text-gray-900">Anular Documento</h3>
            <p class="text-sm text-gray-500">Invalidación oficial del registro médico</p>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-4 mb-6">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 font-medium">Tipo:</span>
                <span class="text-gray-900 font-semibold">{{ documentLabel || documentType }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 font-medium">Fecha de Anulación:</span>
                <span class="text-gray-900 font-semibold">{{ fechaActual }}</span>
              </div>
            </div>
          </div>

          <!-- Selección de razón -->
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-gray-700">
              Razón de anulación <span class="text-rose-500">*</span>
            </label>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <label 
                v-for="razon in razonesPredefinidas" 
                :key="razon.id"
                class="flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200"
                :class="razonSeleccionada === razon.id 
                  ? 'border-rose-400 bg-rose-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
              >
                <input 
                  type="radio" 
                  :value="razon.id" 
                  v-model="razonSeleccionada"
                  class="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                >
                <span class="ml-3 text-sm text-gray-700">{{ razon.label }}</span>
              </label>
            </div>
          </div>

          <!-- Campo de razón personalizada -->
          <Transition name="slide-fade">
            <div v-if="mostrarCampoPersonalizado" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Especifique la razón <span class="text-rose-500">*</span>
              </label>
              <textarea
                v-model="razonPersonalizada"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm resize-none"
                placeholder="Describa brevemente la razón de la anulación..."
                maxlength="500"
              ></textarea>
              <p class="text-xs text-gray-400 text-right">{{ razonPersonalizada.length }}/500</p>
            </div>
          </Transition>

          <!-- Warning -->
          <div class="bg-rose-50 border-l-4 border-rose-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-rose-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-rose-700 font-medium">
                  Atención: Esta acción es <span class="font-bold uppercase underline">irreversible</span>. 
                  El documento quedará marcado como anulado y no podrá ser editado ni eliminado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            type="button" 
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
            @click="$emit('closeModal')"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            class="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleConfirm"
            :disabled="loading || !puedeConfirmar"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span>{{ loading ? 'Anulando...' : 'Confirmar Anulación' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

