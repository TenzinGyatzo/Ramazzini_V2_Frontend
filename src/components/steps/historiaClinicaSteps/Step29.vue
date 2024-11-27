<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const duracionPromedio = ref('5 días');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para duracionPromedio
    if (!formDataHistoriaClinica.duracionPromedio) {
        formDataHistoriaClinica.duracionPromedio = duracionPromedio.value;
    }

    if (!formDataHistoriaClinica.duracionPromedioEspecificar) {
        formDataHistoriaClinica.duracionPromedioEspecificar = '5 días';
    }
});

// Sincronizar duracionPromedio con formData
watch(duracionPromedio, (newValue) => {
    formDataHistoriaClinica.duracionPromedio = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>DURACIÓN</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuántos días dura, en promedio, el periodo menstrual de la trabajadora?</p>
            <div class="grid grid-cols-2 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="2 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>2 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="3 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>3 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="4 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>4 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="5 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>5 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="6 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>6 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="7 días" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>7 días</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Otro" v-model="duracionPromedio"
                        class="form-radio accent-emerald-600" />
                    <span>Otro</span>
                </label>
            </div>
        </div>
    </div>
</template>