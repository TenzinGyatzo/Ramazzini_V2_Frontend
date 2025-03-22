<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();

const exploracionFisica = ref('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.exploracionFisica !== '') {
        exploracionFisica.value = documentos.currentDocument.exploracionFisica;
    }

    if (formDataNotaMedica.exploracionFisica) {
        exploracionFisica.value = formDataNotaMedica.exploracionFisica;
    }
});

onUnmounted(() => {
    if (!formDataNotaMedica.exploracionFisica) {
        formDataNotaMedica.exploracionFisica = '';
    }
});

watch(exploracionFisica, (newValue) => {
    formDataNotaMedica.exploracionFisica = newValue;
});
</script>

<template>
    <div>
        <h2 class="font-bold mb-4 text-gray-800 leading-5">EXPLORACIÓN FÍSICA:</h2>
        <div class="mt-4">
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-48"
                    v-model="exploracionFisica"
                    required
                    data-skip-validation
                >
                </textarea>
            </div>
        </div>
    </div>
</template>
