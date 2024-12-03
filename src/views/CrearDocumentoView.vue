<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useFormDataStore } from '@/stores/formDataStore';
import FormStepper from '@/components/steps/FormStepper.vue';
import VisualizadorAntidoping from '@/components/steps/VisualizadorAntidoping.vue';
import VisualizadorAptitud from '@/components/steps/VisualizadorAptitud.vue';
import VisualizadorCertificado from '@/components/steps/VisualizadorCertificado.vue';
import VisualizadorExamenVista from '@/components/steps/VisualizadorExamenVista.vue';
import VisualizadorExploracionFisica from '@/components/steps/VisualizadorExploracionFisica.vue';
import VisualizadorHistoriaClinica from '@/components/steps/VisualizadorHistoriaClinica.vue';

const route = useRoute();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  const trabajadorId = String(route.params.idTrabajador);

  // Setear los ID actuales en el store
  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
  trabajadores.currentTrabajadorId = trabajadorId;
  trabajadores.fetchTrabajadorById(empresaId, centroTrabajoId, trabajadorId);
  formData.resetFormData();
});

onUnmounted(() => {
  formData.resetFormData();
});
</script>

<template>

  <div v-if="documentos.currentTypeOfDocument === 'Antidoping'"
    class="max-w-3xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
    <div class="w-full lg:w-1/2">
      <FormStepper />
    </div>
    <div class="w-full lg:w-1/2">
      <VisualizadorAntidoping />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'Aptitud'"
    class=" flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorAptitud />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'Certificado'"
    class="max-w-6xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
    <div class="w-full xl:w-1/3">
      <FormStepper />
    </div>
    <div class="w-full xl:w-2/3">
      <VisualizadorCertificado />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'Exploración Física'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorExploracionFisica />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'Examen Vista'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorExamenVista />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'Historia Clínica'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorHistoriaClinica />
    </div>
  </div>

</template>