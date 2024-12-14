<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const recuerdaFechaUltimaRegla = ref('No');

const fechaUltimaRegla = ref('');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.fechaUltimaRegla tiene un valor y establecerlo en fechaUltimaRegla
    if (formDataHistoriaClinica.fechaUltimaRegla) {
        fechaUltimaRegla.value = formDataHistoriaClinica.fechaUltimaRegla;
        recuerdaFechaUltimaRegla.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para fechaUltimaRegla
    if (!formDataHistoriaClinica.fechaUltimaRegla) {
        formDataHistoriaClinica.fechaUltimaRegla = 'No recuerda';
    }
});


// Sincronizar fechaUltimaRegla con formData
watch(fechaUltimaRegla, (newValue) => {
    formDataHistoriaClinica.fechaUltimaRegla = newValue;
});

// Watch para establecer 'Negado' cuando fechaUltimaRegla sea 'No'
watch(fechaUltimaRegla, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.fechaUltimaRegla = 'No recuerda';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.fechaUltimaRegla = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>FECHA DE ÚLTIMA REGLA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿La trabajadora recuerda la fecha del primer día de su última menstruación?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="recuerdaFechaUltimaRegla" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="recuerdaFechaUltimaRegla" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="recuerdaFechaUltimaRegla === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.fechaUltimaRegla"
                    placeholder="Fecha de primer día de última mesntruación" required>
            </div>
        </div>
    </div>
</template>