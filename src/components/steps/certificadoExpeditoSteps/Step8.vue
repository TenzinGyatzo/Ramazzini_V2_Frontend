<script setup>
import { ref, watch, onMounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataCertificadoExpedito } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la observaciones principal, inicializado con el valor actual del store
const observaciones = ref(formDataCertificadoExpedito.observaciones || '');

// Sincronizar el valor seleccionado con formDataCertificadoExpedito.observaciones
watch(observaciones, (newValue) => {
    formDataCertificadoExpedito.observaciones = newValue;
});

onMounted(async () => {
    if (documentos.currentDocument) {
        observaciones.value = documentos.currentDocument.observaciones;
    } else {
        observaciones.value = formDataCertificadoExpedito.observaciones;
    }
});


</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Certificado</h1>
    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Agregar observaciones:</h2>
        <div class="font-light mb-4">
            <textarea
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 custom-height"
                v-model="formDataCertificadoExpedito.observaciones"
                placeholder="Ej. Vacunación contra el COVID-19"
            >
            </textarea>
        </div>
    </div>
</template>

<style scoped>
textarea.custom-height {
    height: 140px !important;
}
</style>