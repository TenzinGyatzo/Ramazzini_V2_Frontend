<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const neoplasicos = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        neoplasicos.value = documentos.currentDocument.neoplasicos || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        neoplasicos.value = formDataHistoriaClinica.neoplasicos || 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para neoplasicos
    if (!formDataHistoriaClinica.neoplasicos) {
        formDataHistoriaClinica.neoplasicos = neoplasicos.value;
    }

    if (!formDataHistoriaClinica.neoplasicosEspecificar) {
        formDataHistoriaClinica.neoplasicosEspecificar = 'Negado';
    }
});


// Sincronizar neoplasicos con formData
watch(neoplasicos, (newValue) => {
    formDataHistoriaClinica.neoplasicos = newValue;
});

// Watch para establecer 'Negado' cuando neoplasicos sea 'No'
watch(neoplasicos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.neoplasicosEspecificar = 'Negado';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>NEOPLÁSICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Presencia de casos de cáncer en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="neoplasicos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="neoplasicos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="neoplasicos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.neoplasicosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>