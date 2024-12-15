<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const rodillasPregunta = ref('No');
const rodillas = ref ('');

onMounted(() => {
    if (documentos.currentDocument) {
        rodillas.value = documentos.currentDocument.rodillas;
        rodillasPregunta.value = 'Si';
    }});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para rodillas
    if (!formDataExploracionFisica.rodillas) {
        formDataExploracionFisica.rodillas = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(rodillas, (newValue) => {
    formDataExploracionFisica.rodillas = newValue;
});

// Watch para establecer 'Default' cuando rodillas sea 'No'
watch(rodillasPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.rodillas = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.rodillas = rodillas.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Extremidades Inferiores</h1>
        <h2>RODILLAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="rodillasPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="rodillasPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="rodillasPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.rodillas"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>