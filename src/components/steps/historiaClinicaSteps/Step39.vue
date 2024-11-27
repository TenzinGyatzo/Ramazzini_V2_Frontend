<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const planificacionFamiliarPregunta = ref('No');

const planificacionFamiliar = ref('');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para planificacionFamiliar
    if (!formDataHistoriaClinica.planificacionFamiliar) {
        formDataHistoriaClinica.planificacionFamiliar = 'Ninguno';
    }
});


// Sincronizar planificacionFamiliar con formData
watch(planificacionFamiliar, (newValue) => {
    formDataHistoriaClinica.planificacionFamiliar = newValue;
});

// Watch para establecer 'Ninguno' cuando planificacionFamiliar sea 'No'
watch(planificacionFamiliar, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.planificacionFamiliar = 'Ninguno';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.planificacionFamiliar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>PLANIFICACIÓN FAMILIAR</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">
                ¿Ha utilizado la trabajadora métodos específicos para controlar el número y espaciamiento de sus hijos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="planificacionFamiliarPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="planificacionFamiliarPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="planificacionFamiliarPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.planificacionFamiliar"
                    placeholder="Especifique" required>
            </div>
        </div>
    </div>
</template>