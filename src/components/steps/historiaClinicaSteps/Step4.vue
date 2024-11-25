<script setup>
import { watch, ref } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const hipertensivos = ref('No');

// Asegurar que formData tenga un valor inicial para hipertensivos
if (!formDataHistoriaClinica.hipertensivos) {
    formDataHistoriaClinica.hipertensivos = hipertensivos.value;
}

if (!formDataHistoriaClinica.hipertensivosEspecificar) {
    formDataHistoriaClinica.hipertensivosEspecificar = 'Negado';
}

// Sincronizar hipertensivos con formData
watch(hipertensivos, (newValue) => {
    formDataHistoriaClinica.hipertensivos = newValue;
});

// Watch para establecer 'Negado' cuando hipertensivos sea 'No'
watch(hipertensivos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.hipertensivosEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.hipertensivosEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>

        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Casos de hipertensión en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="hipertensivos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="hipertensivos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="hipertensivos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.hipertensivosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc">
            </div>
        </div>
    </div>
</template>