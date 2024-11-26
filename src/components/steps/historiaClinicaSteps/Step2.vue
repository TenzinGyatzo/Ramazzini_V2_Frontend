<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const nefropatias = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para nefropatias
    if (!formDataHistoriaClinica.nefropatias) {
        formDataHistoriaClinica.nefropatias = nefropatias.value;
    }

    if (!formDataHistoriaClinica.nefropatiasEspecificar) {
        formDataHistoriaClinica.nefropatiasEspecificar = 'Negado';
    }
});


// Sincronizar nefropatias con formData
watch(nefropatias, (newValue) => {
    formDataHistoriaClinica.nefropatias = newValue;
});

// Watch para establecer 'Negado' cuando nefropatias sea 'No'
watch(nefropatias, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.nefropatiasEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.nefropatiasEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>NEFROPATÍAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Problemas de riñones en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="nefropatias" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="nefropatias" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="nefropatias === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.nefropatiasEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc"
                    required>
            </div>
        </div>
    </div>
</template>