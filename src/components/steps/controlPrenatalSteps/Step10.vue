<script setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

// Valor local para la pregunta principal
const metodoPlanificacionFamiliarPregunta = ref('No'); // Cambiado a 'No' por defecto

// Valor local para el método seleccionado
const metodoSeleccionado = ref('Ninguno'); // Preseleccionado como "Ninguno"
const metodoOtro = ref('');

onMounted(() => {
    // Verificar si formDataControlPrenatal.metodoPlanificacionFamiliar tiene un valor y establecerlo
    if (formDataControlPrenatal.metodoPlanificacionFamiliar && formDataControlPrenatal.metodoPlanificacionFamiliar !== 'Ninguno') {
        const valor = formDataControlPrenatal.metodoPlanificacionFamiliar;
        // Verificar si el valor está en los presets
        const presetEncontrado = presetsMetodos.find(preset => preset.valor === valor);
        if (presetEncontrado) {
            metodoSeleccionado.value = presetEncontrado.valor;
            metodoPlanificacionFamiliarPregunta.value = 'Si';
        } else {
            // Si no está en presets, usar "Otro..."
            metodoSeleccionado.value = 'otro';  
            metodoOtro.value = valor;
            metodoPlanificacionFamiliarPregunta.value = 'Si';
        }
    } else if (formDataControlPrenatal.metodoPlanificacionFamiliar === 'Ninguno') {
        // Si el valor es 'Ninguno', establecer la pregunta como 'No'
        metodoSeleccionado.value = 'Ninguno';
        metodoPlanificacionFamiliarPregunta.value = 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para metodoPlanificacionFamiliar
    if (!formDataControlPrenatal.metodoPlanificacionFamiliar) {
        formDataControlPrenatal.metodoPlanificacionFamiliar = 'Ninguno';
    }
});

// Presets de métodos de planificación familiar comunes
const presetsMetodos = [
    { valor: 'Ninguno', descripcion: 'Ninguno', texto: 'No utiliza métodos' },
    { valor: 'Condón', descripcion: 'Condón', texto: 'Condón' },
    { valor: 'DIU', descripcion: 'DIU', texto: 'Dispositivo Intrauterino' },
    { valor: 'Píldora', descripcion: 'Píldora', texto: 'Anticonceptivos orales' },
    { valor: 'Implante', descripcion: 'Implante', texto: 'Implante subdérmico' },
    { valor: 'Inyección', descripcion: 'Inyección', texto: 'Anticonceptivos inyectables' },
    { valor: 'Esterilización', descripcion: 'Esterilización', texto: 'Esterilización quirúrgica' },
    { valor: 'Natural', descripcion: 'Natural', texto: 'Métodos naturales' },
    { valor: 'otro', descripcion: 'Otro...', texto: 'Otro...' }
];

// Sincronizar metodoSeleccionado y metodoOtro con formData
watch([metodoSeleccionado, metodoOtro], ([newMetodo, newOtro]) => {
    if (newMetodo === 'otro') {
        formDataControlPrenatal.metodoPlanificacionFamiliar = newOtro || '';
    } else if (newMetodo !== 'Ninguno') {
        formDataControlPrenatal.metodoPlanificacionFamiliar = newMetodo;
    }
    // Si es 'Ninguno', se maneja en el watcher de metodoPlanificacionFamiliarPregunta
});

// Función para seleccionar un preset
const seleccionarPreset = (valor) => {
    metodoSeleccionado.value = valor;
    if (valor !== 'otro') {
        metodoOtro.value = ''; // Resetear el valor cuando se selecciona un preset
    }
    // Si se selecciona "Ninguno", cambiar la pregunta a "No"
    if (valor === 'Ninguno') {
        metodoPlanificacionFamiliarPregunta.value = 'No';
        formDataControlPrenatal.metodoPlanificacionFamiliar = 'Ninguno';
    } else {
        metodoPlanificacionFamiliarPregunta.value = 'Si';
        formDataControlPrenatal.metodoPlanificacionFamiliar = valor;
    }
};

// Función para manejar la opción "Otro..."
const manejarOtro = () => {
    metodoSeleccionado.value = 'otro';
    metodoPlanificacionFamiliarPregunta.value = 'Si';
    // No establecer formData aquí, se hará en el watcher cuando se escriba en el input
};

// Texto descriptivo para mostrar
const textoMetodo = computed(() => {
    if (metodoSeleccionado.value === 'otro') {
        return metodoOtro.value || 'Especifique...';
    }
    const preset = presetsMetodos.find(p => p.valor === metodoSeleccionado.value);
    return preset ? preset.texto : metodoSeleccionado.value;
});

// Valor para el input "Otro..."
const valorInputOtro = computed(() => {
    return metodoSeleccionado.value === 'otro' ? metodoOtro.value : '';
});

// Watch para establecer el valor cuando cambie la pregunta
watch(metodoPlanificacionFamiliarPregunta, (newValue) => {
    if (newValue === 'No') {
        metodoSeleccionado.value = 'Ninguno';
        formDataControlPrenatal.metodoPlanificacionFamiliar = 'Ninguno';
    }
    // No forzar cambio a "Condón" cuando cambia a "Si"
    // Solo sincronizar el valor actual
    if (newValue === 'Si' && metodoSeleccionado.value !== 'Ninguno') {
        formDataControlPrenatal.metodoPlanificacionFamiliar = metodoSeleccionado.value;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>PLANIFICACIÓN FAMILIAR</h2>
        
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">
                ¿Ha utilizado la trabajadora métodos específicos para controlar el número y espaciamiento de sus hijos?
            </p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="metodoPlanificacionFamiliarPregunta" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="metodoPlanificacionFamiliarPregunta" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Presets de métodos, solo visibles si el resultado es "Sí" -->
        <div v-if="metodoPlanificacionFamiliarPregunta === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Seleccione el método utilizado:</p>
            
            <!-- Presets compactos -->
            <div class="mb-4 mt-4">
                <div class="grid grid-cols-3 gap-3">
                    <button
                        v-for="preset in presetsMetodos.slice(0, 3)"
                        :key="preset.valor"
                        @click="seleccionarPreset(preset.valor)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="metodoSeleccionado === preset.valor 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        {{ preset.descripcion }}
                    </button>
                </div>
                
                <div class="grid grid-cols-3 gap-3 mt-3">
                    <button
                        v-for="preset in presetsMetodos.slice(3, 6)"
                        :key="preset.valor"
                        @click="seleccionarPreset(preset.valor)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="metodoSeleccionado === preset.valor 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        {{ preset.descripcion }}
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-3 mt-3">
                    <button
                        v-for="preset in presetsMetodos.slice(6, 9)"
                        :key="preset.valor"
                        @click="seleccionarPreset(preset.valor)"
                        type="button"
                        class="w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-xs"
                        :class="metodoSeleccionado === preset.valor 
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
                        :class="metodoSeleccionado === 'otro' 
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-700' 
                            : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'"
                    >
                        Otro...
                    </button>    
                    <input
                        :value="valorInputOtro"
                        @input="(e) => { if (metodoSeleccionado === 'otro') metodoOtro = e.target.value }"
                        type="text"
                        class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        :class="metodoSeleccionado === 'otro' ? 'border-emerald-500 bg-emerald-50' : ''"
                        :disabled="metodoSeleccionado !== 'otro'"
                        :placeholder="metodoSeleccionado === 'otro' ? 'Ej: Parche, Anillo vaginal...' : ''"
                    >
                </div>
            </div>

            <!-- Resumen de selección -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p class="text-sm text-emerald-800 mb-2">
                    <span class="font-medium">✅ Método a registrar:</span>
                </p>
                <p class="text-2xl font-bold text-emerald-700 text-center">
                    {{ textoMetodo }}
                </p>
            </div>
        </div>

    </div>
</template>