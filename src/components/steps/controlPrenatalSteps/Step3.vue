<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const gestas = ref(0);
const gestasOtro = ref(6);

onMounted(() => {
    // Verificar si formDataControlPrenatal.gestas tiene un valor y establecerlo en gestas
    if (formDataControlPrenatal.gestas !== undefined) {
        if (formDataControlPrenatal.gestas >= 6) {
            gestas.value = 6; // Valor especial para "Otro"
            gestasOtro.value = formDataControlPrenatal.gestas;
        } else {
            gestas.value = formDataControlPrenatal.gestas;
        }
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para gestas
    if (formDataControlPrenatal.gestas === undefined) {
        formDataControlPrenatal.gestas = gestas.value;
    }
});

// Sincronizar gestas con formData
watch([gestas, gestasOtro], ([newGestas, newGestasOtro]) => {
    if (newGestas === 6) {
        formDataControlPrenatal.gestas = newGestasOtro;
    } else {
        formDataControlPrenatal.gestas = newGestas;
    }
});

// Computed para el texto a mostrar
const textoGestas = computed(() => {
    if (gestas.value === 0) return '0 (Ninguna)';
    if (gestas.value === 1) return '1 gesta';
    if (gestas.value === 2) return '2 gestas';
    if (gestas.value === 3) return '3 gestas';
    if (gestas.value === 4) return '4 gestas';
    if (gestas.value === 5) return '5 gestas';
    if (gestas.value === 6) return `${gestasOtro.value} gestas`;
    return `${gestas.value} gestas`;
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    gestas.value = valor;
    if (valor !== 6) {
        gestasOtro.value = 6; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar el campo "Otro"
const manejarOtro = () => {
    gestas.value = 6;
};

// Función para obtener el valor a mostrar en el input
const valorInputOtro = computed(() => {
    return gestas.value === 6 ? gestasOtro.value : '';
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>GESTAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuántos embarazos ha tenido la trabajadora, incluyendo el actual si lo hay?</p>
            
            <!-- Presets compactos (0-5) -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-3 gap-3">
                    <button
                        @click="seleccionarPreset(0)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 0 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Ninguna
                    </button>
                    <button
                        @click="seleccionarPreset(1)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 1 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        1 gesta
                    </button>
                    <button
                        @click="seleccionarPreset(2)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 2 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        2 gestas
                    </button>
                    <button
                        @click="seleccionarPreset(3)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 3 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        3 gestas
                    </button>
                    <button
                        @click="seleccionarPreset(4)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 4 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        4 gestas
                    </button>
                    <button
                        @click="seleccionarPreset(5)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 5 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        5 gestas
                    </button>
                </div>
            </div>

            <hr class="my-4">

            <!-- Campo "Otro" para valores ≥6 -->
            <div class="mb-4">
                <div class="flex items-center justify-center gap-3">
                    <button
                        @click="manejarOtro"
                        type="button"
                        class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="gestas === 6 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Otro...
                    </button>
                    <input
                        :value="gestas === 6 ? gestasOtro : ''"
                        @input="(e) => { if (gestas === 6) gestasOtro = Number(e.target.value) }"
                        type="number"
                        min="0"
                        max="12"
                        class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                        :class="gestas === 6 ? 'border-emerald-500 bg-emerald-50' : ''"
                        :disabled="gestas !== 6"
                        :placeholder="gestas === 6 ? '6' : ''"
                    />
                    <span class="text-gray-600 text-sm">gestas</span>
                </div>
            </div>

            <!-- Resumen de selección -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p class="text-sm text-emerald-800 mb-2">
                    <span class="font-medium">✅ Gestas a registrar:</span>
                </p>
                <p class="text-2xl font-bold text-emerald-700 text-center">
                    {{ textoGestas }}
                </p>
            </div>
        </div>
    </div>
</template>