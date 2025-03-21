<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();

const antecedentes = ref('');

onMounted(() => {
    if (documentos.currentDocument && documentos.currentDocument.antecedentes !== '') {
        antecedentes.value = documentos.currentDocument.antecedentes;
    }

    if (formDataNotaMedica.antecedentes) {
        antecedentes.value = formDataNotaMedica.antecedentes;
    }
});

onUnmounted(() => {
    if (!formDataNotaMedica.antecedentes) {
        formDataNotaMedica.antecedentes = '';
    }
});

watch(antecedentes, (newValue) => {
    formDataNotaMedica.antecedentes = newValue;
});
</script>

<template>
    <div>
        <h2 class="font-bold mb-4 text-gray-800 leading-5">ANTECEDENTES:</h2>
        <div class="mt-4">
            <div class="font-light">
                <textarea
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-64"
                    v-model="antecedentes"
                    required
                    data-skip-validation
                >
                </textarea>
            </div>
        </div>
    </div>
</template>
