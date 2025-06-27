<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const dolorMenstrual = ref('Eumenorrea');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.dolorMenstrual tiene un valor y establecerlo en dolorMenstrual
    if (formDataHistoriaClinica.dolorMenstrual) {
        dolorMenstrual.value = formDataHistoriaClinica.dolorMenstrual;
    }
})

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para dolorMenstrual
    if (!formDataHistoriaClinica.dolorMenstrual) {
        formDataHistoriaClinica.dolorMenstrual = dolorMenstrual.value;
    }
});

// Sincronizar dolorMenstrual con formData
watch(dolorMenstrual, (newValue) => {
    formDataHistoriaClinica.dolorMenstrual = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>DOLOR DURANTE LA MENSTRUACIÓN</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">De acuerdo a la descripciíon de la trabajadora, ¿Cómo clasifica el nivel de dolor durante su período menstrual?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Eumenorrea" v-model="dolorMenstrual"
                        class="form-radio accent-emerald-600" />
                    <span>Eumenorrea</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Dismenorrea" v-model="dolorMenstrual"
                        class="form-radio accent-emerald-600" />
                    <span>Dismenorrea</span>
                </label>
            </div>
        </div>
    </div>
</template>