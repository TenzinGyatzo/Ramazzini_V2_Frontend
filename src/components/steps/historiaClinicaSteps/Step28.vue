<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataHistoriaClinica } = useFormDataStore();

// Valor local para la pregunta principal
const menarca = ref('12-14 años');

onMounted(() => {
    // Verificar si formDataHistoriaClinica.menarca tiene un valor y establecerlo en menarca
    if (formDataHistoriaClinica.menarca) {
        menarca.value = formDataHistoriaClinica.menarca;
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para menarca
    if (!formDataHistoriaClinica.menarca) {
        formDataHistoriaClinica.menarca = menarca.value;
    }
});

// Sincronizar menarca con formData
watch(menarca, (newValue) => {
    formDataHistoriaClinica.menarca = newValue;
});

</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>MENARCA</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800 leading-5">¿A que edad experimentó la trabajadora su primera menstruación?</p>
            <div class="grid grid-cols-2 gap-2 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Menos de 9 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>Menos de 9 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="9-11 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>9-11 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="12-14 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>12-14 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="15-17 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>15-17 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="18-20 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>18-20 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="21-24 años" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>21-24 años</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="25 años o más" v-model="menarca"
                        class="form-radio accent-emerald-600" />
                    <span>25 años o más</span>
                </label>
            </div>
        </div>
    </div>
</template>