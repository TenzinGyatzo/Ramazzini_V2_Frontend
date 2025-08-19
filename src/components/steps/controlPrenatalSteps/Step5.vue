<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const cesareas = ref(0);
const cesareasOtro = ref(4);

onMounted(() => {
    // Verificar si formDataControlPrenatal.cesareas tiene un valor y establecerlo en cesareas
    if (formDataControlPrenatal.cesareas !== undefined) {
        if (formDataControlPrenatal.cesareas >= 4) {
            cesareas.value = 4; // Valor especial para "Otro"
            cesareasOtro.value = formDataControlPrenatal.cesareas;
        } else {
            cesareas.value = formDataControlPrenatal.cesareas;
        }
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cesareas
    if (formDataControlPrenatal.cesareas === undefined) {
        formDataControlPrenatal.cesareas = cesareas.value;
    }
});

// Sincronizar cesareas con formData
watch([cesareas, cesareasOtro], ([newCesareas, newCesareasOtro]) => {
    if (newCesareas === 4) {
        formDataControlPrenatal.cesareas = newCesareasOtro;
    } else {
        formDataControlPrenatal.cesareas = newCesareas;
    }
});

// Computed para el texto a mostrar
const textoCesareas = computed(() => {
    if (cesareas.value === 0) return '0 (Ninguna)';
    if (cesareas.value === 1) return '1 cesárea';
    if (cesareas.value === 2) return '2 cesáreas';
    if (cesareas.value === 3) return '3 cesáreas';
    if (cesareas.value === 4) return `${cesareasOtro.value} cesáreas`;
    return `${cesareas.value} cesáreas`;
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    cesareas.value = valor;
    if (valor !== 4) {
        cesareasOtro.value = 4; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar el campo "Otro"
const manejarOtro = () => {
    cesareas.value = 4;
};

// Función para obtener el valor a mostrar en el input
const valorInputOtro = computed(() => {
    return cesareas.value === 4 ? cesareasOtro.value : '';
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>CESÁREAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuantas cesáreas ha tenido la paciente como método de parto?</p>
            
            <!-- Presets compactos (0-3) -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-2 gap-3">
                    <button
                        @click="seleccionarPreset(0)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="cesareas === 0 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Ninguna
                    </button>
                    <button
                        @click="seleccionarPreset(1)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="cesareas === 1 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        1 cesárea
                    </button>
                    <button
                        @click="seleccionarPreset(2)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="cesareas === 2 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        2 cesáreas
                    </button>
                    <button
                        @click="seleccionarPreset(3)"
                        type="button"
                        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="cesareas === 3 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        3 cesáreas
                    </button>
                </div>
            </div>

            <hr class="my-4">
            <!-- Campo "Otro" para valores ≥4 -->
            <div class="flex items-center justify-center space-x-3">
                <button
                    @click="manejarOtro"
                    type="button"
                    class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                    :class="cesareas === 4 
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                        : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                >
                    Otro...
                </button>
                <input
                    :value="cesareas === 4 ? cesareasOtro : ''"
                    @input="(e) => { if (cesareas === 4) cesareasOtro = Number(e.target.value) }"
                    type="number"
                    min="0"
                    max="12"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                    :class="cesareas === 4 ? 'border-emerald-500 bg-emerald-50' : ''"
                    :disabled="cesareas !== 4"
                    :placeholder="cesareas === 4 ? '4' : ''"
                />
                <span class="text-gray-600 text-sm">cesáreas</span>
            </div>

            <!-- Resumen de selección -->
            <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Selección actual: </span> 
                    <span class="text-emerald-700 font-semibold"> {{ textoCesareas }}</span>
                </p>
            </div>
        </div>
    </div>
</template>