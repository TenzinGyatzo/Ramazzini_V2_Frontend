<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const cardiopaticosPP = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cardiopaticosPP
    if (!formDataHistoriaClinica.cardiopaticosPP) {
        formDataHistoriaClinica.cardiopaticosPP = cardiopaticosPP.value;
    }

    if (!formDataHistoriaClinica.cardiopaticosPPEspecificar) {
        formDataHistoriaClinica.cardiopaticosPPEspecificar = 'Negado';
    }
});


// Sincronizar cardiopaticosPP con formData
watch(cardiopaticosPP, (newValue) => {
    formDataHistoriaClinica.cardiopaticosPP = newValue;
});

// Watch para establecer 'Negado' cuando cardiopaticosPP sea 'No'
watch(cardiopaticosPP, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.cardiopaticosPPEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.cardiopaticosPPEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales Patológicos</h1>
        <h2>CARDIOPÁTICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Historial de enfermedades cardiácas en el trabajador?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="cardiopaticosPP" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="cardiopaticosPP" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="cardiopaticosPP === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.cardiopaticosPPEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>