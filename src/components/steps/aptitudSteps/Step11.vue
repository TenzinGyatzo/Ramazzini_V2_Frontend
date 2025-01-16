<script setup>
import { ref, watch, onMounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataAptitud } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la medidasPreventivas principal, inicializado con el valor actual del store
const medidasPreventivas = ref(formDataAptitud.medidasPreventivas || '');

onMounted(() => {
    if (documentos.currentDocument) {
        medidasPreventivas.value = documentos.currentDocument.medidasPreventivas;
    }
});

// Sincronizar el valor seleccionado con formDataAptitud.medidasPreventivas
watch(medidasPreventivas, (newValue) => {
    formDataAptitud.medidasPreventivas = newValue;
});

const openSections = ref({});

const toggle = (section) => {
    openSections.value[section] = !openSections.value[section];
};

const isOpen = (section) => {
    return !!openSections.value[section];
};

const showTooltip = (content) => {
    console.log(content); // Puedes usar una librería como Tippy.js aquí
};

const hideTooltip = () => {
    console.log("Tooltip cerrado");
};

// Función para copiar el texto al portapapeles
const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
        // alert('Texto copiado al portapapeles');
    }).catch((err) => {
        console.error('Error al copiar el texto: ', err);
    });
};

</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Aptitud al Puesto</h1>
    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Medidas Preventivas Específicas</h2>
        <p class="text-sm font-medium mb-1 text-gray-800 leading-4">Descripción de medidas específicas recomendadas:</p>
        <div class="font-light mb-4">
            <textarea
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-64"
                v-model="formDataAptitud.medidasPreventivas" required>
            </textarea>
        </div>

        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">Para cada una de las alteraciones encontradas debe de
                haber una medida preventiva recomendada. </p>

            <p class="font-medium mb-1 text-gray-800 leading-5 mt-4">1. Puedes iniciar con los siguientes enunciados:</p>
            <ul class="list-disc list-inside">
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Es importante ')">
                        Es importante...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Se aconseja ')">
                        Se aconseja...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Es recomendable que ')">
                        Es recomendable que...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Se sugiere ')">
                        Se sugiere...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Es fundamental que ')">
                        Es fundamental que...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Es crucial que ')">
                        Es crucial que...
                    </p>
                </li>
                <li class="text-gray-700 hover:text-emerald-700 cursor-pointer leading-4">
                    <p class="italic text-sm font-light inline"
                        @click="copiarTexto('Se recomienda ')">
                        Se recomienda...
                    </p>
                </li>
            </ul>

            <p class="font-medium mb-1 text-gray-800 leading-5 mt-4">2. Separar cada recomendacion con punto y seguido.</p>

            <!-- Ejemplos -->
            <p class="font-medium mb-1 text-gray-800 leading-5 mt-4">3. Ejemplos de recomendaciones comúnes:</p>
            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="w-full bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('generico')">
                    Genérico
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('generico')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-emerald-500 bg-gray-100">
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('Es importante usar adecuadamente el EPP, mantener hábitos saludables como una alimentación balanceada, ejercicio regular y descanso adecuado, así como efectuar vigilancia médica con periodicidad anual, incluyendo exámenes generales de laboratorio y gabinete para una vigilancia integral de la salud. ')">
                            Es importante usar adecuadamente el EPP, mantener hábitos saludables como una alimentación
                            balanceada, ejercicio regular y descanso adecuado, así como efectuar vigilancia médica con
                            periodicidad anual, incluyendo exámenes generales de laboratorio y gabinete para una
                            vigilancia integral de la salud.
                        </p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="w-full bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('Hernia')">
                    Hernia Abdominal
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('Hernia')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white text-justify">
                    <div class="p-4 border-l-4 border-emerald-500 bg-gray-100">
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('Es crucial priorizar la prevención y el cuidado de la pared abdominal mediante el fortalecimiento de los músculos centrales, la mejora de la postura y el uso de técnicas adecuadas de levantamiento de objetos. ')">
                            Es crucial priorizar la prevención y el cuidado de la pared abdominal mediante el fortalecimiento de los músculos centrales, la mejora de la postura y el uso de técnicas adecuadas de levantamiento de objetos.
                        </p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="w-full bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('obesidad')">
                    Obesidad
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('obesidad')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white text-justify">
                    <div class="p-4 border-l-4 border-emerald-500 bg-gray-100">
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('Se recomienda adoptar una dieta balanceada y realizar ejercicio físico regularmente para mejorar la salud en general. Estas prácticas ayudan a controlar el peso, disminuir los niveles de grasa corporal, fortalecer los músculos y mejorar la función cardiovascular. Además, reducen el riesgo de desarrollar enfermedades crónicas como la diabetes tipo 2, enfermedades cardíacas y ciertos tipos de cáncer. ')">
                            Se recomienda adoptar una dieta balanceada y realizar ejercicio físico regularmente para mejorar la salud en general. Estas prácticas ayudan a controlar el peso, disminuir los niveles de grasa corporal, fortalecer los músculos y mejorar la función cardiovascular. Además, reducen el riesgo de desarrollar enfermedades crónicas como la diabetes tipo 2, enfermedades cardíacas y ciertos tipos de cáncer. 
                        </p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="w-full bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('diabetesMellitus2')">
                    Diabetes Tipo II
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('diabetesMellitus2')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white text-justify">
                    <div class="p-4 border-l-4 border-emerald-500 bg-gray-100">
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer"
                            @click="copiarTexto('Es importante mantener una dieta equilibrada, controlar regularmente los niveles de azúcar en la sangre y visitar al médico familiar para un seguimiento y una correcta gestión de la diabetes tipo 2. ')">
                            Es importante mantener una dieta equilibrada, controlar regularmente los niveles de azúcar en la sangre y visitar al médico familiar para un seguimiento y una correcta gestión de la diabetes tipo 2. 
                        </p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <!-- Botón principal -->
                <button
                    class="w-full bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-medium py-2 px-4 rounded-lg mt-2"
                    @click="toggle('hipertension')">
                    Hipertensión
                </button>

                <!-- Contenedor del desplegable -->
                <div v-if="isOpen('hipertension')" class="font-medium space-y-2 p-4 border rounded-md shadow-sm bg-white">
                    <div class="p-4 border-l-4 border-emerald-500 bg-gray-100">
                        <p class="italic text-sm font-light mb-4 leading-4 text-gray-700 hover:text-emerald-700 cursor-pointer text-justify"
                            @click="copiarTexto('Es recomendable mantener una dieta baja en sodio, realizar actividad física regularmente, controlar la presión arterial periódicamente y adherirse estrictamente al tratamiento recetado para gestionar la hipertensión de manera efectiva. ')">
                            Es recomendable mantener una dieta baja en sodio, realizar actividad física regularmente, controlar la presión arterial periódicamente y adherirse estrictamente al tratamiento recetado para gestionar la hipertensión de manera efectiva. 
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
