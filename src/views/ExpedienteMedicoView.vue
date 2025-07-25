<script setup lang="ts">
import { ref, onMounted, watch, inject, computed } from 'vue';
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
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useMedicoFirmanteStore } from '@/stores/medicoFirmante';

const toast: any = inject('toast');

const route = useRoute();
const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();
const proveedorSaludStore = useProveedorSaludStore();
const medicoFirmanteStore = useMedicoFirmanteStore();

const showDocumentoExternoModal = ref(false);
const showDocumentoExternoUpdateModal = ref(false);
const showSubscriptionModal = ref(false);
const showDeleteModal = ref(false);
const selectedDocumentId = ref<string | null>(null);
const selectedDocumentName = ref<string>('');
const selectedDocumentType = ref<string | null>(null);
const selectedRoutes = ref<string[]>([]);
const periodoDePruebaFinalizado = ref<boolean | null>(null);
const estadoSuscripcion = ref<string | null>(null);
const finDeSuscripcion = ref<Date | null>(null);
const historiasDelMes = ref<number | null>(null);

const user = ref( JSON.parse(localStorage.getItem('user') || '{}') || null );

onMounted(async () => {
  const idProveedorSalud = user.value?.idProveedorSalud;
  if (idProveedorSalud) {
    await proveedorSaludStore.loadProveedorSalud(idProveedorSalud);

    periodoDePruebaFinalizado.value = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado ?? null;
    estadoSuscripcion.value = proveedorSaludStore.proveedorSalud?.estadoSuscripcion ?? null;
    finDeSuscripcion.value = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;
    historiasDelMes.value = await proveedorSaludStore.getHistoriasClinicasDelMes();
  } else {
    console.error("No se encontró idProveedorSalud en el usuario.");
  }
});

const toggleDocumentoExternoModal = () => {
  if (!proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado.value) {
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

    if (estadoSuscripcion.value === 'cancelled' && finDeSuscripcion.value && new Date() > finDeSuscripcion.value) {
      showSubscriptionModal.value = true;
      return;
    }
  }

  showDocumentoExternoModal.value = !showDocumentoExternoModal.value;
};

const toggleDocumentoExternoUpdateModal = () => {
  if (!proveedorSaludStore.proveedorSalud) return;

  if (periodoDePruebaFinalizado.value) {
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

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
    selectedDocumentId.value = null;
    selectedDocumentName.value = '';
    selectedDocumentType.value = null;
  } else {
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

  toggleDeleteModal();
  await documentos.fetchAllDocuments(trabajadores.currentTrabajadorId!);
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
  documentoExterno: "Documento Externo",
  notaMedica: "Nota Médica",
};

const fetchData = async () => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  const trabajadorId = String(route.params.idTrabajador);

  try {
    await Promise.all([
      documentos.fetchAllDocuments(trabajadorId),
      empresas.fetchEmpresaById(empresaId),
      centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId),
      trabajadores.fetchTrabajadorById(empresaId, centroTrabajoId, trabajadorId)
    ]);

    empresas.currentEmpresaId = empresaId;
    centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
    trabajadores.currentTrabajadorId = trabajadorId;

    formData.resetFormData();
  } catch (error) {
    console.error("Error al cargar datos:", error);
  } 
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
    if (!estadoSuscripcion.value || estadoSuscripcion.value === 'inactive') {
      showSubscriptionModal.value = true;
      return;
    }

    if (estadoSuscripcion.value === 'cancelled' && finDeSuscripcion.value && new Date() > finDeSuscripcion.value) {
      showSubscriptionModal.value = true;
      return;
    }
  }

  if (routeName === 'crear-documento' && params.tipoDocumento === 'historiaClinica' && historiasDelMes.value != null && historiasDelMes.value >= proveedorSaludStore.proveedorSalud?.maxHistoriasPermitidasAlMes) {
    showSubscriptionModal.value = true;
    return;
  }

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

const logotipoPendiente = computed(() => {
  const proveedor = proveedorSaludStore.proveedorSalud;
  return !proveedor?.logotipoEmpresa?.data;
});

// Computed para el total de documentos creados (sin documentos externos)
const totalDocumentosCreados = computed(() => {
  if (!documentos.documentsByYear) return 0;
  return Object.values(documentos.documentsByYear).reduce((total, yearData) => {
    return total + (
      (yearData.aptitudes?.length || 0) +
      (yearData.historiasClinicas?.length || 0) +
      (yearData.exploracionesFisicas?.length || 0) +
      (yearData.examenesVista?.length || 0) +
      (yearData.antidopings?.length || 0) +
      (yearData.certificados?.length || 0) +
      (yearData.notasMedicas?.length || 0)
    );
  }, 0);
});

// Computed para el total de documentos externos
const totalDocumentosExternos = computed(() => {
  if (!documentos.documentsByYear) return 0;
  return Object.values(documentos.documentsByYear).reduce((total, yearData) => {
    return total + (yearData.documentosExternos?.length || 0);
  }, 0);
});

// Computed para el año más reciente con documentos
const añoMasReciente = computed(() => {
  if (!documentos.documentsByYear || Object.keys(documentos.documentsByYear).length === 0) return null;
  return Math.max(...Object.keys(documentos.documentsByYear).map(Number));
});

</script>

<template>
  <!-- Modales -->
  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" 
      @closeModal="showSubscriptionModal = false"/>
  </Transition>

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

  <div class="grid gap-5">

    <!-- Header principal con información del trabajador -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div class="p-6">
        <Transition appear mode="out-in" name="slide-up">
          <div v-if="trabajadores.currentTrabajador" class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            
            <!-- Información del trabajador -->
            <div class="flex items-center gap-4 sm:mb-4 lg:mb-0">
              <!-- Logo de la empresa o placeholder -->
              <div class="flex-shrink-0">
                <img
                  v-if="empresas.currentEmpresa?.logotipoEmpresa?.data"
                  :src="'/uploads/logos/' + empresas.currentEmpresa.logotipoEmpresa.data + '?t=' + empresas.currentEmpresa.updatedAt"
                  :alt="'Logo de ' + empresas.currentEmpresa?.nombreComercial"
                  class="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg shadow-lg"
                />
                <div v-else class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i class="fas fa-building text-white text-xl sm:text-2xl"></i>
                </div>
              </div>
              
                <!-- Datos del trabajador -->
                <div class="flex-1 min-w-0">
                  <h1 class="text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i class="fas fa-user text-emerald-600 text-md sm:text-lg lg:text-xl xl:text-2xl"></i>
                    {{ trabajadores.currentTrabajador?.nombre }}
                  </h1>
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <div class="flex sm:hidden md:flex items-center gap-2 group relative">
                      <i class="fas fa-birthday-cake text-emerald-500 text-sm"></i>
                      <span class="text-sm sm:text-base text-gray-600">
                        {{ calcularEdad(trabajadores.currentTrabajador?.fechaNacimiento) }} años
                      </span>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Edad
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 group relative">
                      <i class="fas fa-briefcase text-blue-500 text-sm"></i>
                      <span class="text-sm sm:text-base text-gray-600">
                        {{ trabajadores.currentTrabajador?.puesto }}
                      </span>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Puesto
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                      </div>
                    </div>
                    <div class="flex sm:hidden md:flex lg:hidden xl:flex items-center gap-2 group relative">
                      <i class="fas fa-clock text-cyan-500 text-sm"></i>
                      <span class="text-sm sm:text-base text-gray-600">
                        {{ calcularAntiguedad(trabajadores.currentTrabajador?.fechaIngreso) }}
                      </span>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Antigüedad
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                      </div>
                    </div>
                    <div v-if="trabajadores.currentTrabajador?.numeroEmpleado" class="flex items-center gap-2 group relative">
                      <i class="fas fa-id-badge text-purple-500 text-sm"></i>
                      <span class="text-sm sm:text-base text-gray-600">
                        No. {{ trabajadores.currentTrabajador.numeroEmpleado }}
                      </span>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Número de empleado
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            
            <!-- Estadísticas rápidas -->
            <div class="hidden sm:flex sm:flex-row gap-3">
              <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center sm:w-1/3 md:w-1/3 lg:w-1/2 xl:w-1/3">
                <div class="text-2xl font-bold text-emerald-600">{{ totalDocumentosCreados }}</div>
                <div class="text-xs text-emerald-700 font-medium">
                  {{ totalDocumentosCreados === 1 ? 'Documento Creado' : 'Documentos Creados' }}
                </div>
              </div>
              <div class="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-center sm:w-1/3 md:w-1/3 lg:w-1/2 xl:w-1/3">
                <div class="text-2xl font-bold text-purple-600">{{ totalDocumentosExternos }}</div>
                <div class="text-xs text-purple-700 font-medium">
                  {{ totalDocumentosExternos === 1 ? 'Documento Externo' : 'Documentos Externos' }}
                </div>
              </div>
              <div class="hidden sm:block lg:hidden xl:block bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center sm:w-1/3 md:w-1/3 lg:w-1/2 xl:w-1/3">
                <div class="text-2xl font-bold text-orange-600">
                  {{ añoMasReciente || 'N/A' }}
                </div>
                <div class="text-xs text-orange-700 font-medium">Año Más Reciente</div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Aviso de logotipo pendiente -->
    <Transition appear name="slide-down">
      <div v-if="logotipoPendiente" class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <i class="fas fa-exclamation-triangle text-amber-600 text-sm"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm text-amber-800">
            <span class="font-semibold">Aviso:</span> Puedes crear informes, pero como no has subido un logotipo, el encabezado podría verse incorrecto. 
            <router-link :to="{ name: 'perfil-proveedor' }" class="font-semibold underline hover:text-amber-900 transition-colors">
              Sube tu logotipo aquí
            </router-link> 
            para mejor presentación.
          </p>
        </div>
      </div>
    </Transition>

    <!-- Panel de creación de documentos -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Header del panel -->
      <div class="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <i class="fas fa-plus text-white text-sm"></i>
            </div>
            <div>
              <h2 class="text-lg font-medium text-white">Crear Nuevo Documento</h2>
              <p class="text-emerald-100 text-sm">Selecciona el tipo de documento a crear</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de documentos -->
      <div class="p-6">
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          
          <!-- Historia Clínica -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'historiaClinica'
          })" class="group relative bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-2 border-teal-200 hover:border-teal-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-600 transition-colors">
                <i class="fas fa-notes-medical text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Historia Clínica</h3>
              <p class="text-xs text-gray-600">Entrevista médica</p>
            </div>
          </button>

          <!-- Exploración Física -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'exploracionFisica'
          })" class="group relative bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 transition-colors">
                <i class="fas fa-heartbeat text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Exploración Física</h3>
              <p class="text-xs text-gray-600">Aparatos y sistemas</p>
            </div>
          </button>

          <!-- Examen de la Vista -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'examenVista'
          })" class="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-600 transition-colors">
                <i class="fas fa-eye text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Examen Vista</h3>
              <p class="text-xs text-gray-600">Agudeza visual y colores</p>
            </div>
          </button>

          <!-- Antidoping -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'antidoping'
          })" class="group relative bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 hover:border-red-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition-colors">
                <i class="fas fa-flask text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Antidoping</h3>
              <p class="text-xs text-gray-600">Prueba de sustancias</p>
            </div>
          </button>

          <!-- Aptitud -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'aptitud'
          })" class="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 transition-colors">
                <i class="fas fa-user-check text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Aptitud</h3>
              <p class="text-xs text-gray-600">Evaluación laboral</p>
            </div>
          </button>

          <!-- Certificado -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'certificado'
          })" class="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <i class="fas fa-certificate text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Certificado</h3>
              <p class="text-xs text-gray-600">Certificación médica</p>
            </div>
          </button>

          <!-- Nota Médica -->
          <button @click="navigateTo('crear-documento', {
            idEmpresa: empresas.currentEmpresaId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: 'notaMedica'
          })" class="group relative bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200 hover:border-pink-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div class="text-center">
              <div class="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-600 transition-colors">
                <i class="fas fa-stethoscope text-white text-lg"></i>
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">Nota Médica</h3>
              <p class="text-xs text-gray-600">Consultas</p>
            </div>
          </button>
        </div>

        <!-- Documento Externo -->
        <div class="mt-6 flex justify-center">
          <SliderButton 
            class="w-full max-w-md" 
            text="Documento Externo" 
            @click="toggleDocumentoExternoModal"
            @closeModal="toggleDocumentoExternoModal" 
          />
        </div>
      </div>
    </div>

    <!-- Contenido principal de documentos -->
    <div>
      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.loading" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4 animate-pulse">
            <i class="fas fa-spinner fa-spin text-2xl text-emerald-600"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Cargando documentos...</h2>
          <p class="text-gray-500">Obteniendo el historial médico del trabajador</p>
        </div>
        
        <div v-else>
          <!-- Lista de documentos por año -->
          <div v-if="documentos.documentsByYear && Object.keys(documentos.documentsByYear).length" class="grid grid-cols-1 gap-6">
            <GrupoDocumentos 
              v-for="year in Object.keys(documentos.documentsByYear).sort((a, b) => Number(b) - Number(a))"
              :key="year" 
              :documents="documentos.documentsByYear[year]" 
              :year="year"
              @eliminarDocumento="toggleDeleteModal" 
              @abrirModalUpdate="toggleDocumentoExternoUpdateModal" 
              @openSubscriptionModal="showSubscriptionModal = true"
              :toggleRouteSelection="toggleRouteSelection" 
              :selectedRoutes="selectedRoutes"
            />
          </div>
          
          <!-- Estado vacío -->
          <div v-else class="text-center py-8">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <i class="fas fa-folder-open text-6xl text-gray-400"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Expediente médico vacío
            </h2>
            <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
              Este trabajador aún no tiene documentos médicos registrados. 
              Comienza creando una historia clínica para establecer el expediente médico.
            </p>
            
            <!-- Sugerencias de documentos -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 max-w-4xl mx-auto">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 text-center">
                ¿Por dónde empezar?
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div class="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
                  <div class="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-notes-medical text-white text-xl"></i>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-2">Historia Clínica</h4>
                  <p class="text-sm text-gray-600 mb-4">
                    Base fundamental del expediente médico
                  </p>
                  <button @click="navigateTo('crear-documento', {
                    idEmpresa: empresas.currentEmpresaId,
                    idTrabajador: trabajadores.currentTrabajadorId,
                    tipoDocumento: 'historiaClinica'
                  })" class="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Crear Historia Clínica
                  </button>
                </div>
                
                <div class="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                  <div class="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-flask text-white text-xl"></i>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-2">Antidoping</h4>
                  <p class="text-sm text-gray-600 mb-4">
                    Examen para detección de consumo de sustancias
                  </p>
                  <button @click="navigateTo('crear-documento', {
                    idEmpresa: empresas.currentEmpresaId,
                    idTrabajador: trabajadores.currentTrabajadorId,
                    tipoDocumento: 'antidoping'
                  })" class="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Crear Antidoping
                  </button>
                </div>
                
                <div class="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                  <div class="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-stethoscope text-white text-xl"></i>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-2">Nota Médica</h4>
                  <p class="text-sm text-gray-600 mb-4">
                    Consultas y evaluaciones médicas
                  </p>
                  <button @click="navigateTo('crear-documento', {
                    idEmpresa: empresas.currentEmpresaId,
                    idTrabajador: trabajadores.currentTrabajadorId,
                    tipoDocumento: 'notaMedica'
                  })" class="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Crear Nota Médica
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Panel de botones deslizante -->
    <div class="relative flex justify-center md:justify-start">
      <SlidingButtonPanel :selectedRoutes="selectedRoutes" />
    </div>

  </div>
</template>

<style scoped>
/* Animaciones para las transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Animación personalizada para el icono de carga */
@keyframes gentle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: gentle-pulse 2s ease-in-out infinite;
}

/* Efectos de hover para las tarjetas */
.transform {
  transition: all 0.3s ease;
}

.transform:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Responsive design mejorado */
@media (max-width: 640px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Mejoras para los botones */
button:active {
  transform: scale(0.98);
}

/* Efectos de gradiente mejorados */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
