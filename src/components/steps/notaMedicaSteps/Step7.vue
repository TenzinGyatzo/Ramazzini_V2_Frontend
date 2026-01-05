<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import CIE10Autocomplete from '@/components/selectors/CIE10Autocomplete.vue';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();
const proveedorSaludStore = useProveedorSaludStore();
const trabajadores = useTrabajadoresStore();

const isMX = computed(() => proveedorSaludStore.isMX);

// NOM-024 GIIS-B015: Campos para segundo diagnóstico y texto libre
const primeraVezDiagnostico2 = ref(false);
const codigoCIEDiagnostico2 = ref('');
const diagnosticoTexto = ref('');

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
    // Cargar desde documento existente
    if (documentos.currentDocument) {
        codigoCIEDiagnostico2.value = documentos.currentDocument.codigoCIEDiagnostico2 || '';
        diagnosticoTexto.value = documentos.currentDocument.diagnosticoTexto || documentos.currentDocument.diagnostico || '';
    }

    // Cargar desde formData (estado temporal)
    if (formDataNotaMedica.codigoCIEDiagnostico2) {
        codigoCIEDiagnostico2.value = formDataNotaMedica.codigoCIEDiagnostico2;
    }
    if (formDataNotaMedica.diagnosticoTexto) {
        diagnosticoTexto.value = formDataNotaMedica.diagnosticoTexto;
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
    formDataNotaMedica.codigoCIEDiagnostico2 = newValue;
    // Actualizar primeraVezDiagnostico2 según si hay código o no
    primeraVezDiagnostico2.value = !!newValue;
    formDataNotaMedica.primeraVezDiagnostico2 = primeraVezDiagnostico2.value;
});

watch(diagnosticoTexto, (newValue) => {
    formDataNotaMedica.diagnosticoTexto = newValue;
});
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
            </div>
        </div>

        <!-- Diagnóstico en texto libre -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Texto Libre Complementario
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
