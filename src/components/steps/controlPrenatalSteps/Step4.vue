<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const partos = ref(0);
const partosOtro = ref(6);

onMounted(() => {
    // Verificar si formDataControlPrenatal.partos tiene un valor y establecerlo en partos
    if (formDataControlPrenatal.partos !== undefined) {
        if (formDataControlPrenatal.partos >= 6) {
            partos.value = 6; // Valor especial para "Otro"
            partosOtro.value = formDataControlPrenatal.partos;
        } else {
            partos.value = formDataControlPrenatal.partos;
        }
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para partos
    if (formDataControlPrenatal.partos === undefined) {
        formDataControlPrenatal.partos = partos.value;
    }
});

// Sincronizar partos con formData
watch([partos, partosOtro], ([newPartos, newPartosOtro]) => {
    if (newPartos === 6) {
        formDataControlPrenatal.partos = newPartosOtro;
    } else {
        formDataControlPrenatal.partos = newPartos;
    }
});

// Computed para el texto a mostrar
const textoPartos = computed(() => {
    if (partos.value === 0) return '0 (Ninguno)';
    if (partos.value === 1) return '1 parto';
    if (partos.value === 2) return '2 partos';
    if (partos.value === 3) return '3 partos';
    if (partos.value === 4) return '4 partos';
    if (partos.value === 5) return '5 partos';
    if (partos.value === 6) return `${partosOtro.value} partos`;
    return `${partos.value} partos`;
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    partos.value = valor;
    if (valor !== 6) {
        partosOtro.value = 6; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar el campo "Otro"
const manejarOtro = () => {
    partos.value = 6;
};

// Función para obtener el valor a mostrar en el input
const valorInputOtro = computed(() => {
    return partos.value === 6 ? partosOtro.value : '';
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>PARTOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuántos partos completos ha tenido la trabajadora?</p>
            
            <!-- Presets compactos (0-5) -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-3 gap-3">
                    <button
                        @click="seleccionarPreset(0)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 0 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Ninguno
                    </button>
                    <button
                        @click="seleccionarPreset(1)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 1 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        1 parto
                    </button>
                    <button
                        @click="seleccionarPreset(2)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 2 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        2 partos
                    </button>
                    <button
                        @click="seleccionarPreset(3)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 3 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        3 partos
                    </button>
                    <button
                        @click="seleccionarPreset(4)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 4 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        4 partos
                    </button>
                    <button
                        @click="seleccionarPreset(5)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="partos === 5 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        5 partos
                    </button>
                </div>
            </div>

            <hr class="my-4">
            <!-- Campo "Otro" para valores ≥6 -->
            <div class="flex items-center justify-center space-x-3">
                <button
                    @click="manejarOtro"
                    type="button"
                    class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                    :class="partos === 6 
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                        : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                >
                    Otro...
                </button>
                <input
                    :value="partos === 6 ? partosOtro : ''"
                    @input="(e) => { if (partos === 6) partosOtro = Number(e.target.value) }"
                    type="number"
                    min="0"
                    max="12"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                    :class="partos === 6 ? 'border-emerald-500 bg-emerald-50' : ''"
                    :disabled="partos !== 6"
                    :placeholder="partos === 6 ? '6' : ''"
                />
                <span class="text-gray-600 text-sm">partos</span>
            </div>

            <!-- Resumen de selección -->
            <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Selección actual: </span> 
                    <span class="text-emerald-700 font-semibold"> {{ textoPartos }}</span>
                </p>
            </div>
        </div>
    </div>
</template>