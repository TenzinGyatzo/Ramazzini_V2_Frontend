<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const cesareas = ref('0 (Ninguna)');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para cesareas
    if (!formDataHistoriaClinica.cesareas) {
        formDataHistoriaClinica.cesareas = cesareas.value;
    }

    if (!formDataHistoriaClinica.cesareasEspecificar) {
        formDataHistoriaClinica.cesareasEspecificar = '0 (Ninguna)';
    }
});

// Sincronizar cesareas con formData
watch(cesareas, (newValue) => {
    formDataHistoriaClinica.cesareas = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>CESÁREAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuantas cesáreas ha tenido la paciente como método de parto?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="0 (Ninguna)" v-model="cesareas"
                        class="form-radio accent-emerald-600" />
                    <span>0 (Ninguna)</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="1 cesarea" v-model="cesareas"
                        class="form-radio accent-emerald-600" />
                    <span>1 cesárea</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="2 cesareas" v-model="cesareas"
                        class="form-radio accent-emerald-600" />
                    <span>2 cesáreas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="3 cesareas" v-model="cesareas"
                        class="form-radio accent-emerald-600" />
                    <span>3 cesáreas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Más de 3 cesareas" v-model="cesareas"
                        class="form-radio accent-emerald-600" />
                    <span>Más de 3 cesáreas</span>
                </label>
            </div>
        </div>
    </div>
</template>