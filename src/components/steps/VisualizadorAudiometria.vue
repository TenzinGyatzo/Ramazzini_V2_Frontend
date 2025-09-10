<script setup>
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

// Ir a un paso específico
const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

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
        <p class="w-full md:w-auto">Fecha: <span class="font-medium">{{
           formatDateDDMMYYYY(formData.formDataAudiometria.fechaAudiometria) }}</span></p>
      </div>
    </div>

    <!-- Trabajador -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE
            </td>
            <td class="w-1/3 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formatNombreCompleto(trabajadores.currentTrabajador) }}
            </td>
            <td class="w-1/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NACIMIENTO
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ convertirFechaISOaDDMMYYYY(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESCOLARIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PUESTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.puesto }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SEXO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.sexo }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ANTIGUEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TELÉFONO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.telefono }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESTADO CIVIL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.estadoCivil }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NUM. EMPLEADO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.numeroEmpleado || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabla de Mediciones Audiométricas -->
    <div class="w-full">
      <table class="w-full border-collapse border border-gray-200 table-fixed">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-32 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">-</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">125</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">250</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">500</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">1000</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">2000</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">3000</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">4000</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">6000</th>
            <th class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">8000</th>
            <th class="w-16 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center font-medium">P%</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 2 }"
          @click="goToStep(2)">
            <td class="w-32 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">OIDO DERECHO</td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho125 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho250 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho500 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho1000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho2000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho3000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho4000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho6000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoDerecho8000 ?? '' }}
            </td>
            <td class="w-16 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.porcentajePerdidaOD ?? '' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 3 }"
          @click="goToStep(3)">
            <td class="w-32 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">OIDO IZQUIERDO</td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo125 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo250 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo500 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo1000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo2000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo3000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo4000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo6000 ?? '' }}
            </td>
            <td class="w-12 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.oidoIzquierdo8000 ?? '' }}
            </td>
            <td class="w-16 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.porcentajePerdidaOI ?? '' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td colspan="10" class="w-32 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">Hipoacusia Bilateral Combinada</td>
            <td class="w-16 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">
              {{ formData.formDataAudiometria.hipoacusiaBilateralCombinada ?? '' }}
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
