<script setup>
import { ref } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, convertirFechaISOaDDMMYYYY, formatDateDDMMYYYY } from '@/helpers/dates';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
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

const antecedentesPersonalesPatologicos = ref([
  { name: 'LUMBALGIAS', step: 12, key: 'lumbalgias', specifyKey: 'lumbalgiasEspecificar' },
  { name: 'DIABÉTICOS', step: 13, key: 'diabeticosPP', specifyKey: 'diabeticosPPEspecificar' },
  { name: 'CARDIOPÁTICOS', step: 14, key: 'cardiopaticosPP', specifyKey: 'cardiopaticosPPEspecificar' },
  { name: 'ALÉRGICOS', step: 15, key: 'alergicos', specifyKey: 'alergicosEspecificar' },
  { name: 'HIPERTENSIVOS', step: 16, key: 'hipertensivosPP', specifyKey: 'hipertensivosPPEspecificar' },
  { name: 'OBESIDAD', step: 17, key: 'obesidad', specifyKey: 'obesidadEspecificar' },
  { name: 'EPILÉPTICOS', step: 18, key: 'epilepticosPP', specifyKey: 'epilepticosPPEspecificar' },
  { name: 'ACCIDENTES', step: 19, key: 'accidentes', specifyKey: 'accidentesEspecificar' },
  { name: 'QUIRÚRGICOS', step: 20, key: 'quirurgicos', specifyKey: 'quirurgicosEspecificar' },
  { name: 'TRAUMÁTICOS', step: 21, key: 'traumaticos', specifyKey: 'traumaticosEspecificar' },
]);

const antecedentesPersonalesNoPatologicos = ref([
  { name: 'ALCOHOLISMO', step: 22, key: 'alcoholismo', specifyKey: 'alcoholismoEspecificar' },
  { name: 'TABAQUISMO', step: 23, key: 'tabaquismo', specifyKey: 'tabaquismoEspecificar' },
  { name: 'TOXICOMANIAS', step: 24, key: 'toxicomanias', specifyKey: 'toxicomaniasEspecificar' },
]);

const antecedentesPersonalesNoPatologicosParte2 = ref([
  { name: 'ALIMENTACIÓN', step: 25, key: 'alimentacionDeficiente', specifyKey: 'alimentacionDeficienteEspecificar' },
  { name: 'ACTIVIDAD FÍSICA', step: 26, key: 'actividadFisicaDeficiente', specifyKey: 'actividadFisicaDeficienteEspecificar' },
  { name: 'HIGIENE PERSONAL', step: 27, key: 'higienePersonalDeficiente', specifyKey: 'higienePersonalDeficienteEspecificar' },
]);

const antecedentesLaborales = ref([
  { number: '1', step: 42, empresa: 'empresaAnterior1', puesto: 'puestoAnterior1', antiguedad: 'antiguedadAnterior1', agentes: 'agentesAnterior1' },
  { number: '2', step: 43, empresa: 'empresaAnterior2', puesto: 'puestoAnterior2', antiguedad: 'antiguedadAnterior2', agentes: 'agentesAnterior2' },
  { number: '3', step: 44, empresa: 'empresaAnterior3', puesto: 'puestoAnterior3', antiguedad: 'antiguedadAnterior3', agentes: 'agentesAnterior3' },
]);

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
        @click="goToStep(1)">
        <p class="flex-1 md:flex-none">Ingreso ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Ingreso' ? 'X' :
          '&nbsp;' }} )</p>
        <p class="flex-1 md:flex-none">Inicial ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Inicial' ? 'X' :
          '&nbsp;' }} )</p>
        <p class="flex-1 md:flex-none">Periódico ( {{ formData.formDataHistoriaClinica.motivoExamen === 'Periódico' ?
          'X' : '&nbsp;' }} )</p>
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formatDateDDMMYYYY(formData.formDataHistoriaClinica.fechaHistoriaClinica) }}</span></p>
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

    <!-- Antecedentes Heredofamiliares -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Heredofamiliares</h2>
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
            :class="index % 2 === 0 ? 'bg-gray-50 cursor-pointer' : 'bg-white cursor-pointer'"
            @click="goToStep(item.step)">
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
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Personales Patológicos</h2>
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
          <tr v-for="(item, index) in antecedentesPersonalesPatologicos" :key="index"
            :class="index % 2 === 0 ? 'bg-gray-50 cursor-pointer' : 'bg-white cursor-pointer'"
            @click="goToStep(item.step)">
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

    <!-- Antecedentes Personales No Patológicos -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Personales No Patológicos</h2>
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
          <tr v-for="(item, index) in antecedentesPersonalesNoPatologicos" :key="index"
            :class="index % 2 === 0 ? 'bg-gray-50 cursor-pointer' : 'bg-white cursor-pointer'"
            @click="goToStep(item.step)">
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

    <!-- Antecedentes Personales No Patológicos Parte 2 -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Personales No Patológicos</h2>
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
          <tr v-for="(item, index) in antecedentesPersonalesNoPatologicosParte2" :key="index"
            :class="index % 2 === 0 ? 'bg-gray-50 cursor-pointer' : 'bg-white cursor-pointer'"
            @click="goToStep(item.step)">
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

    <!-- Antecedentes Gineco Obstétricos -->
    <div v-if="trabajadores.currentTrabajador.sexo === 'Femenino'" class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Gineco Obstétricos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(28)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MENARCA
            </td>
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.menarca }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(29)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DURACIÓN PROMEDIO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.duracionPromedio }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(30)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FRECUENCIA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.frecuencia }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(31)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              GESTAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.gestas }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(32)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PARTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.partos }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(33)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CESÁREAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.cesareas }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(34)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ABORTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.abortos }}
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
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(35)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FECHA ULTIMA REGLA
            </td>
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.fechaUltimaRegla }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(36)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CANTIDAD DE SANGRE
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.cantidadDeSangre }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(37)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DOLOR MENSTRUAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.dolorMenstrual }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(38)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EMBARAZO ACTUAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.embarazoActual }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(39)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PLANIFICACIÓN FAMILIAR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.planificacionFamiliar }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(40)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              VIDA SEXUAL ACTIVA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.vidaSexualActiva }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(41)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ÚLTIMO PAPANICOLAOU
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.fechaUltimoPapanicolaou }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes Laborales -->
    <div class="w-full">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Laborales</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">#</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Empresa</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Puesto</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Antiguedad</th>
            <th class="text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center">Agentes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in antecedentesLaborales" :key="index"
            :class="index % 2 === 0 ? 'bg-gray-50 cursor-pointer' : 'bg-white cursor-pointer'"
            @click="goToStep(item.step)">
            <td class="w-1/10 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium text-center">{{ item.number }}</td>
            <td class="w-1/5 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.empresa] }}
            </td>
            <td class="w-1/5 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.puesto] }}
            </td>
            <td class="w-1/5 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.antiguedad] }}
            </td>
            <td class="w-2/5 text-xs sm:text-sm text-center px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica[item.agentes] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Antecedentes de Accidentes de Trabajo -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Antecedentes Laborales</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(45)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ACCIDENTES DE TRABAJO
            </td>
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.accidenteLaboral }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(45)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DESCRIPCIÓN ACCIDENTE
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.accidenteLaboralEspecificar }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(45)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DESCRIPCIÓN DEL DAÑO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.descripcionDelDano }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(45)">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SECUELAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300">
              {{ formData.formDataHistoriaClinica.secuelas }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumen de Historia Clínica -->
    <div class="w-full md:w-[calc(50%-0.5rem)]">
      <h2 class="text-lg font-semibold mb-1 text-center">Resumen de Historia Clínica</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <!-- Encabezado -->
          <tr class="bg-gray-200 cursor-pointer" @click="goToStep(46)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light text-center">
              RESUMEN
            </td>
          </tr>
          <!-- Fila combinada -->
          <tr class="bg-white cursor-pointer" @click="goToStep(46)">
            <td class="w-1/2 text-xs sm:text-sm px-2 py-0 border border-gray-300 text-center align-middle" rowspan="3"
              style="height: calc(3 * 1.3rem);">
              {{ formData.formDataHistoriaClinica.resumenHistoriaClinica }}
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
