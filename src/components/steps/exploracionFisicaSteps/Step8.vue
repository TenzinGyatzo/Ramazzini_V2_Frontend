<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const bocaPregunta = ref('No');
const boca = ref ('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.boca === '') {
        boca.value = documentos.currentDocument.boca;
        bocaPregunta.value = 'Si';
    }

    if (formDataExploracionFisica.boca) {
        boca.value = formDataExploracionFisica.boca;
        bocaPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para boca
    if (!formDataExploracionFisica.boca) {
        formDataExploracionFisica.boca = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(boca, (newValue) => {
    formDataExploracionFisica.boca = newValue;
});

// Watch para establecer 'Default' cuando boca sea 'No'
watch(bocaPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.boca = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.boca = boca.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Exploración Cabeza y Cuello</h1>
        <h2>BOCA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="bocaPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="bocaPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="bocaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.boca"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>