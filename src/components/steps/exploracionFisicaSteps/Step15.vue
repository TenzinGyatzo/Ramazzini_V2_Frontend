<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataExploracionFisica } = useFormDataStore();

// Valor local para la pregunta principal
const toraxPregunta = ref('No');
const torax = ref ('');

onMounted(() => {
  torax.value = formDataExploracionFisica.torax;
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para torax
    if (!formDataExploracionFisica.torax) {
        formDataExploracionFisica.torax = 'Sin hallazgos';
    }
});

// Sincronizar valores con formData
watch(torax, (newValue) => {
    formDataExploracionFisica.torax = newValue;
});

// Watch para establecer 'Default' cuando torax sea 'No'
watch(toraxPregunta, (newValue) => {
    if (newValue === 'No') {
        formDataExploracionFisica.torax = 'Sin hallazgos';
    }
    if (newValue === 'Si') {
        formDataExploracionFisica.torax = torax.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Exploración de Tórax</h1>
        <h2>TÓRAX</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de hallazgos significativos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="toraxPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="toraxPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="toraxPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Hallazgos:</p>
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataExploracionFisica.torax"
                    required
                >
                </textarea>
            </div>
        </div>
    </div>
</template>