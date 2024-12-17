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
const { formDataExamenVista } = useFormDataStore();
const documentos = useDocumentosStore();

// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

onMounted(() => {
  if (documentos.currentDocument) {
    fechaExamenVista.value = formatDateYYYYMMDD(documentos.currentDocument.fechaExamenVista || today);
  }

  // Establece idTrabajador en formData
  formDataExamenVista.idTrabajador = trabajadores.currentTrabajadorId;

  // Establece usuario creador y/o actualizador en formData
  formDataExamenVista.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataExamenVista.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual

  // Establece rutaPDF en formData cuando aun no se ha seleccionado la fecha
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataExamenVista.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/`;
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para fechaExamenVista
  if (!formDataExamenVista.fechaExamenVista) {
    formDataExamenVista.fechaExamenVista = today;
  }
})

// Inicializar la referencia local sincronizada con formData
const fechaExamenVista = ref(today);

// Mantener sincronizados los valores
watch(fechaExamenVista, (newValue) => {
  formDataExamenVista.fechaExamenVista = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha de valoración</h1>
    <FormKit type="date" name="fechaExamenVista" placeholder="Seleccione una fecha" v-model="fechaExamenVista" />
  </div>
</template>
