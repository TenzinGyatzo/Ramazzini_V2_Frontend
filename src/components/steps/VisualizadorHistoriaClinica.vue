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
    <div v-if="formData.formDataHistoriaClinica.nefropatias" class="w-full md:w-1/2">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Heredofamiliares</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm  px-2 py-0 border w-3/5 border-gray-300 text-left">Campo</th>
            <th class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 text-left">Valor</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="fade" class="transition-group">
          <tr v-for="([key, value], index) in Object.entries(formData.formDataHistoriaClinica).slice(2, 22)" :key="key"
            class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300">
              <!-- Transición para el Value -->
              <transition name="value-change" mode="out-in">
                <span :key="value">{{ value }}</span>
              </transition>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>

    <!-- Antecedentes Personales Patológicos -->
    <div v-if="formData.formDataHistoriaClinica.lumbalgias" class="w-full md:w-[calc(50%-1rem)]">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm  px-2 py-0 border w-3/5 border-gray-300 text-left">Campo</th>
            <th class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 text-left">Valor</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="fade" class="transition-group">
          <tr v-for="([key, value], index) in Object.entries(formData.formDataHistoriaClinica).slice(22, 42)" :key="key"
            class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300">
              <!-- Transición para el Value -->
              <transition name="value-change" mode="out-in">
                <span :key="value">{{ value }}</span>
              </transition>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>

    <!-- Antecedentes Personales No Patológicos -->
    <div v-if="formData.formDataHistoriaClinica.alcoholismo" class="w-full md:w-1/2">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales No Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm  px-2 py-0 border w-3/5 border-gray-300 text-left">Campo</th>
            <th class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 text-left">Valor</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="fade" class="transition-group">
          <tr v-for="([key, value], index) in Object.entries(formData.formDataHistoriaClinica).slice(42, 48)" :key="key"
            class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300">
              <!-- Transición para el Value -->
              <transition name="value-change" mode="out-in">
                <span :key="value">{{ value }}</span>
              </transition>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>

    <!-- Antecedentes Personales No Patológicos Parte 2 -->
    <div v-if="formData.formDataHistoriaClinica.alimentacionDeficiente" class="w-full md:w-[calc(50%-1rem)]">
      <h2 class="text-lg font-semibold mb-1">Antecedentes Personales No Patológicos</h2>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="text-xs sm:text-sm  px-2 py-0 border w-3/5 border-gray-300 text-left">Campo</th>
            <th class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 text-left">Valor</th>
          </tr>
        </thead>
        <transition-group tag="tbody" name="fade" class="transition-group">
          <tr v-for="([key, value], index) in Object.entries(formData.formDataHistoriaClinica).slice(48, 54)" :key="key"
            class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
            <td class="text-xs sm:text-sm  px-2 py-0 border border-gray-300">
              <!-- Transición para el Value -->
              <transition name="value-change" mode="out-in">
                <span :key="value">{{ value }}</span>
              </transition>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>
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
