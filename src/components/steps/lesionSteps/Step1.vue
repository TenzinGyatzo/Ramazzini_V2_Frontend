<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const { formDataLesion } = useFormDataStore();
const documentos = useDocumentosStore();

const today = format(new Date(), 'yyyy-MM-dd');

const DIA_FESTIVO_OPTS = [
  { value: 1, label: '1 - SI' },
  { value: 2, label: '2 - NO' },
];

const fechaReporteLesion = ref(today);
const fechaEvento = ref(today);
const horaEvento = ref('');
const horaEventoDesconocida = ref(false);
const diaFestivo = ref(null);

const syncToFormData = () => {
  formDataLesion.fechaReporteLesion = fechaReporteLesion.value
    ? new Date(fechaReporteLesion.value)
    : new Date(today);
  formDataLesion.fechaEvento = fechaEvento.value ? new Date(fechaEvento.value) : undefined;
  formDataLesion.horaEvento = horaEventoDesconocida.value ? '99:99' : (horaEvento.value?.trim() || undefined);
  formDataLesion.diaFestivo = diaFestivo.value ?? undefined;
};

const formatHoraEventoInput = (e) => {
  let v = (e.target?.value || '').slice(0, 5);
  if (/[^\d:]/.test(v)) {
    horaEvento.value = v;
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
  horaEvento.value = v;
};

watch(horaEventoDesconocida, (checked) => {
  if (checked) horaEvento.value = '';
});

watch(
  [fechaReporteLesion, fechaEvento, horaEvento, horaEventoDesconocida, diaFestivo],
  () => syncToFormData(),
  { deep: true }
);

onMounted(() => {
  const doc = documentos.currentDocument || formDataLesion;

  fechaReporteLesion.value = formatDateYYYYMMDD(doc?.fechaReporteLesion || today) || today;
  fechaEvento.value = formatDateYYYYMMDD(doc?.fechaEvento || '') || today;
  if (doc?.horaEvento) {
    horaEvento.value = doc.horaEvento;
    horaEventoDesconocida.value = doc.horaEvento === '99:99';
  }
  if (doc?.diaFestivo != null) diaFestivo.value = doc.diaFestivo;

  formDataLesion.idTrabajador = trabajadores.currentTrabajadorId;

  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const t = trabajadores.currentTrabajador;
  const trabajadorNombre = t ? [t.primerApellido ?? '', t.segundoApellido ?? '', t.nombre ?? ''].join(' ').trim() : '';
  const trabajadorId = trabajadores.currentTrabajadorId;
  formDataLesion.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajadorNombre}_${trabajadorId}`;

  syncToFormData();
});

onUnmounted(() => {
  syncToFormData();
});

const inputClass =
  'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass =
  'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

const HORA_VALIDA_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const horaEventoError = computed(() => {
  if (horaEventoDesconocida.value) return '';
  const v = horaEvento.value?.trim();
  if (!v) return '';
  if (HORA_VALIDA_REGEX.test(v)) return '';
  if (/[^\d:]/.test(v)) return 'Solo se permiten dígitos y formato HH:mm.';
  const [hh, mm] = v.split(':').map(Number);
  if (v.length < 5 || isNaN(hh) || isNaN(mm)) return 'Complete el formato HH:mm (ej: 14:30).';
  if (hh < 0 || hh > 23) return 'Las horas deben estar entre 00 y 23.';
  if (mm < 0 || mm > 59) return 'Los minutos deben estar entre 00 y 59.';
  return '';
});

const fechaEventoError = computed(() => {
  const fe = fechaEvento.value;
  if (!fe) return '';
  const fechaEv = new Date(fe);
  if (isNaN(fechaEv.getTime())) return '';

  const fechaNac = trabajadores.currentTrabajador?.fechaNacimiento;
  if (fechaNac) {
    const fn = new Date(fechaNac);
    if (!isNaN(fn.getTime()) && fechaEv < fn) {
      return 'La fecha del evento no puede ser anterior a la fecha de nacimiento del trabajador.';
    }
  }

  const fechaAt = formDataLesion?.fechaAtencion;
  if (fechaAt) {
    const fa = new Date(fechaAt);
    if (!isNaN(fa.getTime()) && fechaEv > fa) {
      return 'La fecha del evento no puede ser posterior a la fecha de atención.';
    }
  }
  return '';
});
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-2xl font-bold mb-4 text-gray-900">¿Cuándo ocurrió el evento?</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
      <div>
        <label :class="labelClass">Fecha de reporte *</label>
        <input
          v-model="fechaReporteLesion"
          type="date"
          :class="inputClass"
          required
        />
      </div>

      <div>
        <label :class="labelClass">Fecha del evento *</label>
        <input
          v-model="fechaEvento"
          type="date"
          :class="inputClass"
          required
        />
        <div v-if="fechaEventoError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
          <i class="fas fa-exclamation-triangle mt-0.5"></i>
          <span>{{ fechaEventoError }}</span>
        </div>
      </div>

      <div>
        <label :class="labelClass">Hora del evento (HH:mm)</label>
        <input
          :value="horaEvento"
          type="text"
          :class="inputClass"
          placeholder="Ej: 14:30"
          maxlength="5"
          :disabled="horaEventoDesconocida"
          @input="formatHoraEventoInput"
        />
        <div v-if="horaEventoError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
          <i class="fas fa-exclamation-triangle mt-0.5"></i>
          <span>{{ horaEventoError }}</span>
        </div>
        <label class="mt-2 inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            v-model="horaEventoDesconocida"
            type="checkbox"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Se desconoce la hora</span>
        </label>
      </div>

      <div>
        <label :class="labelClass">¿Día festivo?</label>
        <select v-model="diaFestivo" :class="selectClass">
          <option :value="null">Seleccione...</option>
          <option v-for="opt in DIA_FESTIVO_OPTS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
