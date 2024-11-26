<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const diabeticosPP = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para diabeticosPP
    if (!formDataHistoriaClinica.diabeticosPP) {
        formDataHistoriaClinica.diabeticosPP = diabeticosPP.value;
    }

    if (!formDataHistoriaClinica.diabeticosPPEspecificar) {
        formDataHistoriaClinica.diabeticosPPEspecificar = 'Negado';
    }
});


// Sincronizar diabeticosPP con formData
watch(diabeticosPP, (newValue) => {
    formDataHistoriaClinica.diabeticosPP = newValue;
});

// Watch para establecer 'Negado' cuando diabeticosPP sea 'No'
watch(diabeticosPP, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.diabeticosPPEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.diabeticosPPEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales Patológicos</h1>
        <h2>DIABÉTICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presenta el trabajador antecedentes de diabetes?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="diabeticosPP" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="diabeticosPP" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="diabeticosPP === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.diabeticosPPEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>