<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDateDDMMYYYY } from '@/helpers/dates';

interface Props {
  documentType: string;
  documentId: string;
  trabajadorId: string;
  documentLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['closeModal', 'confirmFinalize']);

const loading = ref(false);
const fechaActual = computed(() => formatDateDDMMYYYY(new Date()));

const handleConfirm = async () => {
  loading.value = true;
  try {
    emit('confirmFinalize');
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
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-file-signature text-emerald-600 text-xl" aria-hidden="true"></i>
          </div>
          <div>
            <h3 id="modal-title" class="text-xl font-bold text-gray-900">Finalizar Documento</h3>
            <p class="text-sm text-gray-500">Cierre oficial del registro médico</p>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-4 mb-8">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 font-medium">Tipo:</span>
                <span class="text-gray-900 font-semibold">{{ documentLabel || documentType }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 font-medium">Fecha de Cierre:</span>
                <span class="text-gray-900 font-semibold">{{ fechaActual }}</span>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border-l-4 border-amber-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-amber-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-amber-700 font-medium">
                  Atención: Esta acción es <span class="font-bold uppercase underline">irreversible</span>. 
                  Una vez finalizado, el documento quedará sellado y no podrá volver al estado de borrador.
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
            class="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
            @click="handleConfirm"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span>{{ loading ? 'Finalizando...' : 'Confirmar Finalización' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

