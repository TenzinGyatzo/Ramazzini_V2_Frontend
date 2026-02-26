<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataLesion } = useFormDataStore();
const documentos = useDocumentosStore();

const today = format(new Date(), 'yyyy-MM-dd');

const SERVICIO_ATENCION_OPTS = [
  { value: 1, label: '1 - CONSULTA EXTERNA' },
  { value: 2, label: '2 - HOSPITALIZACION' },
  { value: 3, label: '3 - URGENCIAS' },
  { value: 4, label: '4 - SERVICIO ESPECIALIZADO DE ATENCION A LA VIOLENCIA' },
  { value: 5, label: '5 - OTRO SERVICIO' },
];

const TIPO_ATENCION_OPTS = [
  { value: 1, label: '1 - TRATAMIENTO MÉDICO' },
  { value: 2, label: '2 - TRATAMIENTO PSICOLÓGICO' },
  { value: 3, label: '3 - TRATAMIENTO QUIRÚRGICO' },
  { value: 4, label: '4 - TRATAMIENTO PSIQUIÁTRICO' },
  { value: 5, label: '5 - CONSEJERÍA' },
  { value: 6, label: '6 - OTRO' },
  { value: 7, label: '7 - PÍLDORA ANTICONCEPTIVA DE EMERGENCIA' },
  { value: 8, label: '8 - PROFILAXIS VIH' },
  { value: 9, label: '9 - PROFILAXIS OTRAS ITS' },
];

const MAX_TIPO_ATENCION = 5;

const fechaAtencion = ref(today);
const horaAtencion = ref('');
const horaAtencionDesconocida = ref(false);
const servicioAtencion = ref(null);
const especifiqueServicio = ref('');
const tipoAtencion = ref([]);

const syncToFormData = () => {
  formDataLesion.fechaAtencion = fechaAtencion.value ? new Date(fechaAtencion.value) : undefined;
  formDataLesion.horaAtencion = horaAtencionDesconocida.value ? '99:99' : (horaAtencion.value?.trim() || undefined);
  formDataLesion.servicioAtencion = servicioAtencion.value;
  formDataLesion.especifiqueServicio = servicioAtencion.value === 5 ? (especifiqueServicio.value?.trim() || undefined) : undefined;
  formDataLesion.tipoAtencion = tipoAtencion.value?.length ? [...tipoAtencion.value] : [];
};

const formatHoraAtencionInput = (e) => {
  let v = (e.target?.value || '').slice(0, 5);
  if (/[^\d:]/.test(v)) {
    horaAtencion.value = v;
    return;
  }
  if (v.length === 2 && !v.includes(':')) {
    v += ':';
  } else if (v.length > 2 && v[2] !== ':') {
    v = v.slice(0, 2) + ':' + v.slice(2).replace(/:/g, '');
  }
  v = v.slice(0, 5);
  if (v.length === 5) {
    const [hh, mm] = v.split(':').map(Number);
    if (!isNaN(hh) && hh > 23) v = '23:' + (isNaN(mm) ? '00' : String(mm).padStart(2, '0'));
    else if (!isNaN(mm) && mm > 59) v = (isNaN(hh) ? '00' : String(hh).padStart(2, '0')) + ':59';
  }
  horaAtencion.value = v;
};

watch(servicioAtencion, (val) => {
  if (val !== 5) especifiqueServicio.value = '';
});

watch(horaAtencionDesconocida, (checked) => {
  if (checked) horaAtencion.value = '';
});

watch(
  [fechaAtencion, horaAtencion, horaAtencionDesconocida, servicioAtencion, especifiqueServicio, tipoAtencion],
  () => syncToFormData(),
  { deep: true }
);

onMounted(() => {
  const doc = documentos.currentDocument || formDataLesion;

  if (doc?.fechaAtencion) {
    fechaAtencion.value = formatDateYYYYMMDD(doc.fechaAtencion) || today;
  }
  if (doc?.horaAtencion) {
    horaAtencion.value = doc.horaAtencion;
    horaAtencionDesconocida.value = doc.horaAtencion === '99:99';
  }
  if (doc?.servicioAtencion != null) servicioAtencion.value = doc.servicioAtencion;
  if (doc?.especifiqueServicio) especifiqueServicio.value = (doc.especifiqueServicio || '').toUpperCase();
  if (Array.isArray(doc?.tipoAtencion) && doc.tipoAtencion.length > 0) {
    tipoAtencion.value = [...doc.tipoAtencion];
  }

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

const canAddTipoAtencion = (value) => {
  if (tipoAtencion.value.includes(value)) return true;
  return tipoAtencion.value.length < MAX_TIPO_ATENCION;
};

const inputClass = 'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass = 'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

const parseHHMM = (str) => {
  if (!str || str === '99:99') return null;
  const [h, m] = (str || '').split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};
const HORA_VALIDA_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const horaAtencionFormatoError = computed(() => {
  if (horaAtencionDesconocida.value) return '';
  const v = horaAtencion.value?.trim();
  if (!v) return '';
  if (HORA_VALIDA_REGEX.test(v)) return '';
  if (/[^\d:]/.test(v)) return 'Solo se permiten dígitos y formato HH:mm.';
  const [hh, mm] = v.split(':').map(Number);
  if (v.length < 5 || isNaN(hh) || isNaN(mm)) return 'Complete el formato HH:mm (ej: 14:30).';
  if (hh < 0 || hh > 23) return 'Las horas deben estar entre 00 y 23.';
  if (mm < 0 || mm > 59) return 'Los minutos deben estar entre 00 y 59.';
  return '';
});
const horaAtencionError = computed(() => {
  const fe = formDataLesion?.fechaEvento;
  const fa = formDataLesion?.fechaAtencion;
  if (!fe || !fa) return '';
  const d1 = new Date(fe).toDateString();
  const d2 = new Date(fa).toDateString();
  if (d1 !== d2) return '';
  const he = parseHHMM(formDataLesion?.horaEvento);
  const ha = parseHHMM(horaAtencionDesconocida.value ? '99:99' : (horaAtencion.value?.trim() || ''));
  if (he == null || ha == null) return '';
  if (ha <= he) return 'Cuando el evento y la atención son el mismo día, la hora de atención debe ser posterior a la hora del evento.';
  return '';
});
const horaAtencionErrorFinal = computed(() => horaAtencionFormatoError.value || horaAtencionError.value);
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-base font-semibold text-gray-900 mb-2">Atención recibida</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
      <div>
        <label :class="labelClass">Fecha de atención <span class="text-red-500">*</span></label>
        <input
          v-model="fechaAtencion"
          type="date"
          :class="inputClass"
          required
        />
      </div>

      <div>
        <label :class="labelClass">Hora de atención (HH:mm)</label>
        <input
          :value="horaAtencion"
          type="text"
          :class="inputClass"
          placeholder="Ej: 14:30"
          maxlength="5"
          :disabled="horaAtencionDesconocida"
          @input="formatHoraAtencionInput"
        />
        <div v-if="horaAtencionErrorFinal" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
          <i class="fas fa-exclamation-triangle mt-0.5"></i>
          <span>{{ horaAtencionErrorFinal }}</span>
        </div>
        <label class="mt-2 inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            v-model="horaAtencionDesconocida"
            type="checkbox"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Se desconoce la hora</span>
        </label>
      </div>
    </div>

    <div class="mb-2">
      <label :class="labelClass">Servicio que otorgó la atención</label>
      <select v-model="servicioAtencion" :class="selectClass">
        <option :value="null">Seleccione...</option>
        <option v-for="opt in SERVICIO_ATENCION_OPTS" :key="opt.value" :value="opt.value">
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
      <div v-if="servicioAtencion === 5" class="mt-4">
        <label :class="labelClass">Especifique el servicio</label>
        <input
          :value="especifiqueServicio"
          type="text"
          :class="inputClass"
          placeholder="Nombre del servicio..."
          @input="especifiqueServicio = ($event.target?.value || '').toUpperCase()"
        />
      </div>
    </transition>

    <div class="mt-4">
      <label :class="labelClass">Tipo de atención (seleccione hasta 5) <span class="text-red-500">*</span></label>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="opt in TIPO_ATENCION_OPTS"
          :key="opt.value"
          class="inline-flex items-center gap-1.5 text-sm cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': !canAddTipoAtencion(opt.value) }"
        >
          <input
            v-model="tipoAtencion"
            type="checkbox"
            :value="opt.value"
            :disabled="!canAddTipoAtencion(opt.value)"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>
  </div>
</template>
