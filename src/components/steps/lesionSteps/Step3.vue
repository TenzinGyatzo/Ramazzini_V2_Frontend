<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { calcularEdad } from '@/helpers/dates';
import CatalogsAPI from '@/api/CatalogsAPI';
import { CatalogType } from '@/interfaces/catalogos.interface';

const { formDataLesion } = useFormDataStore();
const documentos = useDocumentosStore();
const trabajadores = useTrabajadoresStore();

// Catálogo dinámico
const agenteLesionOpts = ref([]);

// Opciones estáticas
const INTENCIONALIDAD_OPTS = [
  { value: 1, label: '1 - ACCIDENTAL' },
  { value: 2, label: '2 - VIOLENCIA FAMILIAR' },
  { value: 3, label: '3 - VIOLENCIA NO FAMILIAR' },
  { value: 4, label: '4 - AUTOINFLIGIDO' },
  { value: 11, label: '11 - TRATA DE PERSONAS' },
];

const EVENTO_REPETIDO_OPTS = [
  { value: 1, label: '1 - ÚNICA VEZ' },
  { value: 2, label: '2 - REPETIDO' },
];

const TIPO_VIOLENCIA_OPTS = [
  { value: 6, label: '6 - VIOLENCIA FÍSICA' },
  { value: 7, label: '7 - VIOLENCIA SEXUAL' },
  { value: 8, label: '8 - VIOLENCIA PSICOLÓGICA' },
  { value: 9, label: '9 - VIOLENCIA ECONÓMICA/PATRIMONIAL' },
  { value: 10, label: '10 - ABANDONO Y/O NEGLIGENCIA' },
];

const NUMERO_AGRESORES_OPTS = [
  { value: 1, label: '1 - ÚNICO' },
  { value: 2, label: '2 - MÁS DE UNO' },
  { value: 3, label: '3 - NO ESPECIFICADO' },
];

const PARENTESCO_FULL = [
  { value: 0, label: '0 - NO ESPECIFICADO' },
  { value: 1, label: '1 - PADRE' },
  { value: 2, label: '2 - MADRE' },
  { value: 3, label: '3 - CÓNYUGE / PAREJA / NOVIO' },
  { value: 4, label: '4 - OTRO PARIENTE' },
  { value: 5, label: '5 - PADRASTRO' },
  { value: 6, label: '6 - MADRASTRA' },
  { value: 7, label: '7 - CONOCIDO SIN PARENTESCO' },
  { value: 8, label: '8 - DESCONOCIDO' },
  { value: 9, label: '9 - HIJA / HIJO' },
  { value: 10, label: '10 - OTRO' },
  { value: 99, label: '99 - SE IGNORA' },
];

const SEXO_AGRESOR_OPTS = [
  { value: 0, label: '0 - NO ESPECIFICADO' },
  { value: 1, label: '1 - HOMBRE' },
  { value: 2, label: '2 - MUJER' },
  { value: 3, label: '3 - INTERSEXUAL' },
  { value: 9, label: '9 - SE IGNORA' },
];

const LESIONADO_VEHICULO_OPTS = [
  { value: 1, label: '1 - CONDUCTOR' },
  { value: 2, label: '2 - OCUPANTE' },
  { value: 3, label: '3 - PEATÓN' },
  { value: 4, label: '4 - SE IGNORA' },
];

const USO_EQUIPO_OPTS = [
  { value: 1, label: '1 - SI' },
  { value: 2, label: '2 - NO' },
  { value: 9, label: '9 - SE IGNORA' },
];

const EQUIPO_UTILIZADO_OPTS = [
  { value: 1, label: '1 - CINTURÓN' },
  { value: 2, label: '2 - CASCO' },
  { value: 3, label: '3 - SILLA INFANTIL' },
  { value: 4, label: '4 - OTRO' },
];

const BAJO_EFECTOS_OPTS = [
  { value: 1, label: '1 - ALCOHOL' },
  { value: 2, label: '2 - DROGA POR INDICACIÓN MÉDICA' },
  { value: 3, label: '3 - DROGAS ILEGALES' },
  { value: 4, label: '4 - SE IGNORA' },
  { value: 5, label: '5 - NINGUNA' },
];

const ATENCION_PREHOSP_OPTS = [
  { value: 1, label: '1 - SI' },
  { value: 2, label: '2 - NO' },
];

// Refs locales
const intencionalidad = ref(null);
const eventoRepetido = ref(null);
const agenteLesion = ref(null);
const especifique = ref('');
const tipoViolencia = ref([]);
const numeroAgresores = ref(null);
const parentescoAfectado = ref(null);
const sexoAgresor = ref(null);
const edadAgresor = ref(null);
const agresorBajoEfectos = ref([]);
const lesionadoVehiculoMotor = ref(null);
const usoEquipoSeguridad = ref(null);
const equipoUtilizado = ref(null);
const especifiqueEquipo = ref('');
const sospechaBajoEfectosDe = ref([]);
const atencionPreHospitalaria = ref(null);
const tiempoTrasladoUH = ref('');
const tiempoTrasladoDesconocido = ref(false);

// Mostrar agenteLesion cuando: intenc 1/4 (Accidental/Autoinfligido) O tipoViolencia incluye 6 o 7 (Física/Sexual)
const mostrarAgenteLesion = computed(() => {
  const int = intencionalidad.value;
  const tv = tipoViolencia.value || [];
  const tieneFisicaSexual = tv.includes(6) || tv.includes(7);
  return int === 1 || int === 4 || tieneFisicaSexual;
});

// Parentesco filtrado según intencionalidad (intenc. 2: excluir 7,8; intenc. 3: solo 7,8)
const parentescoOptsFiltrados = computed(() => {
  const int = intencionalidad.value;
  if (int === 2) {
    return PARENTESCO_FULL.filter((o) => o.value !== 7 && o.value !== 8);
  }
  if (int === 3) {
    return PARENTESCO_FULL.filter((o) => o.value === 7 || o.value === 8);
  }
  return [];
});

// Convertir agresorBajoEfectos y sospechaBajoEfectosDe entre array y string "1&2&3"
const bajoEfectosToArray = (str) => {
  if (!str || typeof str !== 'string') return [];
  return str.split('&').map(Number).filter((n) => !Number.isNaN(n));
};

const arrayToBajoEfectos = (arr) => {
  if (!arr || arr.length === 0) return '';
  return arr.map(String).join('&');
};

const syncToFormData = () => {
  formDataLesion.intencionalidad = intencionalidad.value;
  formDataLesion.eventoRepetido = eventoRepetido.value;
  formDataLesion.agenteLesion = mostrarAgenteLesion.value ? agenteLesion.value : 27;
  formDataLesion.especifique = especifique.value?.trim() || undefined;
  formDataLesion.tipoViolencia = tipoViolencia.value?.length ? [...tipoViolencia.value] : undefined;
  formDataLesion.numeroAgresores = numeroAgresores.value;

  const parentescoAplica = (intencionalidad.value === 2 || intencionalidad.value === 3) && numeroAgresores.value === 1;
  formDataLesion.parentescoAfectado = parentescoAplica ? parentescoAfectado.value : -1;

  formDataLesion.sexoAgresor = sexoAgresor.value;
  formDataLesion.edadAgresor = edadAgresor.value != null ? Number(edadAgresor.value) : undefined;
  formDataLesion.agresorBajoEfectos = (intencionalidad.value === 2 || intencionalidad.value === 3)
    ? arrayToBajoEfectos(agresorBajoEfectos.value) || undefined
    : undefined;
  formDataLesion.lesionadoVehiculoMotor = lesionadoVehiculoMotor.value;
  formDataLesion.usoEquipoSeguridad = usoEquipoSeguridad.value;
  formDataLesion.equipoUtilizado = equipoUtilizado.value;
  formDataLesion.especifiqueEquipo = especifiqueEquipo.value?.trim() || undefined;
  formDataLesion.sospechaBajoEfectosDe = arrayToBajoEfectos(sospechaBajoEfectosDe.value) || undefined;
  formDataLesion.atencionPreHospitalaria = atencionPreHospitalaria.value;
  formDataLesion.tiempoTrasladoUH = tiempoTrasladoDesconocido.value ? '99:99' : (tiempoTrasladoUH.value?.trim() || undefined);
};

const loadAgenteLesion = async () => {
  try {
    const { data } = await CatalogsAPI.listCatalog(CatalogType.AGENTE_LESION);
    agenteLesionOpts.value = (data || []).map((e) => ({
      value: Number(e.code),
      label: `${e.code} - ${(e.description || '').trim()}`,
    }));
  } catch (err) {
    console.error('Error al cargar AGENTE_LESION:', err);
    agenteLesionOpts.value = [];
  }
};

onMounted(async () => {
  await loadAgenteLesion();
  const doc = documentos.currentDocument || formDataLesion;

  if (doc?.intencionalidad != null) intencionalidad.value = doc.intencionalidad;
  if (doc?.eventoRepetido != null) eventoRepetido.value = doc.eventoRepetido;
  if (doc?.agenteLesion != null) agenteLesion.value = doc.agenteLesion;
  if (doc?.especifique) especifique.value = (doc.especifique || '').toUpperCase();
  if (Array.isArray(doc?.tipoViolencia)) tipoViolencia.value = [...doc.tipoViolencia];
  if (doc?.numeroAgresores != null) numeroAgresores.value = doc.numeroAgresores;
  const parentescoVal = doc?.parentescoAfectado;
  if (parentescoVal != null && parentescoVal !== -1) parentescoAfectado.value = parentescoVal;
  if (doc?.sexoAgresor != null) sexoAgresor.value = doc.sexoAgresor;
  if (doc?.edadAgresor != null) edadAgresor.value = doc.edadAgresor;
  if (doc?.agresorBajoEfectos) agresorBajoEfectos.value = bajoEfectosToArray(doc.agresorBajoEfectos);
  if (doc?.lesionadoVehiculoMotor != null) lesionadoVehiculoMotor.value = doc.lesionadoVehiculoMotor;
  if (doc?.usoEquipoSeguridad != null) usoEquipoSeguridad.value = doc.usoEquipoSeguridad;
  if (doc?.equipoUtilizado != null) equipoUtilizado.value = doc.equipoUtilizado;
  if (doc?.especifiqueEquipo) especifiqueEquipo.value = (doc.especifiqueEquipo || '').toUpperCase();
  if (doc?.sospechaBajoEfectosDe) sospechaBajoEfectosDe.value = bajoEfectosToArray(doc.sospechaBajoEfectosDe);
  if (doc?.atencionPreHospitalaria != null) atencionPreHospitalaria.value = doc.atencionPreHospitalaria;
  if (doc?.tiempoTrasladoUH) {
    tiempoTrasladoUH.value = doc.tiempoTrasladoUH;
    tiempoTrasladoDesconocido.value = doc.tiempoTrasladoUH === '99:99';
  }

  syncToFormData();
});

onUnmounted(() => {
  syncToFormData();
});

// Parentesco: asignar -1 cuando no aplica y resetear si valor inválido
watch([intencionalidad, numeroAgresores], () => {
  const aplica = (intencionalidad.value === 2 || intencionalidad.value === 3) && numeroAgresores.value === 1;
  if (!aplica) {
    parentescoAfectado.value = null;
    return;
  }
  const opts = parentescoOptsFiltrados.value;
  const validos = opts.map((o) => o.value);
  if (parentescoAfectado.value != null && !validos.includes(parentescoAfectado.value)) {
    parentescoAfectado.value = null;
  }
});

watch(
  [
    intencionalidad, eventoRepetido, agenteLesion, especifique, tipoViolencia, numeroAgresores,
    parentescoAfectado, sexoAgresor, edadAgresor, agresorBajoEfectos,
    lesionadoVehiculoMotor, usoEquipoSeguridad, equipoUtilizado, especifiqueEquipo,
    sospechaBajoEfectosDe, atencionPreHospitalaria, tiempoTrasladoUH, tiempoTrasladoDesconocido,
  ],
  () => syncToFormData(),
  { deep: true }
);

// Al cambiar intencionalidad o tipoViolencia: cuando agenteLesion no se muestra, fijar 27 (NO APLICA)
watch(mostrarAgenteLesion, (mostrar) => {
  if (!mostrar) {
    agenteLesion.value = 27;
    especifique.value = '';
    lesionadoVehiculoMotor.value = null;
    usoEquipoSeguridad.value = null;
    equipoUtilizado.value = null;
    especifiqueEquipo.value = '';
  } else if (agenteLesion.value === 27) {
    agenteLesion.value = null;
  }
});

// Al cambiar intencionalidad: limpiar campos que ya no aplican (mostrarAgenteLesion watch maneja agenteLesion)
watch(intencionalidad, (val) => {
  if (val !== 1 && val !== 4) {
    especifique.value = '';
    lesionadoVehiculoMotor.value = null;
    usoEquipoSeguridad.value = null;
    equipoUtilizado.value = null;
    especifiqueEquipo.value = '';
  }
  if (val !== 2 && val !== 3) {
    tipoViolencia.value = [];
    numeroAgresores.value = null;
    parentescoAfectado.value = null;
    sexoAgresor.value = null;
    edadAgresor.value = null;
    agresorBajoEfectos.value = [];
  }
});

watch(numeroAgresores, (val) => {
  if (val !== 1) {
    parentescoAfectado.value = null;
    sexoAgresor.value = null;
    edadAgresor.value = null;
  }
});

watch(agenteLesion, (val) => {
  if (val !== 25) especifique.value = '';
  if (val !== 20) {
    lesionadoVehiculoMotor.value = null;
    usoEquipoSeguridad.value = null;
    equipoUtilizado.value = null;
    especifiqueEquipo.value = '';
  }
});

watch(usoEquipoSeguridad, (val) => {
  if (val !== 1) {
    equipoUtilizado.value = null;
    especifiqueEquipo.value = '';
  }
});

watch(equipoUtilizado, (val) => {
  if (val !== 4) especifiqueEquipo.value = '';
});

watch(atencionPreHospitalaria, (val) => {
  if (val !== 1) {
    tiempoTrasladoUH.value = '';
    tiempoTrasladoDesconocido.value = false;
  }
});

watch(tiempoTrasladoDesconocido, (checked) => {
  if (checked) tiempoTrasladoUH.value = '';
});

const transitionClasses = {
  enter: 'transition-all duration-300 ease-out',
  enterFrom: 'opacity-0 transform -translate-y-2',
  enterTo: 'opacity-100 transform translate-y-0',
  leave: 'transition-all duration-200 ease-in',
  leaveFrom: 'opacity-100 transform translate-y-0',
  leaveTo: 'opacity-0 transform -translate-y-2',
};

// Formatear input tiempo traslado: dígitos y :, auto-insertar : tras 2 dígitos, máx HH:MM
// Si hay caracteres inválidos, se conservan para que la validación los detecte
const formatTiempoTrasladoInput = (e) => {
  let v = (e.target?.value || '').slice(0, 5);
  if (/[^\d:]/.test(v)) {
    tiempoTrasladoUH.value = v;
    return;
  }
  if (v.length === 2 && !v.includes(':')) {
    v += ':';
  } else if (v.length > 2 && v[2] !== ':') {
    v = v.slice(0, 2) + ':' + v.slice(2).replace(/:/g, '');
  }
  v = v.slice(0, 5);
  tiempoTrasladoUH.value = v;
};

const inputClass = 'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass = 'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

const parseHHMM = (str) => {
  if (!str || str === '99:99') return { h: 99, m: 99 };
  const [h, m] = (str || '').split(':').map(Number);
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
};
const tiempoTrasladoUHError = computed(() => {
  if (atencionPreHospitalaria.value !== 1) return '';
  if (tiempoTrasladoDesconocido.value) return '';
  const v = tiempoTrasladoUH.value?.trim();
  if (!v) return '';
  if (/[^\d:]/.test(v)) return 'Solo se permiten dígitos y formato HH:mm.';
  const { h, m } = parseHHMM(v);
  if (h === 99 && m === 99) return '';
  if (h < 0 || h > 48 || (h === 48 && m > 0) || m < 0 || m > 59) {
    return 'El tiempo debe estar entre 00:01 y 48:00 (o marque "Se desconoce").';
  }
  if (h === 0 && m === 0) return 'Ingrese una duración mayor a 00:00.';
  return '';
});
const edadAgresorError = computed(() => {
  if (numeroAgresores.value !== 1) return '';
  const edad = edadAgresor.value;
  if (edad == null || edad === '') return '';
  const n = Number(edad);
  if (isNaN(n) || n < 0 || n > 999) return 'La edad del agresor debe estar entre 0 y 999.';
  return '';
});
const conductorError = computed(() => {
  if (lesionadoVehiculoMotor.value !== 1) return '';
  const edad = trabajadores.currentTrabajador?.fechaNacimiento
    ? calcularEdad(trabajadores.currentTrabajador.fechaNacimiento)
    : null;
  if (edad == null) return '';
  if (edad < 15) return 'Para ser conductor, la edad del paciente debe ser al menos 15 años.';
  return '';
});
const sillaInfantilError = computed(() => {
  if (equipoUtilizado.value !== 3) return '';
  if (lesionadoVehiculoMotor.value !== 2) return 'La silla infantil aplica solo para ocupantes.';
  const edad = trabajadores.currentTrabajador?.fechaNacimiento
    ? calcularEdad(trabajadores.currentTrabajador.fechaNacimiento)
    : null;
  if (edad == null) return '';
  if (edad > 5) return 'La silla infantil aplica solo cuando la edad del paciente es 5 años o menos.';
  return '';
});
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-base font-semibold text-gray-900 mb-2">¿Cómo ocurrió el evento?</h1>

    <!-- Intencionalidad (siempre visible) -->
    <div class="mb-2">
      <label :class="labelClass">Intencionalidad <span class="text-red-500">*</span></label>
      <select v-model="intencionalidad" :class="selectClass" required>
        <option :value="null">Seleccione...</option>
        <option v-for="opt in INTENCIONALIDAD_OPTS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Evento repetido (siempre visible) -->
    <div class="mb-2">
      <label :class="labelClass">Evento repetido <span class="text-red-500">*</span></label>
      <select v-model="eventoRepetido" :class="selectClass" required>
        <option :value="null">Seleccione...</option>
        <option v-for="opt in EVENTO_REPETIDO_OPTS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Bloque Agente lesión (intenc. 1/4 Accidental/Autoinfligido O tipoViolencia 6/7 Física/Sexual) -->
    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="mostrarAgenteLesion" class="mt-4 space-y-2">
        <div>
          <label :class="labelClass">Agente lesión *</label>
          <select v-model="agenteLesion" :class="selectClass" required>
            <option :value="null">Seleccione...</option>
            <option v-for="opt in agenteLesionOpts" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Subbloque especifique (agente=25) -->
        <transition
          :enter-active-class="transitionClasses.enter"
          :enter-from-class="transitionClasses.enterFrom"
          :enter-to-class="transitionClasses.enterTo"
          :leave-active-class="transitionClasses.leave"
          :leave-from-class="transitionClasses.leaveFrom"
          :leave-to-class="transitionClasses.leaveTo"
        >
          <div v-if="agenteLesion === 25" class="mt-2">
            <label :class="labelClass">Especifique</label>
            <input
              :value="especifique"
              type="text"
              :class="inputClass"
              placeholder="Especifique..."
              @input="especifique = ($event.target?.value || '').toUpperCase()"
            />
          </div>
        </transition>

        <!-- Subbloque vehículo (agente=20) -->
        <transition
          :enter-active-class="transitionClasses.enter"
          :enter-from-class="transitionClasses.enterFrom"
          :enter-to-class="transitionClasses.enterTo"
          :leave-active-class="transitionClasses.leave"
          :leave-from-class="transitionClasses.leaveFrom"
          :leave-to-class="transitionClasses.leaveTo"
        >
          <div v-if="agenteLesion === 20" class="mt-2 space-y-2">
            <div>
              <label :class="labelClass">Lesionado en vehículo motor</label>
              <select v-model="lesionadoVehiculoMotor" :class="selectClass">
                <option :value="null">Seleccione...</option>
                <option v-for="opt in LESIONADO_VEHICULO_OPTS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <div v-if="conductorError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
                <i class="fas fa-exclamation-triangle mt-0.5"></i>
                <span>{{ conductorError }}</span>
              </div>
            </div>
            <template v-if="lesionadoVehiculoMotor === 1 || lesionadoVehiculoMotor === 2">
              <div>
                <label :class="labelClass">Uso equipo de seguridad</label>
                <select v-model="usoEquipoSeguridad" :class="selectClass">
                  <option :value="null">Seleccione...</option>
                  <option v-for="opt in USO_EQUIPO_OPTS" :key="opt.value" :value="opt.value">
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
                <div v-if="usoEquipoSeguridad === 1" class="space-y-2">
                  <div>
                    <label :class="labelClass">Equipo utilizado</label>
                    <select v-model="equipoUtilizado" :class="selectClass">
                      <option :value="null">Seleccione...</option>
                      <option v-for="opt in EQUIPO_UTILIZADO_OPTS" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <div v-if="sillaInfantilError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
                      <i class="fas fa-exclamation-triangle mt-0.5"></i>
                      <span>{{ sillaInfantilError }}</span>
                    </div>
                  </div>
                  <transition
                    :enter-active-class="transitionClasses.enter"
                    :enter-from-class="transitionClasses.enterFrom"
                    :enter-to-class="transitionClasses.enterTo"
                    :leave-active-class="transitionClasses.leave"
                    :leave-from-class="transitionClasses.leaveFrom"
                    :leave-to-class="transitionClasses.leaveTo"
                  >
                    <div v-if="equipoUtilizado === 4" class="mt-2">
                      <label :class="labelClass">Especifique equipo</label>
                      <input
                        :value="especifiqueEquipo"
                        type="text"
                        :class="inputClass"
                        placeholder="Especifique..."
                        @input="especifiqueEquipo = ($event.target?.value || '').toUpperCase()"
                      />
                    </div>
                  </transition>
                </div>
              </transition>
            </template>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Bloque Violencia (intenc. 2 o 3) -->
    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="intencionalidad === 2 || intencionalidad === 3" class="mt-4 space-y-2">
        <div>
          <label :class="labelClass">Tipo de violencia (seleccione todas las que apliquen)</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="opt in TIPO_VIOLENCIA_OPTS"
              :key="opt.value"
              class="inline-flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                v-model="tipoViolencia"
                type="checkbox"
                :value="opt.value"
                class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div>
          <label :class="labelClass">Número de agresores</label>
          <select v-model="numeroAgresores" :class="selectClass">
            <option :value="null">Seleccione...</option>
            <option v-for="opt in NUMERO_AGRESORES_OPTS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Subbloque 1 agresor: parentesco, sexo, edad -->
        <transition
          :enter-active-class="transitionClasses.enter"
          :enter-from-class="transitionClasses.enterFrom"
          :enter-to-class="transitionClasses.enterTo"
          :leave-active-class="transitionClasses.leave"
          :leave-from-class="transitionClasses.leaveFrom"
          :leave-to-class="transitionClasses.leaveTo"
        >
          <div v-if="numeroAgresores === 1" class="mt-2 grid grid-cols-1 sm:grid-cols-[1.3fr_1.2fr_0.8fr] gap-2">
            <div>
              <label :class="labelClass">Parentesco afectado</label>
              <select v-model="parentescoAfectado" :class="selectClass">
                <option :value="null">Seleccione...</option>
                <option v-for="opt in parentescoOptsFiltrados" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Sexo agresor</label>
              <select v-model="sexoAgresor" :class="selectClass">
                <option :value="null">Seleccione...</option>
                <option v-for="opt in SEXO_AGRESOR_OPTS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Edad agresor</label>
              <input
                v-model.number="edadAgresor"
                type="number"
                min="0"
                max="999"
                :class="inputClass"
                placeholder="0-999"
              />
              <div v-if="edadAgresorError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
                <i class="fas fa-exclamation-triangle mt-0.5"></i>
                <span>{{ edadAgresorError }}</span>
              </div>
            </div>
          </div>
        </transition>

        <div>
          <label :class="labelClass">Agresor bajo efectos de (seleccione todas las que apliquen)</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="opt in BAJO_EFECTOS_OPTS"
              :key="opt.value"
              class="inline-flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                v-model="agresorBajoEfectos"
                type="checkbox"
                :value="opt.value"
                class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>
      </div>
    </transition>

    <!-- Sospecha lesionado bajo efectos (opcional, siempre visible) -->
    <div class="mt-4">
      <label :class="labelClass">Sospecha lesionado bajo efectos de</label>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="opt in BAJO_EFECTOS_OPTS"
          :key="'sospecha-' + opt.value"
          class="inline-flex items-center gap-1.5 text-sm cursor-pointer"
        >
          <input
            v-model="sospechaBajoEfectosDe"
            type="checkbox"
            :value="opt.value"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>

    <!-- Atención prehospitalaria y tiempo traslado -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <label :class="labelClass">Atención prehospitalaria</label>
        <select v-model="atencionPreHospitalaria" :class="selectClass">
          <option :value="null">Seleccione...</option>
          <option v-for="opt in ATENCION_PREHOSP_OPTS" :key="opt.value" :value="opt.value">
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
        <div v-if="atencionPreHospitalaria === 1" class="sm:col-span-2 space-y-2">
          <div>
            <label :class="labelClass">Tiempo traslado a UH (duración en HH:MM)</label>
            <input
              :value="tiempoTrasladoUH"
              type="text"
              :class="inputClass"
              placeholder="Ej: 01:30 (horas:minutos de duración, máx 48:00)"
              maxlength="5"
              :disabled="tiempoTrasladoDesconocido"
              @input="formatTiempoTrasladoInput"
            />
            <div v-if="tiempoTrasladoUHError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span>{{ tiempoTrasladoUHError }}</span>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              v-model="tiempoTrasladoDesconocido"
              type="checkbox"
              class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Se desconoce el tiempo de traslado</span>
          </label>
        </div>
      </transition>
    </div>
  </div>
</template>
