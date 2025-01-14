<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const equilibrioPregunta = ref('No');
const equilibrio = ref ('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.equilibrio === '') {
        equilibrio.value = documentos.currentDocument.equilibrio;
        equilibrioPregunta.value = 'Si';
    }

    if (formDataExploracionFisica.equilibrio) {
        equilibrio.value = formDataExploracionFisica.equilibrio;
        equilibrioPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para equilibrio
    if (!formDataExploracionFisica.equilibrio) {
        formDataExploracionFisica.equilibrio = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(equilibrio, (newValue) => {
    formDataExploracionFisica.equilibrio = newValue;
});

// Watch para establecer 'Default' cuando equilibrio sea 'No'
watch(equilibrioPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.equilibrio = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.equilibrio = equilibrio.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Evaluación Neurologica Complementaria</h1>
        <h2>EQUILIBRIO</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="equilibrioPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="equilibrioPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="equilibrioPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.equilibrio"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>