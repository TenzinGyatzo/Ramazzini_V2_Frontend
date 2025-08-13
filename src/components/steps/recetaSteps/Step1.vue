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
const { formDataReceta } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const today = format(new Date(), 'yyyy-MM-dd');

// Inicializar la referencia local sincronizada con formData
const fechaReceta = ref(today);

onMounted(() => {
  if (documentos.currentDocument) {
    // Si se está editando un documento, usa los valores existentes
    fechaReceta.value = formatDateYYYYMMDD(documentos.currentDocument.fechaReceta || today);
  } else {
    // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
    fechaReceta.value = formatDateYYYYMMDD(formDataReceta.fechaReceta || today);

    // Configurar valores iniciales en formData si no existen
    if (!formDataReceta.idTrabajador) {
      formDataReceta.idTrabajador = trabajadores.currentTrabajadorId;
    }
  }
  
  formDataReceta.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataReceta.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  
  // Establece rutaPDF en formData
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataReceta.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}`;
});

onUnmounted(() => {
  // Guardar valores en formData antes de desmontar
  formDataReceta.fechaReceta = fechaReceta.value;
});

// Mantener sincronizados los valores
watch(fechaReceta, (newValue) => {
  formDataReceta.fechaReceta = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Receta Médica</h1>
    <!-- Pregunta principal -->
    <div class="mt-6">
      <h1 class="font-medium mb-2 text-gray-800 leading-5">Fecha de Consulta</h1>
      <FormKit type="date" name="fechaReceta" placeholder="Seleccione una fecha"
        v-model="fechaReceta" />
    </div>
  </div>
</template>
