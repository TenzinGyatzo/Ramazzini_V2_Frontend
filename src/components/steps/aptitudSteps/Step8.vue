<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataAptitud } = useFormDataStore();

// Valor local para la aptitudPuesto principal, inicializado con el valor actual del store
const aptitudPuesto = ref(formDataAptitud.aptitudPuesto || 'Apto Sin Restricciones');

// Sincronizar el valor seleccionado con formDataAptitud.aptitudPuesto
watch(aptitudPuesto, (newValue) => {
    formDataAptitud.aptitudPuesto = newValue;
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para aptitudPuesto
    if (!formDataAptitud.aptitudPuesto) {
        formDataAptitud.aptitudPuesto = 'Apto Sin Restricciones';
    }
});
</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Aptitud al Puesto</h1>

    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Selección de Aptitud</h2>
        <div class="grid grid-cols-1 gap-6">
            <label class="flex items-start gap-4">
                <input type="radio" value="Apto Sin Restricciones" v-model="aptitudPuesto"
                    class="form-radio mt-1 accent-emerald-600" />
                <div>
                    <p class="font-semibold block text-gray-800">Apto sin restricciones</p>
                    <p class="text-sm text-gray-600 italic">
                        No tiene impedimentos para el puesto al que aspira o desempeña.
                    </p>
                </div>
            </label>

            <label class="flex items-start gap-4">
                <input type="radio" value="Apto Con Precaución" v-model="aptitudPuesto"
                    class="form-radio mt-1 accent-emerald-600" />
                <div>
                    <p class="font-semibold block text-gray-800">Apto con precaución</p>
                    <p class="text-sm text-gray-600 italic">
                        Requiere vigilancia médica más frecuente.
                    </p>
                </div>
            </label>

            <label class="flex items-start gap-4">
                <input type="radio" value="Apto Con Restricciones" v-model="aptitudPuesto"
                    class="form-radio mt-1 accent-emerald-600" />
                <div>
                    <p class="font-semibold block text-gray-800">Apto con restricciones</p>
                    <p class="text-sm text-gray-600 italic">
                        Requiere adaptaciones razonables para asegurar la seguridad y salud.
                    </p>
                </div>
            </label>

            <label class="flex items-start gap-4">
                <input type="radio" value="No Apto" v-model="aptitudPuesto"
                    class="form-radio mt-1 accent-emerald-600" />
                <div>
                    <p class="font-semibold block text-gray-800">No apto</p>
                    <p class="text-sm text-gray-600 italic">
                        No está permitido el desempeño del puesto al que aspira.
                    </p>
                </div>
            </label>

            <label class="flex items-start gap-4">
                <input type="radio" value="Evaluación No Completada" v-model="aptitudPuesto"
                    class="form-radio mt-1 accent-emerald-600" />
                <div>
                    <p class="font-semibold block text-gray-800">Evaluación no completada</p>
                    <p class="text-sm text-gray-600 italic">
                        Para concluir, requiere evaluaciones adicionales o tratamiento médico.
                    </p>
                </div>
            </label>
        </div>
    </div>


</template>
