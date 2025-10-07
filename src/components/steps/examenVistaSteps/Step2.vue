<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
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

// Computed properties para validaciones y mensajes de error
const mensajeErrorOjoIzquierdo = computed(() => {
  return ojoIzquierdoLejanaSinCorreccion.value < 10 
    ? 'Debe ser mínimo 10' 
    : ojoIzquierdoLejanaSinCorreccion.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

const mensajeErrorOjoDerecho = computed(() => {
  return ojoDerechoLejanaSinCorreccion.value < 10 
    ? 'Debe ser mínimo 10' 
    : ojoDerechoLejanaSinCorreccion.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

// Computed property para determinar el color de semaforización de la interpretación
const colorInterpretacion = computed(() => {
  const interpretacion = sinCorreccionLejanaInterpretacion.value;
  
  if (interpretacion === 'Visión excepcional' || interpretacion === 'Visión normal') {
    return 'bg-emerald-50 text-emerald-800';
  } else if (interpretacion === 'Visión ligeramente reducida') {
    return 'bg-yellow-50 text-yellow-800';
  } else if (interpretacion === 'Visión moderadamente reducida' || interpretacion === 'Visión significativamente reducida') {
    return 'bg-orange-50 text-orange-800';
  } else if (interpretacion === 'Visión muy reducida') {
    return 'bg-red-100 text-red-900';
  } else {
    return 'bg-gray-50 text-gray-800';
  }
});

</script>

<template>
  <div>
    <!-- Jerarquía Visual Mejorada -->
    <h1 class="text-2xl font-bold mb-4 text-gray-900">AGUDEZA VISUAL <br>SIN CORRECCIÓN</h1>
    <h3 class="text-lg font-medium mb-6 text-gray-700">LEJANA (CARTA SCHNELLEN)</h3>

    <!-- Ojo Izquierdo -->
    <div class="mb-6">
       <label for="ojoIzquierdoLejanaSinCorreccion" class="block text-lg font-normal text-gray-800 mb-3">
         Ojo Izquierdo
       </label>
       <div class="flex space-x-4 mt-1 mb-4">
         <div class="flex flex-col space-y-1">
           <input 
             type="number"
             class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
             value="20" 
             step="5" 
             min="10" 
             max="200" 
             readonly 
             title="Medida base de agudeza visual. No editable." 
           />
         </div>
         <p class="text-3xl">/</p>
         <div class="flex flex-col space-y-1">
           <input 
             type="number"
             class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
             v-model="ojoIzquierdoLejanaSinCorreccion" 
             step="5" 
             min="10" 
             max="200"
             placeholder="20"
           />
         </div>
       </div>
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 transform -translate-y-1"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-1"
      >
        <p v-if="mensajeErrorOjoIzquierdo" class="text-red-600 text-sm mt-2 font-medium">
          ⚠️ {{ mensajeErrorOjoIzquierdo }}
        </p>
      </transition>
    </div>

    <!-- Ojo Derecho -->
    <div class="mb-6">
       <label for="ojoDerechoLejanaSinCorreccion" class="block text-lg font-normal text-gray-800 mb-3">
         Ojo Derecho
       </label>
       <div class="flex space-x-4 mt-1 mb-4">
         <div class="flex flex-col space-y-1">
           <input 
             type="number"
             class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-100 cursor-default"
             value="20" 
             step="5" 
             min="10" 
             max="200" 
             readonly 
             title="Medida base de agudeza visual. No editable." 
           />
         </div>
         <p class="text-3xl">/</p>
         <div class="flex flex-col space-y-1">
           <input 
             type="number"
             class="w-full p-1.5 text-center border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
             v-model="ojoDerechoLejanaSinCorreccion" 
             step="5" 
             min="10" 
             max="200"
             placeholder="20"
           />
         </div>
       </div>
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 transform -translate-y-1"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-1"
      >
        <p v-if="mensajeErrorOjoDerecho" class="text-red-600 text-sm mt-2 font-medium">
          ⚠️ {{ mensajeErrorOjoDerecho }}
        </p>
      </transition>
    </div>

    <!-- Interpretación con Semaforización -->
    <div class="mb-4">
       <label class="block text-lg font-normal text-gray-800 mb-3">
         Interpretación
       </label>
      <div class="relative">
        <input 
          type="text"
          :class="[
            'w-full p-3 text-center border-2 border-gray-200 rounded-lg cursor-not-allowed font-semibold',
            colorInterpretacion
          ]"
          v-model="sinCorreccionLejanaInterpretacion"
          readonly
          title="Se determina automáticamente en función a la agudeza visual."
        />
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconoInterpretacion" />
          </svg>
        </div>
      </div>
    </div>

  </div>
</template>
