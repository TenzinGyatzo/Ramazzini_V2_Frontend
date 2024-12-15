<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const caderaPregunta = ref('No');
const cadera = ref ('');

onMounted(() => {
    if (documentos.currentDocument) {
        cadera.value = documentos.currentDocument.cadera;
        caderaPregunta.value = 'Si';
    }});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cadera
    if (!formDataExploracionFisica.cadera) {
        formDataExploracionFisica.cadera = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(cadera, (newValue) => {
    formDataExploracionFisica.cadera = newValue;
});

// Watch para establecer 'Default' cuando cadera sea 'No'
watch(caderaPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.cadera = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.cadera = cadera.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Extremidades Inferiores</h1>
        <h2>CADERA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="caderaPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="caderaPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="caderaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.cadera"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>