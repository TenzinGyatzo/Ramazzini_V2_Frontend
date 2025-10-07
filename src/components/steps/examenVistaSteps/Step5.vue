<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataExamenVista } = useFormDataStore();
const documentos = useDocumentosStore();

const ojoIzquierdoCercanaConCorreccion = ref(20);
const ojoDerechoCercanaConCorreccion = ref(20);
const conCorreccionCercanaInterpretacion = ref('Visión normal');
const usaLentes = ref('No');

// Computed properties para validaciones y mensajes de error
const mensajeErrorOjoIzquierdo = computed(() => {
  if (usaLentes.value === 'No') return '';
  return ojoIzquierdoCercanaConCorreccion.value < 10 
    ? 'Debe ser mínimo 10' 
    : ojoIzquierdoCercanaConCorreccion.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

const mensajeErrorOjoDerecho = computed(() => {
  if (usaLentes.value === 'No') return '';
  return ojoDerechoCercanaConCorreccion.value < 10 
    ? 'Debe ser mínimo 10' 
    : ojoDerechoCercanaConCorreccion.value > 200 
      ? 'Debe ser máximo 200' 
      : '';
});

// Computed property para determinar el color de semaforización de la interpretación
const colorInterpretacion = computed(() => {
  if (usaLentes.value === 'No') return 'bg-gray-50 text-gray-800';
  
  const interpretacion = conCorreccionCercanaInterpretacion.value;
  
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

onMounted(() => {
  if (documentos.currentDocument) {
    if (documentos.currentDocument.conCorreccionCercanaInterpretacion) {
      ojoIzquierdoCercanaConCorreccion.value = documentos.currentDocument.ojoIzquierdoCercanaConCorreccion;
      ojoDerechoCercanaConCorreccion.value = documentos.currentDocument.ojoDerechoCercanaConCorreccion;
      conCorreccionCercanaInterpretacion.value = documentos.currentDocument.conCorreccionCercanaInterpretacion;
      usaLentes.value = 'Si';
    }
  }
});

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
});

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
  return "NA";
}
</script>

<template>
  <div>
    <!-- Jerarquía Visual Mejorada -->
    <h1 class="text-2xl font-bold mb-4 text-gray-900">AGUDEZA VISUAL <br>CON CORRECCIÓN</h1>
    <h3 class="text-lg font-medium mb-6 text-gray-700">CERCANA (CARTA JAEGER)</h3>

    <!-- Pregunta Inicial con Diseño Mejorado -->
    <div class="mb-8">
      <p class="text-lg font-medium mb-4 text-gray-800">¿La persona usa lentes para leer?</p>
      
      <!-- Diseño de Radio Buttons más Visual tipo Card -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Opción No -->
        <label 
          :class="[
            'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            usaLentes === 'No' 
              ? 'border-emerald-600 bg-emerald-50 shadow-md' 
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input 
            type="radio" 
            value="No" 
            v-model="usaLentes" 
            class="sr-only" 
          />
          <!-- Icono -->
          <div 
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-200',
              usaLentes === 'No' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span 
            :class="[
              'text-base font-semibold transition-colors duration-200',
              usaLentes === 'No' ? 'text-emerald-700' : 'text-gray-700'
            ]"
          >
            No
          </span>
          <!-- Indicador de selección -->
          <div 
            v-if="usaLentes === 'No'"
            class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>

        <!-- Opción Si -->
        <label 
          :class="[
            'relative flex flex-col items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out',
            usaLentes === 'Si' 
              ? 'border-emerald-600 bg-emerald-50 shadow-md' 
              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm'
          ]"
        >
          <input 
            type="radio" 
            value="Si" 
            v-model="usaLentes" 
            class="sr-only" 
          />
          <!-- Icono -->
          <div 
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-200',
              usaLentes === 'Si' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span 
            :class="[
              'text-base font-semibold transition-colors duration-200',
              usaLentes === 'Si' ? 'text-emerald-700' : 'text-gray-700'
            ]"
          >
            Sí
          </span>
          <!-- Indicador de selección -->
          <div 
            v-if="usaLentes === 'Si'"
            class="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </label>
      </div>
    </div>

    <!-- Campos de agudeza visual con transición -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-2"
    >
      <div v-if="usaLentes === 'Si'">
        <!-- Ojo Izquierdo -->
        <div class="mb-6">
          <label for="ojoIzquierdoCercanaConCorreccion" class="block text-lg font-normal text-gray-800 mb-3">
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
                v-model="ojoIzquierdoCercanaConCorreccion" 
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
          <label for="ojoDerechoCercanaConCorreccion" class="block text-lg font-normal text-gray-800 mb-3">
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
                v-model="ojoDerechoCercanaConCorreccion" 
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
              v-model="conCorreccionCercanaInterpretacion"
              readonly
              title="Se determina automáticamente en función a la agudeza visual."
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
