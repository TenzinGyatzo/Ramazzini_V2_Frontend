<script setup>
import { ref, onMounted } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { calcularEdad, calcularAntiguedad, convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();

onMounted(() => {
  formData.resetFormData();
});


const goToStep = (stepNumber) => {
  if (stepNumber >= 1 && stepNumber <= steps.value.length) {
    currentStep.value = stepNumber;
  } else {
    console.error(`El paso ${stepNumber} no es válido.`);
  }
};

const antecedentesHeredoFamiliares = ref([
  { name: 'NEFROPATÍAS', step: 2, key: 'nefropatias', specifyKey: 'nefropatiasEspecificar' },
  { name: 'DIABÉTICOS', step: 3, key: 'diabeticos', specifyKey: 'diabeticosEspecificar' },
  { name: 'HIPERTENSIVOS', step: 4, key: 'hipertensivos', specifyKey: 'hipertensivosEspecificar' },
  { name: 'CARDIOPÁTICOS', step: 5, key: 'cardiopaticos', specifyKey: 'cardiopaticosEspecificar' },
  { name: 'NEOPLÁSICOS', step: 6, key: 'neoplasicos', specifyKey: 'neoplasicosEspecificar' },
  { name: 'PSIQUÁTRICOS', step: 7, key: 'psiquiatricos', specifyKey: 'psiquiatricosEspecificar' },
  { name: 'EPILÉPTICOS', step: 8, key: 'epilepticos', specifyKey: 'epilepticosEspecificar' },
  { name: 'LEUTICOS', step: 9, key: 'leuticos', specifyKey: 'leuticosEspecificar' },
  { name: 'FÍMICOS', step: 10, key: 'fimicos', specifyKey: 'fimicosEspecificar' },
  { name: 'HEPATOPATÍAS', step: 11, key: 'hepatopatias', specifyKey: 'hepatopatiasEspecificar' },
]);

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto">

    <div class="flex flex-wrap w-full gap-4">
      <!-- Empresa -->
      <div class="w-full md:w-2/5">
        <p class="text-center text-base sm:text-lg font-semibold">
          {{ empresas.currentEmpresa.nombreComercial }}
        </p>
      </div>

      <!-- Fecha y Motivo del Examen -->
      <div
        class="w-full md:w-[calc(60%-1rem)] flex flex-wrap gap-2 justify-start md:justify-end text-sm sm:text-base">
        <p class="flex-1 md:flex-none">Ingreso ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Ingreso' ? 'X' :
          '&nbsp;' }} )</p>
        <p class="flex-1 md:flex-none">Inicial ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Inicial' ? 'X' :
          '&nbsp;' }} )</p>
        <p class="flex-1 md:flex-none">Periódico ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Periódico' ?
          'X' : '&nbsp;' }} )</p>
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formData.formDataHistoriaClinica.fechaHistoriaClinica }}</span></p>
      </div>
    </div>

    <!-- Trabajador -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.nombre }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NACIMIENTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
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

    <!-- Antecedentes Heredofamiliares -->
    <div class="w-full md:w-1/2">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Heredofamiliares</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Sí</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">No</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in antecedentesHeredoFamiliares" :key="index"
            :class="index % 2 === 0 ? 'bg-gray-50' : 'bg-white'">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">{{ item.name }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.key] === 'Si' ? 'XX' : '' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.key] === 'No' ? 'XX' : '' }}
            </td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.specifyKey] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Personales Patológicos -->
    <div class="w-full md:w-[calc(50%-1rem)]">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Sí</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">No</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-gray-50 even::bg-white ">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">LUMBALGIAS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 ">{{
              formData.formDataHistoriaClinica.lumbalgias === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.lumbalgias === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.lumbalgiasEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">DIABÉTICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.diabeticosPP === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.diabeticosPP === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.diabeticosPPEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">CARDIOPÁTICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.cardiopaticosPP === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.cardiopaticosPP === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.cardiopaticosPPEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ALÉRGICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alergicos === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alergicos === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alergicosEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">HIPERTENSIVOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.hipertensivosPP === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.hipertensivosPP === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.hipertensivosPPEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">OBESIDAD</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.obesidad === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.obesidad === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.obesidadEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">EPILÉPTICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.epilepticosPP === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.epilepticosPP === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.epilepticosPPEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ACCIDENTES</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.accidentes
                === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.accidentes
                === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.accidentesEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">QUIRÚRGICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.quirurgicos
                === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.quirurgicos
                === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.quirurgicosEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">TRAUMÁTICOS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.traumaticos === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.traumaticos === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.traumaticosEspecificar }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Personales No Patológicos -->
    <div class="w-full md:w-1/2">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales No Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Sí</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">No</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-gray-50 even::bg-white ">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ALCOHOLISMO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 ">{{
              formData.formDataHistoriaClinica.alcoholismo === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alcoholismo === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alcoholismoEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">TABAQUISMO</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.tabaquismo === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.tabaquismo === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.tabaquismoEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">TOXICOMANIAS</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.toxicomanias === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.toxicomanias === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.toxicomaniasEspecificar }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Personales No Patológicos Parte 2 -->
    <div class="w-full md:w-[calc(50%-1rem)]">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales No Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-left">-</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Sí</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">No</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Especifique</th>
          </tr>
        </thead>
        <tbody>
          <tr class="odd:bg-gray-50 even::bg-white ">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ALIMENTACIÓN</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 ">{{
              formData.formDataHistoriaClinica.alimentacionDeficiente === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alimentacionDeficiente === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.alimentacionDeficienteEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">ACTIVIDAD FÍSICA</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.actividadFisicaDeficiente === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.actividadFisicaDeficiente === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.actividadFisicaDeficienteEspecificar }}</td>
          </tr>
          <tr class="odd:bg-gray-50 even::bg-white">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">HIGIENE PERSONAL</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.higienePersonalDeficiente === 'Si' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.higienePersonalDeficiente === 'No' ? 'XX' : '' }}</td>
            <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
              formData.formDataHistoriaClinica.higienePersonalDeficienteEspecificar }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Gineco Obstétricos -->
    <!-- <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="w-full">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Gineco Obstétricos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MENARCA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.menarca }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FECHA ULTIMA REGLA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ convertirFechaISOaDDMMYYYY(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DURACIÓN PROMEDIO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CANTIDAD DE SANGRE
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FRECUENCIA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.puesto }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DOLOR MENSTRUAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.sexo }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              GESTAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EMBARAZO ACTUAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.telefono }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PARTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.estadoCivil }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PLANIFICACIÓN FAMILIAR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.hijos }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CESÁREAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.estadoCivil }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              VIDA SEXUAL ACTIVA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.hijos }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ABORTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.estadoCivil }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ÚLTIMO PAPANICOLAOU
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.hijos }}
            </td>
          </tr>
        </tbody>
      </table>
    </div> -->
  </div>
</template>

<style>
/* Transiciones personalizadas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transiciones para los valores */
.value-change-enter-active,
.value-change-leave-active {
  transition: all 0.3s ease;
}

.value-change-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.value-change-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
