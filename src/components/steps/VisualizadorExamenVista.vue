<script setup>
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, formatDateDDMMYYYY } from '@/helpers/dates';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

console.log('Datos del store en VisualizadorExamenVista:', formData.formDataExamenVista);

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
          formatDateDDMMYYYY(formData.formDataExamenVista.fechaExamenVista) }}</span></p>
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
              ESCOLARIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ANTIGUEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Agudeza Visual Sin Corrección -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Agudeza Visual Sin Corrección</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">OJO IZQUIERDO</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">OJO DERECHO</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">INTERPRETACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
            <td class="w-1/6 text-xs sm:text-sm px-2 py-0 text-center border border-gray-300 font-medium">LEJANA</td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoIzquierdoLejanaSinCorreccion ?
                '20/' + formData.formDataExamenVista.ojoIzquierdoLejanaSinCorreccion : '' }}
            </td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoDerechoLejanaSinCorreccion ?
                '20/' + formData.formDataExamenVista.ojoDerechoLejanaSinCorreccion : '' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.sinCorreccionLejanaInterpretacion }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)">
            <td class="w-1/6 text-xs sm:text-sm px-2 py-0 text-center border border-gray-300 font-medium">CERCANA</td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoIzquierdoCercanaSinCorreccion ?
                '20/' + formData.formDataExamenVista.ojoIzquierdoCercanaSinCorreccion : '' }}
            </td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoDerechoCercanaSinCorreccion ?
                '20/' + formData.formDataExamenVista.ojoDerechoCercanaSinCorreccion : '' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.sinCorreccionCercanaInterpretacion }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Requiere Lentes -->
    <div class="w-full flex flex-wrap gap-0 md:gap-8 justify-start xl:justify-evenly text-sm sm:text-base">
      <p class="w-full md:w-auto cursor-pointer" @click="goToStep(2)">
        Requiere Lentes para Uso General: (
        <span class="font-semibold">{{ formData.formDataExamenVista.requiereLentesUsoGeneral }}</span> )
      </p>
      <p class="w-full md:w-auto cursor-pointer" @click="goToStep(3)">
        Requiere Lentes para Lectura: (
        <span class="font-semibold">{{ formData.formDataExamenVista.requiereLentesParaLectura }}</span> )
      </p>
    </div>

    <!-- Agudeza Visual Con Corrección -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Agudeza Visual Con Corrección</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">OJO IZQUIERDO</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">OJO DERECHO</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">INTERPRETACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(4)">
            <td class="w-1/6 text-xs sm:text-sm px-2 py-0 text-center border border-gray-300 font-medium">LEJANA</td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoIzquierdoLejanaConCorreccion ?
                '20/' + formData.formDataExamenVista.ojoIzquierdoLejanaConCorreccion : 'NA' }}
            </td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoDerechoLejanaConCorreccion ?
                '20/' + formData.formDataExamenVista.ojoDerechoLejanaConCorreccion : 'NA' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.conCorreccionLejanaInterpretacion ? 
                formData.formDataExamenVista.conCorreccionLejanaInterpretacion : 'NA' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(5)">
            <td class="w-1/6 text-xs sm:text-sm px-2 py-0 text-center border border-gray-300 font-medium">CERCANA</td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoIzquierdoCercanaConCorreccion ?
                '20/' + formData.formDataExamenVista.ojoIzquierdoCercanaConCorreccion : 'NA' }}
            </td>
            <td class="w-1/6 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.ojoDerechoCercanaConCorreccion  ?
                '20/' + formData.formDataExamenVista.ojoDerechoCercanaConCorreccion : 'NA' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.conCorreccionCercanaInterpretacion ?
                formData.formDataExamenVista.conCorreccionCercanaInterpretacion : 'NA' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Prueba de Ishihara -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Prueba de Ishihara</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">PLACAS CORRECTAS</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">PORCENTAJE</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">INTERPRETACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(6)">
            <td class="w-1/3 text-xs sm:text-sm px-2 py-0 text-center border border-gray-300 font-medium">
              {{ formData.formDataExamenVista.placasCorrectas ?
                formData.formDataExamenVista.placasCorrectas + ' de 14': '&nbsp;' }}
            </td>
            <td class="w-1/3 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.porcentajeIshihara ?
                formData.formDataExamenVista.porcentajeIshihara + ' %': '' }}
            </td>
            <td class="w-1/3 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExamenVista.interpretacionIshihara }}
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
