<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, convertirFechaISOaDDMMYYYY, formatDateDDMMYYYY } from '@/helpers/dates';
import DocumentosAPI from '@/api/DocumentosAPI';
import { findNearestDocument } from '@/helpers/findNearestDocuments';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

// Lógica para traerse la data de los documentos con fecha más cercana a la aptitud
const historiasClinicas = ref([]);
const nearestHistoriaClinica = ref(null);

const exploracionesFisicas = ref([]);
const nearestExploracionFisica = ref(null);

const examenesVista = ref([]);
const nearestExamenVista = ref(null);

const antidopings = ref([]);
const nearestAntidoping = ref(null);

onMounted(async () => {
  try {
    const response = await DocumentosAPI.getHistoriasClinicas(trabajadores.currentTrabajadorId);
    historiasClinicas.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }
  try {
    const response = await DocumentosAPI.getExploracionesFisicas(trabajadores.currentTrabajadorId);
    exploracionesFisicas.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }
  try {
    const response = await DocumentosAPI.getExamenesVista(trabajadores.currentTrabajadorId);
    examenesVista.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }
  try {
    const response = await DocumentosAPI.getAntidopings(trabajadores.currentTrabajadorId);
    antidopings.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }

    // Llamar la función de cálculo inicial si ya existe fechaAptitudPuesto
    if (formData.formDataAptitud.fechaAptitudPuesto) {
    calculateNearestDocuments(formData.formDataAptitud.fechaAptitudPuesto);
  }
});

// Función reutilizable para calcular los documentos más cercanos
const calculateNearestDocuments = (fechaAptitudPuesto) => {
  nearestExamenVista.value = findNearestDocument(examenesVista.value, fechaAptitudPuesto, 'fechaExamenVista');
  nearestHistoriaClinica.value = findNearestDocument(historiasClinicas.value, fechaAptitudPuesto, 'fechaHistoriaClinica');
  nearestExploracionFisica.value = findNearestDocument(exploracionesFisicas.value, fechaAptitudPuesto, 'fechaExploracionFisica');
  nearestAntidoping.value = findNearestDocument(antidopings.value, fechaAptitudPuesto, 'fechaAntidoping');
};

// Watch para reactuar a cambios en la fecha
watch(
  () => formData.formDataAptitud.fechaAptitudPuesto,
  (newFechaAptitudPuesto) => {
    calculateNearestDocuments(newFechaAptitudPuesto);
  }
);

// Ir a un paso específico
const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

// Resumenes Computados
const historiaClinicaResumen = computed(() => {
  if (!nearestHistoriaClinica.value) {
    return 'No hay históricas clínicas disponibles';
  }
  return nearestHistoriaClinica.value.resumenHistoriaClinica + '.';
});

const exploracionFisicaResumen = computed(() => {
  if (!nearestExploracionFisica.value) {
    return 'No hay exploraciones físicas disponibles';
  }
  return `TA: ${nearestExploracionFisica.value.tensionArterialSistolica}/${nearestExploracionFisica.value.tensionArterialDiastolica} mmHg - ${nearestExploracionFisica.value.categoriaTensionArterial}. ${nearestExploracionFisica.value.resumenExploracionFisica}.`;
});

const adiposidadCorporalResumen = computed(() => {
  if (!nearestExploracionFisica.value) {
    return 'No hay exploraciones físicas disponibles';
  }
  return `IMC: ${nearestExploracionFisica.value.indiceMasaCorporal} - ${nearestExploracionFisica.value.categoriaIMC}. Cintura: ${nearestExploracionFisica.value.circunferenciaCintura} cm - ${nearestExploracionFisica.value.categoriaCircunferenciaCintura}.`;
});

const examenVistaResumen = computed(() => {
  if (!nearestExamenVista.value) {
    return 'No hay exámenes de vista disponibles';
  }
  return (nearestExamenVista.value.ojoIzquierdoLejanaConCorreccion === 0 || nearestExamenVista.value.ojoIzquierdoLejanaConCorreccion == null) &&
    (nearestExamenVista.value.ojoDerechoLejanaConCorreccion === 0 || nearestExamenVista.value.ojoDerechoLejanaConCorreccion == null)
    ? `OI: 20/${nearestExamenVista.value.ojoIzquierdoLejanaSinCorreccion || '-'}, OD: 20/${nearestExamenVista.value.ojoDerechoLejanaSinCorreccion || '-'} - ${nearestExamenVista.value.sinCorreccionLejanaInterpretacion || '-'}, Ishihara: ${nearestExamenVista.value.porcentajeIshihara || '-'}% - ${nearestExamenVista.value.interpretacionIshihara || '-'}`
    : `OI: 20/${nearestExamenVista.value.ojoIzquierdoLejanaConCorreccion || '-'}, OD: 20/${nearestExamenVista.value.ojoDerechoLejanaConCorreccion || '-'} - ${nearestExamenVista.value.conCorreccionLejanaInterpretacion || '-'} Corregida, Ishihara: ${nearestExamenVista.value.porcentajeIshihara || '-'}% - ${nearestExamenVista.value.interpretacionIshihara || '-'}`;
});

const antidopingResumen = computed(() => {
  if (!nearestAntidoping.value) {
    return 'No hay antidopings disponibles';
  }

  // Contar cuántos parámetros están presentes
  const evaluados = [
    'marihuana',
    'cocaina',
    'anfetaminas',
    'metanfetaminas',
    'opiaceos',
    'benzodiacepinas',
    'fenciclidina',
    'metadona',
    'barbituricos',
    'antidepresivosTriciclicos'
  ].filter(param => nearestAntidoping.value[param] !== undefined);

  // Evaluar si todos los evaluados son 'Negativo'
  const todosNegativos = evaluados.every(param => nearestAntidoping.value[param] === 'Negativo');

  if (todosNegativos) {
    const cantidadEnLetras = {
      5: 'cinco',
      6: 'seis',
      10: 'diez'
    }[evaluados.length] || evaluados.length;

    return `Negativo a ${cantidadEnLetras} parámetros`;
  }

  // Si hay algún positivo, construir el mensaje con las sustancias correspondientes
  const sustanciasPositivas = [
    nearestAntidoping.value.marihuana !== 'Negativo' ? 'Marihuana' : null,
    nearestAntidoping.value.cocaina !== 'Negativo' ? 'Cocaína' : null,
    nearestAntidoping.value.anfetaminas !== 'Negativo' ? 'Anfetaminas' : null,
    nearestAntidoping.value.metanfetaminas !== 'Negativo' ? 'Metanfetaminas' : null,
    nearestAntidoping.value.opiaceos !== 'Negativo' ? 'Opiáceos' : null,
    nearestAntidoping.value.benzodiacepinas !== 'Negativo' ? 'Benzodiazepinas' : null,
    nearestAntidoping.value.fenciclidina !== 'Negativo' ? 'Fenciclidina' : null,
    nearestAntidoping.value.metadona !== 'Negativo' ? 'Metadona' : null,
    nearestAntidoping.value.barbituricos !== 'Negativo' ? 'Barbitúricos' : null,
    nearestAntidoping.value.antidepresivosTriciclicos !== 'Negativo' ? 'Antidepresivos Tricíclicos' : null
  ].filter(Boolean).join(', '); // Filtrar valores nulos o `undefined` y unirlos en una cadena separada por comas

  return `Positivo a: ${sustanciasPositivas}`;
});

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

    <!-- Empresa y Fecha -->
    <div class="flex flex-wrap w-full gap-1 md:gap-4">
      <!-- Empresa -->
      <div class="w-full md:w-[calc(75%-0.5rem)]">
        <p class="text-center text-base sm:text-lg">
          {{ empresas.currentEmpresa.nombreComercial }}
        </p>
      </div>

      <!-- Fecha -->
      <div class="w-full md:w-[calc(25%-0.5rem)] flex flex-wrap gap-2 justify-end text-sm sm:text-base cursor-pointer"
        :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 1 }"
        @click="goToStep(1)">
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
           formatDateDDMMYYYY(formData.formDataAptitud.fechaAptitudPuesto) }}</span></p>
      </div>
    </div>

    <!-- Trabajador -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.nombre }}
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NACIMIENTO
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ convertirFechaISOaDDMMYYYY(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESCOLARIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PUESTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.puesto }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SEXO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.sexo }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ANTIGUEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TELÉFONO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.telefono }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESTADO CIVIL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.estadoCivil }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              HIJOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.hijos }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen y/o Alteraciones -->
    <div class="w-full">
      <h2 class="mb-1 text-left">La evaluación médica para la aptitud ante el puesto está basada
        en la siguiente información:</h2>
      <table class="table-auto w-full border-collapse border border-gray-200" :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 1 }">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">INFORMACIÓN Y ESTUDIOS
            </th>
            <th class="w-1/7 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">FECHAS</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">RESUMEN Y/O ALTERACIONES
              ENCONTRADAS</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">HISTORIA CLÍNICA
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestHistoriaClinica ?
              convertirFechaISOaDDMMYYYY(nearestHistoriaClinica.fechaHistoriaClinica) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestHistoriaClinica ?
              historiaClinicaResumen : '-' }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">EXPLORACIÓN FÍSICA
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExploracionFisica ?
              convertirFechaISOaDDMMYYYY(nearestExploracionFisica.fechaExploracionFisica) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExploracionFisica ?
              exploracionFisicaResumen : '-' }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">ADIPOSIDAD CORPORAL
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExploracionFisica ?
              convertirFechaISOaDDMMYYYY(nearestExploracionFisica.fechaExploracionFisica) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExploracionFisica ?
              adiposidadCorporalResumen : '-' }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">EXAMEN VISUAL</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExamenVista ?
              convertirFechaISOaDDMMYYYY(nearestExamenVista.fechaExamenVista) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExamenVista ?
              examenVistaResumen : '-' }}</td>
          </tr>
          <tr v-if="nearestAntidoping" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">ANTIDOPING</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestAntidoping ?
              convertirFechaISOaDDMMYYYY(nearestAntidoping.fechaAntidoping) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestAntidoping ?
              antidopingResumen : '-' }}</td>
          </tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional1" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 2 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional1.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional1) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional1 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 2 }"></tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional2" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 3 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional2.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional2) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional2 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 3 }"></tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional3" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(4)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 4 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional3.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional3) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional3 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 4 }"></tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional4" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(5)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 5 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional4.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional4) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional4 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 5 }"></tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional5" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(6)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 6 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional5.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional5) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional5 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 6 }"></tr>
          <tr v-if="formData.formDataAptitud.evaluacionAdicional6" class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(7)"
            :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 7 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">{{ formData.formDataAptitud.evaluacionAdicional6.toUpperCase() }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAptitud.fechaEvaluacionAdicional6) }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ formData.formDataAptitud.resultadosEvaluacionAdicional6 }}</td>
          </tr>
          <tr v-else :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 7 }"></tr>
        </tbody>
      </table>
    </div>

    <!-- Aptitud al Puesto -->
    <div class="w-full cursor-pointer" @click="goToStep(8)" 
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 8 }">
      <table class="table-auto w-full border-collapse border border-gray-200 ">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center" colspan="2">
              BASADO EN LA INFORMACIÓN ANTERIOR SE HA DETERMINADO:
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!formData.formDataAptitud.aptitudPuesto" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-gray-700 font-medium P">
              -
            </td>
          </tr>

          <tr v-if="formData.formDataAptitud.aptitudPuesto === 'Apto Sin Restricciones'" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-green-600 font-medium">
              {{ trabajadores.currentTrabajador.sexo === 'Femenino' ? 'APTA SIN RESTRICCIONES' : 'APTO SIN RESTRICCIONES' }}
            </td>
          </tr>

          <tr v-if="formData.formDataAptitud.aptitudPuesto === 'Apto Con Precaución'" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-amber-600 font-medium">
              {{ trabajadores.currentTrabajador.sexo === 'Femenino' ? 'APTA CON PRECAUCIÓN' : 'APTO CON PRECAUCIÓN' }}
            </td>
          </tr>

          <tr v-if="formData.formDataAptitud.aptitudPuesto === 'Apto Con Restricciones'" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-orange-600 font-medium">
              {{ trabajadores.currentTrabajador.sexo === 'Femenino' ? 'APTA CON RESTRICCIONES' : 'APTO CON RESTRICCIONES' }}
            </td>
          </tr>

          <tr v-if="formData.formDataAptitud.aptitudPuesto === 'No Apto'" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-red-600 font-medium">
              {{ trabajadores.currentTrabajador.sexo === 'Femenino' ? 'NO APTA' : 'NO APTO' }}
            </td>
          </tr>

          <tr v-if="formData.formDataAptitud.aptitudPuesto === 'Evaluación No Completada'" class="odd:bg-white even:bg-gray-50 cursor-pointer">
            <td class="text-lg sm:text-2xl lg:text-3xl text-center px-2 py-0 sm:py-1 lg:py-2 border border-gray-300 text-gray-700 font-medium">
              EVALUACIÓN NO COMPLETADA
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <!-- Conclusión y recomendaciones -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center" colspan="2">
              CONCLUSIÓN Y RECOMENDACIONES
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" style="height: 3.9rem;" @click='goToStep(9)'
          :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 9 }">
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Alteraciones a la salud
            </td>
            <td class="text-xs sm:text-sm text-justify px-2 py-0 border border-gray-300">
              {{ formData.formDataAptitud.alteracionesSalud }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" style="height: 3.9rem;" @click='goToStep(10)'
          :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 10 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Resultados
            </td>
            <td class="text-xs sm:text-sm text-justify px-2 py-0 border border-gray-300">
              {{ formData.formDataAptitud.resultados }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" style="height: 3.9rem;" @click='goToStep(11)'
          :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 11 }">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Medidas Preventivas Específicas
            </td>
            <td class="text-xs sm:text-sm text-justify px-2 py-0 border border-gray-300">
              {{ formData.formDataAptitud.medidasPreventivas }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f0f0f0;
  /* Cambia el color según tu diseño */
}
</style>
