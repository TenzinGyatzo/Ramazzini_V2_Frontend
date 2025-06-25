<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const respiratorios = ref('No');

onMounted(() => {
    if (documentos.currentDocument) {
        // Si se está editando un documento, usa los valores existentes
        respiratorios.value = documentos.currentDocument.respiratorios || 'No';

    } else {
        // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
        respiratorios.value = formDataHistoriaClinica.respiratorios || 'No';
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga un valor inicial para respiratorios
    if (!formDataHistoriaClinica.respiratorios) {
        formDataHistoriaClinica.respiratorios = respiratorios.value;
    }

    if (!formDataHistoriaClinica.respiratoriosEspecificar) {
        formDataHistoriaClinica.respiratoriosEspecificar = 'Negado';
    }
});


// Sincronizar respiratorios con formData
watch(respiratorios, (newValue) => {
    formDataHistoriaClinica.respiratorios = newValue;
});

// Watch para establecer 'Negado' cuando respiratorios sea 'No'
watch(respiratorios, (newValue) => {
    if (newValue === 'No') {
        formDataHistoriaClinica.respiratoriosEspecificar = 'Negado';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Personales Patológicos</h1>
        <h2>RESPIRATORIOS</h2>
        <!-- Pregunta principal -->
        <div class="mb-4">
            <p class="font-medium mb-1 text-gray-800 leading-5">¿Historial de enfermedades respiratorias en el trabajador?</p>
            <div class="flex items-center space-x-6 font-light">
                <label class="flex items-center space-x-2">
                    <input type="radio" value="No" v-model="respiratorios" class="form-radio accent-emerald-600" />
                    <span>No</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="radio" value="Si" v-model="respiratorios" class="form-radio accent-emerald-600" />
                    <span>Si</span>
                </label>
            </div>
        </div>

        <!-- Opciones adicionales, solo visibles si el resultado es "Sí" -->
        <div v-if="respiratorios === 'Si'" class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Especifique:</p>
            <div class="font-light">
                <input type="text"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="formDataHistoriaClinica.respiratoriosEspecificar"
                    placeholder="Frecuencia, tratamiento, evolución, etc." required>
            </div>
        </div>
    </div>
</template>