<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { useCurrentUser } from '@/composables/useCurrentUser';
import FormStepper from '@/components/steps/FormStepper.vue';
import VisualizadorAntidoping from '@/components/steps/VisualizadorAntidoping.vue';
import VisualizadorAptitud from '@/components/steps/VisualizadorAptitud.vue';
import VisualizadorCertificado from '@/components/steps/VisualizadorCertificado.vue';
import VisualizadorExamenVista from '@/components/steps/VisualizadorExamenVista.vue';
import VisualizadorExploracionFisica from '@/components/steps/VisualizadorExploracionFisica.vue';
import VisualizadorHistoriaClinica from '@/components/steps/VisualizadorHistoriaClinica.vue';
import VisualizadorNotaMedica from '@/components/steps/VisualizadorNotaMedica.vue';
import VisualizadorControlPrenatal from '@/components/steps/VisualizadorControlPrenatal.vue';

const route = useRoute();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();
const steps = useStepsStore();
const { ensureUserLoaded } = useCurrentUser();

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

  // Consultar altura disponible para control prenatal (una sola vez al iniciar)
  if (tipoDocumento.value === 'controlPrenatal') {
    formData.consultarAlturaDisponible(trabajadorId.value)
      .then(({ altura, fuente }) => {
        if (altura) {
          console.log(`Altura obtenida de ${fuente}: ${altura}m para control prenatal`);
        }
      })
      .catch(error => console.log('No se pudo consultar altura disponible:', error));
  }
});

// Verificar cuando los datos se hayan cargado completamente
watchEffect(async () => {
  const empresa = empresas.currentEmpresa?.nombreComercial;
  const centroTrabajo = centrosTrabajo.currentCentroTrabajo?.nombreCentro;
  const trabajador = trabajadores.currentTrabajador?.nombre;

  if (empresa && centroTrabajo && trabajador && tipoDocumento.value) {
    // Obtener el ID del usuario actual
    const currentUserId = await ensureUserLoaded();
    
    if (!currentUserId) {
      console.error('No se pudo obtener el ID del usuario actual');
      return;
    }

    const rutaBase = `expedientes-medicos/${empresa}/${centroTrabajo}/${trabajador}/`;

    const documentoMap = {
      antidoping: formData.formDataAntidoping,
      aptitud: formData.formDataAptitud,
      certificado: formData.formDataCertificado,
      'documento Externo': formData.formDataDocumentoExterno,
      examenVista: formData.formDataExamenVista,
      exploracionFisica: formData.formDataExploracionFisica,
      historiaClinica: formData.formDataHistoriaClinica,
      notaMedica: formData.formDataNotaMedica,
      controlPrenatal: formData.formDataControlPrenatal,
    };

    const documentoForm = documentoMap[tipoDocumento.value];

    if (documentoForm) {
      documentoForm.createdBy = currentUserId;
      documentoForm.updatedBy = currentUserId;
      documentoForm.rutaPDF = rutaBase;
    } else {
      console.error(`Tipo de documento no reconocido: ${tipoDocumento.value}`);
    }
  }
});

onUnmounted(() => {
  formData.resetFormData();
});

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

const heredoFamiliaresNegados = () => {
  formData.formDataHistoriaClinica.nefropatias = 'No';
  formData.formDataHistoriaClinica.nefropatiasEspecificar = 'Negado';
  formData.formDataHistoriaClinica.diabeticos = 'No';
  formData.formDataHistoriaClinica.diabeticosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.hipertensivos = 'No';
  formData.formDataHistoriaClinica.hipertensivosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.cardiopaticos = 'No';
  formData.formDataHistoriaClinica.cardiopaticosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.neoplasicos = 'No';
  formData.formDataHistoriaClinica.neoplasicosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.psiquiatricos = 'No';
  formData.formDataHistoriaClinica.psiquiatricosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.epilepticos = 'No';
  formData.formDataHistoriaClinica.epilepticosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.autoinmunes = 'No';
  formData.formDataHistoriaClinica.autoinmunesEspecificar = 'Negado';
  formData.formDataHistoriaClinica.tuberculosis = 'No';
  formData.formDataHistoriaClinica.tuberculosisEspecificar = 'Negado';
  formData.formDataHistoriaClinica.hepatopatias = 'No';
  formData.formDataHistoriaClinica.hepatopatiasEspecificar = 'Negado';
};

const personalesPatologicosNegados = () => {
  formData.formDataHistoriaClinica.lumbalgias = 'No';
  formData.formDataHistoriaClinica.lumbalgiasEspecificar = 'Negado';
  formData.formDataHistoriaClinica.diabeticosPP = 'No';
  formData.formDataHistoriaClinica.diabeticosPPEspecificar = 'Negado';
  formData.formDataHistoriaClinica.cardiopaticosPP = 'No';
  formData.formDataHistoriaClinica.cardiopaticosPPEspecificar = 'Negado';
  formData.formDataHistoriaClinica.alergicos = 'No';
  formData.formDataHistoriaClinica.alergicosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.hipertensivosPP = 'No';
  formData.formDataHistoriaClinica.hipertensivosPPEspecificar = 'Negado';
  formData.formDataHistoriaClinica.respiratorios = 'No';
  formData.formDataHistoriaClinica.respiratoriosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.epilepticosPP = 'No';
  formData.formDataHistoriaClinica.epilepticosPPEspecificar = 'Negado';
  formData.formDataHistoriaClinica.accidentes = 'No';
  formData.formDataHistoriaClinica.accidentesEspecificar = 'Negado';
  formData.formDataHistoriaClinica.quirurgicos = 'No';
  formData.formDataHistoriaClinica.quirurgicosEspecificar = 'Negado';
  formData.formDataHistoriaClinica.traumaticos = 'No';
  formData.formDataHistoriaClinica.traumaticosEspecificar = 'Negado';
};

const personalesNoPatologicosNegados = () => {
  formData.formDataHistoriaClinica.alcoholismo = 'No';
  formData.formDataHistoriaClinica.alcoholismoEspecificar = 'Negado';
  formData.formDataHistoriaClinica.tabaquismo = 'No';
  formData.formDataHistoriaClinica.tabaquismoEspecificar = 'Negado';
  formData.formDataHistoriaClinica.toxicomanias = 'No';
  formData.formDataHistoriaClinica.toxicomaniasEspecificar = 'Negado';
  formData.formDataHistoriaClinica.alimentacionDeficiente = 'No';
  formData.formDataHistoriaClinica.alimentacionDeficienteEspecificar = 'Adecuada';
  formData.formDataHistoriaClinica.actividadFisicaDeficiente = 'No';
  formData.formDataHistoriaClinica.actividadFisicaDeficienteEspecificar = 'Adecuada';
  formData.formDataHistoriaClinica.higienePersonalDeficiente = 'No';
  formData.formDataHistoriaClinica.higienePersonalDeficienteEspecificar = 'Adecuada';
};

const marcarSinHallazgos = () => {
  formData.formDataExploracionFisica.craneoCara = 'Sin hallazgos';
  formData.formDataExploracionFisica.ojos = 'Sin hallazgos';
  formData.formDataExploracionFisica.oidos = 'Sin hallazgos';
  formData.formDataExploracionFisica.nariz = 'Sin hallazgos';
  formData.formDataExploracionFisica.boca = 'Sin hallazgos';
  formData.formDataExploracionFisica.cuello = 'Sin hallazgos';
  formData.formDataExploracionFisica.hombros = 'Sin hallazgos';
  formData.formDataExploracionFisica.codos = 'Sin hallazgos';
  formData.formDataExploracionFisica.manos = 'Sin hallazgos';
  formData.formDataExploracionFisica.reflejosOsteoTendinososSuperiores = 'Sin hallazgos';
  formData.formDataExploracionFisica.vascularESuperiores = 'Sin hallazgos';
  formData.formDataExploracionFisica.torax = 'Sin hallazgos';
  formData.formDataExploracionFisica.abdomen = 'Sin hallazgos';
  formData.formDataExploracionFisica.cadera = 'Sin hallazgos';
  formData.formDataExploracionFisica.rodillas = 'Sin hallazgos';
  formData.formDataExploracionFisica.tobillosPies = 'Sin hallazgos';
  formData.formDataExploracionFisica.reflejosOsteoTendinososInferiores = 'Sin hallazgos';
  formData.formDataExploracionFisica.vascularEInferiores = 'Sin hallazgos';
  formData.formDataExploracionFisica.inspeccionColumna = 'Sin hallazgos';
  formData.formDataExploracionFisica.movimientosColumna = 'Sin hallazgos';
  formData.formDataExploracionFisica.lesionesPiel = 'Sin hallazgos';
  formData.formDataExploracionFisica.cicatrices = 'Sin hallazgos';
  formData.formDataExploracionFisica.nevos = 'Sin hallazgos';
  formData.formDataExploracionFisica.coordinacion = 'Sin hallazgos';
  formData.formDataExploracionFisica.sensibilidad = 'Sin hallazgos';
  formData.formDataExploracionFisica.equilibrio = 'Sin hallazgos';
  formData.formDataExploracionFisica.marcha = 'Sin hallazgos';
};
</script>

<template>
  <Transition appear mode="out-in" name="slide-up">
    <div>
      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.currentTypeOfDocument === 'antidoping'"
          class="max-w-3xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
          <div class="w-full lg:w-1/2">
            <FormStepper />
          </div>
          <div class="w-full lg:w-1/2">
            <VisualizadorAntidoping />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.currentTypeOfDocument === 'aptitud'"
          class=" flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/4">
            <FormStepper />
            <div class="text-center mt-4 p-4 md:p-6 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg max-w-md mx-auto">
              <p class="text-xl font-bold text-gray-700 flex items-center justify-center space-x-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Acción Rápida</span>
              </p>
              <button 
                type="button"
                @click="() => { goToStep(8); }"
                class="w-full mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2">
                <span>No más evaluaciones adicionales</span>
              </button>
            </div>
          </div>
          <div class="w-full xl:w-3/4">
            <VisualizadorAptitud />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.currentTypeOfDocument === 'certificado'"
          class="max-w-6xl mx-auto flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
          <div class="w-full xl:w-1/3">
            <FormStepper />
          </div>
          <div class="w-full xl:w-2/3">
            <VisualizadorCertificado />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">  
        <div v-if="documentos.currentTypeOfDocument === 'exploracionFisica'"
          class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/4">
            <FormStepper />
            <div class="text-center mt-4 p-4 md:p-6 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg max-w-md mx-auto">
              <p class="text-xl font-bold text-gray-700 flex items-center justify-center space-x-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Acción Rápida</span>
              </p>
              <button 
                type="button"
                @click="() => { marcarSinHallazgos(); goToStep(31); }"
                class="w-full mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2">
                <span>Sin hallazgos en la exploración</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="w-full xl:w-3/4">
            <VisualizadorExploracionFisica />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">  
        <div v-if="documentos.currentTypeOfDocument === 'examenVista'"
          class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/4">
            <FormStepper />
          </div>
          <div class="w-full xl:w-3/4">
            <VisualizadorExamenVista />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.currentTypeOfDocument === 'historiaClinica'"
          class="flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/4">
            <FormStepper />
            <div class="text-center mt-4 p-4 md:p-6 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg max-w-md mx-auto">
              <p class="text-xl font-bold text-gray-700 flex items-center justify-center space-x-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Acciones Rápidas</span>
              </p>
              <button 
                type="button"
                @click="() => { heredoFamiliaresNegados(); goToStep(12); }"
                class="w-full mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2">
                <span>Heredofamiliares Negados</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                type="button"
                @click="() => { personalesPatologicosNegados(); goToStep(22); }"
                class="w-full mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2">
                <span>Patológicos Negados</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                type="button"
                @click="() => { personalesNoPatologicosNegados(); goToStep(28); }"
                class="w-full mt-4 px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform active:scale-95 flex items-center justify-center space-x-2">
                <span>No Patológicos Negados</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="w-full xl:w-3/4">
            <VisualizadorHistoriaClinica />
          </div>
        </div>
      </Transition>

      <Transition appear mode="out-in" name="slide-up">  
        <div v-if="documentos.currentTypeOfDocument === 'notaMedica'"
          class="max-w-6xl mx-auto flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/3">
            <FormStepper />
          </div>
          <div class="w-full xl:w-2/3 max-w-3xl mx-auto">
            <VisualizadorNotaMedica />
          </div>
        </div>
      </Transition> 

      <Transition appear mode="out-in" name="slide-up">
        <div v-if="documentos.currentTypeOfDocument === 'controlPrenatal'"
          class="max-w-6xl mx-auto flex flex-col xl:flex-row md:flex-wrap lg:flex-nowrap gap-3 md:gap-6">
          <div class="w-full xl:w-1/3">
            <FormStepper />
          </div>
          <div class="w-full xl:w-2/3 max-w-3xl mx-auto">
            <VisualizadorControlPrenatal />
          </div>
        </div>
      </Transition>

    </div>
  </Transition>

</template>