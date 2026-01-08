<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import CIE10Autocomplete from '@/components/selectors/CIE10Autocomplete.vue';
import { validateCIE10Duplicates, validateCIE10SexAge } from '@/helpers/cie10';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();
const proveedorSaludStore = useProveedorSaludStore();
const trabajadores = useTrabajadoresStore();

const isMX = computed(() => proveedorSaludStore.isMX);

// NOM-024 GIIS-B015: Campos para segundo diagnóstico y texto libre
const primeraVezDiagnostico2 = ref(false);
// Inicializar con valores del store o documento para evitar que se sobrescriban
const codigoCIEDiagnostico2 = ref(
  formDataNotaMedica.codigoCIEDiagnostico2 || 
  documentos.currentDocument?.codigoCIEDiagnostico2 || 
  ''
);
const diagnosticoTexto = ref(
  formDataNotaMedica.diagnosticoTexto || 
  documentos.currentDocument?.diagnosticoTexto || 
  documentos.currentDocument?.diagnostico || 
  ''
);

// Computed: fechaNotaMedica para calcular edad
const fechaNotaMedica = computed(() => {
  // Intentar obtener desde formData o desde documento actual
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
    // Los valores ya están inicializados en la declaración de los refs
    // Solo necesitamos sincronizar con formData si los refs tienen valores
    // y asegurarnos de que primeraVezDiagnostico2 esté correcto
    
    // Sincronizar valores iniciales con formData (por si acaso)
    if (codigoCIEDiagnostico2.value && !formDataNotaMedica.codigoCIEDiagnostico2) {
        formDataNotaMedica.codigoCIEDiagnostico2 = codigoCIEDiagnostico2.value;
    }
    
    if (diagnosticoTexto.value && !formDataNotaMedica.diagnosticoTexto) {
        formDataNotaMedica.diagnosticoTexto = diagnosticoTexto.value;
    }
    
    // Establecer primeraVezDiagnostico2 basado en si hay código
    primeraVezDiagnostico2.value = !!codigoCIEDiagnostico2.value;
    formDataNotaMedica.primeraVezDiagnostico2 = primeraVezDiagnostico2.value;
});

onUnmounted(() => {
    // Guardar en formData
    formDataNotaMedica.primeraVezDiagnostico2 = primeraVezDiagnostico2.value;
    formDataNotaMedica.codigoCIEDiagnostico2 = codigoCIEDiagnostico2.value || '';
    formDataNotaMedica.diagnosticoTexto = diagnosticoTexto.value || '';
});

// Sincronizar valores con formData
watch(codigoCIEDiagnostico2, (newValue) => {
    formDataNotaMedica.codigoCIEDiagnostico2 = newValue || '';
    // Actualizar primeraVezDiagnostico2 según si hay código o no
    primeraVezDiagnostico2.value = !!newValue;
    formDataNotaMedica.primeraVezDiagnostico2 = primeraVezDiagnostico2.value;
});

watch(diagnosticoTexto, (newValue) => {
    // Guardar inmediatamente en formData cuando cambia
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

// Mensajes de error específicos para mostrar en Step7
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

// Validación de sexo/edad para diagnóstico 2
const diagnostico2SexAgeError = ref('');

// Función para validar y actualizar mensajes de sexo/edad
const validateSexAge = async () => {
  // Resetear error
  diagnostico2SexAgeError.value = '';

  // Validar solo si hay trabajador disponible
  const trabajador = trabajadores.currentTrabajador;
  if (!trabajador || !trabajador.sexo || !trabajador.fechaNacimiento) {
    return;
  }

  try {
    const issues = await validateCIE10SexAge({
      codigoCIE10Principal: formDataNotaMedica.codigoCIE10Principal,
      codigosCIE10Complementarios: formDataNotaMedica.codigosCIE10Complementarios,
      codigoCIEDiagnostico2: codigoCIEDiagnostico2.value,
      trabajadorSexo: trabajador.sexo,
      trabajadorFechaNacimiento: new Date(trabajador.fechaNacimiento),
      fechaNotaMedica: fechaNotaMedica.value
    });

    // Procesar issue para diagnóstico 2
    const diagnostico2Issue = issues.find(
      issue => issue.field === 'codigoCIEDiagnostico2'
    );
    if (diagnostico2Issue) {
      diagnostico2SexAgeError.value = diagnostico2Issue.messageInline;
    }
  } catch (error) {
    console.error('Error validando sexo/edad CIE-10:', error);
    // En caso de error, no mostrar nada (UX neutra)
  }
};

// Watchers para recalcular validación cuando cambien los valores
watch([codigoCIEDiagnostico2, fechaNotaMedica], validateSexAge);
watch(
  () => formDataNotaMedica.codigoCIE10Principal,
  validateSexAge
);
watch(
  () => formDataNotaMedica.codigosCIE10Complementarios,
  validateSexAge,
  { deep: true }
);
watch(
  () => trabajadores.currentTrabajador?.sexo,
  validateSexAge
);
watch(
  () => trabajadores.currentTrabajador?.fechaNacimiento,
  validateSexAge
);
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">DIAGNÓSTICO SECUNDARIO</h2>
        
        <!-- Segundo Diagnóstico (NOM-024 GIIS-B015) -->
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
                
                <!-- Mensaje de error por sexo/edad para diagnóstico 2 -->
                <Transition name="fade">
                    <div v-if="diagnostico2SexAgeError" class="mt-2">
                        <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-sm">
                            <i class="fas fa-exclamation-triangle mt-0.5"></i>
                            <span class="flex-1 font-medium">{{ diagnostico2SexAgeError }}</span>
                        </div>
                    </div>
                </Transition>
                
                <!-- Avisos de duplicidad -->
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

        <!-- Diagnóstico en texto libre -->
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
