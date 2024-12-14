<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const fimicos = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        fimicos.value = documentos.currentDocument.fimicos || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        fimicos.value = formDataHistoriaClinica.fimicos || 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para fimicos
    if (!formDataHistoriaClinica.fimicos) {
        formDataHistoriaClinica.fimicos = fimicos.value;
    }

    if (!formDataHistoriaClinica.fimicosEspecificar) {
        formDataHistoriaClinica.fimicosEspecificar = 'Negado';
    }
});


// Sincronizar fimicos con formData
watch(fimicos, (newValue) => {
    formDataHistoriaClinica.fimicos = newValue;
});

// Watch para establecer 'Negado' cuando fimicos sea 'No'
watch(fimicos, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.fimicosEspecificar = 'Negado';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>FÍMICOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Antecedentes de tuberculosis en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="fimicos" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="fimicos" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="fimicos === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.fimicosEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>