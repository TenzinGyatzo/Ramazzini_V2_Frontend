<script setup>
import { watch, ref } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const cardiopaticos = ref('No');

// Asegurar que formData tenga un valor inicial para cardiopaticos
if (!formDataHistoriaClinica.cardiopaticos) {
    formDataHistoriaClinica.cardiopaticos = cardiopaticos.value;
}

if (!formDataHistoriaClinica.cardiopaticosEspecificar) {
    formDataHistoriaClinica.cardiopaticosEspecificar = 'Negado';
}

// Sincronizar cardiopaticos con formData
watch(cardiopaticos, (newValue) => {
    formDataHistoriaClinica.cardiopaticos = newValue;
});

// Watch para establecer 'Negado' cuando cardiopaticos sea 'No'
watch(cardiopaticos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.cardiopaticosEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.cardiopaticosEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>

        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Casos de problemas cardíacos en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="cardiopaticos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="cardiopaticos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="cardiopaticos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.cardiopaticosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc">
            </div>
        </div>
    </div>
</template>