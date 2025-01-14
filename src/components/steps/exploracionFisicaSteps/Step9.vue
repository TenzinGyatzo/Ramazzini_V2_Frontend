<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const cuelloPregunta = ref('No');
const cuello = ref ('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.cuello === '') {
        cuello.value = documentos.currentDocument.cuello;
        cuelloPregunta.value = 'Si';
    }

    if (formDataExploracionFisica.cuello) {
        cuello.value = formDataExploracionFisica.cuello;
        cuelloPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cuello
    if (!formDataExploracionFisica.cuello) {
        formDataExploracionFisica.cuello = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(cuello, (newValue) => {
    formDataExploracionFisica.cuello = newValue;
});

// Watch para establecer 'Default' cuando cuello sea 'No'
watch(cuelloPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.cuello = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.cuello = cuello.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Exploración Cabeza y Cuello</h1>
        <h2>CUELLO</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="cuelloPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="cuelloPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="cuelloPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.cuello"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>