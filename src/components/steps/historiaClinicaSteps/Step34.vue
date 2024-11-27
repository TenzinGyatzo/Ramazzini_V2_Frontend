<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const abortos = ref('0 (Ninguno)');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para abortos
    if (!formDataHistoriaClinica.abortos) {
        formDataHistoriaClinica.abortos = abortos.value;
    }

    if (!formDataHistoriaClinica.abortosEspecificar) {
        formDataHistoriaClinica.abortosEspecificar = '0 (Ninguno)';
    }
});

// Sincronizar abortos con formData
watch(abortos, (newValue) => {
    formDataHistoriaClinica.abortos = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>ABORTOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿La trabajadora ha experimentado pérdidas de embarazo antes de las 20 semanas? En caso afirmativo, ¿cuántas?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="0 (Ninguno)" v-model="abortos"
                        class="form-radio accent-emerald-600" />
                    <span>0 (Ninguno)</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="1 aborto" v-model="abortos"
                        class="form-radio accent-emerald-600" />
                    <span>1 aborto</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="2 abortos" v-model="abortos"
                        class="form-radio accent-emerald-600" />
                    <span>2 abortos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="3 abortos" v-model="abortos"
                        class="form-radio accent-emerald-600" />
                    <span>3 abortos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Más de 3 abortos" v-model="abortos"
                        class="form-radio accent-emerald-600" />
                    <span>Más de 3 abortos</span>
                </label>
            </div>
        </div>
    </div>
</template>