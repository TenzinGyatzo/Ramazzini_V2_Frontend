<script setup>
import { watch, ref, onMounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

const empresaAnterior3 = ref('');
const puestoAnterior3 = ref('');
const antiguedadAnterior3 = ref('');
const agentesSeleccionados = ref([]);

onMounted(() => {
  // Verificar si formDataHistoriaClinica.agentesAnterior3 tiene un valor y establecerlo en agentesSeleccionados
  if (formDataHistoriaClinica.agentesAnterior3) {
    agentesSeleccionados.value = formDataHistoriaClinica.agentesAnterior3.split(', ');
  }
})

// Sincronizar empresaAnterior3 con formData
watch(empresaAnterior3, (newValue) => {
  formDataHistoriaClinica.empresaAnterior3 = newValue;
});
watch(puestoAnterior3, (newValue) => {
  formDataHistoriaClinica.puestoAnterior3 = newValue;
});
watch(antiguedadAnterior3, (newValue) => {
  formDataHistoriaClinica.antiguedadAnterior3 = newValue;
});

// Sincronizar agentesSeleccionados con formDataHistoriaClinica.agentesAnterior3
watch(agentesSeleccionados, (newValue) => {
  formDataHistoriaClinica.agentesAnterior3 = newValue.join(', ');
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Laborales</h1>
    <h2>TRABAJO ANTERIOR 3</h2>
    <!-- Pregunta principal -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800">Empresa:</p>
      <div class="font-light">
        <label class="flex items-center space-x-2">
          <input type="text"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="formDataHistoriaClinica.empresaAnterior3" placeholder="Ingrese el nombre de la empresa">
        </label>
      </div>
    </div>
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800">Puesto:</p>
      <div class="font-light">
        <label class="flex items-center space-x-2">
          <input type="text"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="formDataHistoriaClinica.puestoAnterior3" placeholder="Ingrese el puesto que ocupó">
        </label>
      </div>
    </div>
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800">Antigüedad:</p>
      <div class="font-light">
        <label class="flex items-center space-x-2">
          <input type="text"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="formDataHistoriaClinica.antiguedadAnterior3" placeholder="Duración en años y meses">
        </label>
      </div>
    </div>

    <div class="mt-4">
      <p class="font-medium mb-2 text-gray-800">Agentes:</p>
      <div class="grid grid-cols-1 gap-1 font-light">
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Ergonómicos" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Ergonómicos</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Ruido" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Ruido</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Polvos" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Polvos</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Químicos" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Químicos</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Psicosociales" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Psicosociales</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Temperaturas elevadas" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Temperaturas elevadas</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Temperaturas abatidas" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Temperaturas abatidas</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Vibraciones" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Vibraciones</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="Biológicos Infecciosos" v-model="agentesSeleccionados"
            class="form-checkbox accent-emerald-600" />
          <span>Biológicos Infecciosos</span>
        </label>
      </div>
    </div>
  </div>
</template>
