<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const menarca = ref(12);
const menarcaOtro = ref(17);

onMounted(() => {
    // Verificar si formDataControlPrenatal.menarca tiene un valor y establecerlo
    if (formDataControlPrenatal.menarca) {
        const valor = formDataControlPrenatal.menarca;
        if (valor >= 9 && valor <= 16) {
            menarca.value = valor;
        } else {
            menarca.value = 17; // "Otro..."
            menarcaOtro.value = valor;
        }
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para menarca
    if (!formDataControlPrenatal.menarca) {
        formDataControlPrenatal.menarca = menarca.value === 17 ? menarcaOtro.value : menarca.value;
    }
});

// Sincronizar menarca con formData
watch([menarca, menarcaOtro], ([newMenarca, newMenarcaOtro]) => {
    formDataControlPrenatal.menarca = newMenarca === 17 ? newMenarcaOtro : newMenarca;
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    menarca.value = valor;
    if (valor !== 17) {
        menarcaOtro.value = 17; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar la opción "Otro..."
const manejarOtro = () => {
    menarca.value = 17;
};

// Texto descriptivo para mostrar
const textoMenarca = computed(() => {
    if (menarca.value === 17) {
        return `${menarcaOtro.value} años`;
    }
    return `${menarca.value} años`;
});

// Valor para el input "Otro..."
const valorInputOtro = computed(() => {
    return menarca.value === 17 ? menarcaOtro.value : '';
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>MENARCA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿A que edad experimentó la trabajadora su primera menstruación?</p>
            
            <!-- Presets compactos (9-16 años) -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-4 gap-3">
                    <button
                        @click="seleccionarPreset(9)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 9 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        9 años
                    </button>
                    <button
                        @click="seleccionarPreset(10)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 10 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        10 años
                    </button>
                    <button
                        @click="seleccionarPreset(11)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 11 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        11 años
                    </button>
                    <button
                        @click="seleccionarPreset(12)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 12 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        12 años
                    </button>
                    <button
                        @click="seleccionarPreset(13)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 13 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        13 años
                    </button>
                    <button
                        @click="seleccionarPreset(14)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 14 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        14 años
                    </button>
                    <button
                        @click="seleccionarPreset(15)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 15 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        15 años
                    </button>
                    <button
                        @click="seleccionarPreset(16)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="menarca === 16 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        16 años
                    </button>
                </div>
            </div>

            <hr class="my-4 border-gray-300">

            <!-- Opción "Otro..." con input numérico -->
            <div class="mb-4">
                <div class="flex items-center justify-center gap-3">
                    <button
                        @click="manejarOtro"
                        type="button"
                        class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="menarca === 17 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Otro...
                    </button>    
                    <input
                        :value="menarca === 17 ? menarcaOtro : ''"
                        @input="(e) => { if (menarca === 17) menarcaOtro = Number(e.target.value) }"
                        type="number"
                        min="7"
                        max="20"
                        class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                        :class="menarca === 17 ? 'border-emerald-500 bg-emerald-50' : ''"
                        :disabled="menarca !== 17"
                        :placeholder="menarca === 17 ? '17' : ''"
                    >
                    <span class="text-gray-600 text-sm">años</span>
                </div>
            </div>

            <!-- Resumen de selección -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p class="text-sm text-emerald-800 mb-2">
                    <span class="font-medium">✅ Menarca a registrar:</span>
                </p>
                <p class="text-2xl font-bold text-emerald-700 text-center">
                    {{ textoMenarca }}
                </p>
            </div>
        </div>
    </div>
</template>