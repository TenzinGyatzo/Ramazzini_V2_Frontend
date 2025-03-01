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
          formatDateDDMMYYYY(formData.formDataExploracionFisica.fechaExploracionFisica) }}</span></p>
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

    <!-- Somatometría -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">SOMATOMETRÍA</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-2/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">Parámetro</th>
            <th class="w-1/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Categoría</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">PESO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.peso ? `${formData.formDataExploracionFisica.peso} kg` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ALTURA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.altura ? `${formData.formDataExploracionFisica.altura} m` : '' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ÍNDICE DE MASA CORPORAL</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.indiceMasaCorporal }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaIMC }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">CIRCUNFERENCIA CINTURA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.circunferenciaCintura
                ? `${formData.formDataExploracionFisica.circunferenciaCintura} cm` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaCircunferenciaCintura }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Signos Vitales -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">SIGNOS VITALES</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-2/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">Parámetro</th>
            <th class="w-1/5 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Categoría</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">TENSIÓN ARTERIAL</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaTensionArterial ?
                `${formData.formDataExploracionFisica.tensionArterialSistolica}/${formData.formDataExploracionFisica.tensionArterialDiastolica}
              mmHg` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaTensionArterial }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">FRECUENCIA CARDIACA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.frecuenciaCardiaca ?
                `${formData.formDataExploracionFisica.frecuenciaCardiaca} lpm` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaFrecuenciaCardiaca }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">FRECUENCIA RESPIRATORIA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.frecuenciaRespiratoria ?
                `${formData.formDataExploracionFisica.frecuenciaRespiratoria} rpm` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaFrecuenciaRespiratoria }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(3)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">SATURACIÓN DE OXÍGENO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.saturacionOxigeno ?
                `${formData.formDataExploracionFisica.saturacionOxigeno} %` : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.categoriaSaturacionOxigeno }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cabeza y Cuello -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">CABEZA Y CUELLO</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(4)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">CRÁNEO CARA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.craneoCara }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(5)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">OJOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.ojos }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(6)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">OÍDOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.oidos }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(7)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">NARIZ</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.nariz }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(8)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">BOCA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.boca }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(9)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">CUELLO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.cuello }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Extremidades Superiores -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">EXTREMIDADES SUPERIORES</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(10)" style="height: 1.57rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">HOMBROS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.hombros }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(11)" style="height: 1.57rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">CODOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.codos }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(12)" style="height: 1.57rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">MANOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.manos }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(13)" style="height: 1.57rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">NEUROLÓGICO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.neurologicoESuperiores }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(14)" style="height: 1.57rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">VASCULAR</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.vascularESuperiores }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tórax -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">TÓRAX</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(15)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">TÓRAX</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.torax }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Abdomen -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">ABDOMEN</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(16)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">ABDOMEN</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.abdomen }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Extremidades Inferiores -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">EXTREMIDADES INFERIORES</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(17)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">CADERA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.cadera }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(18)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">RODILLAS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.rodillas }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(19)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">TOBILLOS-PIES</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.tobillosPies }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(20)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">NEUROLÓGICO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.neurologicoEInferiores }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(21)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">VASCULAR</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.vascularEInferiores }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Columna -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">COLUMNA</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(22)" style="height: 3.25rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">INSPECCIÓN</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.inspeccionColumna }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(23)" style="height: 3.25rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">MOVIMIENTOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.movimientosColumna }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Piel -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">PIEL</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(24)" style="height: 1.75rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">LESIONES</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.lesionesPiel }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(25)" style="height: 1.75rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">CICATRICES</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.cicatrices }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(26)" style="height: 1.75rem;">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">NEVOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.nevos }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Neurológico -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">NEUROLÓGICO</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="w-1/4 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">-</th>
            <th class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">Hallazgos</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(27)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">COORDINACIÓN</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.coordinacion }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(28)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">SENSIBILIDAD</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.sensibilidad }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(29)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">EQUILIBRIO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.equilibrio }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(30)">
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 font-medium">MARCHA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataExploracionFisica.marcha }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen de Exploración Física -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">RESUMEN EXPLORACIÓN FÍSICA</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <!-- Encabezado -->
          <tr class="bg-gray-200 cursor-pointer" @click="goToStep(31)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light text-center">
              RESUMEN
            </td>
          </tr>
          <!-- Fila combinada -->
          <tr class="bg-white cursor-pointer" @click="goToStep(31)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center align-middle"
              style="height: calc(2 * 1.3rem);">
              {{ formData.formDataExploracionFisica.resumenExploracionFisica }}
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
