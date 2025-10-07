<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataPrevioEspirometria } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const disnea = ref('NINGUNA');

onMounted(() => {
    // Priorizar valores guardados en formData, luego documento actual, luego valores por defecto
    disnea.value = formDataPrevioEspirometria.disnea || 
                   documentos.currentDocument?.disnea || 
                   'NINGUNA';
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para disnea
    if (!formDataPrevioEspirometria.disnea) {
        formDataPrevioEspirometria.disnea = disnea.value;
    }
});

// Sincronizar disnea con formData
watch(disnea, (newValue) => {
    formDataPrevioEspirometria.disnea = newValue;
});
</script>

<template>
    <div>
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">DISNEA</h1>
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Síntomas Respiratorios</h2>
        
        <!-- Pregunta principal con mejor jerarquía -->
        <div class="mb-8">
            <p class="text-lg font-medium mb-4 text-gray-800">¿El trabajador sufre de disnea?</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Opción NINGUNA -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        disnea === 'NINGUNA' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="NINGUNA" 
                        v-model="disnea" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            disnea === 'NINGUNA' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        NINGUNA
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="disnea === 'NINGUNA'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción AL ESFUERZO -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        disnea === 'AL ESFUERZO' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="AL ESFUERZO" 
                        v-model="disnea" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            disnea === 'AL ESFUERZO' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        AL ESFUERZO
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="disnea === 'AL ESFUERZO'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción EN REPOSO -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        disnea === 'EN REPOSO' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="EN REPOSO" 
                        v-model="disnea" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            disnea === 'EN REPOSO' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        EN REPOSO
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="disnea === 'EN REPOSO'"
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