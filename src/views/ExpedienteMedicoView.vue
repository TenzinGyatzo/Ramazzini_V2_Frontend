<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useFormDataStore } from '@/stores/formDataStore';
import GreenButton from '@/components/GreenButton.vue';
import SliderButton from '@/components/SliderButton.vue';
import ModalCargaDocumentoExterno from '@/components/ModalCargaDocumentoExterno.vue';
import ModalUpdateDocumentoExterno from '@/components/ModalUpdateDocumentoExterno.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import GrupoDocumentos from '@/components/GrupoDocumentos.vue';
import SlidingButtonPanel from '@/components/SlidingButtonPanel.vue';
import { calcularEdad } from '@/helpers/dates';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

const toast: any = inject('toast');

const route = useRoute();
const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();
const proveedorSaludStore = useProveedorSaludStore();

const showDocumentoExternoModal = ref(false);
const showDocumentoExternoUpdateModal = ref(false);
const showSubscriptionModal = ref(false);
const showDeleteModal = ref(false); // Controla la visibilidad del modal
const selectedDocumentId = ref<string | null>(null); // ID del documento seleccionado
const selectedDocumentName = ref<string>(''); // Valor inicial como cadena vacía
const selectedDocumentType = ref<string | null>(null); // Tipo del documento seleccionado
const selectedRoutes = ref<string[]>([]);
const periodoDePruebaFinalizado = ref<boolean | null>(null);
const estadoSuscripcion = ref<string | null>(null);
const finDeSuscripcion = ref<Date | null>(null);

const user = ref( JSON.parse(localStorage.getItem('user') || '{}') || null );

onMounted(async () => {
  const idProveedorSalud = user.value?.idProveedorSalud;
  if (idProveedorSalud) {
    await proveedorSaludStore.loadProveedorSalud(idProveedorSalud);

    // Actualiza los valores después de cargar los datos
    periodoDePruebaFinalizado.value = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado ?? null;
    estadoSuscripcion.value = proveedorSaludStore.proveedorSalud?.estadoSuscripcion ?? null;
    finDeSuscripcion.value = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

  } else {
    console.error("No se encontró idProveedorSalud en el usuario.");
  }
});

const toggleDocumentoExternoModal = () => {
  if (!proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado.value) {
    // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

    // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
    if (estadoSuscripcion.value === 'cancelled' && finDeSuscripcion.value && new Date() > finDeSuscripcion.value) {
      showSubscriptionModal.value = true;
      return;
    }
  }

  // Si la suscripción aún está activa, permitir la carga de documentos
  showDocumentoExternoModal.value = !showDocumentoExternoModal.value;
};

const toggleDocumentoExternoUpdateModal = () => {
  if (! proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado) {
    // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

    // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
    if (estadoSuscripcion.value === 'cancelled' && finDeSuscripcion.value && new Date() > finDeSuscripcion.value) {
      showSubscriptionModal.value = true;
      return;
    }
  }

  showDocumentoExternoUpdateModal.value = !showDocumentoExternoUpdateModal.value;
};

const toggleDeleteModal = (
  documentId: string | null = null,
  documentName: string = 'Sin nombre',
  documentType: string | null = null
) => {
  showDeleteModal.value = !showDeleteModal.value;

  if (!showDeleteModal.value) {
    // Limpia los valores si el modal se cierra
    selectedDocumentId.value = null;
    selectedDocumentName.value = '';
    selectedDocumentType.value = null;
  } else {
    // Asigna valores si el modal se abre
    selectedDocumentId.value = documentId;
    selectedDocumentName.value = documentName;
    selectedDocumentType.value = documentType;
  }
};

const handleDeleteDocument = async () => {
  if (!selectedDocumentId.value || !selectedDocumentType.value) return;

  try {
    await documentos.deleteDocumentById(
      selectedDocumentType.value,
      trabajadores.currentTrabajadorId!,
      selectedDocumentId.value
    );

  toast.open({ message: "Documento eliminado exitosamente." });

  toggleDeleteModal(); // Cierra el modal
  await documentos.fetchAllDocuments(trabajadores.currentTrabajadorId!); // Actualiza la lista
  } catch (error) {
    console.log("Error al eliminar el documento:", error);
    toast.open({ message: "Error al eliminar, por favor intente nuevamente.", type: "error" });
  }
};

const documentTypeLabels = {
  aptitud: "Aptitud al Puesto",
  historiaClinica: "Historia Clínica",
  exploracionFisica: "Exploración Física",
  examenVista: "Examen de la Vista",
  antidoping: "Antidoping",
  certificado: "Certificado",
  documentoExterno: "Documento Externo"
};

const fetchData = () => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  const trabajadorId = String(route.params.idTrabajador);

  documentos.fetchAllDocuments(trabajadorId);

  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
  trabajadores.currentTrabajadorId = trabajadorId;
  trabajadores.fetchTrabajadorById(empresaId, centroTrabajoId, trabajadorId);
  formData.resetFormData();
};

onMounted(fetchData);

watch(
  () => route.params,
  () => {
    fetchData();
  }
);

const navigateTo = (routeName, params) => {
  if (!proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado.value) {
    // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

    // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
    if (estadoSuscripcion.value === 'cancelled' && finDeSuscripcion.value && new Date() > finDeSuscripcion.value) {
      showSubscriptionModal.value = true;
      return;
    }
  }

  // Si la suscripción aún está activa, permitir la navegación
  router.push({ name: routeName, params });
  documentos.setCurrentTypeOfDocument(params.tipoDocumento);
  documentos.currentDocument = null;
};

const toggleRouteSelection = (route: string, isSelected: boolean) => {
    if (isSelected) {
        if (!selectedRoutes.value.includes(route)) {
            selectedRoutes.value.push(route);
        }
    } else {
        selectedRoutes.value = selectedRoutes.value.filter(r => r !== route);
    }
};

</script>

<template>
  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" 
      @closeModal="showSubscriptionModal = false"/>
  </Transition>
   <div class="relative flex justify-center md:justify-start">
    <Transition appear name="slide-down">
      <SlidingButtonPanel v-if="selectedRoutes.length >= 1" 
        :selectedRoutes="selectedRoutes"/>
    </Transition>
   </div>
  <Transition appear name="fade">
    <ModalCargaDocumentoExterno v-if="showDocumentoExternoModal"
      @closeDocumentoExternoModal="toggleDocumentoExternoModal" @updateData="fetchData" />
  </Transition>

  <Transition appear name="fade">
    <ModalUpdateDocumentoExterno v-if="showDocumentoExternoUpdateModal"
      @closeModalUpdate="toggleDocumentoExternoUpdateModal" @updateData="fetchData"/>
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedDocumentId && selectedDocumentType" :idRegistro="selectedDocumentId"
      :identificacion="selectedDocumentName" :tipoRegistro="documentTypeLabels[selectedDocumentType]"
      @closeModal="toggleDeleteModal" @confirmDelete="handleDeleteDocument" />
  </Transition>

  <div class="p-5 grid gap-5">
    <div class="flex flex-wrap flex-col md:flex-row justify-center gap-3 md:gap-6">
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Historia Clínica"
        @click="navigateTo('crear-documento', {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'historiaClinica'
        })" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Exploración Física"
        @click="navigateTo('crear-documento', {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'exploracionFisica'
        })" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Examen Vista" @click="navigateTo('crear-documento', {
        idEmpresa: empresas.currentEmpresaId,
        idTrabajador: trabajadores.currentTrabajadorId,
        tipoDocumento: 'examenVista'
      })" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Antidoping" @click="navigateTo('crear-documento', {
        idEmpresa: empresas.currentEmpresaId,
        idTrabajador: trabajadores.currentTrabajadorId,
        tipoDocumento: 'antidoping'
      })" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Aptitud" @click="navigateTo('crear-documento', {
        idEmpresa: empresas.currentEmpresaId,
        idTrabajador: trabajadores.currentTrabajadorId,
        tipoDocumento: 'aptitud'
      })" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Certificado" @click="navigateTo('crear-documento', {
        idEmpresa: empresas.currentEmpresaId,
        idTrabajador: trabajadores.currentTrabajadorId,
        tipoDocumento: 'certificado'
      })" />
      <div class="w-full flex justify-center">
        <SliderButton class="align-self-center" text="Documento Externo" @click="toggleDocumentoExternoModal"
          @closeModal="toggleDocumentoExternoModal" />
      </div>

    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="trabajadores.currentTrabajador"
        class="w-full text-center flex flex-col items-center gap-2 mt-4 p-4 border border-gray-200 rounded-lg shadow-md bg-gray-50">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
          {{ trabajadores.currentTrabajador?.nombre }}
        </h1>
        <h2 class="text-sm sm:text-base md:text-lg text-gray-500 italic">
          {{ calcularEdad(trabajadores.currentTrabajador?.fechaNacimiento) }} años - {{
            trabajadores.currentTrabajador?.puesto }}
        </h2>
      </div>
    </Transition>

    <Transition appear mode="out-in" name="slide-up">
      <div v-if="documentos.loading">
        <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div>
      <div v-else>
        <div v-if="documentos.documentsByYear && Object.keys(documentos.documentsByYear).length"
          class="grid grid-cols-1 gap-6">
          <GrupoDocumentos v-for="year in Object.keys(documentos.documentsByYear).sort((a, b) => Number(b) - Number(a))"
            :key="year" :documents="documentos.documentsByYear[year]" :year="year"
            @eliminarDocumento="toggleDeleteModal" @abrirModalUpdate="toggleDocumentoExternoUpdateModal" 
            @openSubscriptionModal="showSubscriptionModal = true"
            :toggleRouteSelection="toggleRouteSelection" :selectedRoutes="selectedRoutes"/>
        </div>
        <h1 v-else
          class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700">Este
          trabajador aun no tiene documentos registrados</h1>
      </div>
    </Transition>

  </div>
</template>
