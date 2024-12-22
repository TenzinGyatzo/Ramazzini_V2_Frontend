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
const { formDataAntidoping } = useFormDataStore();
const documentos = useDocumentosStore();

// Obtener la fecha actual en formato YYYY-MM-DD
const today = format(new Date(), 'yyyy-MM-dd');

onMounted(() => {
  if(documentos.currentDocument) {
    fechaAntidoping.value = formatDateYYYYMMDD(documentos.currentDocument.fechaAntidoping || today);
  }

  // Establece idTrabajador en formData
  formDataAntidoping.idTrabajador = trabajadores.currentTrabajadorId;

  // Establece usuario creador y/o actualizador en formData
  formDataAntidoping.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataAntidoping.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual

  // Establece rutaPDF en formData cuando aun no se ha seleccionado la fecha
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataAntidoping.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}`;
});

onUnmounted(() => {
  // Asegurar que formData tenga un valor inicial para fechaAntidoping
  if (!formDataAntidoping.fechaAntidoping) {
    formDataAntidoping.fechaAntidoping = today;
  }
})

// Inicializar la referencia local sincronizada con formData
const fechaAntidoping = ref(today);

// Mantener sincronizados los valores
watch(fechaAntidoping, (newValue) => {
  formDataAntidoping.fechaAntidoping = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha de realización de la prueba</h1>
    <FormKit type="date" name="fechaAntidoping" placeholder="Seleccione una fecha" v-model="fechaAntidoping" />
  </div>
</template>
