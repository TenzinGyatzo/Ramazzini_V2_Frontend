<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const { formDataExploracionFisica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const resumenExploracionFisicaPregunta = ref('No');
const resumenExploracionFisica = ref('');

onMounted(() => {
    if (documentos.currentDocument) {
        resumenExploracionFisica.value = documentos.currentDocument.resumenExploracionFisica;
        resumenExploracionFisicaPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para resumenExploracionFisica
    if (!formDataExploracionFisica.resumenExploracionFisica) {
        formDataExploracionFisica.resumenExploracionFisica = trabajadores.currentTrabajador.sexo === 'Femenino'
            ? 'Se encuentra clínicamente sana'
            : 'Se encuentra clínicamente sano';
    }
});

// Sincronizar valores con formData
watch(resumenExploracionFisica, (newValue) => {
    formDataExploracionFisica.resumenExploracionFisica = newValue;
});

// Watch para establecer 'Default' cuando resumenExploracionFisica sea 'No'
watch(resumenExploracionFisicaPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.resumenExploracionFisica = trabajadores.currentTrabajador.sexo === 'Femenino'
            ? 'Se encuentra clínicamente sana'
            : 'Se encuentra clínicamente sano';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.resumenExploracionFisica = resumenExploracionFisica.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Evaluación Exploración Física</h1>
        <h2>RESUMEN</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Hay hallazgos significativos por resumir?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="resumenExploracionFisicaPregunta"
                        class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="resumenExploracionFisicaPregunta"
                        class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="resumenExploracionFisicaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.resumenExploracionFisica" required>
                </textarea>
            </div>
        </div>
    </div>
</template>