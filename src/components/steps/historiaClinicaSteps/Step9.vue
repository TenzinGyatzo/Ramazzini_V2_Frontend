<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const autoinmunes = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        autoinmunes.value = documentos.currentDocument.autoinmunes || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        autoinmunes.value = formDataHistoriaClinica.autoinmunes || 'No';
    }
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para autoinmunes
if (!formDataHistoriaClinica.autoinmunes) {
    formDataHistoriaClinica.autoinmunes = autoinmunes.value;
}

if (!formDataHistoriaClinica.autoinmunesEspecificar) {
    formDataHistoriaClinica.autoinmunesEspecificar = 'Negado';
}  
})


// Sincronizar autoinmunes con formData
watch(autoinmunes, (newValue) => {
    formDataHistoriaClinica.autoinmunes = newValue;
});

// Watch para establecer 'Negado' cuando autoinmunes sea 'No'
watch(autoinmunes, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.autoinmunesEspecificar = 'Negado';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Heredofamiliares</h1>
        <h2>AUTOINMUNES</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Antecedentes de enfermedades autoinmunes en la familia?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="autoinmunes" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="autoinmunes" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="autoinmunes === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.autoinmunesEspecificar"
                    placeholder="Madre, Padre, Abuelo Materno, etc" required>
            </div>
        </div>
    </div>
</template>