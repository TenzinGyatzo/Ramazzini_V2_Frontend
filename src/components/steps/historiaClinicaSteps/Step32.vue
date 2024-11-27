<script setup>
import { watch, ref, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const partos = ref('0 (Ninguno)');

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para partos
    if (!formDataHistoriaClinica.partos) {
        formDataHistoriaClinica.partos = partos.value;
    }

    if (!formDataHistoriaClinica.partosEspecificar) {
        formDataHistoriaClinica.partosEspecificar = '0 (Ninguno)';
    }
});

// Sincronizar partos con formData
watch(partos, (newValue) => {
    formDataHistoriaClinica.partos = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>PARTOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuántos partos completos ha tenido la trabajadora?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="0 (Ninguno)" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>0 (Ninguno)</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="1 parto" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>1 parto</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="2 partos" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>2 partos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="3 partos" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>3 partos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="4 partos" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>4 partos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="5 partos" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>5 partos</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Más de 5 partos" v-model="partos"
                        class="form-radio accent-emerald-600" />
                    <span>Más de 5 partos</span>
                </label>
            </div>
        </div>
    </div>
</template>