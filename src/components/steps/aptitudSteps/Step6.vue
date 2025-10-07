<script setup>
import { ref, watch, onMounted } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataAptitud } = useFormDataStore();

const today = format(new Date(), 'yyyy-MM-dd');

onMounted(() => {
    formDataAptitud.evaluacionAdicional5 = formDataAptitud.evaluacionAdicional5 || '';
    formDataAptitud.fechaEvaluacionAdicional5 = formatDateYYYYMMDD(formDataAptitud.fechaEvaluacionAdicional5) || today;
    formDataAptitud.resultadosEvaluacionAdicional5 = formDataAptitud.resultadosEvaluacionAdicional5 || '';
});

const evaluacionSugerencias = [
    'Tipo de Sangre',
    'Audiometría',
    'Espirometría',
    'Estudios de laboratorio',
    'Rx simple de tórax',
    'Rx columna lumbar',
    'Rx rodillas',
    'Electrocardiograma',
];

</script>


<template>
    <div>
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">EVALUACIÓN ADICIONAL 5</h1>
        
        <div class="space-y-6">
            <!-- Campo 1: Nombre de evaluación -->
            <div class="mb-6">
                <label for="nombreEvaluacion" class="block text-base font-medium leading-5 text-gray-800 mb-1">
                    Nombre de evaluación, prueba o estudio
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        name="nombreEvaluacion" 
                        data-skip-validation
                        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        v-model="formDataAptitud.evaluacionAdicional5" 
                        required
                        list="evaluaciones-sugerencias"
                        placeholder="Selecciona o escribe"
                    />
                    <!-- Datalist con opciones -->
                    <datalist id="evaluaciones-sugerencias">
                        <option v-for="sugerencia in evaluacionSugerencias" :key="sugerencia" :value="sugerencia">
                            {{ sugerencia }}
                        </option>
                    </datalist>
                </div>
            </div>

            <!-- Campo 2: Fecha de resultados -->
            <div class="mb-6">
                <label for="fechaEvaluacion" class="block text-base font-medium leading-5 text-gray-800 mb-1">
                    Fecha de resultados
                </label>
                <div class="relative">
                    <input 
                        type="date" 
                        name="fechaEvaluacion" 
                        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        v-model="formDataAptitud.fechaEvaluacionAdicional5" 
                        required
                    />
                </div>
            </div>

            <!-- Campo 3: Resumen de resultados -->
            <div class="mb-6">
                <label for="resultadosEvaluacion" class="block text-base font-medium leading-5 text-gray-800 mb-1">
                    Resumen de resultados y/o alteraciones encontradas
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        name="resultadosEvaluacion" 
                        data-skip-validation
                        class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        v-model="formDataAptitud.resultadosEvaluacionAdicional5" 
                        required
                        placeholder="Describe el resultado"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
