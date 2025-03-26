<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExamenVista } = useFormDataStore();
const documentos = useDocumentosStore();

const ojoIzquierdoLejanaSinCorreccion = ref(20);
const ojoDerechoLejanaSinCorreccion = ref(20);
const sinCorreccionLejanaInterpretacion = ref('Visión normal');
const requiereLentesUsoGeneral = ref('No');

onMounted(() => {
  if(documentos.currentDocument) {
    ojoIzquierdoLejanaSinCorreccion.value = documentos.currentDocument.ojoIzquierdoLejanaSinCorreccion;
    ojoDerechoLejanaSinCorreccion.value = documentos.currentDocument.ojoDerechoLejanaSinCorreccion;
    sinCorreccionLejanaInterpretacion.value = documentos.currentDocument.sinCorreccionLejanaInterpretacion;
    requiereLentesUsoGeneral.value = documentos.currentDocument.requiereLentesUsoGeneral;
  }
});

onUnmounted(() => {
  formDataExamenVista.ojoIzquierdoLejanaSinCorreccion = ojoIzquierdoLejanaSinCorreccion.value;
  formDataExamenVista.ojoDerechoLejanaSinCorreccion = ojoDerechoLejanaSinCorreccion.value;
  formDataExamenVista.sinCorreccionLejanaInterpretacion = sinCorreccionLejanaInterpretacion.value;
  formDataExamenVista.requiereLentesUsoGeneral = requiereLentesUsoGeneral.value;
})

// Observa los cambios y actualiza el store y los campos relacionados
watch([ojoIzquierdoLejanaSinCorreccion, ojoDerechoLejanaSinCorreccion], () => {
  formDataExamenVista.ojoIzquierdoLejanaSinCorreccion = ojoIzquierdoLejanaSinCorreccion.value;
  formDataExamenVista.ojoDerechoLejanaSinCorreccion = ojoDerechoLejanaSinCorreccion.value;
  interpretarAgudezaVisualLejana();
});

// Función para interpretar la agudeza visual
function interpretarAgudezaVisualLejana() {
  const interpretacionOjoIzquierdo = obtenerInterpretacion(ojoIzquierdoLejanaSinCorreccion.value);
  const interpretacionOjoDerecho = obtenerInterpretacion(ojoDerechoLejanaSinCorreccion.value);

  // Actualiza la interpretación basada en el peor valor
  sinCorreccionLejanaInterpretacion.value = ojoIzquierdoLejanaSinCorreccion.value > ojoDerechoLejanaSinCorreccion.value
    ? interpretacionOjoIzquierdo
    : interpretacionOjoDerecho;

  formDataExamenVista.sinCorreccionLejanaInterpretacion = sinCorreccionLejanaInterpretacion.value;

  // Determina si requiere lentes
  requiereLentes();
}

// Función auxiliar para obtener la interpretación
function obtenerInterpretacion(valor) {
  if (valor >= 10 && valor <= 15) {
    return "Visión excepcional";
  } else if (valor >= 16 && valor <= 25) {
    return "Visión normal";
  } else if (valor >= 26 && valor <= 35) {
    return "Visión ligeramente reducida";
  } else if (valor >= 36 && valor <= 45) {
    return "Visión moderadamente reducida";
  } else if (valor >= 46 && valor <= 55) {
    return "Visión significativamente reducida";
  } else if (valor >= 56) {
    return "Visión muy reducida";
  }
  return "Valor fuera de rango";
}

// Función para determinar si requiere lentes
function requiereLentes() {
  if (ojoIzquierdoLejanaSinCorreccion.value <= 20 && ojoDerechoLejanaSinCorreccion.value <= 20) {
    requiereLentesUsoGeneral.value = "No";
  } else {
    requiereLentesUsoGeneral.value = "Si";
  }

  formDataExamenVista.requiereLentesUsoGeneral = requiereLentesUsoGeneral.value;
}
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
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
          value="20" step="5" min="10" max="200" readonly title="Medida base de agudeza visual. No editable." />
      </div>
      <p class="text-3xl">/</p>
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="ojoIzquierdoLejanaSinCorreccion" step="5" min="10" max="200" />
      </div>
    </div>

    <label for="ojoDerechoLejanaSinCorreccion">Ojo Derecho</label>
    <div class="flex space-x-4 mt-1 mb-4">
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
          value="20" step="5" min="10" max="200" readonly title="Medida base de agudeza visual. No editable." />
      </div>
      <p class="text-3xl">/</p>
      <div class="flex flex-col space-y-1">
        <input type="number"
          class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          v-model="ojoDerechoLejanaSinCorreccion" step="5" min="10" max="200" />
      </div>
    </div>

    <label for="">Interpretación</label>
    <input 
      type="text"
      class="w-full p-3 mt-1 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
      v-model="sinCorreccionLejanaInterpretacion"
      readonly
      title="Se determina automáticamente en función a la agudeza visual."
    >
  </div>
</template>
