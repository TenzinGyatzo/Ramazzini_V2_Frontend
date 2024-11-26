<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const hipertensivosPP = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para hipertensivosPP
    if (!formDataHistoriaClinica.hipertensivosPP) {
        formDataHistoriaClinica.hipertensivosPP = hipertensivosPP.value;
    }

    if (!formDataHistoriaClinica.hipertensivosPPEspecificar) {
        formDataHistoriaClinica.hipertensivosPPEspecificar = 'Negado';
    }
});


// Sincronizar hipertensivosPP con formData
watch(hipertensivosPP, (newValue) => {
    formDataHistoriaClinica.hipertensivosPP = newValue;
});

// Watch para establecer 'Negado' cuando hipertensivosPP sea 'No'
watch(hipertensivosPP, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.hipertensivosPPEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.hipertensivosPPEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales Patológicos</h1>
        <h2>HIPERTENSIVOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador tiene antecedentes de hipertensión
                arterial?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="hipertensivosPP" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="hipertensivosPP" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="hipertensivosPP === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.hipertensivosPPEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>