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

// NOM-024 GIIS-B015: Campos para segundo diagnóstico (análogos al principal)
// primeraVezDiagnostico2: 0=No, 1=Si (similar a relacionTemporal pero con opciones No/Si)
const primeraVezDiagnostico2 = ref(null); // number | null
const codigoCIEDiagnostico2 = ref(
  formDataNotaMedica.codigoCIEDiagnostico2 ||
  documentos.currentDocument?.codigoCIEDiagnostico2 ||
  ''
);
const confirmacionDiagnostica2 = ref(false);
const diagnosticoTexto = ref(
  formDataNotaMedica.diagnosticoTexto ||
  documentos.currentDocument?.diagnosticoTexto ||
  documentos.currentDocument?.diagnostico ||
  ''
);

// Computed: ¿Requiere confirmación diagnóstica 2? (crónicos/cáncer, misma lógica que principal)
const requiereConfirmacionDiagnostica2 = computed(() => {
  if (!codigoCIEDiagnostico2.value) return false;
  const codigo = extractCode(codigoCIEDiagnostico2.value).toUpperCase();
  const esCronico = codigo.startsWith('E11') || codigo.startsWith('I1');
  const esCancer = codigo.startsWith('C');
  return esCronico || esCancer;
});

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

onMounted(() => {
  if (documentos.currentDocument) {
    const doc = documentos.currentDocument;
    primeraVezDiagnostico2.value = doc.primeraVezDiagnostico2 ?? null;
    confirmacionDiagnostica2.value = doc.confirmacionDiagnostica2 ?? false;
  }
  if (formDataNotaMedica.primeraVezDiagnostico2 !== undefined && formDataNotaMedica.primeraVezDiagnostico2 !== null) {
    primeraVezDiagnostico2.value = formDataNotaMedica.primeraVezDiagnostico2;
  }
  if (formDataNotaMedica.confirmacionDiagnostica2 !== undefined) {
    confirmacionDiagnostica2.value = formDataNotaMedica.confirmacionDiagnostica2;
  }
  if (codigoCIEDiagnostico2.value && !formDataNotaMedica.codigoCIEDiagnostico2) {
    formDataNotaMedica.codigoCIEDiagnostico2 = codigoCIEDiagnostico2.value;
  }
  if (diagnosticoTexto.value && !formDataNotaMedica.diagnosticoTexto) {
    formDataNotaMedica.diagnosticoTexto = diagnosticoTexto.value;
  }
});

onUnmounted(() => {
  formDataNotaMedica.primeraVezDiagnostico2 = primeraVezDiagnostico2.value ?? undefined;
  formDataNotaMedica.codigoCIEDiagnostico2 = codigoCIEDiagnostico2.value || '';
  if (requiereConfirmacionDiagnostica2.value) {
    formDataNotaMedica.confirmacionDiagnostica2 = confirmacionDiagnostica2.value;
  } else {
    formDataNotaMedica.confirmacionDiagnostica2 = undefined;
  }
  formDataNotaMedica.diagnosticoTexto = diagnosticoTexto.value || '';
});

watch(primeraVezDiagnostico2, (newValue) => {
  formDataNotaMedica.primeraVezDiagnostico2 = newValue ?? undefined;
});

watch(codigoCIEDiagnostico2, (newValue) => {
  formDataNotaMedica.codigoCIEDiagnostico2 = newValue || '';
});

watch(confirmacionDiagnostica2, (newValue) => {
  if (requiereConfirmacionDiagnostica2.value) {
    formDataNotaMedica.confirmacionDiagnostica2 = newValue;
  } else {
    formDataNotaMedica.confirmacionDiagnostica2 = undefined;
  }
});

watch(requiereConfirmacionDiagnostica2, (newValue) => {
  if (!newValue) {
    confirmacionDiagnostica2.value = false;
    formDataNotaMedica.confirmacionDiagnostica2 = undefined;
  } else if (confirmacionDiagnostica2.value !== undefined && confirmacionDiagnostica2.value !== null) {
    formDataNotaMedica.confirmacionDiagnostica2 = confirmacionDiagnostica2.value;
  }
});

watch(diagnosticoTexto, (newValue) => {
  formDataNotaMedica.diagnosticoTexto = newValue || '';
});

// Validación de duplicidades CIE-10 para diagnóstico 2
const cie10Validation = computed(() => {
  return validateCIE10Duplicates({
    codigoCIE10Principal: formDataNotaMedica.codigoCIE10Principal,
    codigosCIE10Complementarios: formDataNotaMedica.codigosCIE10Complementarios,
    codigoCIEDiagnostico2: codigoCIEDiagnostico2.value
  });
});

const diagnostico2EqualsPrincipalError = computed(() => {
  return cie10Validation.value.issues.find(
    issue => issue.type === 'diagnostico2_equals_principal'
  )?.message || null;
});

const diagnostico2EqualsComplementaryError = computed(() => {
  return cie10Validation.value.issues.find(
    issue => issue.type === 'diagnostico2_equals_complementary'
  )?.message || null;
});

const diagnostico2SexAgeError = ref('');

const validateSexAge = async () => {
  diagnostico2SexAgeError.value = '';
  const trabajador = trabajadores.currentTrabajador;
  if (!trabajador || !trabajador.sexo || !trabajador.fechaNacimiento) return;
  try {
    const issues = await validateCIE10SexAge({
      codigoCIE10Principal: formDataNotaMedica.codigoCIE10Principal,
      codigosCIE10Complementarios: formDataNotaMedica.codigosCIE10Complementarios,
      codigoCIEDiagnostico2: codigoCIEDiagnostico2.value,
      trabajadorSexo: trabajador.sexo,
      trabajadorFechaNacimiento: new Date(trabajador.fechaNacimiento),
      fechaNotaMedica: fechaNotaMedica.value
    });
    const diagnostico2Issue = issues.find(issue => issue.field === 'codigoCIEDiagnostico2');
    if (diagnostico2Issue) {
      diagnostico2SexAgeError.value = diagnostico2Issue.messageInline;
    }
  } catch (error) {
    console.error('Error validando sexo/edad CIE-10:', error);
  }
};

watch([codigoCIEDiagnostico2, fechaNotaMedica], validateSexAge);
watch(() => formDataNotaMedica.codigoCIE10Principal, validateSexAge);
watch(() => formDataNotaMedica.codigosCIE10Complementarios, validateSexAge, { deep: true });
watch(() => trabajadores.currentTrabajador?.sexo, validateSexAge);
watch(() => trabajadores.currentTrabajador?.fechaNacimiento, validateSexAge);
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">DIAGNÓSTICO SECUNDARIO</h2>

    <!-- 1. Primera vez diagnóstico 2 (0=No, 1=Si) - antes del código -->
    <div>
      <h3 class="text-base font-medium text-gray-700 mb-2">
        Primera vez diagnóstico 2
      </h3>
      <div class="grid grid-cols-2 gap-3 mb-1">
        <label
          :class="[
            'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            primeraVezDiagnostico2 === 0
              ? 'border-emerald-600 bg-emerald-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input type="radio" :value="0" v-model="primeraVezDiagnostico2" class="sr-only" />
          <span :class="['text-sm transition-colors duration-200', primeraVezDiagnostico2 === 0 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
            No
          </span>
          <div v-if="primeraVezDiagnostico2 === 0" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
        <label
          :class="[
            'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            primeraVezDiagnostico2 === 1
              ? 'border-emerald-600 bg-emerald-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input type="radio" :value="1" v-model="primeraVezDiagnostico2" class="sr-only" />
          <span :class="['text-sm transition-colors duration-200', primeraVezDiagnostico2 === 1 ? 'text-emerald-700 font-semibold' : 'text-gray-700']">
            Sí
          </span>
          <div v-if="primeraVezDiagnostico2 === 1" class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
      </div>
    </div>

    <!-- 2. Código CIE-10 Diagnóstico 2 -->
    <div class="space-y-4">
      <div>
        <CIE10Autocomplete
          v-model="codigoCIEDiagnostico2"
          label="Código CIE-10 Diagnóstico 2"
          :trabajadorId="trabajadores.currentTrabajadorId"
          :fechaConsulta="fechaNotaMedica"
          placeholder="Buscar segundo diagnóstico..."
        />
        <p class="mt-1 text-xs text-gray-600">
          Padecimiento distinto al diagnóstico principal que también está presente.
        </p>
        <Transition name="fade">
          <div v-if="diagnostico2SexAgeError" class="mt-2">
            <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico2SexAgeError }}</span>
            </div>
          </div>
        </Transition>
        <div v-if="diagnostico2EqualsPrincipalError || diagnostico2EqualsComplementaryError" class="mt-2 space-y-2">
          <Transition name="fade">
            <div v-if="diagnostico2EqualsPrincipalError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico2EqualsPrincipalError }}</span>
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="diagnostico2EqualsComplementaryError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
              <i class="fas fa-exclamation-triangle mt-0.5"></i>
              <span class="flex-1 font-medium">{{ diagnostico2EqualsComplementaryError }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 3. Confirmación diagnóstica 2 (condicional crónicos/cáncer) -->
    <div v-if="requiereConfirmacionDiagnostica2" class="space-y-2 border border-amber-200 rounded-xl p-4 bg-amber-50/30">
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="confirmacionDiagnostica2"
          v-model="confirmacionDiagnostica2"
          class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
        />
        <label for="confirmacionDiagnostica2" class="text-sm font-medium text-gray-700">
          Confirmación Diagnóstica 2
        </label>
      </div>
      <p class="text-xs text-amber-700">
        <i class="fas fa-exclamation-triangle"></i>
        Requerida para diagnósticos crónicos (Diabetes, HTA) o Cáncer en menores de 18 años
      </p>
    </div>

    <!-- 4. Descripción complementaria -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Descripción complementaria
      </label>
      <input
        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        v-model="diagnosticoTexto"
        placeholder="Descripción del diagnóstico..."
        data-skip-validation
      />
      <p class="mt-1 text-xs text-gray-500">
        Puede complementar el diagnóstico codificado con texto libre adicional
      </p>
    </div>
  </div>
</template>
