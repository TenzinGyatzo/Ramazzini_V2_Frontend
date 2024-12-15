<script setup>
import { ref, watch, onMounted } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataAptitud } = useFormDataStore();

const today = format(new Date(), 'yyyy-MM-dd');

// Inicializar pregunta con el valor actual del store
const pregunta = ref(formDataAptitud.evaluacionAdicional6 ? 'Si' : 'No');

onMounted(() => {
    formDataAptitud.evaluacionAdicional6 = formDataAptitud.evaluacionAdicional6 || '';
    formDataAptitud.fechaEvaluacionAdicional6 = formatDateYYYYMMDD(formDataAptitud.fechaEvaluacionAdicional6) || today;
    formDataAptitud.resultadosEvaluacionAdicional6 = formDataAptitud.resultadosEvaluacionAdicional6 || '';
});

// Sincronizar los valores de formDataAptitud en función de la respuesta
watch(pregunta, () => {
    if (pregunta.value === 'No') {
        formDataAptitud.evaluacionAdicional6 = null;
        formDataAptitud.fechaEvaluacionAdicional6 = null;
        formDataAptitud.resultadosEvaluacionAdicional6 = null;
    } else {
        formDataAptitud.evaluacionAdicional6 = formDataAptitud.evaluacionAdicional6 || '';
        formDataAptitud.fechaEvaluacionAdicional6 = formDataAptitud.fechaEvaluacionAdicional6 || today;
        formDataAptitud.resultadosEvaluacionAdicional6 = formDataAptitud.resultadosEvaluacionAdicional6 || '';
    }
});
</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Evaluación Adicional 6</h1>
    <!-- Pregunta principal -->
    <div class="mb-4">
        <p class="font-medium mb-1 text-gray-800 leading-5">¿Agregar evaluación adicional 6?
        </p>
        <div class="flex items-center space-x-6 font-light">
            <label class="flex items-center space-x-2">
                <input type="radio" value="No" v-model="pregunta" class="form-radio accent-emerald-600" />
                <span>No</span>
            </label>
            <label class="flex items-center space-x-2">
                <input type="radio" value="Si" v-model="pregunta" class="form-radio accent-emerald-600" />
                <span>Si</span>
            </label>
        </div>
    </div>
    <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
    <div v-if="pregunta === 'Si'">
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">Nombre de evaluación, prueba o estudio:</p>
            <div class="font-light mb-4">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.evaluacionAdicional6" required>
            </div>
            <p class="font-medium mb-1 text-gray-800 leading-5">Fecha de resultados:</p>
            <div class="font-light mb-4">
                <input type="date"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.fechaEvaluacionAdicional6" required>
            </div>
            <p class="font-medium mb-1 text-gray-800 leading-5">Resumen de resultados y/o alteraciones encontradas:
            </p>
            <div class="font-light mb-4">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.resultadosEvaluacionAdicional6" required>
            </div>
        </div>
    </div>
</template>
