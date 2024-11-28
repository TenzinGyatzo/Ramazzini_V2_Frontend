<script setup>
import { ref, watch, onMounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataExamenVista } = useFormDataStore();

const ojoIzquierdoLejanaSinCorreccion = ref(20);
const ojoDerechoLejanaSinCorreccion = ref(20);

onMounted(() => {
  formDataExamenVista.ojoIzquierdoLejanaSinCorreccion = ojoIzquierdoLejanaSinCorreccion.value;
  formDataExamenVista.ojoDerechoLejanaSinCorreccion = ojoDerechoLejanaSinCorreccion.value;
})

watch(ojoIzquierdoLejanaSinCorreccion, (newValue) => {
  formDataExamenVista.ojoIzquierdoLejanaSinCorreccion = newValue;
})

watch(ojoDerechoLejanaSinCorreccion, (newValue) => {
  formDataExamenVista.ojoDerechoLejanaSinCorreccion = newValue;
})

</script>

<template>
  <div>
    <h1 class="font-bold text-gray-800 ">Agudeza Visual</h1>
    <h1 class="font-bold mb-4 text-gray-800">SIN CORRECCIÓN</h1>
    <h2 class="mb-4">LEJANA (CARTA SCHNELLEN)</h2>
    <label for="ojoIzquierdoLejanaSinCorreccion">Ojo Izquierdo</label>
    <div class="flex space-x-4 mt-1 mb-4">
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          value="20" step="10" min="0" max="200" readonly />
      </div>
      <p class="text-3xl">/</p>
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="formDataExamenVista.ojoIzquierdoLejanaSinCorreccion" step="10" min="0" max="200" />
      </div>
    </div>

    <label for="ojoDerechoLejanaSinCorreccion">Ojo Derecho</label>
    <div class="flex space-x-4 mt-1">
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          value="20" step="10" min="0" max="200" readonly />
      </div>
      <p class="text-3xl">/</p>
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="formDataExamenVista.ojoDerechoLejanaSinCorreccion" step="10" min="0" max="200" />
      </div>
    </div>
  </div>
</template>
