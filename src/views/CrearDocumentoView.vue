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
import VisualizadorHistoriaClinica from '@/components/steps/VisualizadorHistoriaClinica.vue';

const route = useRoute();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();

/* watch(
  () => route.params, // Observamos los parámetros idEmpresa e idCentroTrabajo
  (newParams) => {
    const { idEmpresa, idCentroTrabajo, idTrabajador, tipoDocumento } = newParams;
    if (idEmpresa && idCentroTrabajo && idTrabajador && tipoDocumento) {
      // Cuando todos los parámetros están definidos, realizamos las llamadas necesarias
      empresas.fetchEmpresaById(String(idEmpresa));
      centrosTrabajo.fetchCentroTrabajoById(String(idEmpresa), String(idCentroTrabajo));
      trabajadores.fetchTrabajadorById(String(idEmpresa), String(idCentroTrabajo), String(idTrabajador));
      documentos.setCurrentTypeOfDocument(String(tipoDocumento));

      empresas.currentEmpresaId = String(idEmpresa); // Seteamos el id de la empresa actual en el store
      centrosTrabajo.currentCentroTrabajoId = String(idCentroTrabajo); // Seteamos el id del centro de trabajo actual en el store
      trabajadores.currentTrabajadorId = String(idTrabajador); // Seteamos el id del trabajador actual en el store
    }
  },
  { immediate: true } // Esto asegura que el watch se ejecute inmediatamente con el valor actual
); */

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
    <div v-if="documentos.currentTypeOfDocument === 'Antidoping'" class="flex flex-wrap lg:flex-nowrap gap-3 md:gap-6">
      <div class="w-full lg:w-1/2">
        <FormStepper />
      </div>
      <div class="w-full lg:w-1/2">
        <VisualizadorAntidoping />
      </div>
    </div>
    <div v-if="documentos.currentTypeOfDocument === 'Historia Clínica'" class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
      <div class="w-full xl:w-1/4">
        <FormStepper />
      </div>
      <div class="w-full xl:w-3/4">
        <VisualizadorHistoriaClinica />
      </div>
    </div>
</template>