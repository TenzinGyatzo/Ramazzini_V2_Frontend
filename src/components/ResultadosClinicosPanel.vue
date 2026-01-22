<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="handleClose"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="slide-right">
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEditing ? 'Editar Resultado Clínico' : 'Registrar Resultado Clínico' }}
          </h2>
          <button
            @click="handleClose"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i class="fas fa-times text-gray-600 text-xl"></i>
          </button>
        </div>

        <div class="px-6 pt-4 text-sm text-gray-600 leading-relaxed">
          Resultados de evaluaciones adicionales que enriquecen el seguimiento y la estadística, pero no generan documentos en PDF.
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Paso 1: Selector de tipo -->
          <div v-if="currentStep === 'select'" class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Seleccione el tipo de estudio</h3>
              
              <!-- Categorías -->
              <div class="space-y-4">
                <!-- Gabinete -->
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i class="fas fa-x-ray text-blue-500 mr-2"></i>
                    Gabinete
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      @click="selectTipo('ESPIROMETRIA')"
                      class="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center gap-3"
                    >
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
                        :style="{ backgroundColor: getIconBackground('ESPIROMETRIA') }"
                      >
                        <i
                          :class="getTipoIcon('ESPIROMETRIA')"
                          class="text-lg"
                          :style="{ color: getIconColor('ESPIROMETRIA') }"
                        ></i>
                      </div>
                      <div>
                        <div class="font-medium text-gray-800">Espirometría</div>
                        <div class="text-sm text-gray-500">Función pulmonar</div>
                      </div>
                    </button>
                    <button
                      @click="selectTipo('EKG')"
                      class="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center gap-3"
                    >
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
                        :style="{ backgroundColor: getIconBackground('EKG') }"
                      >
                        <i
                          :class="getTipoIcon('EKG')"
                          class="text-lg"
                          :style="{ color: getIconColor('EKG') }"
                        ></i>
                      </div>
                      <div>
                        <div class="font-medium text-gray-800">EKG</div>
                        <div class="text-sm text-gray-500">Electrocardiograma</div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Laboratorio -->
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i class="fas fa-flask text-red-500 mr-2"></i>
                    Laboratorio
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      @click="selectTipo('TIPO_SANGRE')"
                      class="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center gap-3"
                    >
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
                        :style="{ backgroundColor: getIconBackground('TIPO_SANGRE') }"
                      >
                        <i
                          :class="getTipoIcon('TIPO_SANGRE')"
                          class="text-lg"
                          :style="{ color: getIconColor('TIPO_SANGRE') }"
                        ></i>
                      </div>
                      <div>
                        <div class="font-medium text-gray-800">Tipo de Sangre</div>
                        <div class="text-sm text-gray-500">Grupo sanguíneo</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Formulario -->
          <div v-if="currentStep === 'form'" class="space-y-6">
            <div class="flex items-center mb-4">
              <button
                @click="handleBackToSelect"
                class="text-emerald-600 hover:text-emerald-700 mr-2"
                type="button"
              >
                <i class="fas fa-arrow-left"></i>
              </button>
              <span class="text-sm text-gray-600">
                Tipo: {{ getTipoLabel(formData.tipoEstudio) }}
                <span v-if="isEditing" class="ml-2 text-emerald-600 font-semibold">(Editando)</span>
              </span>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Fecha del estudio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del estudio <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 items-end">
                  <div class="sm:col-span-1">
                    <input
                      v-model="formData.fechaEstudio"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    @click="setFechaHoy"
                    class="w:full md:w-1/2 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 transition-colors"
                  >
                    Usar fecha de hoy
                  </button>
                </div>
              </div>

              <!-- Resultado Global -->
              <div v-if="formData.tipoEstudio !== 'TIPO_SANGRE'">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Resultado Global <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="formData.resultadoGlobal"
                      required
                      @change="handleResultadoGlobalChange"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Seleccione...</option>
                      <option
                        v-for="option in store.resultadoGlobalOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <template v-if="formData.resultadoGlobal === 'ANORMAL'">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ formData.tipoEstudio === 'EKG' ? 'Tipo de Alteración Principal' : 'Tipo de Alteración' }} <span class="text-red-500">*</span>
                      </label>
                      <select
                        v-if="formData.tipoEstudio === 'ESPIROMETRIA'"
                        v-model="formData.tipoAlteracion"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Seleccione...</option>
                        <option
                          v-for="option in store.tipoAlteracionEspirometriaOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      <select
                        v-else-if="formData.tipoEstudio === 'EKG'"
                        v-model="formData.tipoAlteracionPrincipal"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Seleccione...</option>
                        <option
                          v-for="option in store.tipoAlteracionEKGOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Campos condicionales si resultadoGlobal = ANORMAL -->
              <template v-if="formData.resultadoGlobal === 'ANORMAL'">
                <!-- Hallazgo Específico -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Hallazgo Específico
                  </label>
                  <textarea
                    v-model="formData.hallazgoEspecifico"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describa el hallazgo específico..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Relevancia Clínica
                    </label>
                    <select
                      v-model="formData.relevanciaClinica"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Seleccione...</option>
                      <option
                        v-for="option in store.relevanciaClinicaOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Recomendación
                    </label>
                    <input
                      v-model="formData.recomendacion"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Seguimiento, Repetir estudio, Valoración especializada..."
                    />
                  </div>
                </div>

              </template>

              <!-- Campo específico para Tipo de Sangre (siempre requerido) -->
              <div v-if="formData.tipoEstudio === 'TIPO_SANGRE'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Sangre <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <label
                    v-for="option in store.tipoSangreOptions"
                    :key="option.value"
                    :class="[
                      'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out text-sm font-semibold',
                      formData.tipoSangre === option.value
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                  >
                    <input
                      type="radio"
                      class="sr-only"
                      :value="option.value"
                      v-model="formData.tipoSangre"
                    />
                    <span>{{ option.label }}</span>
                    <div
                      v-if="formData.tipoSangre === option.value"
                      class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="handleClose"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="store.loading"
                  class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="store.loading">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Guardando...
                  </span>
                  <span v-else>
                    {{ isEditing ? 'Actualizar' : 'Guardar' }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sección Resultados (Permanente) -->
        <div v-if="hasResults" class="border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div class="px-4 py-2 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-700">Resultados Registrados</h3>
          </div>
          <div class="h-56 overflow-y-auto p-3">
            <div class="space-y-3">
              <div v-for="year in sortedYears" :key="year" class="space-y-2">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                  {{ year }}
                </div>
                <div class="space-y-1.5">
                  <div
                    v-for="item in sortedResultsByYear(year)"
                    :key="item._id"
                    class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm text-gray-800 truncate">
                        {{ getTipoLabel(item.tipoEstudio) }}
                      </div>
                      <div class="text-xs text-gray-600 truncate">
                        {{ formatDate(item.fechaEstudio) }}
                        <span v-if="item.tipoEstudio !== 'TIPO_SANGRE' && item.resultadoGlobal" class="ml-1">
                          - <span :class="getResultadoColor(item.resultadoGlobal)">
                            {{ getResultadoLabel(item.resultadoGlobal) }}
                          </span>
                        </span>
                        <span v-else-if="item.tipoEstudio === 'TIPO_SANGRE' && item.tipoSangre" class="ml-1">
                          - <span class="text-red-600 font-semibold">{{ getTipoSangreLabel(item.tipoSangre) }}</span>
                        </span>
                      </div>
                    </div>
                    <div class="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        @click="handleEdit(item)"
                        class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <i class="fas fa-edit text-sm"></i>
                      </button>
                      <button
                        @click="handleDelete(item)"
                        class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <i class="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    </Transition>

      <ConfirmacionEliminar
        :is-open="isDeleteModalOpen"
        title="Eliminar resultado clínico"
        :message="deleteMessage"
        :fecha="modalFecha"
        :resultado="modalResultado"
        :tipo-sangre="modalTipoSangre"
        :tipo-estudio-label="modalTipoEstudio"
        @close="closeDeleteModal"
        @confirm="confirmDeleteResultado"
      />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, inject, nextTick } from 'vue';
import { useResultadosClinicosStore, type ResultadoClinico } from '@/stores/resultadosClinicos';
import { convertirFechaISOaDDMMYYYY, formatDateYYYYMMDD } from '@/helpers/dates';
import ConfirmacionEliminar from '@/components/ConfirmacionEliminar.vue';

const props = defineProps<{
  isOpen: boolean;
  trabajadorId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const toast: any = inject('toast');
const store = useResultadosClinicosStore();

const currentStep = ref<'select' | 'form'>('select');
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const formData = ref<Partial<ResultadoClinico>>({
  tipoEstudio: undefined,
  fechaEstudio: '',
  resultadoGlobal: undefined,
  hallazgoEspecifico: '',
  relevanciaClinica: undefined,
  recomendacion: '',
  tipoAlteracion: undefined,
  tipoAlteracionPrincipal: undefined,
  tipoSangre: undefined,
});

const isDeleteModalOpen = ref(false);
const resultadoParaEliminar = ref<ResultadoClinico | null>(null);

// Observar cuando se abre el drawer
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    // Esperar un tick para asegurar que current esté establecido si se estableció antes de abrir
    await nextTick();
    
    // Si hay un resultado en current, cargarlo para edición
    if (store.current) {
      handleEdit(store.current);
    } else {
      // Modo nuevo: resetear todo
      currentStep.value = 'select';
      isEditing.value = false;
      editingId.value = null;
      resetForm();
    }
    await store.fetchByTrabajador(props.trabajadorId);
    await store.fetchResultadosAgrupados(props.trabajadorId);
  }
}, { immediate: true });

// Observar cambios en current del store (para edición desde fuera)
// Esto maneja el caso cuando current se establece después de que el drawer ya está abierto
watch(() => store.current, (newCurrent, oldCurrent) => {
  // Solo procesar si hay un nuevo current y el drawer está abierto
  if (newCurrent && props.isOpen) {
    // Si había un current anterior y es diferente, o si no había, cargar el nuevo
    if (!oldCurrent || (oldCurrent._id && newCurrent._id && oldCurrent._id !== newCurrent._id)) {
      handleEdit(newCurrent);
    }
  }
});

const selectTipo = (tipo: 'ESPIROMETRIA' | 'EKG' | 'TIPO_SANGRE') => {
  // Entrar en modo "Registrar" (nuevo)
  isEditing.value = false;
  editingId.value = null;
  store.setCurrent(null); // Limpiar current para asegurar modo nuevo
  
  // Resetear formulario y establecer tipo de estudio
  resetForm();
  formData.value.tipoEstudio = tipo;
  formData.value.resultadoGlobal = undefined;
  
  // Ir al formulario
  currentStep.value = 'form';
};

const handleBackToSelect = () => {
  // Si estamos en modo edición, resetear a modo nuevo
  if (isEditing.value) {
    isEditing.value = false;
    editingId.value = null;
    store.setCurrent(null);
  }
  // Resetear formulario y volver al selector
  resetForm();
  currentStep.value = 'select';
};

const setFechaHoy = () => {
  const hoy = new Date().toISOString().split('T')[0];
  formData.value.fechaEstudio = hoy;
};

const handleResultadoGlobalChange = () => {
  // Si cambia a NORMAL o NO_CONCLUYENTE, limpiar campos condicionales
  if (formData.value.resultadoGlobal !== 'ANORMAL') {
    formData.value.hallazgoEspecifico = '';
    formData.value.relevanciaClinica = undefined;
    formData.value.recomendacion = '';
    formData.value.tipoAlteracion = undefined;
    formData.value.tipoAlteracionPrincipal = undefined;
  }
};

const handleEdit = (item: ResultadoClinico) => {
  // Entrar en modo "Editar"
  isEditing.value = true;
  editingId.value = item._id || null;
  store.setCurrent(item); // Establecer current para mantener consistencia
  
  // Convertir fecha a formato YYYY-MM-DD para el input
  let fecha = '';
  if (item.fechaEstudio) {
    if (item.fechaEstudio instanceof Date) {
      fecha = formatDateYYYYMMDD(item.fechaEstudio.toISOString());
    } else {
      // Si es string, intentar formatearlo
      try {
        fecha = formatDateYYYYMMDD(item.fechaEstudio);
      } catch {
        // Si falla, usar la fecha directamente si ya está en formato YYYY-MM-DD
        fecha = item.fechaEstudio.split('T')[0];
      }
    }
  }
  
  // Cargar datos del resultado en el formulario
  formData.value = {
    tipoEstudio: item.tipoEstudio,
    fechaEstudio: fecha,
    resultadoGlobal: item.resultadoGlobal,
    hallazgoEspecifico: item.hallazgoEspecifico || '',
    relevanciaClinica: item.relevanciaClinica,
    recomendacion: item.recomendacion || '',
    tipoAlteracion: item.tipoAlteracion,
    tipoAlteracionPrincipal: item.tipoAlteracionPrincipal,
    tipoSangre: item.tipoSangre,
  };
  
  // Ir directamente al formulario (no mostrar selector)
  currentStep.value = 'form';
};

const handleDelete = (item: ResultadoClinico) => {
  resultadoParaEliminar.value = item;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  resultadoParaEliminar.value = null;
};

const confirmDeleteResultado = async () => {
  if (!resultadoParaEliminar.value?._id) return;
  try {
    await store.deleteResultado(resultadoParaEliminar.value._id);
    await store.fetchResultadosAgrupados(props.trabajadorId);
    toast.open({
      message: 'Resultado eliminado correctamente',
      type: 'success',
    });
  } catch (error) {
    toast.open({
      message: 'Error al eliminar el resultado',
      type: 'error',
    });
  } finally {
    closeDeleteModal();
  }
};

const handleSubmit = async () => {
  try {
    // Validaciones adicionales
    if (formData.value.tipoEstudio !== 'TIPO_SANGRE' && formData.value.resultadoGlobal === 'ANORMAL') {
      if (formData.value.tipoEstudio === 'ESPIROMETRIA' && !formData.value.tipoAlteracion) {
        toast.open({
          message: 'Por favor seleccione el tipo de alteración',
          type: 'error',
        });
        return;
      }
      
      if (formData.value.tipoEstudio === 'EKG' && !formData.value.tipoAlteracionPrincipal) {
        toast.open({
          message: 'Por favor seleccione el tipo de alteración principal',
          type: 'error',
        });
        return;
      }
    }
    
    if (formData.value.tipoEstudio === 'TIPO_SANGRE' && !formData.value.tipoSangre) {
      toast.open({
        message: 'Por favor seleccione el tipo de sangre',
        type: 'error',
      });
      return;
    }
    
    // Preparar payload
    const payload: any = {
      idTrabajador: props.trabajadorId,
      tipoEstudio: formData.value.tipoEstudio,
      fechaEstudio: new Date(formData.value.fechaEstudio as string).toISOString(),
    };

    if (formData.value.tipoEstudio !== 'TIPO_SANGRE') {
      payload.resultadoGlobal = formData.value.resultadoGlobal;
    }
    
    // Agregar campos condicionales
    if (formData.value.resultadoGlobal === 'ANORMAL') {
      payload.hallazgoEspecifico = formData.value.hallazgoEspecifico;
      payload.relevanciaClinica = formData.value.relevanciaClinica;
      payload.recomendacion = formData.value.recomendacion;
      
      if (formData.value.tipoEstudio === 'ESPIROMETRIA') {
        payload.tipoAlteracion = formData.value.tipoAlteracion;
      }
      
      if (formData.value.tipoEstudio === 'EKG') {
        payload.tipoAlteracionPrincipal = formData.value.tipoAlteracionPrincipal;
      }
    }
    
    if (formData.value.tipoEstudio === 'TIPO_SANGRE') {
      payload.tipoSangre = formData.value.tipoSangre;
    }
    
    if (isEditing.value && editingId.value) {
      await store.updateResultado(editingId.value, payload);
      toast.open({
        message: 'Resultado actualizado correctamente',
        type: 'success',
      });
    } else {
      await store.createResultado(payload);
      toast.open({
        message: 'Resultado creado correctamente',
        type: 'success',
      });
    }
    
    // Refrescar resultados agrupados después de crear/actualizar
    await store.fetchResultadosAgrupados(props.trabajadorId);
    
    handleClose();
  } catch (error: any) {
    toast.open({
      message: error.response?.data?.message || 'Error al guardar el resultado',
      type: 'error',
    });
  }
};

const handleClose = () => {
  resetForm();
  currentStep.value = 'select';
  isEditing.value = false;
  editingId.value = null;
  store.setCurrent(null); // Limpiar current al cerrar
  emit('close');
};

const resetForm = () => {
  formData.value = {
    tipoEstudio: undefined,
    fechaEstudio: '',
    resultadoGlobal: undefined,
    hallazgoEspecifico: '',
    relevanciaClinica: undefined,
    recomendacion: '',
    tipoAlteracion: undefined,
    tipoAlteracionPrincipal: undefined,
    tipoSangre: undefined,
  };
};

const hasResults = computed(() => {
  const results = store.resultsByYear;
  return Object.keys(results).length > 0 && 
    Object.values(results).some(yearResults => yearResults.length > 0);
});

const sortedYears = computed(() => {
  const years = Object.keys(store.resultsByYear || {});
  return years.sort((a, b) => Number(b) - Number(a));
});

const sortedResultsByYear = (year: string) => {
  const results = store.resultsByYear[year] || [];
  return [...results].sort((a, b) => {
    const timeA = new Date(a.fechaEstudio).getTime();
    const timeB = new Date(b.fechaEstudio).getTime();
    return timeB - timeA; // Más reciente primero
  });
};

const getTipoLabel = (tipo?: string) => {
  const option = store.tipoEstudioOptions.find(opt => opt.value === tipo);
  return option?.label || tipo || '';
};

const deleteMessage = computed(() => {
  if (!resultadoParaEliminar.value) {
    return '¿Deseas eliminar este resultado clínico?';
  }
  return '¿Deseas eliminar el resultado de ';
});

const modalFecha = computed(() => {
  if (!resultadoParaEliminar.value?.fechaEstudio) return '';
  return formatDate(resultadoParaEliminar.value.fechaEstudio);
});

const modalResultado = computed(() => {
  if (!resultadoParaEliminar.value?.resultadoGlobal) return '';
  return getResultadoLabel(resultadoParaEliminar.value.resultadoGlobal);
});

const modalTipoSangre = computed(() => {
  if (resultadoParaEliminar.value?.tipoSangre) {
    return getTipoSangreLabel(resultadoParaEliminar.value.tipoSangre);
  }
  return '';
});

const modalTipoEstudio = computed(() => {
  if (!resultadoParaEliminar.value?.tipoEstudio) return '';
  return getTipoLabel(resultadoParaEliminar.value.tipoEstudio);
});

const getResultadoLabel = (resultado?: string) => {
  const option = store.resultadoGlobalOptions.find(opt => opt.value === resultado);
  return option?.label || resultado || '';
};

const getResultadoColor = (resultado?: string) => {
  if (resultado === 'NORMAL') return 'text-green-600 font-semibold';
  if (resultado === 'ANORMAL') return 'text-red-600 font-semibold';
  return 'text-yellow-600 font-semibold';
};

const getTipoSangreLabel = (tipo?: string) => {
  const option = store.tipoSangreOptions.find(opt => opt.value === tipo);
  return option?.label || tipo || '';
};

const getTipoIcon = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return 'fas fa-lungs';
  if (tipo === 'EKG') return 'fas fa-heartbeat';
  if (tipo === 'TIPO_SANGRE') return 'fas fa-tint';
  return 'fas fa-notes-medical';
};

const getIconColor = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return '#1d4ed8';
  if (tipo === 'EKG') return '#dc2626';
  if (tipo === 'TIPO_SANGRE') return '#991b1b';
  return '#475569';
};

const getIconBackground = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return 'rgba(30,64,175,0.12)';
  if (tipo === 'EKG') return 'rgba(220,38,38,0.12)';
  if (tipo === 'TIPO_SANGRE') return 'rgba(153,27,27,0.12)';
  return 'rgba(71,85,105,0.08)';
};

const formatDate = (date: string | Date) => {
  if (!date) return '';
  const dateStr = date instanceof Date ? date.toISOString() : date;
  return convertirFechaISOaDDMMYYYY(dateStr);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active {
  transition: transform 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-active {
  transition: transform 0.3s ease-in;
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
