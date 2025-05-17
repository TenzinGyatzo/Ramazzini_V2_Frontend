<script setup>
import { ref, watch, onMounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';

const mensajeCopiado = ref(false);

const trabajadores = useTrabajadoresStore();
const { formDataAptitud } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la resultados principal, inicializado con el valor actual del store
const resultados = ref(formDataAptitud.resultados || '');

// Sincronizar el valor seleccionado con formDataAptitud.resultados
watch(resultados, (newValue) => {
    formDataAptitud.resultados = newValue;
});

onMounted(async () => {
    if (documentos.currentDocument) {
        resultados.value = documentos.currentDocument.resultados;
    } else {
        if (!formDataAptitud.resultados) {
            formDataAptitud.resultados = inicioSugerido;
        }
        resultados.value = formDataAptitud.resultados;
    }
});

const openSections = ref({});

const toggle = (section) => {
    openSections.value[section] = !openSections.value[section];
};

const isOpen = (section) => {
    return !!openSections.value[section];
};

// Función para copiar el texto al portapapeles
const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
        // Mostrar mensaje temporal de "Copiado"
        mensajeCopiado.value = true;
        setTimeout(() => {
          mensajeCopiado.value = false;
        }, 2000); // Mensaje se oculta después de 2 segundos
    }).catch((err) => {
        console.error('Error al copiar el texto: ', err);
    });
};

const inicioSugerido = "Posterior a efectuar el examen integral de salud ocupacional, se determina que actualmente "

</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Aptitud al Puesto</h1>
    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Resultados</h2>
        <p class="text-sm font-medium mb-1 text-gray-800 leading-4">Descripción de resultados:</p>
        <div class="font-light mb-4">
            <textarea
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-64"
                v-model="formDataAptitud.resultados" :placeholder="inicioSugerido || 'Cargando datos...'" required>
            </textarea>
        </div>
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">Inicio de texto sugerido: </p>
            <p class="text-sm font-light mb-4 italic text-gray-700 hover:text-emerald-700 cursor-pointer leading-5 text-justify"
                @click="copiarTexto(inicioSugerido)">{{ inicioSugerido }}</p>
        </div>

        <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="mb-4">
            <div class="flex justify-between">
                <p class="font-medium mb-1 text-gray-800 leading-5">Guías para concluir: </p>
                <span v-if="mensajeCopiado" class="ml-2 text-emerald-600 text-sm">¡Copiado!</span>
            </div>
            <!-- Apta Sin Restricciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                    @click="toggle('guiaAptaSinRestricciones')">
                    Apta Sin Restricciones
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptaSinRestricciones')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    Especifica el tipo de aptitud:

                    <!-- Subopción: Clínicamente Apta -->
                    <button
                        class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                        @click="toggle('clinicamenteAptaSinRestricciones')">
                        Clínicamente Apta
                    </button>
                    <div v-if="isOpen('clinicamenteAptaSinRestricciones')"
                        class="p-4 border-l-4 border-green-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE SANA Y APTA PARA LABORAR SIN RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> SANA Y APTA PARA LABORAR SIN
                            RESTRICCIONES.
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según
                            aplique:</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('La trabajadora parece demostrar actualmente los niveles adecuados de agilidad física, fuerza y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales de su trabajo. ')">
                            La trabajadora parece demostrar actualmente los niveles adecuados de agilidad física, fuerza
                            y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales
                            de su trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Por último:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('Cabe señalar que la determinación de la aptitud para el trabajo es solamente clínica, toda vez que no contamos con análisis de laboratorio en este momento. ')">
                            Cabe señalar que la determinación de la aptitud para el trabajo es solamente clínica, toda
                            vez que no contamos con análisis de laboratorio en este momento.
                        </p>
                    </div>

                    <!-- Subopción: Medicamente Apta -->
                    <button
                        class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptaSinRestricciones')">
                        Médicamente Apta
                    </button>
                    <div v-if="isOpen('medicamenteAptaSinRestricciones')"
                        class="p-4 border-l-4 border-blue-500 bg-gray-100">
                        <p class="font-semibold text-sm italic text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE SANA Y APTA PARA LABORAR SIN RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> SANA Y APTA PARA LABORAR SIN
                            RESTRICCIONES.
                        </p>

                        <p class="font-semibold text-sm italic text-gray-700 mt-4">PASO 2. Especifica según
                            aplique:</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm italic text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('La trabajadora parece demostrar actualmente los niveles adecuados de agilidad física, fuerza y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales de su trabajo. ')">
                            La trabajadora parece demostrar actualmente los niveles adecuados de agilidad física, fuerza
                            y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales
                            de su trabajo.
                        </p>
                    </div>

                </div>
            </div>
            <!-- Apta Con Precauciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                    @click="toggle('guiaAptoConPrecaucion')">
                    Apta Con Precaución
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptoConPrecaucion')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <p class="font-semibold text-gray-700">Especifica el tipo de aptitud:</p>

                    <!-- Subopción: Clínicamente apta -->
                    <button
                        class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('clinicamenteAptoConPrecaucion')">
                        Clínicamente apta
                    </button>
                    <div v-if="isOpen('clinicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-yellow-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE APTA PARA LABORAR CON PRECAUCIÓN ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> APTA PARA LABORAR CON
                            PRECAUCIÓN.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apta para el trabajo, es esencial destacar que la presencia de ciertas condiciones médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su salud y seguridad en el lugar de trabajo.')">
                            Aunque apta para el trabajo, es esencial destacar que la presencia de ciertas condiciones
                            médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su
                            salud y seguridad en el lugar de trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('hipertension1')">
                            Hipertensión
                        </button>
                        <div v-if="isOpen('hipertension1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('La individuo presenta un historial de hipertensión arterial, lo cual requiere un seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento médico.')">
                                La individuo presenta un historial de hipertensión arterial, lo cual requiere un
                                seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento
                                médico.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('diabetes1')">
                            Diabetes Tipo II
                        </button>
                        <div v-if="isOpen('diabetes1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo control.')">
                                Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo
                                constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo
                                control.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('obesidad1')">
                            Obesidad Clase II
                        </button>
                        <div v-if="isOpen('obesidad1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de complicaciones metabólicas y cardiovasculares, por lo que se recomienda la implementación de medidas para promover la pérdida de peso y mejorar su estado de salud general.')">
                                El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de
                                complicaciones metabólicas y cardiovasculares, por lo que se recomienda la
                                implementación de medidas para promover la pérdida de peso y mejorar su estado de salud
                                general.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lumbalgia1')">
                            Lumbalgia Crónica
                        </button>
                        <div v-if="isOpen('lumbalgia1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de evitar actividades que puedan exacerbar el dolor de espalda y la implementación de medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.')">
                                Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de
                                evitar actividades que puedan exacerbar el dolor de espalda y la implementación de
                                medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.
                            </p>
                        </div>

                    </div>

                    <!-- Subopción: Médicamente apta -->
                    <button
                        class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptoConPrecaucion')">
                        Médicamente apta
                    </button>
                    <div v-if="isOpen('medicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-blue-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-yellow-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE APTA PARA LABORAR CON PRECAUCIÓN ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> APTA PARA LABORAR CON
                            PRECAUCIÓN.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apta para el trabajo, es esencial destacar que la presencia de ciertas condiciones médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su salud y seguridad en el lugar de trabajo.')">
                            Aunque apta para el trabajo, es esencial destacar que la presencia de ciertas condiciones
                            médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su
                            salud y seguridad en el lugar de trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('hipertension')">
                            Hipertensión
                        </button>
                        <div v-if="isOpen('hipertension')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('La individuo presenta un historial de hipertensión arterial, lo cual requiere un seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento médico.')">
                                La individuo presenta un historial de hipertensión arterial, lo cual requiere un
                                seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento
                                médico.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('diabetes')">
                            Diabetes Tipo II
                        </button>
                        <div v-if="isOpen('diabetes')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo control.')">
                                Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo
                                constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo
                                control.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('obesidad2')">
                            Obesidad Clase II
                        </button>
                        <div v-if="isOpen('obesidad2')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de complicaciones metabólicas y cardiovasculares, por lo que se recomienda la implementación de medidas para promover la pérdida de peso y mejorar su estado de salud general.')">
                                El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de
                                complicaciones metabólicas y cardiovasculares, por lo que se recomienda la
                                implementación de medidas para promover la pérdida de peso y mejorar su estado de salud
                                general.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lumbalgia')">
                            Lumbalgia Crónica
                        </button>
                        <div v-if="isOpen('lumbalgia')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de evitar actividades que puedan exacerbar el dolor de espalda y la implementación de medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.')">
                                Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de
                                evitar actividades que puedan exacerbar el dolor de espalda y la implementación de
                                medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <!-- Apta Con Restricciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                    @click="toggle('guiaAptaConRestricciones')">
                    Apta Con Restricciones
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptaConRestricciones')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <p class="font-semibold text-gray-700">Especifica el tipo de aptitud:</p>

                    <!-- Subopción: Clínicamente apta -->
                    <button
                        class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('clinicamenteAptoConPrecaucion')">
                        Clínicamente apta
                    </button>
                    <div v-if="isOpen('clinicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-orange-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-orange-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE APTA PARA LABORAR CON RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> APTA PARA LABORAR CON
                            RESTRICCIONES.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apta para el trabajo, requiere medidas adicionales para garantizar su seguridad y bienestar en el entorno laboral.')">
                            Aunque apta para el trabajo, requiere medidas adicionales para garantizar su seguridad y
                            bienestar en el entorno laboral.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('herniaAbdominal')">
                            Hernia abdominal
                        </button>
                        <div v-if="isOpen('herniaAbdominal')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta una hernia abdominal, por lo que debe ser valorado por un cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo presenta una hernia abdominal, por lo que debe ser valorado por un
                                cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no
                                impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo
                                adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('problemaEspalda')">
                            Problema espalda
                        </button>
                        <div v-if="isOpen('problemaEspalda')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo debe evitar levantar objetos pesados debido a la condición de su espalda baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo y proporcionar asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo debe evitar levantar objetos pesados debido a la condición de su espalda
                                baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo
                                y proporcionar asistencia o equipo adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('varices')">
                            Várices en piernas
                        </button>
                        <div v-if="isOpen('varices')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se sugiere la implementación de un horario de trabajo flexible para permitir pausas frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el dolor crónico en las piernas debido a una condición de várices.')">
                                Se sugiere la implementación de un horario de trabajo flexible para permitir pausas
                                frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el
                                dolor crónico en las piernas debido a una condición de várices.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('malformacionMano')">
                            Malformación mano
                        </button>
                        <div v-if="isOpen('malformacionMano')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Dada a la malformación congénita de la mano izquierda, se recomienda la implementación de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad y la independencia del individuo en el entorno de trabajo.')">
                                Dada a la malformación congénita de la mano izquierda, se recomienda la implementación
                                de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de
                                objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad
                                y la independencia del individuo en el entorno de trabajo.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lesionRodilla')">
                            Lesión rodilla
                        </button>
                        <div v-if="isOpen('lesionRodilla')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la condición física.')">
                                Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se
                                sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla
                                ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la
                                condición física.
                            </p>
                        </div>

                    </div>

                    <!-- Subopción: Médicamente apta -->
                    <button
                        class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptoConPrecaucion')">
                        Clínicamente apta
                    </button>
                    <div v-if="isOpen('medicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-orange-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-orange-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE APTA PARA LABORAR CON RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> APTA PARA LABORAR CON
                            RESTRICCIONES.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apta para el trabajo, requiere medidas adicionales para garantizar su seguridad y bienestar en el entorno laboral.')">
                            Aunque apta para el trabajo, requiere medidas adicionales para garantizar su seguridad y
                            bienestar en el entorno laboral.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('herniaAbdominal')">
                            Hernia abdominal
                        </button>
                        <div v-if="isOpen('herniaAbdominal')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta una hernia abdominal, por lo que debe ser valorado por un cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo presenta una hernia abdominal, por lo que debe ser valorado por un
                                cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no
                                impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo
                                adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('problemaEspalda')">
                            Problema espalda
                        </button>
                        <div v-if="isOpen('problemaEspalda')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo debe evitar levantar objetos pesados debido a la condición de su espalda baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo y proporcionar asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo debe evitar levantar objetos pesados debido a la condición de su espalda
                                baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo
                                y proporcionar asistencia o equipo adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('varices')">
                            Várices en piernas
                        </button>
                        <div v-if="isOpen('varices')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se sugiere la implementación de un horario de trabajo flexible para permitir pausas frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el dolor crónico en las piernas debido a una condición de várices.')">
                                Se sugiere la implementación de un horario de trabajo flexible para permitir pausas
                                frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el
                                dolor crónico en las piernas debido a una condición de várices.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('malformacionMano')">
                            Malformación mano
                        </button>
                        <div v-if="isOpen('malformacionMano')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Dada a la malformación congénita de la mano izquierda, se recomienda la implementación de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad y la independencia del individuo en el entorno de trabajo.')">
                                Dada a la malformación congénita de la mano izquierda, se recomienda la implementación
                                de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de
                                objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad
                                y la independencia del individuo en el entorno de trabajo.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lesionRodilla')">
                            Lesión rodilla
                        </button>
                        <div v-if="isOpen('lesionRodilla')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la condición física.')">
                                Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se
                                sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla
                                ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la
                                condición física.
                            </p>
                        </div>

                    </div>

                </div>
            </div>
            <!-- No Apta -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('guiaNoApta')">
                    No Apta
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaNoApta')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-red-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-red-700 cursor-pointer"
                            @click="copiarTexto('se encuentra NO APTA PARA LABORAR en las actividades del puesto al que aspira. ')">
                            se encuentra <span class="font-semibold">NO APTA PARA LABORAR</span> en las actividades del
                            puesto al que aspira.
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Explicar detalladamente
                            el/los motivo(s):</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-red-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline" @click="copiarTexto('Toda vez que ')">
                                    Toda vez que...
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- Evaluación No Completada -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-gray-600 border border-gray-600 hover:bg-gray-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('guiaEvaluacionNoCompletada')">
                    Evaluación No Completada
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaEvaluacionNoCompletada')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-gray-500 bg-gray-100">

                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-blue-700 cursor-pointer"
                            @click="copiarTexto('NO ES POSIBLE CONCLUIR LA APTITUD AL PUESTO ')">
                            NO ES POSIBLE CONCLUIR LA APTITUD AL PUESTO
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Explicar:</p>
                        <p class="font-semibold text-sm text-gray-700">Ejemplos de inicio de explicación</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('debido a que no es posible saber si ')">
                                    debido a que no es posible saber si...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('puesto que no se dispone de información suficiente sobre ')">
                                    puesto que no se dispone de información suficiente sobre...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('ya que el trabajador tiene una condición que podría implicar ')">
                                    ya que el trabajador tiene una condición que podría implicar...
                                </p>
                            </li>
                        </ul>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Indicar:</p>
                        <p class="font-semibold text-sm text-gray-700">Ejemplos de inicio de indicaciones:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es necesario realizar una evaluación detallada de ')">
                                    Es necesario realizar una evaluación detallada de...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es imperativo que el candidato se someta a una evaluación de ')">
                                    Es imperativo que el candidato se someta a una evaluación de...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es esencial que el candidato complete un programa de rehabilitación física de ')">
                                    Es esencial que el candidato complete un programa de rehabilitación física de...
                                </p>
                            </li>
                        </ul>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Terminar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-blue-700 cursor-pointer"
                            @click="copiarTexto('antes de volver a evaluar su aptitud para el puesto.')">
                            ...antes de volver a evaluar su aptitud para el puesto.
                        </p>

                    </div>
                </div>
            </div>
        </div>

        <div v-else class="mb-4">
            <div class="flex justify-between">
                <p class="font-medium mb-1 text-gray-800 leading-5">Guías para concluir: </p>
                <span v-if="mensajeCopiado" class="ml-2 text-emerald-600 text-sm">¡Copiado!</span>
            </div>
            <!-- Apto Sin Restricciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                    @click="toggle('guiaAptoSinRestricciones')">
                    Apto Sin Restricciones
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptoSinRestricciones')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    Especifica el tipo de aptitud:

                    <!-- Subopción: Clínicamente Apto -->
                    <button
                        class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                        @click="toggle('clinicamenteAptoSinRestricciones')">
                        Clínicamente Apto
                    </button>
                    <div v-if="isOpen('clinicamenteAptoSinRestricciones')"
                        class="p-4 border-l-4 border-green-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE SANO Y APTO PARA LABORAR SIN RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> SANO Y APTO PARA LABORAR SIN
                            RESTRICCIONES.
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según
                            aplique:</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('El trabajador parece demostrar actualmente los niveles adecuados de agilidad física, fuerza y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales de su trabajo. ')">
                            El trabajador parece demostrar actualmente los niveles adecuados de agilidad física, fuerza
                            y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales
                            de su trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Por último:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('Cabe señalar que la determinación de la aptitud para el trabajo es solamente clínica, toda vez que no contamos con análisis de laboratorio en este momento. ')">
                            Cabe señalar que la determinación de la aptitud para el trabajo es solamente clínica, toda
                            vez que no contamos con análisis de laboratorio en este momento.
                        </p>
                    </div>

                    <!-- Subopción: Medicamente Apto -->
                    <button
                        class="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptoSinRestricciones')">
                        Médicamente Apto
                    </button>
                    <div v-if="isOpen('medicamenteAptoSinRestricciones')"
                        class="p-4 border-l-4 border-blue-500 bg-gray-100">
                        <p class="font-semibold text-sm italic text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE SANO Y APTO PARA LABORAR SIN RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> SANO Y APTO PARA LABORAR SIN
                            RESTRICCIONES.
                        </p>

                        <p class="font-semibold text-sm italic text-gray-700 mt-4">PASO 2. Especifica según
                            aplique:</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm italic text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('El trabajador parece demostrar actualmente los niveles adecuados de agilidad física, fuerza y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales de su trabajo. ')">
                            El trabajador parece demostrar actualmente los niveles adecuados de agilidad física, fuerza
                            y capacidad cardiorrespiratoria requeridos para realizar de forma segura las tareas esenciales
                            de su trabajo.
                        </p>
                    </div>

                </div>
            </div>
            <!-- Apto Con Precauciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                    @click="toggle('guiaAptoConPrecaucion')">
                    Apto Con Precaución
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptoConPrecaucion')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <p class="font-semibold text-gray-700">Especifica el tipo de aptitud:</p>

                    <!-- Subopción: Clínicamente Apto -->
                    <button
                        class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('clinicamenteAptoConPrecaucion')">
                        Clínicamente Apto
                    </button>
                    <div v-if="isOpen('clinicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-yellow-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE APTO PARA LABORAR CON PRECAUCIÓN ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> APTO PARA LABORAR CON
                            PRECAUCIÓN.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apto para el trabajo, es esencial destacar que la presencia de ciertas condiciones médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su salud y seguridad en el lugar de trabajo.')">
                            Aunque apto para el trabajo, es esencial destacar que la presencia de ciertas condiciones
                            médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su
                            salud y seguridad en el lugar de trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('hipertension1')">
                            Hipertensión
                        </button>
                        <div v-if="isOpen('hipertension1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta un historial de hipertensión arterial, lo cual requiere un seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento médico.')">
                                El individuo presenta un historial de hipertensión arterial, lo cual requiere un
                                seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento
                                médico.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('diabetes1')">
                            Diabetes Tipo II
                        </button>
                        <div v-if="isOpen('diabetes1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo control.')">
                                Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo
                                constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo
                                control.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('obesidad1')">
                            Obesidad Clase II
                        </button>
                        <div v-if="isOpen('obesidad1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de complicaciones metabólicas y cardiovasculares, por lo que se recomienda la implementación de medidas para promover la pérdida de peso y mejorar su estado de salud general.')">
                                El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de
                                complicaciones metabólicas y cardiovasculares, por lo que se recomienda la
                                implementación de medidas para promover la pérdida de peso y mejorar su estado de salud
                                general.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lumbalgia1')">
                            Lumbalgia Crónica
                        </button>
                        <div v-if="isOpen('lumbalgia1')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de evitar actividades que puedan exacerbar el dolor de espalda y la implementación de medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.')">
                                Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de
                                evitar actividades que puedan exacerbar el dolor de espalda y la implementación de
                                medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.
                            </p>
                        </div>

                    </div>

                    <!-- Subopción: Médicamente Apto -->
                    <button
                        class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptoConPrecaucion')">
                        Médicamente Apto
                    </button>
                    <div v-if="isOpen('medicamenteAptoConPrecaucion')"
                        class="p-4 border-l-4 border-blue-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-yellow-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE APTO PARA LABORAR CON PRECAUCIÓN ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> APTO PARA LABORAR CON
                            PRECAUCIÓN.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-yellow-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apto para el trabajo, es esencial destacar que la presencia de ciertas condiciones médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su salud y seguridad en el lugar de trabajo.')">
                            Aunque apto para el trabajo, es esencial destacar que la presencia de ciertas condiciones
                            médicas subyacentes demanda la adopción de precauciones adicionales para salvaguardar su
                            salud y seguridad en el lugar de trabajo.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('hipertension')">
                            Hipertensión
                        </button>
                        <div v-if="isOpen('hipertension')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta un historial de hipertensión arterial, lo cual requiere un seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento médico.')">
                                El individuo presenta un historial de hipertensión arterial, lo cual requiere un
                                seguimiento cuidadoso de su presión sanguínea y la adherencia estricta a su tratamiento
                                médico.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('diabetes')">
                            Diabetes Tipo II
                        </button>
                        <div v-if="isOpen('diabetes')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo control.')">
                                Se observa la presencia de diabetes tipo 2, lo que implica la necesidad de un monitoreo
                                constante de los niveles de glucosa en sangre y una dieta adecuada para mantenerlos bajo
                                control.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('obesidad2')">
                            Obesidad Clase II
                        </button>
                        <div v-if="isOpen('obesidad2')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de complicaciones metabólicas y cardiovasculares, por lo que se recomienda la implementación de medidas para promover la pérdida de peso y mejorar su estado de salud general.')">
                                El trabajador ha sido diagnosticado con obesidad clase II, lo que aumenta el riesgo de
                                complicaciones metabólicas y cardiovasculares, por lo que se recomienda la
                                implementación de medidas para promover la pérdida de peso y mejorar su estado de salud
                                general.
                            </p>
                        </div>

                        <button
                            class="bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lumbalgia')">
                            Lumbalgia Crónica
                        </button>
                        <div v-if="isOpen('lumbalgia')" class="p-4 border-l-4 border-yellow-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-yellow-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de evitar actividades que puedan exacerbar el dolor de espalda y la implementación de medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.')">
                                Se ha identificado una historia de lumbalgia persistente, lo que indica la necesidad de
                                evitar actividades que puedan exacerbar el dolor de espalda y la implementación de
                                medidas ergonómicas en el entorno laboral para reducir el riesgo de lesiones.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <!-- Apto Con Restricciones -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                    @click="toggle('guiaAptoConRestricciones')">
                    Apto Con Restricciones
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaAptoConRestricciones')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <p class="font-semibold text-gray-700">Especifica el tipo de aptitud:</p>

                    <!-- Subopción: Clínicamente Apto -->
                    <button
                        class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('clinicamenteAptoConPrecaucion2')">
                        Clínicamente Apto
                    </button>
                    <div v-if="isOpen('clinicamenteAptoConPrecaucion2')"
                        class="p-4 border-l-4 border-orange-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-orange-700 cursor-pointer"
                            @click="copiarTexto('se encuentra CLÍNICAMENTE APTO PARA LABORAR CON RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">CLÍNICAMENTE</span> APTO PARA LABORAR CON
                            RESTRICCIONES.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apto para el trabajo, requiere medidas adicionales para garantizar su seguridad y bienestar en el entorno laboral.')">
                            Aunque apto para el trabajo, requiere medidas adicionales para garantizar su seguridad y
                            bienestar en el entorno laboral.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('herniaAbdominal')">
                            Hernia abdominal
                        </button>
                        <div v-if="isOpen('herniaAbdominal')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta una hernia abdominal, por lo que debe ser valorado por un cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo presenta una hernia abdominal, por lo que debe ser valorado por un
                                cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no
                                impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo
                                adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('problemaEspalda')">
                            Problema espalda
                        </button>
                        <div v-if="isOpen('problemaEspalda')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo debe evitar levantar objetos pesados debido a la condición de su espalda baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo y proporcionar asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo debe evitar levantar objetos pesados debido a la condición de su espalda
                                baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo
                                y proporcionar asistencia o equipo adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('varices')">
                            Várices en piernas
                        </button>
                        <div v-if="isOpen('varices')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se sugiere la implementación de un horario de trabajo flexible para permitir pausas frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el dolor crónico en las piernas debido a una condición de várices.')">
                                Se sugiere la implementación de un horario de trabajo flexible para permitir pausas
                                frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el
                                dolor crónico en las piernas debido a una condición de várices.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('malformacionMano')">
                            Malformación mano
                        </button>
                        <div v-if="isOpen('malformacionMano')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Dada a la malformación congénita de la mano izquierda, se recomienda la implementación de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad y la independencia del individuo en el entorno de trabajo.')">
                                Dada a la malformación congénita de la mano izquierda, se recomienda la implementación
                                de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de
                                objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad
                                y la independencia del individuo en el entorno de trabajo.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lesionRodilla')">
                            Lesión rodilla
                        </button>
                        <div v-if="isOpen('lesionRodilla')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la condición física.')">
                                Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se
                                sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla
                                ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la
                                condición física.
                            </p>
                        </div>

                    </div>

                    <!-- Subopción: Médicamente Apto -->
                    <button
                        class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                        @click="toggle('medicamenteAptoConPrecaucion2')">
                        Médicamente Apto
                    </button>
                    <div v-if="isOpen('medicamenteAptoConPrecaucion2')"
                        class="p-4 border-l-4 border-orange-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-orange-700 cursor-pointer"
                            @click="copiarTexto('se encuentra MÉDICAMENTE APTO PARA LABORAR CON RESTRICCIONES ')">
                            se encuentra <span class="font-semibold">MÉDICAMENTE</span> APTO PARA LABORAR CON
                            RESTRICCIONES.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Especifica según aplique:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto al que aspira. ')">
                                    en las actividades del puesto <span class="font-semibold">al que aspira.</span>
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-orange-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('en las actividades del puesto que desempeña. ')">
                                    en las actividades del puesto <span class="font-semibold">que desempeña.</span>
                                </p>
                            </li>
                        </ul>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Agregar:</p>
                        <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                            @click="copiarTexto('Aunque apto para el trabajo, requiere medidas adicionales para garantizar su seguridad y bienestar en el entorno laboral.')">
                            Aunque apto para el trabajo, requiere medidas adicionales para garantizar su seguridad y
                            bienestar en el entorno laboral.
                        </p>
                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Explicar detalles:</p>

                        <!-- Ejemplos -->
                        <p class="font-semibold text-gray-700 mb-2">Ejemplos:</p>
                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block"
                            @click="toggle('herniaAbdominal')">
                            Hernia abdominal
                        </button>
                        <div v-if="isOpen('herniaAbdominal')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo presenta una hernia abdominal, por lo que debe ser valorado por un cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo presenta una hernia abdominal, por lo que debe ser valorado por un
                                cirujano. Se recomienda uso en todo momento de faja lumbosacra y asignarle tareas que no
                                impliquen esfuerzo físico excesivo. Asimismo, debe proporcionarse asistencia o equipo
                                adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('problemaEspalda')">
                            Problema espalda
                        </button>
                        <div v-if="isOpen('problemaEspalda')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('El individuo debe evitar levantar objetos pesados debido a la condición de su espalda baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo y proporcionar asistencia o equipo adecuado para el manejo de carga.')">
                                El individuo debe evitar levantar objetos pesados debido a la condición de su espalda
                                baja, por lo que se recomienda asignar tareas que no impliquen esfuerzo físico excesivo
                                y proporcionar asistencia o equipo adecuado para el manejo de carga.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('varices')">
                            Várices en piernas
                        </button>
                        <div v-if="isOpen('varices')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Se sugiere la implementación de un horario de trabajo flexible para permitir pausas frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el dolor crónico en las piernas debido a una condición de várices.')">
                                Se sugiere la implementación de un horario de trabajo flexible para permitir pausas
                                frecuentes y evitar períodos prolongados de estar de pie, lo cual ayudará a mitigar el
                                dolor crónico en las piernas debido a una condición de várices.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('malformacionMano')">
                            Malformación mano
                        </button>
                        <div v-if="isOpen('malformacionMano')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Dada a la malformación congénita de la mano izquierda, se recomienda la implementación de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad y la independencia del individuo en el entorno de trabajo.')">
                                Dada a la malformación congénita de la mano izquierda, se recomienda la implementación
                                de tecnologías de asistencia, como dispositivos de ayuda para la manipulación de
                                objetos, así como la adaptación de las tareas laborales para optimizar la funcionalidad
                                y la independencia del individuo en el entorno de trabajo.
                            </p>
                        </div>

                        <button
                            class="bg-white text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white font-medium py-2 px-4 rounded-lg block mt-2"
                            @click="toggle('lesionRodilla')">
                            Lesión rodilla
                        </button>
                        <div v-if="isOpen('lesionRodilla')" class="p-4 border-l-4 border-orange-500 bg-gray-100">
                            <p class="italic text-sm font-light mb-4 text-gray-700 hover:text-orange-700 cursor-pointer text-justify"
                                @click="copiarTexto('Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la condición física.')">
                                Para adaptarse a una limitación de movilidad causada por una lesión en la rodilla, se
                                sugiere la asignación de un espacio de trabajo accesible y la provisión de una silla
                                ergonómica con soporte lumbar para garantizar comodidad y evitar el deterioro de la
                                condición física.
                            </p>
                        </div>

                    </div>

                </div>
            </div>
            <!-- No Apto -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('guiaNoApto')">
                    No Apto
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaNoApto')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-red-500 bg-gray-100">
                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-red-700 cursor-pointer"
                            @click="copiarTexto('se encuentra NO APTO PARA LABORAR en las actividades del puesto al que aspira. ')">
                            se encuentra <span class="font-semibold">NO APTO PARA LABORAR</span> en las actividades del
                            puesto al que aspira.
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Explicar detalladamente
                            el/los motivo(s):</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-red-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline" @click="copiarTexto('Toda vez que ')">
                                    Toda vez que...
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- Evaluación No Completada -->
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="bg-white text-gray-600 border border-gray-600 hover:bg-gray-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('guiaEvaluacionNoCompletada')">
                    Evaluación No Completada
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('guiaEvaluacionNoCompletada')"
                    class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-gray-500 bg-gray-100">

                        <p class="font-semibold text-sm text-gray-700">PASO 1. Usar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-blue-700 cursor-pointer"
                            @click="copiarTexto('NO ES POSIBLE CONCLUIR LA APTITUD AL PUESTO ')">
                            NO ES POSIBLE CONCLUIR LA APTITUD AL PUESTO
                        </p>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 2. Explicar:</p>
                        <p class="font-semibold text-sm text-gray-700">Ejemplos de inicio de explicación</p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('debido a que no es posible saber si ')">
                                    debido a que no es posible saber si...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('puesto que no se dispone de información suficiente sobre ')">
                                    puesto que no se dispone de información suficiente sobre...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('ya que el trabajador tiene una condición que podría implicar ')">
                                    ya que el trabajador tiene una condición que podría implicar...
                                </p>
                            </li>
                        </ul>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 3. Indicar:</p>
                        <p class="font-semibold text-sm text-gray-700">Ejemplos de inicio de indicaciones:
                        </p>
                        <ul class="list-disc list-inside">
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es necesario realizar una evaluación detallada de ')">
                                    Es necesario realizar una evaluación detallada de...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es imperativo que el candidato se someta a una evaluación de ')">
                                    Es imperativo que el candidato se someta a una evaluación de...
                                </p>
                            </li>
                            <li class="text-gray-700 hover:text-blue-700 cursor-pointer leading-4">
                                <p class="italic text-sm font-light inline"
                                    @click="copiarTexto('Es esencial que el candidato complete un programa de rehabilitación física de ')">
                                    Es esencial que el candidato complete un programa de rehabilitación física de...
                                </p>
                            </li>
                        </ul>

                        <p class="font-semibold text-sm text-gray-700 mt-4">PASO 4. Terminar:</p>
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-blue-700 cursor-pointer"
                            @click="copiarTexto('antes de volver a evaluar su aptitud para el puesto.')">
                            ...antes de volver a evaluar su aptitud para el puesto.
                        </p>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
