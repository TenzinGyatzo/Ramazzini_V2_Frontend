<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const embarazoActualPregunta = ref('No');

const embarazoActual = ref('');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.embarazoActual tiene un valor y establecerlo en embarazoActual
    if (formDataHistoriaClinica.embarazoActual) {
        embarazoActual.value = formDataHistoriaClinica.embarazoActual;
        embarazoActualPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para embarazoActual
    if (!formDataHistoriaClinica.embarazoActual) {
        formDataHistoriaClinica.embarazoActual = 'Negado';
    }
});


// Sincronizar embarazoActual con formData
watch(embarazoActual, (newValue) => {
    formDataHistoriaClinica.embarazoActual = newValue;
});

// Watch para establecer 'Negado' cuando embarazoActual sea 'No'
watch(embarazoActual, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.embarazoActual = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.embarazoActual = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>EMBARAZO ACTUAL</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿La trabajadora está actualmente embarazada? En caso afirmativo, ¿podría proporcionar detalles sobre el embarazo actual?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="embarazoActualPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="embarazoActualPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="embarazoActualPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.embarazoActual"
                    placeholder="Especifique" required>
            </div>
        </div>
    </div>
</template>