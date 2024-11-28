<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataExamenVista } = useFormDataStore();

const ojoIzquierdoCercanaConCorreccion = ref(20);
const ojoDerechoCercanaConCorreccion = ref(20);
const conCorreccionCercanaInterpretacion = ref('Visión Normal');
const usaLentes = ref('No');

onUnmounted(() => {
  if (usaLentes.value === 'No') {
    formDataExamenVista.ojoIzquierdoCercanaConCorreccion = undefined;
    formDataExamenVista.ojoDerechoCercanaConCorreccion = undefined;
    formDataExamenVista.conCorreccionCercanaInterpretacion = undefined;
  } else {
    formDataExamenVista.ojoIzquierdoCercanaConCorreccion = ojoIzquierdoCercanaConCorreccion.value;
    formDataExamenVista.ojoDerechoCercanaConCorreccion = ojoDerechoCercanaConCorreccion.value;
    formDataExamenVista.conCorreccionCercanaInterpretacion = conCorreccionCercanaInterpretacion.value;    
  }
})

// Observa el cambio de usaLentes
watch(usaLentes, (newVal) => {
  if (newVal === 'Si') {
    // Sincroniza los valores del formulario
    formDataExamenVista.ojoIzquierdoCercanaConCorreccion = ojoIzquierdoCercanaConCorreccion.value;
    formDataExamenVista.ojoDerechoCercanaConCorreccion = ojoDerechoCercanaConCorreccion.value;
    formDataExamenVista.conCorreccionCercanaInterpretacion = conCorreccionCercanaInterpretacion.value;
    ojoIzquierdoCercanaConCorreccion.value = formDataExamenVista.ojoIzquierdoCercanaConCorreccion || 20;
    ojoDerechoCercanaConCorreccion.value = formDataExamenVista.ojoDerechoCercanaConCorreccion || 20;
    conCorreccionCercanaInterpretacion.value = formDataExamenVista.conCorreccionCercanaInterpretacion || 'Visión Normal';
  } else {
    // Limpia los valores si no usa lentes
    ojoIzquierdoCercanaConCorreccion.value = undefined;
    ojoDerechoCercanaConCorreccion.value = undefined;
    conCorreccionCercanaInterpretacion.value = undefined;
    formDataExamenVista.ojoIzquierdoCercanaConCorreccion = undefined;
    formDataExamenVista.ojoDerechoCercanaConCorreccion = undefined;
    formDataExamenVista.conCorreccionCercanaInterpretacion = undefined;
  }
});

// Observa los cambios y actualiza el store y los campos relacionados
watch([ojoIzquierdoCercanaConCorreccion, ojoDerechoCercanaConCorreccion], () => {
  formDataExamenVista.ojoIzquierdoCercanaConCorreccion = ojoIzquierdoCercanaConCorreccion.value;
  formDataExamenVista.ojoDerechoCercanaConCorreccion = ojoDerechoCercanaConCorreccion.value;
  interpretarAgudezaVisualCercana();
});

// Función para interpretar la agudeza visual
function interpretarAgudezaVisualCercana() {
  const interpretacionOjoIzquierdo = obtenerInterpretacion(ojoIzquierdoCercanaConCorreccion.value);
  const interpretacionOjoDerecho = obtenerInterpretacion(ojoDerechoCercanaConCorreccion.value);

  // Actualiza la interpretación basada en el peor valor
  conCorreccionCercanaInterpretacion.value = ojoIzquierdoCercanaConCorreccion.value > ojoDerechoCercanaConCorreccion.value
    ? interpretacionOjoIzquierdo
    : interpretacionOjoDerecho;

  formDataExamenVista.conCorreccionCercanaInterpretacion = conCorreccionCercanaInterpretacion.value;
}

// Función auxiliar para obtener la interpretación
function obtenerInterpretacion(valor) {
  if (valor == 10) {
    return "Visión excepcional";
  } else if (valor == 20) {
    return "Visión normal";
  } else if (valor == 30) {
    return "Visión ligeramente reducida";
  } else if (valor == 40) {
    return "Visión moderadamente reducida";
  } else if (valor == 50) {
    return "Visión significativamente reducida";
  } else if (valor >= 60) {
    return "Visión muy reducida";
  }
  return "NA";
}
</script>

<template>
  <div>
    <h1 class="font-bold text-gray-800 ">Agudeza Visual</h1>
    <h1 class="font-bold mb-4 text-gray-800">CON CORRECCIÓN</h1>
    <h2 class="mb-4">CERCANA (CARTA SCHNELLEN)</h2>

    <!-- Pregunta Inicial -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800 leading-5">
        ¿La persona usa lentes?
      </p>
      <div class="flex items-center space-x-6 font-light">
        <label class="flex items-center space-x-2">
          <input type="radio" value="No" v-model="usaLentes" class="form-radio accent-emerald-600" />
          <span>No</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Si" v-model="usaLentes" class="form-radio accent-emerald-600" />
          <span>Si</span>
        </label>
      </div>
    </div>

    <div v-if="usaLentes === 'Si'">
      <label for="ojoIzquierdoCercanaConCorreccion">Ojo Izquierdo</label>
      <div class="flex space-x-4 mt-1 mb-4">
        <div class="flex flex-col space-y-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value="20" step="10" min="10" max="200" readonly />
        </div>
        <p class="text-3xl">/</p>
        <div class="flex flex-col space-y-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="ojoIzquierdoCercanaConCorreccion" step="10" min="10" max="200" />
        </div>
      </div>

      <label for="ojoDerechoCercanaConCorreccion">Ojo Derecho</label>
      <div class="flex space-x-4 mt-1 mb-4">
        <div class="flex flex-col space-y-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value="20" step="10" min="10" max="200" readonly />
        </div>
        <p class="text-3xl">/</p>
        <div class="flex flex-col space-y-1">
          <input type="number"
            class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            v-model="ojoDerechoCercanaConCorreccion" step="10" min="10" max="200" />
        </div>
      </div>

      <label for="">Interpretación</label>
      <input type="text"
        class="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        v-model="conCorreccionCercanaInterpretacion" readonly>
    </div>
  </div>
</template>
