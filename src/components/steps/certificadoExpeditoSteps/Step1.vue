<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { format } from 'date-fns';
import { formatDateYYYYMMDD } from '@/helpers/dates';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const { formDataCertificadoExpedito } = useFormDataStore();
const documentos = useDocumentosStore();

// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

// Inicializar la referencia local sincronizada con formData
const fechaCertificadoExpedito = ref(today);

onMounted(() => {
  if (documentos.currentDocument) {
    fechaCertificadoExpedito.value = formatDateYYYYMMDD(documentos.currentDocument.fechaCertificadoExpedito || today);
  }

  // Establece idTrabajador en formData
  formDataCertificadoExpedito.idTrabajador = trabajadores.currentTrabajadorId;

  // Establece usuario creador y/o actualizador en formData
  formDataCertificadoExpedito.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataCertificadoExpedito.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual

  // Establece rutaPDF en formData cuando aun no se ha seleccionado la fecha
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataCertificadoExpedito.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}`;
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para fechaCertificado
  if (!formDataCertificadoExpedito.fechaCertificadoExpedito) {
    formDataCertificadoExpedito.fechaCertificadoExpedito = today;
  }
})

// Mantener sincronizados los valores
watch(fechaCertificadoExpedito, (newValue) => {
  formDataCertificadoExpedito.fechaCertificadoExpedito = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha del certificado</h1>
    <FormKit type="date" name="fechaCertificadoExpedito" placeholder="Seleccione una fecha" v-model="fechaCertificadoExpedito" />
  </div>
</template>
