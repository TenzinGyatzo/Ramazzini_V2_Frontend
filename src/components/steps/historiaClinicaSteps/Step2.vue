<script setup>
import { watch, ref } from 'vue';

const props = defineProps(['formData']);

// Valor local para la pregunta principal
const motivoExamen = ref(props.formData.motivoExamen || '');

// Sincronizar motivoExamen con formData
watch(motivoExamen, (newValue) => {
    props.formData.motivoExamen = newValue;
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Historia Clínica</h1>

        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Motivo del examen?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Ingreso" v-model="motivoExamen" class="form-radio accent-emerald-600" />
                    <span>Ingreso</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Inicial" v-model="motivoExamen" class="form-radio accent-emerald-600" />
                    <span>Inicial</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Periódico" v-model="motivoExamen" class="form-radio accent-emerald-600" />
                    <span>Periódico</span>
                </label>
            </div>
        </div>
    </div>
</template>