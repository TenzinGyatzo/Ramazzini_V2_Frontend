<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const lesionesPielPregunta = ref('No');
const lesionesPiel = ref ('');

onMounted(() => {
    if (documentos.currentDocument) {
        lesionesPiel.value = documentos.currentDocument.lesionesPiel;
        lesionesPielPregunta.value = 'Si';
    }});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para lesionesPiel
    if (!formDataExploracionFisica.lesionesPiel) {
        formDataExploracionFisica.lesionesPiel = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(lesionesPiel, (newValue) => {
    formDataExploracionFisica.lesionesPiel = newValue;
});

// Watch para establecer 'Default' cuando lesionesPiel sea 'No'
watch(lesionesPielPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.lesionesPiel = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.lesionesPiel = lesionesPiel.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Exploración de Piel</h1>
        <h2>LESIONES EN PIEL</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="lesionesPielPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="lesionesPielPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="lesionesPielPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.lesionesPiel"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>