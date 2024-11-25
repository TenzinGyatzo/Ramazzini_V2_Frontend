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
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-7 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-lg mx-auto"
  >
    <h2 class="text-lg font-semibold mb-4">Información del Documento</h2>
    <table class="table-auto w-full border-collapse border border-gray-200">
      <thead>
        <tr class="bg-gray-200">
          <th class="px-2 py-1 border w-1/2 border-gray-300 text-left">Campo</th>
          <th class="px-2 py-1 border border-gray-300 text-left">Valor</th>
        </tr>
      </thead>
      <transition-group
        tag="tbody"
        name="fade"
        class="transition-group"
      >
        <tr 
          v-for="(value, key) in formData.formDataAntidoping" 
          :key="key" 
          class="odd:bg-white even:bg-gray-50"
        >
          <td class="px-2 py-1 border border-gray-300 font-medium">{{ formatKey(key) }}</td>
          <td class="px-2 py-1 border border-gray-300">
            <!-- Transición para el Value -->
            <transition name="value-change" mode="out-in">
              <span :key="value">{{ value }}</span>
            </transition>
          </td>
        </tr>

      </transition-group>
    </table>
  </div>
</template>

<style>
/* Transiciones personalizadas */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Transiciones para los valores */
.value-change-enter-active, .value-change-leave-active {
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
