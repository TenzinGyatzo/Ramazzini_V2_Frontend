<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const accidenteLaboral = ref('No');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.accidenteLaboral tiene un valor y establecerlo en accidenteLaboral
    if (formDataHistoriaClinica.accidenteLaboral) {
        accidenteLaboral.value = formDataHistoriaClinica.accidenteLaboral;
    }
    if (formDataHistoriaClinica.accidenteLaboralEspecificar) {
        formDataHistoriaClinica.accidenteLaboralEspecificar = formDataHistoriaClinica.accidenteLaboralEspecificar;
    }
    if (formDataHistoriaClinica.descripcionDelDano) {
        formDataHistoriaClinica.descripcionDelDano = formDataHistoriaClinica.descripcionDelDano;
    }
    if (formDataHistoriaClinica.secuelas) {
        formDataHistoriaClinica.secuelas = formDataHistoriaClinica.secuelas;
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para accidenteLaboral
    if (!formDataHistoriaClinica.accidenteLaboral) {
        formDataHistoriaClinica.accidenteLaboral = accidenteLaboral.value;
    }

    if (!formDataHistoriaClinica.accidenteLaboralEspecificar) {
        formDataHistoriaClinica.accidenteLaboralEspecificar = 'Niega haber sufrido accidentes';
    }

    if (!formDataHistoriaClinica.descripcionDelDano) {
        formDataHistoriaClinica.descripcionDelDano = 'Ninguno';
    }

    if (!formDataHistoriaClinica.secuelas) {
        formDataHistoriaClinica.secuelas = 'Sin secuelas';
    }
});

// Sincronizar valores con formData
watch(accidenteLaboral, (newValue) => {
    formDataHistoriaClinica.accidenteLaboral = newValue;
});

// Watch para establecer 'Defaults' cuando accidenteLaboral sea 'No'
watch(accidenteLaboral, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.accidenteLaboral = 'Negado';
        formDataHistoriaClinica.descripcionDelDano = 'Ninguno';
        formDataHistoriaClinica.secuelas = 'Sin secuelas';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Laborales</h1>
        <h2>ACCIDENTE DE TRABAJO</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador ha sufrido un accidente de trabajo?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="accidenteLaboral" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="accidenteLaboral" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="accidenteLaboral === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Describa el accidente:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.accidenteLaboralEspecificar"
                    placeholder="Descripción del accidente" required>
            </div>
        </div>

        <div v-if="accidenteLaboral === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Describa el daño:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.descripcionDelDano"
                    placeholder="Descripción del daño" required>
            </div>
        </div>

        <div v-if="accidenteLaboral === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Describa las secuelas:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.secuelas"
                    placeholder="Descripción de secuelas" required>
            </div>
        </div>
    </div>
</template>