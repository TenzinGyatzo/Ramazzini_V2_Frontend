<script setup lang="ts">
import { ref, computed } from 'vue';
import CIE10Autocomplete from './CIE10Autocomplete.vue';

interface Props {
  modelValue: string[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
});

const emit = defineEmits(['update:modelValue']);

const warningMessage = ref('');
const MAX_DIAGNOSES = 5;

const canAdd = computed(() => props.modelValue.length < MAX_DIAGNOSES);

const addDiagnosis = () => {
  if (!canAdd.value) {
    warningMessage.value = `Máximo ${MAX_DIAGNOSES} diagnósticos secundarios permitidos.`;
    return;
  }
  
  // Agregar un string vacío para renderizar un nuevo autocomplete
  const newValue = [...props.modelValue, ''];
  emit('update:modelValue', newValue);
  warningMessage.value = '';
};

const removeDiagnosis = (index: number) => {
  const newValue = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', newValue);
  warningMessage.value = '';
};

const updateDiagnosis = (index: number, code: string) => {
  if (!code) {
    // Si se limpia el código, actualizamos a vacío
    const newValue = [...props.modelValue];
    newValue[index] = '';
    emit('update:modelValue', newValue);
    return;
  }

  // Verificar duplicados (excluyendo el índice actual)
  const isDuplicate = props.modelValue.some((existingCode, i) => i !== index && existingCode === code);
  
  if (isDuplicate) {
    warningMessage.value = `El código ${code} ya ha sido agregado como diagnóstico secundario.`;
    // No actualizamos para evitar el duplicado en el estado
    return;
  }

  const newValue = [...props.modelValue];
  newValue[index] = code;
  emit('update:modelValue', newValue);
  warningMessage.value = '';
};
</script>

<template>
  <div class="space-y-4 border border-emerald-100 rounded-2xl p-5 bg-emerald-50/30">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
        <i class="fas fa-list-ol"></i>
        Diagnósticos Secundarios
        <span class="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
          {{ modelValue.length }} / {{ MAX_DIAGNOSES }}
        </span>
      </h3>
      
      <button 
        v-if="canAdd"
        type="button"
        @click="addDiagnosis"
        class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
      >
        <i class="fas fa-plus-circle"></i>
        Agregar diagnóstico
      </button>
    </div>

    <!-- Warning Message -->
    <Transition name="fade">
      <div v-if="warningMessage" class="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
        <i class="fas fa-exclamation-triangle mt-0.5"></i>
        <span class="flex-1 font-medium">{{ warningMessage }}</span>
        <button @click="warningMessage = ''" class="hover:text-amber-900">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </Transition>

    <!-- List of Diagnoses -->
    <div v-if="modelValue.length > 0" class="space-y-3">
      <div 
        v-for="(code, index) in modelValue" 
        :key="index"
        class="flex items-end gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-emerald-200 transition-colors"
      >
        <div class="flex-1">
          <CIE10Autocomplete
            :modelValue="code"
            @update:modelValue="(val) => updateDiagnosis(index, val)"
            :label="`Diagnóstico Secundario ${index + 1}`"
            placeholder="Buscar diagnóstico..."
          />
        </div>
        
        <button 
          type="button"
          @click="removeDiagnosis(index)"
          class="mb-0.5 p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Quitar diagnóstico"
        >
          <i class="fas fa-trash-alt text-lg"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center border-2 border-dashed border-emerald-100 rounded-xl">
      <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <i class="fas fa-notes-medical text-emerald-300 text-xl"></i>
      </div>
      <p class="text-sm text-emerald-600 font-medium">Sin diagnósticos secundarios registrados</p>
      <p class="text-xs text-gray-400 mt-1">Puedes agregar hasta 5 códigos adicionales</p>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

