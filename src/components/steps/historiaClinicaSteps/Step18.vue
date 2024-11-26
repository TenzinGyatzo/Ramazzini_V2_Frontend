<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const epilepticosPP = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para epilepticosPP
    if (!formDataHistoriaClinica.epilepticosPP) {
        formDataHistoriaClinica.epilepticosPP = epilepticosPP.value;
    }

    if (!formDataHistoriaClinica.epilepticosPPEspecificar) {
        formDataHistoriaClinica.epilepticosPPEspecificar = 'Negado';
    }
});


// Sincronizar epilepticosPP con formData
watch(epilepticosPP, (newValue) => {
    formDataHistoriaClinica.epilepticosPP = newValue;
});

// Watch para establecer 'Negado' cuando epilepticosPP sea 'No'
watch(epilepticosPP, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.epilepticosPPEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.epilepticosPPEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales Patológicos</h1>
        <h2>EPILÉPTICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador tiene antecedentes de epilepsia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="epilepticosPP" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="epilepticosPP" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="epilepticosPP === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.epilepticosPPEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>