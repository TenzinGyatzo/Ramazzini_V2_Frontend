<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const fechaUltimaMastografiaPregunta = ref('No');

const fechaUltimaMastografia = ref('');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.fechaUltimaMastografia tiene un valor y establecerlo en fechaUltimaMastografia
    if (formDataHistoriaClinica.fechaUltimaMastografia) {
        fechaUltimaMastografia.value = formDataHistoriaClinica.fechaUltimaMastografia;
        fechaUltimaMastografiaPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para fechaUltimaMastografia
    if (!formDataHistoriaClinica.fechaUltimaMastografia) {
        formDataHistoriaClinica.fechaUltimaMastografia = 'No recuerda';
    }
});


// Sincronizar fechaUltimaMastografia con formData
watch(fechaUltimaMastografia, (newValue) => {
    formDataHistoriaClinica.fechaUltimaMastografia = newValue;
});

// Watch para establecer 'No recuerda' cuando fechaUltimaMastografia sea 'No'
watch(fechaUltimaMastografia, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.fechaUltimaMastografia = 'No recuerda';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.fechaUltimaMastografia = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>ÚLTIMA MASTROGRAFÍA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">
                ¿Recuerda la fecha exacta o aproximada de la última mastografía?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="fechaUltimaMastografiaPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="fechaUltimaMastografiaPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="fechaUltimaMastografiaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.fechaUltimaMastografia"
                    placeholder="Fecha aproximada" required>
            </div>
        </div>
    </div>
</template>