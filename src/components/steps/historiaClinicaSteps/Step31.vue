<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const gestas = ref('0 (Ninguna)');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.gestas tiene un valor y establecerlo en gestas
    if (formDataHistoriaClinica.gestas) {
        gestas.value = formDataHistoriaClinica.gestas;
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para gestas
    if (!formDataHistoriaClinica.gestas) {
        formDataHistoriaClinica.gestas = gestas.value;
    }
});

// Sincronizar gestas con formData
watch(gestas, (newValue) => {
    formDataHistoriaClinica.gestas = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>GESTAS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿Cuántos embarazos ha tenido la trabajadora, incluyendo el actual si lo hay?</p>
            <div class="grid grid-cols-1 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="0 (Ninguna)" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>0 (Ninguna)</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="1 gesta" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>1 gesta</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="2 gestas" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>2 gestas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="3 gestas" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>3 gestas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="4 gestas" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>4 gestas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="5 gestas" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>5 gestas</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Más de 5 gestas" v-model="gestas"
                        class="form-radio accent-emerald-600" />
                    <span>Más de 5 gestas</span>
                </label>
            </div>
        </div>
    </div>
</template>