<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
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

const empresaId = ref('');
const centroTrabajoId = ref('');
const trabajadorId = ref('');
const documentoId = ref('');
const tipoDocumento = ref('');

onMounted(() => {
  empresaId.value = String(route.params.idEmpresa);
  centroTrabajoId.value = String(route.params.idCentroTrabajo);
  trabajadorId.value = String(route.params.idTrabajador);
  documentoId.value = route.params.idDocumento;
  tipoDocumento.value = route.params.tipoDocumento;

  // Establecer los IDs en los stores
  empresas.currentEmpresaId = empresaId.value;
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId.value;
  trabajadores.currentTrabajadorId = trabajadorId.value;

  // Llamar las funciones de carga (sin await)
  empresas.fetchEmpresaById(empresaId.value);
  centrosTrabajo.fetchCentroTrabajoById(empresaId.value, centroTrabajoId.value);
  trabajadores.fetchTrabajadorById(empresaId.value, centroTrabajoId.value, trabajadorId.value);

  formData.resetFormData();

  // Cargar documento si existe
  if (documentoId.value && tipoDocumento.value) {
    documentos.fetchDocumentById(tipoDocumento.value, trabajadores.currentTrabajadorId, documentoId.value)
      .then(() => {
        if (documentos.currentDocument) {
          formData.setFormDataFromDocument(documentos.currentDocument, tipoDocumento.value);
        } else {
          console.error('No se encontraron datos para el documento especificado.');
        }
      })
      .catch(error => console.error('Error al cargar los datos del documento:', error));
  }
});

// Verificar cuando los datos se hayan cargado completamente
watchEffect(() => {
  const empresa = empresas.currentEmpresa?.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo?.nombreCentro;
  const trabajador = trabajadores.currentTrabajador?.nombre;

  if (empresa && centroTrabajo && trabajador && tipoDocumento.value) {
    const rutaBase = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/`;

    const documentoMap = {
      antidoping: formData.formDataAntidoping,
      aptitud: formData.formDataAptitud,
      certificado: formData.formDataCertificado,
      'documento Externo': formData.formDataDocumentoExterno,
      examenVista: formData.formDataExamenVista,
      exploracionFisica: formData.formDataExploracionFisica,
      historiaClinica: formData.formDataHistoriaClinica
    };

    const documentoForm = documentoMap[tipoDocumento.value];

    if (documentoForm) {
      documentoForm.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
      documentoForm.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
      documentoForm.rutaPDF = rutaBase;
    } else {
      console.error(`Tipo de documento no reconocido: ${tipoDocumento.value}`);
    }
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