<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataExamenVista } = useFormDataStore();

const ojoIzquierdoCercanaSinCorreccion = ref(20);
const ojoDerechoCercanaSinCorreccion = ref(20);
const sinCorreccionCercanaInterpretacion = ref('Visión Normal');
const requiereLentesParaLectura = ref('No');

onUnmounted(() => {
  formDataExamenVista.ojoIzquierdoCercanaSinCorreccion = ojoIzquierdoCercanaSinCorreccion.value;
  formDataExamenVista.ojoDerechoCercanaSinCorreccion = ojoDerechoCercanaSinCorreccion.value;
  formDataExamenVista.sinCorreccionCercanaInterpretacion = sinCorreccionCercanaInterpretacion.value;
  formDataExamenVista.requiereLentesParaLectura = requiereLentesParaLectura.value;
})

// Observa los cambios y actualiza el store y los campos relacionados
watch([ojoIzquierdoCercanaSinCorreccion, ojoDerechoCercanaSinCorreccion], () => {
  formDataExamenVista.ojoIzquierdoCercanaSinCorreccion = ojoIzquierdoCercanaSinCorreccion.value;
  formDataExamenVista.ojoDerechoCercanaSinCorreccion = ojoDerechoCercanaSinCorreccion.value;
  interpretarAgudezaVisualCercana();
});

// Función para interpretar la agudeza visual
function interpretarAgudezaVisualCercana() {
  const interpretacionOjoIzquierdo = obtenerInterpretacion(ojoIzquierdoCercanaSinCorreccion.value);
  const interpretacionOjoDerecho = obtenerInterpretacion(ojoDerechoCercanaSinCorreccion.value);

  // Actualiza la interpretación basada en el peor valor
  sinCorreccionCercanaInterpretacion.value = ojoIzquierdoCercanaSinCorreccion.value > ojoDerechoCercanaSinCorreccion.value
    ? interpretacionOjoIzquierdo
    : interpretacionOjoDerecho;

  formDataExamenVista.sinCorreccionCercanaInterpretacion = sinCorreccionCercanaInterpretacion.value;

  // Determina si requiere lentes
  requiereLentesLectura();
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
  return "Valor fuera de rango";
}

// Función para determinar si requiere lentes
function requiereLentesLectura() {
  if (ojoIzquierdoCercanaSinCorreccion.value <= 20 && ojoDerechoCercanaSinCorreccion.value <= 20) {
    requiereLentesParaLectura.value = "No";
  } else {
    requiereLentesParaLectura.value = "Si";
  }

  formDataExamenVista.requiereLentesParaLectura = requiereLentesParaLectura.value;
}
</script>

<template>
  <div>
    <h1 class="font-bold text-gray-800 ">Agudeza Visual</h1>
    <h1 class="font-bold mb-4 text-gray-800">SIN CORRECCIÓN</h1>
    <h2 class="mb-4">CERCANA (CARTA JAEGER)</h2>

    <label for="ojoIzquierdoCercanaSinCorreccion">Ojo Izquierdo</label>
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
          v-model="ojoIzquierdoCercanaSinCorreccion" step="10" min="10" max="200" />
      </div>
    </div>

    <label for="ojoDerechoCercanaSinCorreccion">Ojo Derecho</label>
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
          v-model="ojoDerechoCercanaSinCorreccion" step="10" min="10" max="200" />
      </div>
    </div>

    <label for="">Interpretación</label>
    <input 
      type="text"
      class="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      v-model="sinCorreccionCercanaInterpretacion"
      readonly
    >
  </div>
</template>
