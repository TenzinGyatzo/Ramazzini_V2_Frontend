<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';

const trabajadores = useTrabajadoresStore();
const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const resumenHistoriaClinicaPregunta = ref('No');
const resumenHistoriaClinica = ref ('');

onMounted(() => {
    if(formDataHistoriaClinica.resumenHistoriaClinica) {
        resumenHistoriaClinica.value = formDataHistoriaClinica.resumenHistoriaClinica
        resumenHistoriaClinicaPregunta.value = 'Si'
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para resumenHistoriaClinica
    if (!formDataHistoriaClinica.resumenHistoriaClinica) {
        formDataHistoriaClinica.resumenHistoriaClinica =
            trabajadores.currentTrabajador.sexo === 'Femenino'
                ? 'Se refiere actualmente asintomática'
                : 'Se refiere actualmente asintomático';
    }
});


// Sincronizar valores con formData
watch(resumenHistoriaClinica, (newValue) => {
    formDataHistoriaClinica.resumenHistoriaClinica = newValue;
});

// Watch para establecer 'Default' cuando resumenHistoriaClinica sea 'No'
watch(resumenHistoriaClinicaPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.resumenHistoriaClinica =
            trabajadores.currentTrabajador.sexo === 'Femenino'
                ? 'Se refiere actualmente asintomática'
                : 'Se refiere actualmente asintomático';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.resumenHistoriaClinica = resumenHistoriaClinica.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Resumen Historia ClÍnica</h1>
        <h2>RESUMEN</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Hay hallazgos significativos por resumir?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="resumenHistoriaClinicaPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="resumenHistoriaClinicaPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="resumenHistoriaClinicaPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Resumen:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.resumenHistoriaClinica"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>