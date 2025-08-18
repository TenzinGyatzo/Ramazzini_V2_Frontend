<script setup>
import { ref } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, convertirFechaISOaDDMMYYYY, formatDateDDMMYYYY } from '@/helpers/dates';
import { formatNombreCompleto } from '@/helpers/formatNombreCompleto';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

    <!-- Empresa, Fecha y Motivo del Examen -->
    <div class="flex flex-wrap w-full gap-4">
      <!-- Empresa -->
      <div class="w-full md:w-2/5">
        <p class="text-center text-base sm:text-lg">
          {{ empresas.currentEmpresa.nombreComercial }}
        </p>
      </div>

      <!-- Fecha y Motivo del Examen -->
      <div
        class="w-full md:w-[calc(60%-1rem)] flex flex-wrap gap-2 justify-start md:justify-end text-sm sm:text-base cursor-pointer"
        :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 1 }"
        @click="goToStep(1)">
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formatDateDDMMYYYY(formData.formDataControlPrenatal.fechaInicioControlPrenatal) }}</span></p>
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
                              {{ formatNombreCompleto(trabajadores.currentTrabajador) }}
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
              NUM. EMPLEADO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.numeroEmpleado || 'No asignado' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Gineco Obstétricos -->
    <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Gineco Obstétricos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 28 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(28)">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MENARCA
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.menarca ? formData.formDataControlPrenatal.menarca + ' años' : '-' }}
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CICLOS
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.ciclos || '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 31 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(31)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              GESTAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.gestas || '-' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FECHA DE ÚLTIMA MENSTRUACIÓN
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.fum ? convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal.fum) : '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 32 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(32)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PARTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.partos || '-' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              INICIO DE VIDA SEXUAL ACTIVA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.ivsa ? formData.formDataControlPrenatal.ivsa + ' años' : '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 33 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(33)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CESÁREAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.cesareas || '-' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PLANIFICACIÓN FAMILIAR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.metodoPlanificacionFamiliar || '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 34 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(34)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ABORTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.abortos || '-' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FECHA PROBABLE DE PARTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.fpp ? convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal.fpp) : '-' }}
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
