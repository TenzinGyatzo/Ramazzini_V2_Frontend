<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const vidaSexualActivaPregunta = ref('No');

const vidaSexualActiva = ref('');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.vidaSexualActiva tiene un valor y establecerlo en vidaSexualActiva
    if (formDataHistoriaClinica.vidaSexualActiva) {
        vidaSexualActiva.value = formDataHistoriaClinica.vidaSexualActiva;
        vidaSexualActivaPregunta.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para vidaSexualActiva
    if (!formDataHistoriaClinica.vidaSexualActiva) {
        formDataHistoriaClinica.vidaSexualActiva = 'Negada';
    }
});


// Sincronizar vidaSexualActiva con formData
watch(vidaSexualActiva, (newValue) => {
    formDataHistoriaClinica.vidaSexualActiva = newValue;
});

// Watch para establecer 'Negada' cuando vidaSexualActiva sea 'No'
watch(vidaSexualActiva, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.vidaSexualActiva = 'Negada';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.vidaSexualActiva = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>VIDA SEXUAL ACTIVA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">
                ¿La trabajadora actualmente es sexualmente activa?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="vidaSexualActivaPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="vidaSexualActivaPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="vidaSexualActivaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">En caso afirmativo, ¿a qué edad comenzó su vida sexual activa?</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.vidaSexualActiva"
                    placeholder="Edad" required>
            </div>
        </div>
    </div>
</template>