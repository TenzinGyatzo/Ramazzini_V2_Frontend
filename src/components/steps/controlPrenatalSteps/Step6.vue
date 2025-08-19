<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const abortos = ref(0);
const abortosOtro = ref(4);

onMounted(() => {
    // Verificar si formDataControlPrenatal.abortos tiene un valor y establecerlo en abortos
    if (formDataControlPrenatal.abortos !== undefined) {
        if (formDataControlPrenatal.abortos >= 4) {
            abortos.value = 4; // Valor especial para "Otro"
            abortosOtro.value = formDataControlPrenatal.abortos;
        } else {
            abortos.value = formDataControlPrenatal.abortos;
        }
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para abortos
    if (formDataControlPrenatal.abortos === undefined) {    
        formDataControlPrenatal.abortos = abortos.value;
    }
});

// Sincronizar abortos con formData
watch([abortos, abortosOtro], ([newAbortos, newAbortosOtro]) => {
    if (newAbortos === 4) {
        formDataControlPrenatal.abortos = newAbortosOtro;
    } else {
        formDataControlPrenatal.abortos = newAbortos;
    }
});

// Computed para el texto a mostrar
const textoAbortos = computed(() => {
    if (abortos.value === 0) return '0 (Ninguno)';
    if (abortos.value === 1) return '1 aborto';
    if (abortos.value === 2) return '2 abortos';
    if (abortos.value === 3) return '3 abortos';
    if (abortos.value === 4) return `${abortosOtro.value} abortos`;
    return `${abortos.value} abortos`;
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    abortos.value = valor;
    if (valor !== 4) {
        abortosOtro.value = 4; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar el campo "Otro"
const manejarOtro = () => {
    abortos.value = 4;
};

// Función para obtener el valor a mostrar en el input
const valorInputOtro = computed(() => {
    return abortos.value === 4 ? abortosOtro.value : '';
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>ABORTOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿La trabajadora ha experimentado pérdidas de embarazo antes de las 20 semanas? En caso afirmativo, ¿cuántas?</p>
            
            <!-- Presets compactos (0-3) -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-2 gap-3">
                    <button
                        @click="seleccionarPreset(0)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="abortos === 0 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Ninguno
                    </button>
                    <button
                        @click="seleccionarPreset(1)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="abortos === 1 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        1 aborto
                    </button>
                    <button
                        @click="seleccionarPreset(2)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="abortos === 2 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        2 abortos
                    </button>
                    <button
                        @click="seleccionarPreset(3)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="abortos === 3 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        3 abortos
                    </button>
                </div>
            </div>

            <hr class="my-4">
            <!-- Campo "Otro" para valores ≥4 -->
            <div class="mb-4 flex items-center justify-center space-x-3">
                <button
                    @click="manejarOtro"
                    type="button"
                    class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                    :class="abortos === 4 
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                        : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                >
                    Otro...
                </button>
                <input
                    :value="abortos === 4 ? abortosOtro : ''"
                    @input="(e) => { if (abortos === 4) abortosOtro = Number(e.target.value) }"
                    type="number"
                    min="0"
                    max="12"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                    :class="abortos === 4 ? 'border-emerald-500 bg-emerald-50' : ''"
                    :disabled="abortos !== 4"
                    :placeholder="abortos === 4 ? '4' : ''"
                />
                <span class="text-gray-600 text-sm">abortos</span>
            </div>

            <!-- Resumen de selección -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p class="text-sm text-emerald-800 mb-2">
                    <span class="font-medium">✅ Abortos a registrar:</span>
                </p>
                <p class="text-2xl font-bold text-emerald-700 text-center">
                    {{ textoAbortos }}
                </p>
            </div>
        </div>
    </div>
</template>