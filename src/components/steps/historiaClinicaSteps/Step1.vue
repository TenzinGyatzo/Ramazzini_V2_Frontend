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
const { formDataHistoriaClinica } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la pregunta principal
const motivoExamen = ref('Ingreso');
const today = format(new Date(), 'yyyy-MM-dd');
const todayDDMMYYYY = format(new Date(), 'dd-MM-yyyy');

// Inicializar la referencia local sincronizada con formData
const fechaHistoriaClinica = ref(today);

onMounted(() => {
  if (documentos.currentDocument) {
    // Si se está editando un documento, usa los valores existentes
    motivoExamen.value = documentos.currentDocument.motivoExamen || 'Ingreso';
    fechaHistoriaClinica.value = formatDateYYYYMMDD(documentos.currentDocument.fechaHistoriaClinica || today);
  } else {
    // Si es un documento nuevo, usa valores predeterminados o lo que ya exista en formData
    motivoExamen.value = formDataHistoriaClinica.motivoExamen || 'Ingreso';
    fechaHistoriaClinica.value = formatDateYYYYMMDD(formDataHistoriaClinica.fechaHistoriaClinica || today);

    // Configurar valores iniciales en formData si no existen
    if (!formDataHistoriaClinica.idTrabajador) {
      formDataHistoriaClinica.idTrabajador = trabajadores.currentTrabajadorId;
    }
  }
  
  formDataHistoriaClinica.createdBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  formDataHistoriaClinica.updatedBy = '6650f38308ac3beedf5ac41b'; // TODO: Obtener el ID del usuario actual
  
  // Establece rutaPDF en formData
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataHistoriaClinica.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/Historia-Clinica ${todayDDMMYYYY}.pdf`;
});

onUnmounted(() => {
  // Guardar valores en formData antes de desmontar
  formDataHistoriaClinica.motivoExamen = motivoExamen.value;
  formDataHistoriaClinica.fechaHistoriaClinica = fechaHistoriaClinica.value;
});

// Sincronizar motivoExamen con formData
watch(motivoExamen, (newValue) => {
  formDataHistoriaClinica.motivoExamen = newValue;
});

// Mantener sincronizados los valores
watch(fechaHistoriaClinica, (newValue) => {
  formDataHistoriaClinica.fechaHistoriaClinica = newValue;

  // Actualiza rutaPDF en formData
  const empresa = empresas.currentEmpresa.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo.nombreCentro;
  const trabajador = trabajadores.currentTrabajador.nombre;
  formDataHistoriaClinica.rutaPDF = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/Historia-Clinica ${formDataHistoriaClinica.fechaHistoriaClinica}.pdf`;
});
</script>

<template>
  <div>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Historia Clínica</h1>
    <!-- Pregunta principal -->
    <div class="mb-4">
      <p class="font-medium mb-1 text-gray-800 leading-5">¿Motivo del examen médico?</p>
      <div class="flex items-center space-x-6 font-light">
        <label class="flex items-center space-x-2">
          <input type="radio" value="Ingreso" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Ingreso</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Inicial" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Inicial</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" value="Periódico" v-model="motivoExamen" class="form-radio accent-emerald-600" />
          <span>Periódico</span>
        </label>
      </div>
    </div>
    <div class="mt-6">
      <h1 class="font-medium mb-2 text-gray-800 leading-5">Fecha de Historia Clínica</h1>
      <FormKit type="date" name="fechaHistoriaClinica" placeholder="Seleccione una fecha"
        v-model="fechaHistoriaClinica" />
    </div>
  </div>
</template>
