<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataPrevioEspirometria } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const tabaquismo = ref('NO FUMA');
const cigarrosSemana = ref('0');

onMounted(() => {
    // Priorizar valores guardados en formData, luego documento actual, luego valores por defecto
    tabaquismo.value = formDataPrevioEspirometria.tabaquismo || 
                       documentos.currentDocument?.tabaquismo || 
                       'NO FUMA';
    cigarrosSemana.value = formDataPrevioEspirometria.cigarrosSemana || 
                          documentos.currentDocument?.cigarrosSemana || 
                          '0';
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para tabaquismo
    if (!formDataPrevioEspirometria.tabaquismo) {
        formDataPrevioEspirometria.tabaquismo = tabaquismo.value;
    }
    // Asegurar que formData tenga un valor inicial para cigarrosSemana
    if (!formDataPrevioEspirometria.cigarrosSemana) {
        formDataPrevioEspirometria.cigarrosSemana = cigarrosSemana.value;
    }
});

// Sincronizar tabaquismo con formData
watch(tabaquismo, (newValue) => {
    formDataPrevioEspirometria.tabaquismo = newValue;
    
    // Si selecciona FUMA, establecer automáticamente cigarrosSemana en <10
    if (newValue === 'FUMA') {
        cigarrosSemana.value = '<10';
    } else {
        // Si no fuma o es exfumador, establecer en 0
        cigarrosSemana.value = '0';
    }
});

// Sincronizar cigarrosSemana con formData
watch(cigarrosSemana, (newValue) => {
    formDataPrevioEspirometria.cigarrosSemana = newValue;
});
</script>

<template>
    <div>
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">TABAQUISMO</h1>
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Factores de riesgo respiratorio</h2>
        
        <!-- Pregunta principal con mejor jerarquía -->
        <div class="mb-8">
            <p class="text-lg font-medium mb-4 text-gray-800">¿El trabajador fuma?</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Opción NO FUMA-->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        tabaquismo === 'NO FUMA' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="NO FUMA" 
                        v-model="tabaquismo" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            tabaquismo === 'NO FUMA' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        NO FUMA
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="tabaquismo === 'NO FUMA'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción EXFUMADOR -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        tabaquismo === 'EXFUMADOR' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="EXFUMADOR" 
                        v-model="tabaquismo" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            tabaquismo === 'EXFUMADOR' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        EXFUMADOR
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="tabaquismo === 'EXFUMADOR'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción FUMA -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        tabaquismo === 'FUMA' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="FUMA" 
                        v-model="tabaquismo" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            tabaquismo === 'FUMA' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        FUMA
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="tabaquismo === 'FUMA'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

            </div>
        </div>

        <!-- Sección de cigarros por semana (solo visible si FUMA) -->
        <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform -translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-2"
        >
            <div v-if="tabaquismo === 'FUMA'" class="mb-8">
            <p class="text-lg font-medium mb-4 text-gray-800">¿Cuántos cigarros fuma el trabajador por semana?</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Opción 0-->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        cigarrosSemana === '0' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="0" 
                        v-model="cigarrosSemana" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            cigarrosSemana === '0' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        0
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="cigarrosSemana === '0'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción <10 -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        cigarrosSemana === '<10' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="<10" 
                        v-model="cigarrosSemana" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            cigarrosSemana === '<10' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        < 10
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="cigarrosSemana === '<10'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción 10–20 -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        cigarrosSemana === '10–20' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="10–20" 
                        v-model="cigarrosSemana" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            cigarrosSemana === '10–20' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        10–20
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="cigarrosSemana === '10–20'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción >20 -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        cigarrosSemana === '>20' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value=">20" 
                        v-model="cigarrosSemana" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            cigarrosSemana === '>20' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        > 20
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="cigarrosSemana === '>20'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

            </div>
            </div>
        </transition>
    </div>
</template>