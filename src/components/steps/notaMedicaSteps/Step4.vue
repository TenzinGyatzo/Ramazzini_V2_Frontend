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
        <!-- Jerarquía Visual Mejorada -->
        <h1 class="text-2xl font-bold mb-4 text-gray-900">ANTECEDENTES</h1>
        
        <!-- Campo de textarea mejorado -->
        <div class="mb-4">
            <label class="block text-base font-medium leading-5 text-gray-800 mb-3">
                Describa los antecedentes médicos relevantes:
            </label>
            <div class="relative">
                <textarea
                    class="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-48 resize-y"
                    v-model="antecedentes"
                    placeholder="Mencione:

• 'Enfermedades previas y cirugías'
• 'Alergias y medicamentos'
• 'Hospitalizaciones y traumas'
"
                    required
                    data-skip-validation
                >
                </textarea>
            </div>
        </div>

    </div>
</template>
