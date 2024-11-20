<script setup>
import { ref } from 'vue';

// Variables reactivas para el resultado de la prueba antidoping y las drogas seleccionadas
const antidopingResult = ref(null);
const selectedDrugs = ref([]);
</script>


<template>
    <h1 class="font-semibold mb-4 text-gray-800 leading-5">Prueba Antidoping</h1>

    <!-- Pregunta principal -->
    <div class="mb-4">
        <p class="font-medium mb-1 text-gray-800">¿La prueba del trabajador dio resultados positivos?</p>
        <div class="flex items-center space-x-6">
            <label class="flex items-center space-x-2">
                <input type="radio" value="no" v-model="antidopingResult" class="form-radio text-blue-500" />
                <span>No</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="radio" value="yes" v-model="antidopingResult" class="form-radio text-blue-500" />
                <span>Sí</span>
            </label>
        </div>
    </div>

    <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
    <div v-if="antidopingResult === 'yes'" class="mt-4">
        <p class="font-medium mb-1 text-gray-800">Especifique:</p>
        <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="marijuana" v-model="selectedDrugs" class="form-checkbox text-blue-500" />
                <span>Marihuana</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="cocaine" v-model="selectedDrugs" class="form-checkbox text-blue-500" />
                <span>Cocaína</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="amphetamines" v-model="selectedDrugs"
                    class="form-checkbox text-blue-500" />
                <span>Anfetaminas</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="methamphetamines" v-model="selectedDrugs"
                    class="form-checkbox text-blue-500" />
                <span>Metanfetaminas</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="opiates" v-model="selectedDrugs" class="form-checkbox text-blue-500" />
                <span>Opiáceos</span>
            </label>
        </div>
    </div>
</template>
