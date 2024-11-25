<script setup>
import { watch, ref } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const toxicomanias = ref('No');

// Asegurar que formData tenga un valor inicial para toxicomanias
if (!formDataHistoriaClinica.toxicomanias) {
    formDataHistoriaClinica.toxicomanias = toxicomanias.value;
}

if (!formDataHistoriaClinica.toxicomaniasEspecificar) {
    formDataHistoriaClinica.toxicomaniasEspecificar = 'Negado';
}

// Sincronizar toxicomanias con formData
watch(toxicomanias, (newValue) => {
    formDataHistoriaClinica.toxicomanias = newValue;
});

// Watch para establecer 'Negado' cuando toxicomanias sea 'No'
watch(toxicomanias, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.toxicomaniasEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.toxicomaniasEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>

        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador tiene historial de adicciones por consumo compulsivo de sustancias psicoactivas?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="toxicomanias" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="toxicomanias" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="toxicomanias === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.toxicomaniasEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc">
            </div>
        </div>
    </div>
</template>