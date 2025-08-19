<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const conoceCiclo = ref('Si'); // Cambiado a 'Si' por defecto ya que tenemos presets

// Valor local para el ciclo seleccionado
const cicloSeleccionado = ref('28x4'); // Preseleccionado como "28x4"
const cicloOtro = ref('');

onMounted(() => {
    // Verificar si formDataControlPrenatal.ciclos tiene un valor y establecerlo
    if (formDataControlPrenatal.ciclos) {
        const valor = formDataControlPrenatal.ciclos;
        // Verificar si el valor está en los presets
        const presetEncontrado = presetsCiclos.find(preset => preset.valor === valor);
        if (presetEncontrado) {
            cicloSeleccionado.value = presetEncontrado.valor;
        } else {
            // Si no está en presets, usar "Otro..."
            cicloSeleccionado.value = 'otro';
            cicloOtro.value = valor;
        }
        conoceCiclo.value = 'Si';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para ciclos
    if (!formDataControlPrenatal.ciclos) {
        formDataControlPrenatal.ciclos = '28x4'; // Valor por defecto
    }
});

// Presets de ciclos menstruales comunes
const presetsCiclos = [
    { valor: '28x4', descripcion: '28x4', texto: '28 días x 4 días' },
    { valor: '30x5', descripcion: '30x5', texto: '30 días x 5 días' },
    { valor: '26x3', descripcion: '26x3', texto: '26 días x 3 días' },
    { valor: '32x6', descripcion: '32x6', texto: '32 días x 6 días' },
    { valor: '25x4', descripcion: '25x4', texto: '25 días x 4 días' },
    { valor: '35x7', descripcion: '35x7', texto: '35 días x 7 días' },
    { valor: 'irregular', descripcion: 'Irregular', texto: 'Irregular' },
    { valor: 'otro', descripcion: 'Otro...', texto: 'Otro...' }
];

// Sincronizar cicloSeleccionado y cicloOtro con formData
watch([cicloSeleccionado, cicloOtro], ([newCiclo, newOtro]) => {
    if (newCiclo === 'otro') {
        formDataControlPrenatal.ciclos = newOtro;
    } else {
        formDataControlPrenatal.ciclos = newCiclo;
    }
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    cicloSeleccionado.value = valor;
    if (valor !== 'otro') {
        cicloOtro.value = ''; // Resetear el valor cuando se selecciona un preset
    }
};

// Función para manejar la opción "Otro..."
const manejarOtro = () => {
    cicloSeleccionado.value = 'otro';
};

// Texto descriptivo para mostrar
const textoCiclo = computed(() => {
    if (cicloSeleccionado.value === 'otro') {
        return cicloOtro.value || 'Especifique...';
    }
    const preset = presetsCiclos.find(p => p.valor === cicloSeleccionado.value);
    return preset ? preset.texto : cicloSeleccionado.value;
});

// Valor para el input "Otro..."
const valorInputOtro = computed(() => {
    return cicloSeleccionado.value === 'otro' ? cicloOtro.value : '';
});

// Watch para establecer el valor cuando cambie conoceCiclo
watch(conoceCiclo, (newValue) => {
    if (newValue === 'No') {
        formDataControlPrenatal.ciclos = 'No sabe';
    } else {
        // Restaurar el valor seleccionado
        if (cicloSeleccionado.value === 'otro') {
            formDataControlPrenatal.ciclos = cicloOtro.value;
        } else {
            formDataControlPrenatal.ciclos = cicloSeleccionado.value;
        }
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>CICLO MENSTRUAL</h2>
        
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿La trabajadora conoce su ciclo menstrual?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="conoceCiclo" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="conoceCiclo" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Presets de ciclos, solo visibles si conoce el ciclo -->
        <div v-if="conoceCiclo === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Seleccione el patrón del ciclo:</p>
            
            <!-- Presets compactos -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-4 gap-3">
                    <button
                        v-for="preset in presetsCiclos.slice(0, 4)"
                        :key="preset.valor"
                        @click="seleccionarPreset(preset.valor)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="cicloSeleccionado === preset.valor 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        {{ preset.descripcion }}
                    </button>
                </div>
                
                <div class="grid grid-cols-4 gap-3 mt-3">
                    <button
                        v-for="preset in presetsCiclos.slice(4, 8)"
                        :key="preset.valor"
                        @click="seleccionarPreset(preset.valor)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="cicloSeleccionado === preset.valor 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        {{ preset.descripcion }}
                    </button>
                </div>
            </div>

            <hr class="my-4 border-gray-300">

            <!-- Opción "Otro..." con input de texto -->
            <div class="mb-4">
                <div class="flex items-center justify-center gap-3">
                    <button
                        @click="manejarOtro"
                        type="button"
                        class="px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm"
                        :class="cicloSeleccionado === 'otro' 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Otro...
                    </button>    
                    <input
                        :value="valorInputOtro"
                        @input="(e) => { if (cicloSeleccionado === 'otro') cicloOtro = e.target.value }"
                        type="text"
                        class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        :class="cicloSeleccionado === 'otro' ? 'border-emerald-500 bg-emerald-50' : ''"
                        :disabled="cicloSeleccionado !== 'otro'"
                        :placeholder="cicloSeleccionado === 'otro' ? 'Ej: 29x5, Variable...' : ''"
                    >
                </div>
            </div>

            <!-- Resumen de selección -->
            <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-700">
                    <span class="font-medium">Ciclo seleccionado: </span> 
                    <span class="text-emerald-700 font-semibold">{{ textoCiclo }}</span>
                </p>
            </div>
        </div>
    </div>
</template>