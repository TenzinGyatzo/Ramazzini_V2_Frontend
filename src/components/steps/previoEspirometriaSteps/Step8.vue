<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataPrevioEspirometria } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const expectoracionFrecuente = ref('NO');

onMounted(() => {
    // Priorizar valores guardados en formData, luego documento actual, luego valores por defecto
    expectoracionFrecuente.value = formDataPrevioEspirometria.expectoracionFrecuente || 
                                   documentos.currentDocument?.expectoracionFrecuente || 
                                   'NO';
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para expectoracionFrecuente
    if (!formDataPrevioEspirometria.expectoracionFrecuente) {
        formDataPrevioEspirometria.expectoracionFrecuente = expectoracionFrecuente.value;
    }
});

// Sincronizar expectoracionFrecuente con formData
watch(expectoracionFrecuente, (newValue) => {
    formDataPrevioEspirometria.expectoracionFrecuente = newValue;
});
</script>

<template>
    <div>
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">EXPECTORACIÓN FRECUENTE</h1>
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Síntomas Respiratorios</h2>
        
        <!-- Pregunta principal con mejor jerarquía -->
        <div class="mb-8">
            <p class="text-lg font-medium mb-4 text-gray-800">¿El trabajador sufre de expectoración frecuente?</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Opción NO -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        expectoracionFrecuente === 'NO' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="NO" 
                        v-model="expectoracionFrecuente" 
                        class="sr-only" 
                    />
                    <!-- Icono -->
                    <div 
                        :class="[
                            'w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-200',
                            expectoracionFrecuente === 'NO' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        ]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            expectoracionFrecuente === 'NO' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        NO
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="expectoracionFrecuente === 'NO'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción SI -->
                <label 
                    :class="[
                        'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        expectoracionFrecuente === 'SI' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="SI" 
                        v-model="expectoracionFrecuente" 
                        class="sr-only" 
                    />
                    <!-- Icono -->
                    <div 
                        :class="[
                            'w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-200',
                            expectoracionFrecuente === 'SI' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        ]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span 
                        :class="[
                            'text-base font-semibold transition-colors duration-200',
                            expectoracionFrecuente === 'SI' ? 'text-emerald-700' : 'text-gray-700'
                        ]"
                    >
                        SÍ
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="expectoracionFrecuente === 'SI'"
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