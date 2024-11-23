<script setup>
import { useRoute } from 'vue-router';
import FormStepper from '@/components/steps/FormStepper.vue';
import Visualizador from '@/components/steps/Visualizador.vue';

const route = useRoute();
const tipoDocumento = route.params.tipoDocumento;
</script>

<template>
    <div v-if="tipoDocumento" class="flex flex-wrap lg:flex-nowrap gap-3 md:gap-6">
      <div class="w-full lg:w-1/2 ">
        <FormStepper :tipo-documento="tipoDocumento" />
      </div>
      <div class="w-full lg:w-1/2 ">
        <Visualizador />
      </div>
    </div>
</template>