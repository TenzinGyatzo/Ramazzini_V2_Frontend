<script setup>
import { ref, watch, onMounted } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataAptitud } = useFormDataStore();

const today = format(new Date(), 'yyyy-MM-dd');

onMounted(() => {
    formDataAptitud.evaluacionAdicional2 = formDataAptitud.evaluacionAdicional2 || '';
    formDataAptitud.fechaEvaluacionAdicional2 = formatDateYYYYMMDD(formDataAptitud.fechaEvaluacionAdicional2) || today;
    formDataAptitud.resultadosEvaluacionAdicional2 = formDataAptitud.resultadosEvaluacionAdicional2 || '';
});

const evaluacionSugerencias = [
    'Tipo de Sangre',
    'Audiometría',
    'Espirometría',
    'Estudios de laboratorio',
    'Rx simple de tórax',
    'Rx columna lumbar',
    'Electrocardiograma',
];

</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Evaluación Adicional 2</h1>
    <div>
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">Nombre de evaluación, prueba o estudio:</p>
            <div class="font-light mb-4">
                <!-- Input con lista de sugerencias -->
                <input type="text" name="nombreEvaluacion" data-skip-validation
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.evaluacionAdicional2" required
                    list="evaluaciones-sugerencias">
                <!-- Datalist con opciones -->
                <datalist id="evaluaciones-sugerencias">
                    <option v-for="sugerencia in evaluacionSugerencias" :key="sugerencia" :value="sugerencia">
                        {{ sugerencia }}
                    </option>
                </datalist>
            </div>
            <p class="font-medium mb-1 text-gray-800 leading-5">Fecha de resultados:</p>
            <div class="font-light mb-4">
                <input type="date" name="fechaEvaluacion" data-skip-validation
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.fechaEvaluacionAdicional2" required>
            </div>
            <p class="font-medium mb-1 text-gray-800 leading-5">Resumen de resultados y/o alteraciones encontradas:
            </p>
            <div class="font-light mb-4">
                <input type="text" name="resultadosEvaluacion" data-skip-validation
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataAptitud.resultadosEvaluacionAdicional2" required>
            </div>
        </div>
    </div>
</template>
