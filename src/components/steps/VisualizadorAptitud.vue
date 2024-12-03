<script setup>
import { onMounted, ref, watch } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import DocumentosAPI from '@/api/DocumentosAPI';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const historiasClinicas = ref([]);
const nearestHistoriaClinica = ref(null);

const exploracionesFisicas = ref([]);
const nearestExploracionFisica = ref(null);

const examenesVista = ref([]);
const nearestExamenVista = ref(null);

const antidopings = ref([]);  
const nearestAntidoping = ref(null);

onMounted(async () => {
  formData.resetFormData();

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
});

watch(
  () => formData.formDataAptitud.fechaAptitudPuesto,
  (newfechaAptitudPuesto) => {
    if (!newfechaAptitudPuesto || !examenesVista.value.length) {
      console.log('No hay fecha válida o el array de exámenes está vacío.');
      nearestExamenVista.value = null;
      return;
    }

    const referenceDate = new Date(newfechaAptitudPuesto);

    if (isNaN(referenceDate.getTime())) {
      console.error('Fecha del certificado no válida:', newfechaAptitudPuesto);
      nearestExamenVista.value = null;
      return;
    }

    // Procesar solo si las fechas son válidas
    nearestExamenVista.value = examenesVista.value.reduce((closest, current) => {
      const currentDate = current.fechaExamenVista ? new Date(current.fechaExamenVista) : null;

      if (!currentDate || isNaN(currentDate.getTime())) {
        console.error('Fecha de examen no válida:', current.fechaExamenVista);
        return closest; // Ignorar exámenes con fechas inválidas
      }

      const currentDiff = Math.abs(currentDate - referenceDate);
      const closestDiff = closest
        ? Math.abs(new Date(closest.fechaExamenVista) - referenceDate)
        : Infinity;

      return currentDiff < closestDiff ? current : closest;
    }, null);
    
  },
  { immediate: true }
);

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

console.log(nearestExamenVista.value);

const examenVistaResumen =
  (nearestExamenVista.ojoIzquierdoLejanaConCorreccion === 0 || nearestExamenVista.ojoIzquierdoLejanaConCorreccion == null) &&
  (nearestExamenVista.ojoDerechoLejanaConCorreccion === 0 || nearestExamenVista.ojoDerechoLejanaConCorreccion == null)
    ? `OI: 20/${nearestExamenVista.ojoIzquierdoLejanaSinCorreccion}, OD: 20/${nearestExamenVista.ojoDerechoLejanaSinCorreccion} - ${nearestExamenVista.sinCorreccionLejanaInterpretacion}, Ishihara: ${nearestExamenVista.porcentajeIshihara}% - ${nearestExamenVista.interpretacionIshihara}`
    : `OI: 20/${nearestExamenVista.ojoIzquierdoLejanaConCorreccion}, OD: 20/${nearestExamenVista.ojoDerechoLejanaConCorreccion} - ${nearestExamenVista.conCorreccionLejanaInterpretacion} Corregida, Ishihara: ${nearestExamenVista.porcentajeIshihara}% - ${nearestExamenVista.interpretacionIshihara}`;

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

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
        @click="goToStep(1)">
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formData.formDataAptitud.fechaAptitudPuesto }}</span></p>
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
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">INFORMACIÓN Y ESTUDIOS
            </th>
            <th class="w-1/6 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">FECHAS</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">RESUMEN Y/O ALTERACIONES
              ENCONTRADAS</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">HISTORIA CLÍNICA
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">EXPLORACIÓN FÍSICA
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">ADIPOSIDAD CORPORAL
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">EXAMEN VISUAL</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExamenVista ? convertirFechaISOaDDMMYYYY(nearestExamenVista.fechaExamenVista) : '-' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{ nearestExamenVista ? examenVistaResumen : '-' }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">ANTIDOPING</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Aptitud al Puesto -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/6 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center" colspan="2">
              BASADO EN LA INFORMACIÓN ANTERIOR SE HA DETERMINADO:
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">

            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">
              Apto sin restricciones. No tiene impedimentos para el puesto al que aspira o desempeña.
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">

            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">
              Apto con precaución. Requiere vigilancia médica más frecuente.
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">

            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">
              Apto con restricciones. Requiere adaptaciones razonables para asegurar la seguridad y salud.
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">

            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">
              No apto. No está permitido el deseméño del puesto al que aspira.
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">

            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">
              Evaluación no completada. Para concluir, requiere evaluaciones adicionales o tratamiento médico.
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
          <tr class="odd:bg-white even:bg-gray-50" style="height: 3.9rem;">
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Alteraciones a la salud
            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">

            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50" style="height: 3.9rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Resultados
            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">

            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50" style="height: 3.9rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              Medidas Preventivas Específicas
            </td>
            <td class="text-xs sm:text-sm text-left px-2 py-0 border border-gray-300">

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
