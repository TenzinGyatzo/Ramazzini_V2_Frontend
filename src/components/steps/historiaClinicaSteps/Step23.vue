<script setup>
import { watch, ref } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const tabaquismo = ref('No');

// Asegurar que formData tenga un valor inicial para tabaquismo
if (!formDataHistoriaClinica.tabaquismo) {
    formDataHistoriaClinica.tabaquismo = tabaquismo.value;
}

if (!formDataHistoriaClinica.tabaquismoEspecificar) {
    formDataHistoriaClinica.tabaquismoEspecificar = 'Negado';
}

// Sincronizar tabaquismo con formData
watch(tabaquismo, (newValue) => {
    formDataHistoriaClinica.tabaquismo = newValue;
});

// Watch para establecer 'Negado' cuando tabaquismo sea 'No'
watch(tabaquismo, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.tabaquismoEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.tabaquismoEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales No Patológicos</h1>
        <h2>TABAQUISMO</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador consume tabaco o cuenta con antecedentes de consumo de tabaco?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="tabaquismo" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="tabaquismo" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="tabaquismo === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.tabaquismoEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc">
            </div>
        </div>
    </div>
</template>