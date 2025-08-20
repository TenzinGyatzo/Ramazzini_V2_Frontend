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
    <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Gineco Obstétricos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 2 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(2)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MENARCA
            </td>
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.menarca ? formData.formDataControlPrenatal.menarca + ' años' : '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 3 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(3)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              GESTAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.gestas === 0 ? 0 : (formData.formDataControlPrenatal.gestas || '-') }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 4 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(4)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PARTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.partos === 0 ? 0 : (formData.formDataControlPrenatal.partos || '-') }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 5 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(5)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CESÁREAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.cesareas === 0 ? 0 : (formData.formDataControlPrenatal.cesareas || '-') }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 6 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(6)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ABORTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.abortos === 0 ? 0 : (formData.formDataControlPrenatal.abortos || '-') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Gineco Obstétricos Parte 2 -->
    <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Gineco Obstétricos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 7 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(7)">
            <td class="w-3/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CICLOS
            </td>
            <td class="w-2/5 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.ciclos || '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 8 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(8)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              F. U. M.
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ (formData.formDataControlPrenatal.fum && convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal.fum)) || '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 9 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(9)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              I. V. S. A.
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.ivsa ? formData.formDataControlPrenatal.ivsa + ' años' : '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 10 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(10)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PLANIFICACIÓN FAMILIAR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataControlPrenatal.metodoPlanificacionFamiliar || '-' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" :class="steps.currentStep === 11 ? 'outline outline-2 outline-yellow-500 rounded-md' : ''" @click="goToStep(11)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              F. P. P.
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ (formData.formDataControlPrenatal.fpp && convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal.fpp)) || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabla de Control Prenatal Enero a Junio -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Control Prenatal - Enero a Junio</h2>
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse border border-gray-300 text-xs">
          <!-- Encabezado de meses -->
          <thead>
            <tr>
              <th class="w-44 bg-gray-700 text-white px-2 py-2 border border-gray-300 text-center font-semibold">
                MES
              </th>
              <th v-for="mes in ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN']" 
                  :key="mes" 
                  class="w-20 bg-gray-700 text-white px-2 py-2 border border-gray-300 text-center font-semibold">
                {{ mes }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Fila: FECHA -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                FECHA
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`fecha-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (12 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(12 + (index * 7))">
                {{ (formData.formDataControlPrenatal[`${mes}Fecha`] && convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal[`${mes}Fecha`])) || '-' }}
              </td>
            </tr>
            
            <!-- Fila: PESO (Kg) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                PESO (Kg)
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`peso-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (13 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(13 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Peso`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: ÍNDICE DE MASA CORPORAL -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                ÍNDICE DE MASA CORPORAL
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`imc-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (13 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(13 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Imc`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: TENSIÓN ARTERIAL (mmHg) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                TENSIÓN ARTERIAL (mmHg)
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`tension-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (14 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(14 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Tia`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: F. C. FETAL (lat/min) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                F. C. FETAL (lat/min)
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`fcf-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (15 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(15 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Fcf`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: SEMANAS DE GESTACIÓN -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                SEMANAS DE GESTACIÓN
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`semanas-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (16 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(16 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Sdg`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: FONDO UTERINO (cm) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                FONDO UTERINO (cm)
              </td>
              <td v-for="(mes, index) in ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']" :key="`fondo-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (17 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(17 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}FondoUterino`] || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tabla de Control Prenatal Julio a Diciembre -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Control Prenatal - Julio a Diciembre</h2>
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse border border-gray-300 text-xs">
          <!-- Encabezado de meses -->
          <thead>
            <tr>
              <th class="w-44 bg-gray-700 text-white px-2 py-2 border border-gray-300 text-center font-semibold">
                MES
              </th>
              <th v-for="mes in ['JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']" 
                  :key="mes" 
                  class="w-20 bg-gray-700 text-white px-2 py-2 border border-gray-300 text-center font-semibold">
                {{ mes }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Fila: FECHA -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                FECHA
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`fecha-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (18 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(18 + (index * 7))">
                {{ (formData.formDataControlPrenatal[`${mes}Fecha`] && convertirFechaISOaDDMMYYYY(formData.formDataControlPrenatal[`${mes}Fecha`])) || '-' }}
              </td>
            </tr>
            
            <!-- Fila: PESO (Kg) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                PESO (Kg)
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`peso-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (19 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(19 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Peso`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: ÍNDICE DE MASA CORPORAL -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                ÍNDICE DE MASA CORPORAL
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`imc-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (20 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(20 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Imc`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: TENSIÓN ARTERIAL (mmHg) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                TENSIÓN ARTERIAL (mmHg)
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`tension-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (21 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(21 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Tia`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: F. C. FETAL (lat/min) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                F. C. FETAL (lat/min)
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`fcf-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (22 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(22 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Fcf`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: SEMANAS DE GESTACIÓN -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                SEMANAS DE GESTACIÓN
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`semanas-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (23 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(23 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}Sdg`] || '-' }}
              </td>
            </tr>
            
            <!-- Fila: FONDO UTERINO (cm) -->
            <tr>
              <td class="bg-gray-100 px-2 py-1 border border-gray-300 font-medium text-center">
                FONDO UTERINO (cm)
              </td>
              <td v-for="(mes, index) in ['julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']" :key="`fondo-${mes}`" 
                  class="px-2 py-1 border border-gray-300 text-center cursor-pointer hover:bg-yellow-100"
                  :class="steps.currentStep === (24 + (index * 7)) ? 'outline outline-2 outline-yellow-500 rounded' : ''"
                  @click="goToStep(24 + (index * 7))">
                {{ formData.formDataControlPrenatal[`${mes}FondoUterino`] || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
