<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const { formDataCertificado } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const impedimentosFisicosPregunta = ref('No');
const impedimentosFisicos = ref ('');

onMounted(() => {
    if (documentos.currentDocument) {
        if (documentos.currentDocument.impedimentosFisicos !== 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita')
        impedimentosFisicos.value = documentos.currentDocument.impedimentosFisicos;
        impedimentosFisicosPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para impedimentosFisicos
    if (!formDataCertificado.impedimentosFisicos) {
        formDataCertificado.impedimentosFisicos =
            trabajadores.currentTrabajador.sexo === 'Femenino'
                ? 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita'
                : 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita';
    }
});


// Sincronizar valores con formData
watch(impedimentosFisicos, (newValue) => {
    formDataCertificado.impedimentosFisicos = newValue;
});

// Watch para establecer 'Default' cuando impedimentosFisicos sea 'No'
watch(impedimentosFisicosPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataCertificado.impedimentosFisicos =
            trabajadores.currentTrabajador.sexo === 'Femenino'
            ? 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita'
            : 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita';
    }
    if (newValue === 'Si') {
        formDataCertificado.impedimentosFisicos = impedimentosFisicos.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Certificado de Salud</h1>
        <h2>IMPEDIMENTOS FÍSICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Hay impedimentos físicos que se deban mencionar en el certificado?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="impedimentosFisicosPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="impedimentosFisicosPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="impedimentosFisicosPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Resumen:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataCertificado.impedimentosFisicos"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>