<script setup>
import { ref, watch, computed } from 'vue';
import RegimenHelpModal from './RegimenHelpModal.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
    validator: (value) => value === null || value === 'SIRES_NOM024' || value === 'SIN_REGIMEN' || value === 'NO_SUJETO_SIRES' // Mantener compatibilidad temporal
  }
});

const emit = defineEmits(['update:modelValue', 'update:declaracion']);

const regimenSeleccionado = ref(props.modelValue);
const declaracionAceptada = ref(false);
const infoExpanded = ref(false);
const showHelpModal = ref(false);

// Watcher para sincronizar cambios externos
watch(() => props.modelValue, (newValue) => {
  // Normalizar valores antiguos a nuevo formato
  if (newValue === 'NO_SUJETO_SIRES') {
    regimenSeleccionado.value = 'SIN_REGIMEN';
  } else {
    regimenSeleccionado.value = newValue;
  }
  if (newValue !== 'SIN_REGIMEN' && newValue !== 'NO_SUJETO_SIRES') {
    declaracionAceptada.value = false;
  }
});

// Watcher para emitir cambios
watch(regimenSeleccionado, (newValue) => {
  emit('update:modelValue', newValue);
  if (newValue !== 'SIN_REGIMEN') {
    declaracionAceptada.value = false;
    emit('update:declaracion', false);
  }
});

watch(declaracionAceptada, (newValue) => {
  emit('update:declaracion', newValue);
});

const toggleInfo = () => {
  infoExpanded.value = !infoExpanded.value;
};

const openHelpModal = () => {
  showHelpModal.value = true;
};

const closeHelpModal = () => {
  showHelpModal.value = false;
};

const applySuggestion = (suggestion) => {
  regimenSeleccionado.value = suggestion;
  closeHelpModal();
};

const selectRegimen = (regimen) => {
  regimenSeleccionado.value = regimen;
};
</script>

<template>
  <div class="mb-6 border border-gray-200 rounded-lg p-3 bg-gray-50">
    <!-- Título y botón de ayuda -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-medium text-gray-800">
        Régimen Regulatorio
      </h3>
      <button
        type="button"
        @click="openHelpModal"
        class="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-label="Abrir ayuda para elegir régimen regulatorio"
      >
        <i class="fas fa-question-circle"></i>
        <span>Ayúdame a elegir</span>
      </button>
    </div>

    <!-- Aviso de reversibilidad (más sutil) -->
    <div class="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
      <p class="text-amber-700 flex items-start gap-2">
        <i class="fas fa-info-circle mt-0.5 text-amber-600"></i>
        <span>Esta decisión define reglas operativas del sistema. Si necesitas cambiarla posteriormente, será necesario un proceso asistido.</span>
      </p>
    </div>

    <!-- Bloque A: Regímenes regulatorios disponibles -->
    <div class="mb-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Regímenes regulatorios disponibles</h4>
      <div class="space-y-3">
        <!-- Opción SIRES -->
        <label
          class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
          :class="regimenSeleccionado === 'SIRES_NOM024' 
            ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200' 
            : 'border-gray-200 bg-white hover:border-emerald-300'"
        >
          <input
            type="radio"
            name="regimenRegulatorio"
            value="SIRES_NOM024"
            :checked="regimenSeleccionado === 'SIRES_NOM024'"
            @change="selectRegimen('SIRES_NOM024')"
            class="sr-only"
            aria-label="Seleccionar régimen SIRES (NOM-024)"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-hospital text-blue-600"></i>
              </div>
              <div class="font-semibold text-gray-800 flex-1 ml-1">
                SIRES — NOM-024-SSA3-2012
              </div>
              <Transition name="check-fade">
                <i 
                  v-if="regimenSeleccionado === 'SIRES_NOM024'" 
                  class="fas fa-check-circle text-emerald-600 text-lg"
                ></i>
              </Transition>
            </div>
            <p class="text-sm text-gray-600">
              Para establecimientos de salud que requieren cumplimiento normativo estricto y trazabilidad completa.
            </p>
          </div>
        </label>
      </div>
    </div>

    <!-- Bloque B: Continuar sin régimen regulatorio (separado, menos prominente) -->
    <div class="mb-4 pt-4 border-t border-gray-300">
      <h4 class="text-sm font-medium text-gray-600 mb-3">Continuar sin régimen regulatorio</h4>
      <label
        class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
        :class="regimenSeleccionado === 'SIN_REGIMEN' 
          ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200' 
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
      >
        <input
          type="radio"
          name="regimenRegulatorio"
          value="SIN_REGIMEN"
          :checked="regimenSeleccionado === 'SIN_REGIMEN'"
          @change="selectRegimen('SIN_REGIMEN')"
          class="sr-only"
          aria-label="Continuar sin régimen regulatorio"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <!-- <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-clipboard-list text-gray-600"></i>
            </div> -->
            <div class="font-medium text-gray-700 flex-1">
              Continuar sin régimen regulatorio
            </div>
            <Transition name="check-fade">
              <i 
                v-if="regimenSeleccionado === 'SIN_REGIMEN'" 
                class="fas fa-check-circle text-emerald-600 text-lg"
              ></i>
            </Transition>
          </div>
          <p class="text-sm text-gray-600 text-justify">
            El sistema operará sin aplicar reglas de trazabilidad normativa específicas.
          </p>
        </div>
      </label>
    </div>

    <!-- Checkbox de declaración (solo visible si SIN_REGIMEN) -->
    <Transition name="fade">
      <div 
        v-if="regimenSeleccionado === 'SIN_REGIMEN'" 
        class="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg shadow-sm"
      >
        <label class="flex items-start cursor-pointer group">
          <div class="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              v-model="declaracionAceptada"
              class="w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300"
              aria-label="Aceptar declaración para continuar sin régimen regulatorio"
            />
            <div 
              v-if="declaracionAceptada"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <i class="fas fa-check text-white text-xs"></i>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <div class="flex items-start gap-2 mb-1">
              <i class="fas fa-file-signature text-amber-600 mt-0.5"></i>
              <span class="text-sm font-medium text-gray-800">
                Declaración de contexto operativo
                <span class="text-red-500 ml-1">*</span>
              </span>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed">
              Declaro que, según el contexto de mi operación y la aplicabilidad de marcos normativos, he decidido no aplicar un régimen regulatorio específico. Entiendo que esta decisión define cómo operará el sistema y que su modificación posterior requerirá un proceso asistido.
            </p>
          </div>
        </label>
      </div>
    </Transition>

    <!-- Panel informativo expandible -->
    <div class="mt-4 border-t border-gray-200 pt-4">
      <button
        type="button"
        @click="toggleInfo"
        class="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span class="flex items-center gap-2">
          <i class="fas fa-info-circle text-emerald-600"></i>
          <span>Más información sobre los regímenes regulatorios</span>
        </span>
        <i
          :class="infoExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
          class="fas transition-transform"
        ></i>
      </button>

      <Transition name="slide-down">
        <div v-if="infoExpanded" class="mt-4 space-y-5 text-sm text-gray-600">
          <!-- ¿Qué es el régimen regulatorio? -->
          <div class="border-l-4 border-emerald-500 pl-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fas fa-info-circle text-emerald-600"></i>
              <h4 class="font-semibold text-gray-800">
                ¿Qué es el régimen regulatorio?
              </h4>
            </div>
            <p class="text-gray-700">
              Define el marco normativo bajo el cual operará tu sistema. Determina las reglas de trazabilidad, validaciones y controles aplicables a tus documentos médicos.
            </p>
          </div>

          <!-- ¿Cuándo se recomienda SIRES? -->
          <div class="border-l-4 border-blue-500 pl-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fas fa-hospital text-blue-600"></i>
              <h4 class="font-semibold text-gray-800">
                ¿Cuándo se recomienda SIRES (NOM-024-SSA3-2012)?
              </h4>
            </div>
            <ul class="space-y-2 ml-2">
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-blue-500 mt-0.5 text-xs"></i>
                <span>Uso institucional (hospitales, clínicas, centros de salud)</span>
              </li>
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-blue-500 mt-0.5 text-xs"></i>
                <span>Exigencia contractual o regulatoria</span>
              </li>
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-blue-500 mt-0.5 text-xs"></i>
                <span>Necesidad de trazabilidad completa y cumplimiento estricto</span>
              </li>
            </ul>
          </div>

          <!-- ¿Qué implica continuar sin régimen regulatorio? -->
          <div class="border-l-4 border-amber-500 pl-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fas fa-clipboard-list text-amber-600"></i>
              <h4 class="font-semibold text-gray-800">
                ¿Qué implica continuar sin un régimen regulatorio?
              </h4>
            </div>
            <ul class="space-y-2 ml-2">
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-amber-500 mt-0.5 text-xs"></i>
                <span>Operación como plataforma clínica general</span>
              </li>
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-amber-500 mt-0.5 text-xs"></i>
                <span>Campos normativos habilitados solo cuando resultan aplicables</span>
              </li>
              <li class="flex items-start gap-2">
                <i class="fas fa-check-circle text-amber-500 mt-0.5 text-xs"></i>
                <span>Validaciones acordes al uso clínico general</span>
              </li>
            </ul>
          </div>

          <!-- Impacto práctico -->
          <div class="border-l-4 border-purple-500 pl-4">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-balance-scale text-purple-600"></i>
              <h4 class="font-semibold text-gray-800">
                Impacto práctico en el sistema
              </h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <i class="fas fa-hospital text-blue-600"></i>
                  SIRES
                </div>
                <ul class="text-xs text-blue-700 space-y-1">
                  <li>• Trazabilidad completa</li>
                  <li>• Validaciones estrictas</li>
                  <li>• Controles de inmutabilidad</li>
                  <li>• Campos NOM-024 obligatorios</li>
                </ul>
              </div>
              <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div class="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <i class="fas fa-clipboard-list text-amber-600"></i>
                  Sin régimen regulatorio
                </div>
                <ul class="text-xs text-amber-700 space-y-1">
                  <li>• Flujo más flexible</li>
                  <li>• Validaciones acordes al uso clínico general</li>
                  <li>• Campos normativos habilitados solo cuando resultan aplicables</li>
                  <li>• Mayor agilidad operativa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Modal de ayuda -->
    <RegimenHelpModal
      v-if="showHelpModal"
      @close="closeHelpModal"
      @apply-suggestion="applySuggestion"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 1000px;
}

.check-fade-enter-active,
.check-fade-leave-active {
  transition: all 0.3s ease;
}

.check-fade-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.check-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>