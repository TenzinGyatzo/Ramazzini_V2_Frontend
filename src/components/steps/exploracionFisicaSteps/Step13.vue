<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const reflejosOsteoTendinososSuperioresPregunta = ref('No');
const reflejosOsteoTendinososSuperiores = ref ('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.reflejosOsteoTendinososSuperiores === '') {
        reflejosOsteoTendinososSuperiores.value = documentos.currentDocument.reflejosOsteoTendinososSuperiores;
        reflejosOsteoTendinososSuperioresPregunta.value = 'Si';
    }

    if (formDataExploracionFisica.reflejosOsteoTendinososSuperiores) {
        reflejosOsteoTendinososSuperiores.value = formDataExploracionFisica.reflejosOsteoTendinososSuperiores;
        reflejosOsteoTendinososSuperioresPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para reflejosOsteoTendinososSuperiores
    if (!formDataExploracionFisica.reflejosOsteoTendinososSuperiores) {
        formDataExploracionFisica.reflejosOsteoTendinososSuperiores = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(reflejosOsteoTendinososSuperiores, (newValue) => {
    formDataExploracionFisica.reflejosOsteoTendinososSuperiores = newValue;
});

// Watch para establecer 'Default' cuando reflejosOsteoTendinososSuperiores sea 'No'
watch(reflejosOsteoTendinososSuperioresPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.reflejosOsteoTendinososSuperiores = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.reflejosOsteoTendinososSuperiores = reflejosOsteoTendinososSuperiores.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Extremidades Superiores</h1>
        <h2>REFLEJOS OSTEO-TENDINOSOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="reflejosOsteoTendinososSuperioresPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="reflejosOsteoTendinososSuperioresPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="reflejosOsteoTendinososSuperioresPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.reflejosOsteoTendinososSuperiores"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>