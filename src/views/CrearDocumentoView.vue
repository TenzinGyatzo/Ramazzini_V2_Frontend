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

onMounted(async () => {
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

  const documentoId = route.params.idDocumento;
  const tipoDocumento = route.params.tipoDocumento;

  console.log({ documentoId, tipoDocumento }); // Depuración adicional

  if (documentoId && tipoDocumento) {
    try {
      await documentos.fetchDocumentById(tipoDocumento, trabajadores.currentTrabajadorId, documentoId);

      const documento = documentos.currentDocument;

      if (documento) {
        // Carga los datos en el formDataStore
        formData.setFormDataFromDocument(documento, tipoDocumento);
      } else {
        console.error('No se encontraron datos para el documento especificado.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del documento:', error);
    }
  } else {
    console.warn('No se proporcionaron documentoId o tipoDocumento.');
    formData.resetFormData(); // Limpia los datos si no hay información para cargar
  }
});

onUnmounted(() => {
  formData.resetFormData();
});
</script>

<template>

  <div v-if="documentos.currentTypeOfDocument === 'antidoping'"
    class="max-w-3xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
    <div class="w-full lg:w-1/2">
      <FormStepper />
    </div>
    <div class="w-full lg:w-1/2">
      <VisualizadorAntidoping />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'aptitud'"
    class=" flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorAptitud />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'certificado'"
    class="max-w-6xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
    <div class="w-full xl:w-1/3">
      <FormStepper />
    </div>
    <div class="w-full xl:w-2/3">
      <VisualizadorCertificado />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'exploracionFisica'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorExploracionFisica />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'examenVista'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorExamenVista />
    </div>
  </div>

  <div v-if="documentos.currentTypeOfDocument === 'historiaClinica'"
    class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
    <div class="w-full xl:w-1/4">
      <FormStepper />
    </div>
    <div class="w-full xl:w-3/4">
      <VisualizadorHistoriaClinica />
    </div>
  </div>

</template>