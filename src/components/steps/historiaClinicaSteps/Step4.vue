<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const hipertensivos = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        hipertensivos.value = documentos.currentDocument.hipertensivos || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        hipertensivos.value = formDataHistoriaClinica.hipertensivos || 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para hipertensivos
    if (!formDataHistoriaClinica.hipertensivos) {
        formDataHistoriaClinica.hipertensivos = hipertensivos.value;
    }

    if (!formDataHistoriaClinica.hipertensivosEspecificar) {
        formDataHistoriaClinica.hipertensivosEspecificar = 'Negado';
    }
});


// Sincronizar hipertensivos con formData
watch(hipertensivos, (newValue) => {
    formDataHistoriaClinica.hipertensivos = newValue;
});

// Watch para establecer 'Negado' cuando hipertensivos sea 'No'
watch(hipertensivos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.hipertensivosEspecificar = 'Negado';
    }
    if (newValue === 'Si') {
        formDataHistoriaClinica.hipertensivosEspecificar = formDataHistoriaClinica.hipertensivosEspecificar;
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>HIPERTENSIVOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Casos de hipertensión en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="hipertensivos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="hipertensivos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="hipertensivos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.hipertensivosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>