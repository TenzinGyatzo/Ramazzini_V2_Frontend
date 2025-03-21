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
const { formDataNotaMedica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const tipoNota = ref('Inicial');
const today = format(new Date(), 'yyyy-MM-dd');

// Inicializar la referencia local sincronizada con formData
const fechaNotaMedica = ref(today);

onMounted(() => {
  if (documentos.currentDocument) {
    // Si se está editando un documento, usa los valores existentes
    tipoNota.value = documentos.currentDocument.tipoNota || 'Inicial';
    fechaNotaMedica.value = formatDateYYYYMMDD(documentos.currentDocument.fechaNotaMedica || today);
  } else {
    // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
    tipoNota.value = formDataNotaMedica.tipoNota || 'Inicial';
    fechaNotaMedica.value = formatDateYYYYMMDD(formDataNotaMedica.fechaNotaMedica || today);

    // Configurar valores iniciales en formData si no existen
    if (!formDataNotaMedica.idTrabajador) {
      formDataNotaMedica.idTrabajador = trabajadores.currentTrabajadorId;
    }
  }
  
  formDataNotaMedica.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataNotaMedica.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  
  // Establece rutaPDF en formData
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataNotaMedica.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}`;
});

onUnmounted(() => {
  // Guardar valores en formData antes de desmontar
  formDataNotaMedica.tipoNota = tipoNota.value;
  formDataNotaMedica.fechaNotaMedica = fechaNotaMedica.value;
});

// Sincronizar tipoNota con formData
watch(tipoNota, (newValue) => {
  formDataNotaMedica.tipoNota = newValue;
});

// Mantener sincronizados los valores
watch(fechaNotaMedica, (newValue) => {
  formDataNotaMedica.fechaNotaMedica = newValue;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Nota Médica</h1>
    <!-- Pregunta principal -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800 leading-5">¿Tipo de Consulta?</p>
      <div class="flex items-center space-x-6 font-light">
        <label class="flex items-center space-x-2">
          <input type="radio" value="Inicial" v-model="tipoNota" class="form-radio accent-emerald-600" />
          <span>Inicial</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Seguimiento" v-model="tipoNota" class="form-radio accent-emerald-600" />
          <span>Seguimiento</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Alta" v-model="tipoNota" class="form-radio accent-emerald-600" />
          <span>Alta</span>
        </label>
      </div>
    </div>
    <div class="mt-6">
      <h1 class="font-medium mb-2 text-gray-800 leading-5">Fecha de Consulta</h1>
      <FormKit type="date" name="fechaNotaMedica" placeholder="Seleccione una fecha"
        v-model="fechaNotaMedica" />
    </div>
  </div>
</template>
