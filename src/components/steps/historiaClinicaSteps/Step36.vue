<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const cantidadDeSangre = ref('Normal');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cantidadDeSangre
    if (!formDataHistoriaClinica.cantidadDeSangre) {
        formDataHistoriaClinica.cantidadDeSangre = cantidadDeSangre.value;
    }
});

// Sincronizar cantidadDeSangre con formData
watch(cantidadDeSangre, (newValue) => {
    formDataHistoriaClinica.cantidadDeSangre = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>CANTIDAD DE SANGRE</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">De acuerdo a la descripción de la trabajadora, ¿Cómo clasifica la cantidad de sangre durante su período menstrual?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Normal" v-model="cantidadDeSangre"
                        class="form-radio accent-emerald-600" />
                    <span>Normal</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Hipermenorrea" v-model="cantidadDeSangre"
                        class="form-radio accent-emerald-600" />
                    <span>Hipermenorrea</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Hipomenorrea" v-model="cantidadDeSangre"
                        class="form-radio accent-emerald-600" />
                    <span>Hipomenorrea</span>
                </label>
            </div>
        </div>
    </div>
</template>