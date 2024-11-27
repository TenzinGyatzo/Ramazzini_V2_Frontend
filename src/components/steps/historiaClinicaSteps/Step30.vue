<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const frecuencia = ref('Regular');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para frecuencia
    if (!formDataHistoriaClinica.frecuencia) {
        formDataHistoriaClinica.frecuencia = frecuencia.value;
    }

    if (!formDataHistoriaClinica.frecuenciaEspecificar) {
        formDataHistoriaClinica.frecuenciaEspecificar = 'Regular';
    }
});

// Sincronizar frecuencia con formData
watch(frecuencia, (newValue) => {
    formDataHistoriaClinica.frecuencia = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>FRECUENCIA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cómo describiría la frecuencia de los ciclos mentruales de la trabajadora?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Regular" v-model="frecuencia"
                        class="form-radio accent-emerald-600" />
                    <span>Regular</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Oligomenorrea" v-model="frecuencia"
                        class="form-radio accent-emerald-600" />
                    <span>Oligomenorrea</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Polimenorrea" v-model="frecuencia"
                        class="form-radio accent-emerald-600" />
                    <span>Polimenorrea</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Amenorrea" v-model="frecuencia"
                        class="form-radio accent-emerald-600" />
                    <span>Amenorrea</span>
                </label>
            </div>
        </div>
    </div>
</template>