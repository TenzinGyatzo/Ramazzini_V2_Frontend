<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import CIE10Autocomplete from '@/components/selectors/CIE10Autocomplete.vue';
import { validateCIE10Duplicates, validateCIE10SexAge } from '@/helpers/cie10';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();
const trabajadores = useTrabajadoresStore();

// Helper para extraer código CIE-10 del formato "CODE - DESCRIPTION"
const extractCode = (value) => {
  if (!value) return '';
  if (!value.includes(' - ')) return value;
  return value.split(' - ')[0].trim();
};

// Pregunta inicial: ¿Registrar una tercera comorbilidad? (0=No por defecto, 1=Sí)
const registrarComorbilidad = ref(0);
// NOM-024 GIIS-B015: Campos para tercer diagnóstico
const primeraVezDiagnostico3 = ref(null); // number | null (0=No, 1=Si)
const codigoCIEDiagnostico3 = ref(
  formDataNotaMedica.codigoCIEDiagnostico3 ||
  documentos.currentDocument?.codigoCIEDiagnostico3 ||
  ''
);
const confirmacionDiagnostica3 = ref(false);

// Computed: fechaNotaMedica para calcular edad
const fechaNotaMedica = computed(() => {
  const fecha = formDataNotaMedica.fechaNotaMedica || documentos.currentDocument?.fechaNotaMedica;
  if (fecha) {
    try {
      return new Date(fecha);
    } catch {
      return new Date();
    }
  }
  return new Date();
});

// Computed: ¿Requiere confirmación diagnóstica 3? (crónicos/cáncer)
const requiereConfirmacionDiagnostica3 = computed(() => {
  if (!codigoCIEDiagnostico3.value) return false;
  const codigo = extractCode(codigoCIEDiagnostico3.value).toUpperCase();
  const esCronico = codigo.startsWith('E11') || codigo.startsWith('I1') || codigo.startsWith('E78');
  const esCancer = codigo.startsWith('C');
  return esCronico || esCancer;
});

// Computed: Edad del trabajador en años
const edadTrabajador = computed(() => {
  const trabajador = trabajadores.currentTrabajador;
  if (!trabajador?.fechaNacimiento) return null;
  try {
    const fn = new Date(trabajador.fechaNacimiento);
    const fc = fechaNotaMedica.value;
    if (isNaN(fn.getTime()) || isNaN(fc.getTime())) return null;
    let edad = fc.getFullYear() - fn.getFullYear();
    const m = fc.getMonth() - fn.getMonth();
    if (m < 0 || (m === 0 && fc.getDate() < fn.getDate())) edad--;
    return edad;
  } catch {
    return null;
  }
});

// Fe de Erratas: mostrar confirmación diagnóstica 3 solo cuando aplica
const muestraConfirmacionDiagnostica3 = computed(() => {
  if (!requiereConfirmacionDiagnostica3.value) return false;
  const codigo = extractCode(codigoCIEDiagnostico3.value).toUpperCase();
  const esCronico = codigo.startsWith('E11') || codigo.startsWith('I1') || codigo.startsWith('E78');
  const esCancer = codigo.startsWith('C');
  const edad = edadTrabajador.value;
  if (edad === null) return false;
  if (edad < 18) return esCancer;
  if (edad >= 20) return primeraVezDiagnostico3.value === 1 && esCronico;
  return false;
});

onMounted(() => {
  const doc = documentos.currentDocument || formDataNotaMedica;
  const tieneComorbilidad = !!(doc?.codigoCIEDiagnostico3 || (doc?.primeraVezDiagnostico3 !== undefined && doc?.primeraVezDiagnostico3 !== null));
  if (tieneComorbilidad) {
    registrarComorbilidad.value = 1;
  }
  if (documentos.currentDocument) {
    const d = documentos.currentDocument;
    const pv = d.primeraVezDiagnostico3;
    primeraVezDiagnostico3.value = pv === 0 || pv === 1 ? pv : null;
    confirmacionDiagnostica3.value = d.confirmacionDiagnostica3 ?? false;
  }
  if (formDataNotaMedica.primeraVezDiagnostico3 !== undefined && formDataNotaMedica.primeraVezDiagnostico3 !== null) {
    const pv = formDataNotaMedica.primeraVezDiagnostico3;
    primeraVezDiagnostico3.value = pv === 0 || pv === 1 ? pv : null;
  }
  if (formDataNotaMedica.confirmacionDiagnostica3 !== undefined) {
    confirmacionDiagnostica3.value = formDataNotaMedica.confirmacionDiagnostica3;
  }
  if (codigoCIEDiagnostico3.value && !formDataNotaMedica.codigoCIEDiagnostico3) {
    formDataNotaMedica.codigoCIEDiagnostico3 = codigoCIEDiagnostico3.value;
  }
});

onUnmounted(() => {
  if (registrarComorbilidad.value === 0) {
    formDataNotaMedica.primeraVezDiagnostico3 = undefined;
    formDataNotaMedica.codigoCIEDiagnostico3 = '';
    formDataNotaMedica.confirmacionDiagnostica3 = undefined;
  } else {
    const pv = primeraVezDiagnostico3.value;
    formDataNotaMedica.primeraVezDiagnostico3 = pv ?? undefined;
    formDataNotaMedica.codigoCIEDiagnostico3 = codigoCIEDiagnostico3.value || '';
    if (muestraConfirmacionDiagnostica3.value) {
      formDataNotaMedica.confirmacionDiagnostica3 = confirmacionDiagnostica3.value;
    } else {
      formDataNotaMedica.confirmacionDiagnostica3 = undefined;
    }
  }
});

watch(registrarComorbilidad, (val) => {
  if (val === 0) {
    primeraVezDiagnostico3.value = null;
    codigoCIEDiagnostico3.value = '';
    confirmacionDiagnostica3.value = false;
  }
});

watch(codigoCIEDiagnostico3, (newValue) => {
  formDataNotaMedica.codigoCIEDiagnostico3 = newValue || '';
});

watch(confirmacionDiagnostica3, (newValue) => {
  if (muestraConfirmacionDiagnostica3.value) {
    formDataNotaMedica.confirmacionDiagnostica3 = newValue;
  } else {
    formDataNotaMedica.confirmacionDiagnostica3 = undefined;
  }
});

watch(muestraConfirmacionDiagnostica3, (newValue) => {
  if (!newValue) {
    confirmacionDiagnostica3.value = false;
    formDataNotaMedica.confirmacionDiagnostica3 = undefined;
  } else if (confirmacionDiagnostica3.value !== undefined && confirmacionDiagnostica3.value !== null) {
    formDataNotaMedica.confirmacionDiagnostica3 = confirmacionDiagnostica3.value;
  }
});

watch(primeraVezDiagnostico3, (newValue) => {
  formDataNotaMedica.primeraVezDiagnostico3 = newValue ?? undefined;
  if (newValue === 0 && !muestraConfirmacionDiagnostica3.value) {
    confirmacionDiagnostica3.value = false;
    formDataNotaMedica.confirmacionDiagnostica3 = undefined;
  }
});

// Validación de duplicidades CIE-10 para diagnóstico 3
const cie10Validation = computed(() => {
  return validateCIE10Duplicates({
    codigoCIE10Principal: formDataNotaMedica.codigoCIE10Principal,
    codigosCIE10Complementarios: formDataNotaMedica.codigosCIE10Complementarios,
    codigoCIEDiagnostico2: formDataNotaMedica.codigoCIEDiagnostico2,
    codigoCIEDiagnostico3: codigoCIEDiagnostico3.value
  });
});

const diagnostico3EqualsPrincipalError = computed(() => {
  return cie10Validation.value.issues.find(
    issue => issue.type === 'diagnostico3_equals_principal'
  )?.message || null;
});

const diagnostico3EqualsComplementaryError = computed(() => {
  return cie10Validation.value.issues.find(
    issue => issue.type === 'diagnostico3_equals_complementary'
  )?.message || null;
});

const diagnostico3EqualsDiagnostico2Error = computed(() => {
  return cie10Validation.value.issues.find(
    issue => issue.type === 'diagnostico3_equals_diagnostico2'
  )?.message || null;
});

const diagnostico3SexAgeError = ref('');

const validateSexAge = async () => {
  diagnostico3SexAgeError.value = '';
  const trabajador = trabajadores.currentTrabajador;
  if (!trabajador || !trabajador.sexo || !trabajador.fechaNacimiento) return;
  try {
    const issues = await validateCIE10SexAge({
      codigoCIE10Principal: formDataNotaMedica.codigoCIE10Principal,
      codigosCIE10Complementarios: formDataNotaMedica.codigosCIE10Complementarios,
      codigoCIEDiagnostico2: formDataNotaMedica.codigoCIEDiagnostico2,
      codigoCIEDiagnostico3: codigoCIEDiagnostico3.value,
      trabajadorSexo: trabajador.sexo,
      trabajadorFechaNacimiento: new Date(trabajador.fechaNacimiento),
      fechaNotaMedica: fechaNotaMedica.value
    });
    const diagnostico3Issue = issues.find(issue => issue.field === 'codigoCIEDiagnostico3');
    if (diagnostico3Issue) {
      diagnostico3SexAgeError.value = diagnostico3Issue.messageInline;
    }
  } catch (error) {
    console.error('Error validando sexo/edad CIE-10:', error);
  }
};

watch([codigoCIEDiagnostico3, fechaNotaMedica], validateSexAge);
watch(() => formDataNotaMedica.codigoCIE10Principal, validateSexAge);
watch(() => formDataNotaMedica.codigosCIE10Complementarios, validateSexAge, { deep: true });
watch(() => formDataNotaMedica.codigoCIEDiagnostico2, validateSexAge);
watch(() => trabajadores.currentTrabajador?.sexo, validateSexAge);
watch(() => trabajadores.currentTrabajador?.fechaNacimiento, validateSexAge);
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">DIAGNÓSTICO 3</h2>

    <!-- 0. Pregunta inicial: ¿Registrar una tercera comorbilidad? (No por defecto) -->
    <div>
      <h3 class="text-base font-medium text-gray-700 mb-2">
        ¿Registrar una tercera comorbilidad?
      </h3>
      <div class="grid grid-cols-2 gap-3 mb-1">
        <label
          :class="[
            'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            registrarComorbilidad === 0
              ? 'border-emerald-600 bg-emerald-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input type="radio" :value="0" v-model="registrarComorbilidad" class="sr-only" />
          <span :class="['text-sm transition-colors duration-200', registrarComorbilidad === 0 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
            No
          </span>
          <div v-if="registrarComorbilidad === 0" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
        <label
          :class="[
            'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            registrarComorbilidad === 1
              ? 'border-emerald-600 bg-emerald-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input type="radio" :value="1" v-model="registrarComorbilidad" class="sr-only" />
          <span :class="['text-sm transition-colors duration-200', registrarComorbilidad === 1 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
            Sí
          </span>
          <div v-if="registrarComorbilidad === 1" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
      </div>
    </div>

    <!-- Bloques visibles solo cuando registrarComorbilidad === Sí -->
    <div v-if="registrarComorbilidad === 1" class="space-y-6">
      <!-- 1. Primera vez diagnóstico 3 (0=No, 1=Si) -->
      <div>
        <h3 class="text-base font-medium text-gray-700 mb-2">
          Primera vez diagnóstico 3 <span class="text-red-500">*</span>
        </h3>
        <div class="grid grid-cols-2 gap-3 mb-1">
          <label
            :class="[
              'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
              primeraVezDiagnostico3 === 0
                ? 'border-emerald-600 bg-emerald-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
            ]"
          >
            <input type="radio" :value="0" v-model="primeraVezDiagnostico3" class="sr-only" />
            <span :class="['text-sm transition-colors duration-200', primeraVezDiagnostico3 === 0 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
              No
            </span>
            <div v-if="primeraVezDiagnostico3 === 0" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </label>
          <label
            :class="[
              'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
              primeraVezDiagnostico3 === 1
                ? 'border-emerald-600 bg-emerald-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
            ]"
          >
            <input type="radio" :value="1" v-model="primeraVezDiagnostico3" class="sr-only" />
            <span :class="['text-sm transition-colors duration-200', primeraVezDiagnostico3 === 1 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
              Sí
            </span>
            <div v-if="primeraVezDiagnostico3 === 1" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </label>
        </div>
      </div>

      <!-- 2. Código CIE-10 Diagnóstico 3 (obligatorio cuando comorbilidad=Sí) -->
      <div>
        <CIE10Autocomplete
          v-model="codigoCIEDiagnostico3"
          label="Código CIE-10 Diagnóstico 3"
          :required="true"
          :trabajadorId="trabajadores.currentTrabajadorId"
          :fechaConsulta="fechaNotaMedica"
          placeholder="Buscar tercer diagnóstico..."
        />
        <p class="mt-1 text-xs text-gray-600">
          Padecimiento distinto al diagnóstico principal y al diagnóstico 2 que también está presente.
        </p>
        <Transition name="fade">
          <div v-if="diagnostico3SexAgeError" class="mt-2">
            <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico3SexAgeError }}</span>
            </div>
          </div>
        </Transition>
        <div v-if="diagnostico3EqualsPrincipalError || diagnostico3EqualsComplementaryError || diagnostico3EqualsDiagnostico2Error" class="mt-2 space-y-2">
          <Transition name="fade">
            <div v-if="diagnostico3EqualsPrincipalError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico3EqualsPrincipalError }}</span>
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="diagnostico3EqualsComplementaryError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico3EqualsComplementaryError }}</span>
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="diagnostico3EqualsDiagnostico2Error" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico3EqualsDiagnostico2Error }}</span>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 3. Confirmación diagnóstica 3 (Fe de Erratas: solo cuando aplica) -->
      <div v-if="muestraConfirmacionDiagnostica3" class="space-y-2 border border-amber-200 rounded-xl p-4 bg-amber-50/30">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="confirmacionDiagnostica3"
            v-model="confirmacionDiagnostica3"
            class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <label for="confirmacionDiagnostica3" class="text-sm font-medium text-gray-700">
            Confirmación Diagnóstica 3 <span class="text-red-500">*</span>
          </label>
        </div>
        <p class="text-xs text-amber-700">
          <i class="fas fa-exclamation-triangle"></i>
          Requerida para diagnósticos crónicos (Diabetes, HTA) o Cáncer en menores de 18 años
        </p>
      </div>
    </div>
  </div>
</template>
