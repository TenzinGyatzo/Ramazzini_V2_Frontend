<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataLesion } = useFormDataStore();
const documentos = useDocumentosStore();

const DESPUES_ATENCION_OPTS = [
  { value: 1, label: '1 - DOMICILIO' },
  { value: 2, label: '2 - TRASLADO A OTRA UNIDAD MÉDICA' },
  { value: 3, label: '3 - SERVICIO ESPECIALIZADO ATENCION A LA VIOLENCIA' },
  { value: 4, label: '4 - CONSULTA EXTERNA' },
  { value: 5, label: '5 - DEFUNCION' },
  { value: 6, label: '6 - REFUGIO O ALBERGUE' },
  { value: 7, label: '7 - DIF' },
  { value: 8, label: '8 - HOSPITALIZACION' },
  { value: 9, label: '9 - MINISTERIO PUBLICO' },
  { value: 10, label: '10 - GRUPO DE AYUDA MUTUA' },
  { value: 11, label: '11 - OTRO' },
];

const MINISTERIO_PUBLICO_OPTS = [
  { value: 1, label: '1 - SI' },
  { value: 2, label: '2 - NO' },
];

const despuesAtencion = ref(null);
const especifiqueDestino = ref('');
const ministerioPublico = ref(null);
const folioCertificadoDefuncion = ref('');

const syncToFormData = () => {
  formDataLesion.despuesAtencion = despuesAtencion.value ?? undefined;
  formDataLesion.especifiqueDestino = despuesAtencion.value === 11
    ? (especifiqueDestino.value?.trim() || undefined)
    : undefined;
  formDataLesion.ministerioPublico = ministerioPublico.value ?? undefined;
  formDataLesion.folioCertificadoDefuncion =
    despuesAtencion.value === 5 && ministerioPublico.value === 2
      ? (folioCertificadoDefuncion.value?.trim() || undefined)
      : undefined;
};

const formatFolioInput = (e) => {
  const v = (e.target?.value || '').replace(/\D/g, '').slice(0, 9);
  folioCertificadoDefuncion.value = v;
};

watch(despuesAtencion, (val) => {
  if (val !== 11) especifiqueDestino.value = '';
  if (!(val === 5 && ministerioPublico.value === 2)) folioCertificadoDefuncion.value = '';
});

watch(ministerioPublico, (val) => {
  if (!(despuesAtencion.value === 5 && val === 2)) folioCertificadoDefuncion.value = '';
});

watch(
  [despuesAtencion, especifiqueDestino, ministerioPublico, folioCertificadoDefuncion],
  () => syncToFormData(),
  { deep: true }
);

onMounted(() => {
  const doc = documentos.currentDocument || formDataLesion;

  if (doc?.despuesAtencion != null) despuesAtencion.value = doc.despuesAtencion;
  if (doc?.especifiqueDestino) especifiqueDestino.value = (doc.especifiqueDestino || '').toUpperCase();
  if (doc?.ministerioPublico != null) ministerioPublico.value = doc.ministerioPublico;
  if (doc?.folioCertificadoDefuncion) folioCertificadoDefuncion.value = doc.folioCertificadoDefuncion;

  syncToFormData();
});

onUnmounted(() => {
  syncToFormData();
});

const transitionClasses = {
  enter: 'transition-all duration-300 ease-out',
  enterFrom: 'opacity-0 transform -translate-y-2',
  enterTo: 'opacity-100 transform translate-y-0',
  leave: 'transition-all duration-200 ease-in',
  leaveFrom: 'opacity-100 transform translate-y-0',
  leaveTo: 'opacity-0 transform -translate-y-2',
};

const inputClass = 'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass = 'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

const folioCertificadoError = computed(() => {
  if (despuesAtencion.value !== 5 || ministerioPublico.value !== 2) return '';
  const v = folioCertificadoDefuncion.value?.trim() || '';
  if (v.length === 0) return '';
  if (v.length !== 9 || !/^\d{9}$/.test(v)) return 'El folio debe tener exactamente 9 dígitos.';
  return '';
});
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-base font-semibold text-gray-900 mb-2">Destino y seguimiento</h1>

    <div class="mb-2">
      <label :class="labelClass">Destino después de la atención</label>
      <select v-model="despuesAtencion" :class="selectClass">
        <option :value="null">Seleccione...</option>
        <option v-for="opt in DESPUES_ATENCION_OPTS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="despuesAtencion === 11" class="mt-2 mb-2">
        <label :class="labelClass">Especifique destino</label>
        <input
          :value="especifiqueDestino"
          type="text"
          :class="inputClass"
          placeholder="Nombre del destino..."
          maxlength="50"
          @input="especifiqueDestino = ($event.target?.value || '').toUpperCase()"
        />
      </div>
    </transition>

    <div class="mb-2">
      <label :class="labelClass">¿Dio aviso al Ministerio Público?</label>
      <select v-model="ministerioPublico" :class="selectClass">
        <option :value="null">Seleccione...</option>
        <option v-for="opt in MINISTERIO_PUBLICO_OPTS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="despuesAtencion === 5 && ministerioPublico === 2" class="mt-2 mb-2">
        <label :class="labelClass">Folio del certificado de defunción (9 dígitos)</label>
        <input
          :value="folioCertificadoDefuncion"
          type="text"
          :class="inputClass"
          placeholder="Ej: 250123456"
          maxlength="9"
          inputmode="numeric"
          @input="formatFolioInput"
        />
        <div v-if="folioCertificadoError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
          <i class="fas fa-exclamation-triangle mt-0.5"></i>
          <span>{{ folioCertificadoError }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>
