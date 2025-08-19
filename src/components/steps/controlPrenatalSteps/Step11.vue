<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';

const { formDataControlPrenatal } = useFormDataStore();

const fpp = ref(''); // Fecha probable de parto

// Función para calcular la FPP usando la Fórmula de Näegele
const calcularFPP = (fum) => {
    if (!fum) return '';
    
    const fechaFUM = new Date(fum);
    if (isNaN(fechaFUM.getTime())) return '';
    
    // Fórmula de Näegele: FUM + 7 días + 9 meses
    const fpp = new Date(fechaFUM);
    fpp.setDate(fpp.getDate() + 7);
    fpp.setMonth(fpp.getMonth() + 9);
    
    // Formatear la fecha como YYYY-MM-DD para el input
    return fpp.toISOString().split('T')[0];
};

onMounted(() => {
    // Si ya existe FUM, calcular automáticamente la FPP
    if (formDataControlPrenatal.fum) {
        fpp.value = calcularFPP(formDataControlPrenatal.fum);
        formDataControlPrenatal.fpp = fpp.value;
    }
});

onUnmounted(() => {
    // Asegurar que formData tenga el valor calculado
    if (fpp.value) {
        formDataControlPrenatal.fpp = fpp.value;
    }
});

// Sincronizar fpp con formData
watch(fpp, (newValue) => {
    formDataControlPrenatal.fpp = newValue;
});

// Watch para recalcular FPP cuando cambie la FUM
watch(() => formDataControlPrenatal.fum, (newFum) => {
    if (newFum) {
        fpp.value = calcularFPP(newFum);
        formDataControlPrenatal.fpp = fpp.value;
    } else {
        fpp.value = '';
        formDataControlPrenatal.fpp = '';
    }
});
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Antecedentes Gineco Obstétricos</h1>
        <h2>FECHA PROBABLE DE PARTO (FPP)</h2>
        
        <div class="mb-4">
            <p class="font-medium mb-2 text-gray-800">
                La FPP se calcula automáticamente usando la Fórmula de Näegele basándose en la FUM capturada.
            </p>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-blue-800 mb-2">
                    <strong>Fórmula de Näegele:</strong> FUM + 7 días + 9 meses
                </p>
                <p class="text-sm text-blue-700">
                    FUM registrada: <span class="font-semibold">{{ formDataControlPrenatal.fum || 'No disponible' }}</span>
                </p>
            </div>
        </div>

        <div class="mt-4">
            <p class="font-medium mb-2 text-gray-800">Fecha Probable de Parto:</p>
            <div class="font-light">
                <input type="date"
                    class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    v-model="fpp"
                    :disabled="!formDataControlPrenatal.fum"
                    :placeholder="formDataControlPrenatal.fum ? 'FPP calculada automáticamente' : 'Requiere FUM del paso anterior'"
                    required>
            </div>
            <p v-if="!formDataControlPrenatal.fum" class="text-sm text-orange-600 mt-2">
                ⚠️ Para calcular la FPP, primero debe capturar la FUM en el paso anterior.
            </p>
        </div>
    </div>
</template>