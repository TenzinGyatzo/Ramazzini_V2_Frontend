<script setup>
import { useRoute } from 'vue-router';
import FormStepper from '@/components/steps/FormStepper.vue';
import Visualizador from '@/components/steps/Visualizador.vue';

const route = useRoute();
const tipoDocumento = route.params.tipoDocumento;
</script>

<template>
  <div>
    <h1>Tipo de Documento: {{ tipoDocumento }}</h1>
    <div v-if="tipoDocumento === 'Historia Clinica'">
      {{ tipoDocumento }}
    </div>
    <div v-if="tipoDocumento === 'Exploración Física'">
      {{ tipoDocumento }}
    </div>
    <div v-if="tipoDocumento === 'Examen Vista'">
      {{ tipoDocumento }}
    </div>
    <div 
      v-if="tipoDocumento === 'Antidoping'"
      class="flex flex-wrap md:flex-nowrap gap-3 md:gap-6"
    >
      <div class="w-full md:w-1/4"><FormStepper /></div>
      <div class="w-full md:w-3/4"><Visualizador /></div>
    </div>

    <div v-if="tipoDocumento === 'Aptitud'">
      {{ tipoDocumento }}
    </div>
    <div v-if="tipoDocumento === 'Certificado'">
      {{ tipoDocumento }}
    </div>
  </div>
</template>