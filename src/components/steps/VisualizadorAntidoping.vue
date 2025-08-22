<script setup>
import { formatDateDDMMYYYY } from '@/helpers/dates';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';

const formData = useFormDataStore();
const steps = useStepsStore();

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

</script>

<template>
  <div
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-7 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-lg mx-auto">
    <h2 class="text-lg font-medium mb-4">Información del Documento</h2>
    <table class="table-auto w-full border-collapse border border-gray-200">
      <thead>
        <tr class="bg-gray-200">
          <th class="px-2 py-1 border w-1/2 border-gray-300 text-left">Campo</th>
          <th class="px-2 py-1 border border-gray-300 text-left">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(1)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Fecha Antidoping</td>
          <td class="px-2 py-1 border border-gray-300">{{ formatDateDDMMYYYY(formData.formDataAntidoping.fechaAntidoping) }}</td>
        </tr>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Marihuana</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.marihuana }}</td>
        </tr>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Cocaína</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.cocaina }}</td>
        </tr>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Anfetaminas</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.anfetaminas }}</td>
        </tr>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Metanfetaminas</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.metanfetaminas }}</td>
        </tr>
        <tr class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Opiáceos</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.opiaceos }}</td>
        </tr>
        <tr v-if="formData.formDataAntidoping.benzodiacepinas" 
          class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Benzodiacepinas</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.benzodiacepinas }}</td>
        </tr>
        <tr v-if="formData.formDataAntidoping.fenciclidina" 
          class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Fenciclidina</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.fenciclidina }}</td>
        </tr>
        <tr v-if="formData.formDataAntidoping.metadona" 
          class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Metadona</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.metadona }}</td>
        </tr>
        <tr v-if="formData.formDataAntidoping.barbituricos" 
          class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Barbituricos</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.barbituricos }}</td>
        </tr>
        <tr v-if="formData.formDataAntidoping.antidepresivosTriciclicos" 
          class="odd:bg-white even:bg-gray-50 cursor-pointer" @click="goToStep(2)">
          <td class="px-2 py-1 border border-gray-300 font-medium">Antidepresivos T.</td>
          <td class="px-2 py-1 border border-gray-300">{{ formData.formDataAntidoping.antidepresivosTriciclicos }}</td>
        </tr>
      </tbody>

    </table>
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