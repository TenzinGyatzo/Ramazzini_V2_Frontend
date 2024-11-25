<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFormDataStore } from '@/stores/formDataStore';
import FormStepper from '@/components/steps/FormStepper.vue';
import VisualizadorAntidoping from '@/components/steps/VisualizadorAntidoping.vue';
import VisualizadorHistoriaClinica from '@/components/steps/VisualizadorHistoriaClinica.vue';

const route = useRoute();
const formData = useFormDataStore();

onMounted(() => {
  formData.tipoDocumento = route.params.tipoDocumento;
})
</script>

<template>
    <div v-if="formData.tipoDocumento === 'Antidoping'" class="flex flex-wrap lg:flex-nowrap gap-3 md:gap-6">
      <div class="w-full lg:w-1/2">
        <FormStepper />
      </div>
      <div class="w-full lg:w-1/2">
        <VisualizadorAntidoping />
      </div>
    </div>
    <div v-if="formData.tipoDocumento === 'Historia Clínica'" class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
      <div class="w-full xl:w-1/4">
        <FormStepper />
      </div>
      <div class="w-full xl:w-3/4">
        <VisualizadorHistoriaClinica />
      </div>
    </div>
</template>