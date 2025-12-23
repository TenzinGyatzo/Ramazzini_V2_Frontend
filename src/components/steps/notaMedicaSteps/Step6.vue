<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import CIE10Autocomplete from '@/components/selectors/CIE10Autocomplete.vue';
import CIE10SecondaryDiagnoses from '@/components/selectors/CIE10SecondaryDiagnoses.vue';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();
const proveedorSaludStore = useProveedorSaludStore();

const isMX = computed(() => proveedorSaludStore.isMX);

const diagnosticoTexto = ref('');
const codigoCIE10Principal = ref('');
const codigosCIE10Secundarios = ref([]);

onMounted(() => {
    // Cargar desde documento existente
    if (documentos.currentDocument) {
        diagnosticoTexto.value = documentos.currentDocument.diagnosticoTexto || documentos.currentDocument.diagnostico || '';
        codigoCIE10Principal.value = documentos.currentDocument.codigoCIE10Principal || '';
        codigosCIE10Secundarios.value = documentos.currentDocument.codigosCIE10Secundarios || [];
    }

    // Cargar desde formData (estado temporal)
    if (formDataNotaMedica.diagnosticoTexto) {
        diagnosticoTexto.value = formDataNotaMedica.diagnosticoTexto;
    }
    if (formDataNotaMedica.codigoCIE10Principal) {
        codigoCIE10Principal.value = formDataNotaMedica.codigoCIE10Principal;
    }
    if (formDataNotaMedica.codigosCIE10Secundarios) {
        codigosCIE10Secundarios.value = formDataNotaMedica.codigosCIE10Secundarios;
    }
});

onUnmounted(() => {
    // Guardar en formData
    formDataNotaMedica.diagnosticoTexto = diagnosticoTexto.value || '';
    formDataNotaMedica.codigoCIE10Principal = codigoCIE10Principal.value || '';
    formDataNotaMedica.codigosCIE10Secundarios = codigosCIE10Secundarios.value || [];
});

// Sincronizar valores con formData
watch(diagnosticoTexto, (newValue) => {
    formDataNotaMedica.diagnosticoTexto = newValue;
});

watch(codigoCIE10Principal, (newValue) => {
    formDataNotaMedica.codigoCIE10Principal = newValue;
});

watch(codigosCIE10Secundarios, (newValue) => {
    formDataNotaMedica.codigosCIE10Secundarios = newValue;
}, { deep: true });
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">DIAGNÓSTICO</h2>
        
        <!-- Campos CIE-10 (NOM-024) -->
        <div class="space-y-5">
            <!-- CIE-10 Principal -->
            <div>
                <CIE10Autocomplete
                    v-model="codigoCIE10Principal"
                    :label="isMX ? 'Código CIE-10 Principal *' : 'Código CIE-10 Principal'"
                    :required="isMX"
                    placeholder="Buscar código diagnóstico principal..."
                />
                <p v-if="isMX" class="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <i class="fas fa-info-circle"></i>
                    Campo obligatorio para proveedores en México (NOM-024)
                </p>
            </div>

            <!-- CIE-10 Secundarios -->
            <div>
                <CIE10SecondaryDiagnoses
                    v-model="codigosCIE10Secundarios"
                />
            </div>
        </div>

        <!-- Diagnóstico en texto libre -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico (Texto Libre)
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
