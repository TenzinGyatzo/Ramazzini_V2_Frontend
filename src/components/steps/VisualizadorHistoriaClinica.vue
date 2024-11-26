<script setup>
import { useFormDataStore } from '@/stores/formDataStore';
const formData = useFormDataStore();

// Formatea las llaves
function formatKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Inserta un espacio antes de cada mayúscula
    .replace(/^./, (str) => str.toUpperCase()); // Convierte la primera letra a mayúscula
}
</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto">

    <!-- Historia Clínica -->
    <div class="w-full md:w-3/5 mx-auto mb-1">
      <h2 class="text-lg font-semibold mb-1">Historia Clínica</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-sm sm:text-base px-2 py-0 border w-1/2 border-gray-300 text-left">Campo</th>
            <th class="text-sm sm:text-base px-2 py-0 border border-gray-300 text-left">Valor</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="fade" class="transition-group">
          <tr v-for="([key, value], index) in Object.entries(formData.formDataHistoriaClinica).slice(0, 2)" :key="key"
            class="odd:bg-white even:bg-gray-50">
            <td class="text-sm sm:text-base px-2 py-0 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
            <td class="text-sm sm:text-base px-2 py-0 border border-gray-300">
              <!-- Transición para el Value -->
              <transition name="value-change" mode="out-in">
                <span :key="value">{{ value }}</span>
              </transition>
            </td>
          </tr>
        </transition-group>
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
        <tr class="odd:bg-gray-50 even::bg-white ">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">NEFROPATÍAS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300 ">{{
            formData.formDataHistoriaClinica.nefropatias === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.nefropatias === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.nefropatiasEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">DIABÉTICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.diabeticos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.diabeticos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.diabeticosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">HIPERTENSIVOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hipertensivos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hipertensivos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hipertensivosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">CARDIOPÁTICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.cardiopaticos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.cardiopaticos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.cardiopaticosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">NEOPLÁSICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.neoplasicos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.neoplasicos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.neoplasicosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">PSIQUIÁTRICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.psiquiatricos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.psiquiatricos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.psiquiatricosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">EPILÉPTICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.epilepticos === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.epilepticos === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.epilepticosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">LEUTICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.leuticos
              === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.leuticos
              === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.leuticosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">FÍMICOS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.fimicos
              === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.fimicos
              === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.fimicosEspecificar }}</td>
        </tr>
        <tr class="odd:bg-gray-50 even::bg-white">
          <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">HEPATOPATÍAS</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hepatopatias === 'Si' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hepatopatias === 'No' ? 'XX' : '' }}</td>
          <td class="text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">{{
            formData.formDataHistoriaClinica.hepatopatiasEspecificar }}</td>
        </tr>
      </table>
    </div>

    <!-- Antecedentes Personales Patológicos -->
    <!-- <div class="w-full md:w-[calc(50%-1rem)]">
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
      </table>
    </div> -->

    <!-- Antecedentes Personales No Patológicos -->
    <!-- <div class="w-full md:w-1/2">
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
      </table>
    </div> -->

    <!-- Antecedentes Personales No Patológicos Parte 2 -->
    <!-- <div class="w-full md:w-[calc(50%-1rem)]">
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
