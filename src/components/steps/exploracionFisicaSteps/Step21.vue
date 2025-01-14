<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const vascularEInferioresPregunta = ref('No');
const vascularEInferiores = ref ('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.vascularEInferiores === '') {
        vascularEInferiores.value = documentos.currentDocument.vascularEInferiores;
        vascularEInferioresPregunta.value = 'Si';
    }

    if (formDataExploracionFisica.vascularEInferiores) {
        vascularEInferiores.value = formDataExploracionFisica.vascularEInferiores;
        vascularEInferioresPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para vascularEInferiores
    if (!formDataExploracionFisica.vascularEInferiores) {
        formDataExploracionFisica.vascularEInferiores = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(vascularEInferiores, (newValue) => {
    formDataExploracionFisica.vascularEInferiores = newValue;
});

// Watch para establecer 'Default' cuando vascularEInferiores sea 'No'
watch(vascularEInferioresPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.vascularEInferiores = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.vascularEInferiores = vascularEInferiores.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Extremidades Inferiores</h1>
        <h2>VASCULAR</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="vascularEInferioresPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="vascularEInferioresPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="vascularEInferioresPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.vascularEInferiores"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>