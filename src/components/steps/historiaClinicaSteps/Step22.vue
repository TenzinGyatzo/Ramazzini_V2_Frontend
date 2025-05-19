<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const alcoholismo = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        alcoholismo.value = documentos.currentDocument.alcoholismo || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        alcoholismo.value = formDataHistoriaClinica.alcoholismo || 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para alcoholismo
    if (!formDataHistoriaClinica.alcoholismo) {
        formDataHistoriaClinica.alcoholismo = alcoholismo.value;
    }

    if (!formDataHistoriaClinica.alcoholismoEspecificar) {
        formDataHistoriaClinica.alcoholismoEspecificar = 'Negado';
    }
});


// Sincronizar alcoholismo con formData
watch(alcoholismo, (newValue) => {
    formDataHistoriaClinica.alcoholismo = newValue;
});

// Watch para establecer 'Negado' cuando alcoholismo sea 'No'
watch(alcoholismo, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.alcoholismoEspecificar = 'Negado';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales No Patológicos</h1>
        <h2>ALCOHOLISMO</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿El trabajador consume alcohol o cuenta con antecedentes
                de consumo de alcohol?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="alcoholismo" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="alcoholismo" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="alcoholismo === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.alcoholismoEspecificar"
                    placeholder="Frecuencia, tratamiento, evolución, etc." required>
            </div>
        </div>
    </div>
</template>