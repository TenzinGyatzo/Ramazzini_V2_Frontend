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
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">Antecedentes Gineco Obstétricos</h1>
        <h2 class="text-lg font-semibold mb-4 text-gray-700">DOLOR DURANTE LA MENSTRUACIÓN</h2>
        
        <!-- Pregunta principal con mejor jerarquía -->
        <div class="mb-8">
            <p class="text-lg font-medium mb-4 text-gray-800">De acuerdo a la descripción de la trabajadora, ¿Cómo clasifica el nivel de dolor durante su período menstrual?</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Opción Eumenorrea -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        dolorMenstrual === 'Eumenorrea' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="Eumenorrea" 
                        v-model="dolorMenstrual" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            dolorMenstrual === 'Eumenorrea' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        Eumenorrea
                    </span>
                    <span 
                        :class="[
                            'text-xs text-center mt-1 transition-colors duration-200',
                            dolorMenstrual === 'Eumenorrea' ? 'text-emerald-600' : 'text-gray-500'
                        ]"
                    >
                        (Sin dolor)
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="dolorMenstrual === 'Eumenorrea'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción Dismenorrea -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        dolorMenstrual === 'Dismenorrea' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="Dismenorrea" 
                        v-model="dolorMenstrual" 
                        class="sr-only" 
                    />

                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            dolorMenstrual === 'Dismenorrea' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        Dismenorrea
                    </span>
                    <span 
                        :class="[
                            'text-xs text-center mt-1 transition-colors duration-200',
                            dolorMenstrual === 'Dismenorrea' ? 'text-emerald-600' : 'text-gray-500'
                        ]"
                    >
                        (Con dolor)
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="dolorMenstrual === 'Dismenorrea'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>
            </div>
        </div>
    </div>
</template>