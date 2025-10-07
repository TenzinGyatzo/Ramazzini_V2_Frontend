<script setup>
import { watch, ref, onMounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataPrevioEspirometria } = useFormDataStore();

// Valor local para la pregunta principal (se inicializará en onMounted)
const resultadoCuestionario = ref('');

// Función para calcular el resultado automático basado en el algoritmo médico
const calcularResultadoAutomatico = () => {
    const hallazgosNoProcedente = [];
    const hallazgosPrecaucion = [];

    // ========================================
    // PRIORIDAD 1: NO PROCEDENTE
    // ========================================
    
    // Contraindicaciones absolutas (si cualquiera se cumple ⇒ clasifica aquí)
    if (formDataPrevioEspirometria.infartoAgudoAnginaInestable === 'SI') {
        hallazgosNoProcedente.push('Infarto agudo/angina inestable');
    }
    if (formDataPrevioEspirometria.aneurismaAorticoConocido === 'SI') {
        hallazgosNoProcedente.push('Aneurisma aórtico conocido');
    }
    if (formDataPrevioEspirometria.inestabilidadHemodinamicaGrave === 'SI') {
        hallazgosNoProcedente.push('Inestabilidad hemodinámica grave');
    }
    if (formDataPrevioEspirometria.hipertensionIntracraneal === 'SI') {
        hallazgosNoProcedente.push('Hipertensión intracraneal');
    }
    if (formDataPrevioEspirometria.desprendimientoAgudoRetina === 'SI') {
        hallazgosNoProcedente.push('Desprendimiento agudo de retina');
    }
    if (formDataPrevioEspirometria.disnea === 'EN REPOSO') {
        hallazgosNoProcedente.push('Disnea en reposo');
    }

    // Si hay contraindicaciones absolutas, retornar NO PROCEDENTE inmediatamente
    if (hallazgosNoProcedente.length > 0) {
        return {
            resultado: 'NO PROCEDENTE',
            hallazgos: hallazgosNoProcedente
        };
    }

    // ========================================
    // PRIORIDAD 2: PROCEDENTE CON PRECAUCIÓN
    // ========================================
    // Solo si NO cayó en "No procedente". Si ≥1 de estas se cumple ⇒ Precaución
    
    // --- Factores de riesgo respiratorio ---
    if (formDataPrevioEspirometria.tabaquismo && 
        (formDataPrevioEspirometria.tabaquismo === 'FUMA' || formDataPrevioEspirometria.tabaquismo === 'EXFUMADOR')) {
        hallazgosPrecaucion.push(`Tabaquismo: ${formDataPrevioEspirometria.tabaquismo}`);
    }
    if (formDataPrevioEspirometria.cigarrosSemana && 
        formDataPrevioEspirometria.cigarrosSemana !== '0') {
        hallazgosPrecaucion.push(`Cigarros/semana: ${formDataPrevioEspirometria.cigarrosSemana}`);
    }
    if (formDataPrevioEspirometria.exposicionHumosBiomasa === 'SI') {
        hallazgosPrecaucion.push('Exposición a humos de biomasa');
    }
    if (formDataPrevioEspirometria.exposicionLaboralPolvos === 'SI') {
        hallazgosPrecaucion.push('Exposición laboral a polvos');
    }
    if (formDataPrevioEspirometria.exposicionVaporesGasesIrritantes === 'SI') {
        hallazgosPrecaucion.push('Exposición a vapores/gases irritantes');
    }
    if (formDataPrevioEspirometria.antecedentesTuberculosisInfeccionesRespiratorias === 'SI') {
        hallazgosPrecaucion.push('Antecedentes de TB/infecciones respiratorias');
    }
    
    // --- Síntomas respiratorios ---
    if (formDataPrevioEspirometria.tosCronica === 'SI') {
        hallazgosPrecaucion.push('Tos crónica');
    }
    if (formDataPrevioEspirometria.expectoracionFrecuente === 'SI') {
        hallazgosPrecaucion.push('Expectoración frecuente');
    }
    if (formDataPrevioEspirometria.disnea === 'AL ESFUERZO') {
        hallazgosPrecaucion.push('Disnea al esfuerzo');
    }
    if (formDataPrevioEspirometria.sibilancias === 'SI') {
        hallazgosPrecaucion.push('Sibilancias');
    }
    if (formDataPrevioEspirometria.hemoptisis === 'SI') {
        hallazgosPrecaucion.push('Hemoptisis');
    }
    if (
        formDataPrevioEspirometria.otrosSintomas &&
        formDataPrevioEspirometria.otrosSintomas.trim() !== '' &&
        formDataPrevioEspirometria.otrosSintomas.trim().toUpperCase() !== 'NO'
    ) {
        hallazgosPrecaucion.push(`Otros síntomas: ${formDataPrevioEspirometria.otrosSintomas}`);
    }
    
    // --- Antecedentes médicos relevantes ---
    if (formDataPrevioEspirometria.asma === 'SI') {
        hallazgosPrecaucion.push('Asma');
    }
    if (formDataPrevioEspirometria.epocBronquitisCronica === 'SI') {
        hallazgosPrecaucion.push('EPOC/Bronquitis crónica');
    }
    if (formDataPrevioEspirometria.fibrosisPulmonar === 'SI') {
        hallazgosPrecaucion.push('Fibrosis pulmonar');
    }
    if (formDataPrevioEspirometria.apneaSueno === 'SI') {
        hallazgosPrecaucion.push('Apnea del sueño');
    }
    if (formDataPrevioEspirometria.medicamentosActuales === 'SI') {
        if (formDataPrevioEspirometria.medicamentosActualesEspecificar && 
            formDataPrevioEspirometria.medicamentosActualesEspecificar.trim() !== '') {
            hallazgosPrecaucion.push(`Medicamentos actuales: ${formDataPrevioEspirometria.medicamentosActualesEspecificar}`);
        } else {
            hallazgosPrecaucion.push('Medicamentos actuales');
        }
    }
    
    // --- Contraindicaciones relativas ---
    if (formDataPrevioEspirometria.cirugiaReciente === 'SI') {
        hallazgosPrecaucion.push('Cirugía reciente');
    }
    if (formDataPrevioEspirometria.infeccionRespiratoriaActiva === 'SI') {
        hallazgosPrecaucion.push('Infección respiratoria activa');
    }
    if (formDataPrevioEspirometria.embarazoComplicado === 'SI') {
        hallazgosPrecaucion.push('Embarazo complicado');
    }
    if (formDataPrevioEspirometria.derramePleural === 'SI') {
        hallazgosPrecaucion.push('Derrame pleural');
    }
    if (formDataPrevioEspirometria.neumotorax === 'SI') {
        hallazgosPrecaucion.push('Neumotórax');
    }

    // Si hay condiciones de precaución, retornar PROCEDENTE CON PRECAUCIÓN
    if (hallazgosPrecaucion.length > 0) {
        return {
            resultado: 'PROCEDENTE CON PRECAUCIÓN',
            hallazgos: hallazgosPrecaucion
        };
    }

    // ========================================
    // PRIORIDAD 3: PROCEDENTE
    // ========================================
    // No se activó nada de NO PROCEDENTE ni de PRECAUCIÓN ⇒ hallazgos: []
    return {
        resultado: 'PROCEDENTE',
        hallazgos: []
    };
};

// Computed para obtener el resultado y hallazgos calculados
const evaluacionAutomatica = computed(() => {
    return calcularResultadoAutomatico();
});

onMounted(() => {
    // Calcular el resultado automático basado en las respuestas del cuestionario
    const evaluacion = calcularResultadoAutomatico();
    
    // Usar siempre el resultado automático calculado
    // Esto asegura que el radio button refleje el algoritmo al renderizar el paso
    resultadoCuestionario.value = evaluacion.resultado;
    formDataPrevioEspirometria.resultadoCuestionario = evaluacion.resultado;
});

// Sincronizar cambios manuales del usuario con el store
// Esto permite que el usuario modifique libremente el resultado
watch(resultadoCuestionario, (newValue) => {
    if (newValue) {
        formDataPrevioEspirometria.resultadoCuestionario = newValue;
    }
});

</script>

<template>
    <div>
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">RESULTADO DE CUESTIONARIO</h1>
        <p class="text-lg font-medium mb-2 text-gray-800">¿Es recomendable realizar la espirometría?</p>
        
        <!-- Sección de Evaluación Automática -->
        <div class="mb-6 p-4 rounded-lg" :class="{
            'bg-red-50 border-2 border-red-200': evaluacionAutomatica.resultado === 'NO PROCEDENTE',
            'bg-yellow-50 border-2 border-yellow-200': evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN',
            'bg-green-50 border-2 border-green-200': evaluacionAutomatica.resultado === 'PROCEDENTE'
        }">
            <div class="flex items-start gap-3 mb-3">
                <!-- Icono según el resultado -->
                <div class="flex-shrink-0 mt-0.5">
                    <svg v-if="evaluacionAutomatica.resultado === 'NO PROCEDENTE'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <svg v-else-if="evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                
                <div class="flex-1">
                    <h3 class="font-semibold mb-2" :class="{
                        'text-red-800': evaluacionAutomatica.resultado === 'NO PROCEDENTE',
                        'text-yellow-800': evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN',
                        'text-green-800': evaluacionAutomatica.resultado === 'PROCEDENTE'
                    }">
                        Evaluación Automática: <br>{{ evaluacionAutomatica.resultado }}
                    </h3>
                    <div v-if="evaluacionAutomatica.hallazgos.length > 0">
                        <p class="text-sm mb-2" :class="{
                            'text-red-700': evaluacionAutomatica.resultado === 'NO PROCEDENTE',
                            'text-yellow-700': evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN',
                            'text-green-700': evaluacionAutomatica.resultado === 'PROCEDENTE'
                        }">
                            Hallazgos identificados:
                        </p>
                        <ul class="text-sm space-y-1" :class="{
                            'text-red-700': evaluacionAutomatica.resultado === 'NO PROCEDENTE',
                            'text-yellow-700': evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN',
                            'text-green-700': evaluacionAutomatica.resultado === 'PROCEDENTE'
                        }">
                            <li v-for="(hallazgo, index) in evaluacionAutomatica.hallazgos" :key="index" class="flex items-start gap-2">
                                <span class="flex-shrink-0 mt-0.5">•</span>
                                <span>{{ hallazgo }}</span>
                            </li>
                        </ul>
                    </div>
                    <p v-else class="text-sm" :class="{
                        'text-red-700': evaluacionAutomatica.resultado === 'NO PROCEDENTE',
                        'text-yellow-700': evaluacionAutomatica.resultado === 'PROCEDENTE CON PRECAUCIÓN',
                        'text-green-700': evaluacionAutomatica.resultado === 'PROCEDENTE'
                    }">
                        Sin hallazgos relevantes
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Pregunta principal con mejor jerarquía -->
        <div class="mb-8">
            <p class="text-sm text-gray-600 mb-4 italic">El médico puede modificar el resultado si lo considera necesario</p>
            
            <!-- Diseño de Radio Buttons más Visual tipo Card sin iconos -->
            <div class="grid grid-cols-1 gap-3">
                <!-- Opción Procedente -->
                <label 
                    :class="[
                        'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        resultadoCuestionario === 'PROCEDENTE' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="PROCEDENTE" 
                        v-model="resultadoCuestionario" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-sm transition-colors duration-200',
                            resultadoCuestionario === 'PROCEDENTE' ? 'text-emerald-700 font-semibold' : 'text-gray-700'
                        ]"
                    >
                        PROCEDENTE
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="resultadoCuestionario === 'PROCEDENTE'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción Procedente con Precaución -->
                <label 
                    :class="[
                        'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        resultadoCuestionario === 'PROCEDENTE CON PRECAUCIÓN' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="PROCEDENTE CON PRECAUCIÓN" 
                        v-model="resultadoCuestionario" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-sm transition-colors duration-200',
                            resultadoCuestionario === 'PROCEDENTE CON PRECAUCIÓN' ? 'text-emerald-700 font-semibold' : 'text-gray-700'
                        ]"
                    >
                        PROCEDENTE CON PRECAUCIÓN
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="resultadoCuestionario === 'PROCEDENTE CON PRECAUCIÓN'"
                        class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </label>

                <!-- Opción No Procedente -->
                <label 
                    :class="[
                        'relative flex items-center justify-center py-2.5 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
                        resultadoCuestionario === 'NO PROCEDENTE' 
                            ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                            : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
                    ]"
                >
                    <input 
                        type="radio" 
                        value="NO PROCEDENTE" 
                        v-model="resultadoCuestionario" 
                        class="sr-only" 
                    />
                    <span 
                        :class="[
                            'text-sm transition-colors duration-200',
                            resultadoCuestionario === 'NO PROCEDENTE' ? 'text-emerald-700 font-semibold' : 'text-gray-700'
                        ]"
                    >
                        NO PROCEDENTE
                    </span>
                    <!-- Indicador de selección -->
                    <div 
                        v-if="resultadoCuestionario === 'NO PROCEDENTE'"
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