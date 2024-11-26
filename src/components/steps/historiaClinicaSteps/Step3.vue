<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const diabeticos = ref('No');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para diabeticos
    if (!formDataHistoriaClinica.diabeticos) {
        formDataHistoriaClinica.diabeticos = diabeticos.value;
    }

    if (!formDataHistoriaClinica.diabeticosEspecificar) {
        formDataHistoriaClinica.diabeticosEspecificar = 'Negado';
    }
});


// Sincronizar diabeticos con formData
watch(diabeticos, (newValue) => {
    formDataHistoriaClinica.diabeticos = newValue;
});

// Watch para establecer 'Negado' cuando diabeticos sea 'No'
watch(diabeticos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.diabeticosEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.diabeticosEspecificar = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>DIABÉTICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Casos de diabetes en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="diabeticos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="diabeticos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="diabeticos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.diabeticosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>