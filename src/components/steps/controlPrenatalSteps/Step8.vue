<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const recuerdaFum = ref('No');

const fum = ref(''); // Fecha de última menstruación

onMounted(() => {
    // Verificar si formDataHistoriaClinica.fum tiene un valor y establecerlo en fum
    if (formDataControlPrenatal.fum) {
        fum.value = formDataControlPrenatal.fum;
        recuerdaFum.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para fum
    if (!formDataControlPrenatal.fum) {
        formDataControlPrenatal.fum = 'No recuerda';
    }
});


// Sincronizar fum con formData
watch(fum, (newValue) => {
    formDataControlPrenatal.fum = newValue;
});

// Watch para establecer 'Negado' cuando fum sea 'No'
watch(fum, (newValue) => {
    if (newValue === 'No') {
        formDataControlPrenatal.fum = 'No recuerda';
    }
    if (newValue === 'Si') {
        formDataControlPrenatal.fum = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>FECHA DE ÚLTIMA MENSTRUACIÓN</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿La trabajadora recuerda la fecha del primer día de su última menstruación?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="recuerdaFum" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="recuerdaFum" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="recuerdaFum === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="date"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataControlPrenatal.fum"
                    required>
            </div>
        </div>
    </div>
</template>