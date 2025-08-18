<script>
import axios from 'axios';
import { ref, onMounted, onUnmounted, inject, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useStepsStore } from '@/stores/steps';

import Step1Antidoping from '../steps/antidopingSteps/Step1.vue';
import Step2Antidoping from '../steps/antidopingSteps/Step2.vue';
import Step1Aptitud from '../steps/aptitudSteps/Step1.vue';
import Step2Aptitud from '../steps/aptitudSteps/Step2.vue';
import Step3Aptitud from '../steps/aptitudSteps/Step3.vue';
import Step4Aptitud from '../steps/aptitudSteps/Step4.vue';
import Step5Aptitud from '../steps/aptitudSteps/Step5.vue';
import Step6Aptitud from '../steps/aptitudSteps/Step6.vue';
import Step7Aptitud from '../steps/aptitudSteps/Step7.vue';
import Step8Aptitud from '../steps/aptitudSteps/Step8.vue';
import Step9Aptitud from '../steps/aptitudSteps/Step9.vue';
import Step10Aptitud from '../steps/aptitudSteps/Step10.vue';
import Step11Aptitud from '../steps/aptitudSteps/Step11.vue';
import Step1Certificado from '../steps/certificadoSteps/Step1.vue';
import Step2Certificado from '../steps/certificadoSteps/Step2.vue';
import Step1ExamenVista from '../steps/examenVistaSteps/Step1.vue';
import Step2ExamenVista from '../steps/examenVistaSteps/Step2.vue';
import Step3ExamenVista from '../steps/examenVistaSteps/Step3.vue';
import Step4ExamenVista from '../steps/examenVistaSteps/Step4.vue';
import Step5ExamenVista from '../steps/examenVistaSteps/Step5.vue';
import Step6ExamenVista from '../steps/examenVistaSteps/Step6.vue';
import Step1ExploracionFisica from '../steps/exploracionFisicaSteps/Step1.vue';
import Step2ExploracionFisica from '../steps/exploracionFisicaSteps/Step2.vue';
import Step3ExploracionFisica from '../steps/exploracionFisicaSteps/Step3.vue';
import Step4ExploracionFisica from '../steps/exploracionFisicaSteps/Step4.vue';
import Step5ExploracionFisica from '../steps/exploracionFisicaSteps/Step5.vue';
import Step6ExploracionFisica from '../steps/exploracionFisicaSteps/Step6.vue';
import Step7ExploracionFisica from '../steps/exploracionFisicaSteps/Step7.vue';
import Step8ExploracionFisica from '../steps/exploracionFisicaSteps/Step8.vue';
import Step9ExploracionFisica from '../steps/exploracionFisicaSteps/Step9.vue';
import Step10ExploracionFisica from '../steps/exploracionFisicaSteps/Step10.vue';
import Step11ExploracionFisica from '../steps/exploracionFisicaSteps/Step11.vue';
import Step12ExploracionFisica from '../steps/exploracionFisicaSteps/Step12.vue';
import Step13ExploracionFisica from '../steps/exploracionFisicaSteps/Step13.vue';
import Step14ExploracionFisica from '../steps/exploracionFisicaSteps/Step14.vue';
import Step15ExploracionFisica from '../steps/exploracionFisicaSteps/Step15.vue';
import Step16ExploracionFisica from '../steps/exploracionFisicaSteps/Step16.vue';
import Step17ExploracionFisica from '../steps/exploracionFisicaSteps/Step17.vue';
import Step18ExploracionFisica from '../steps/exploracionFisicaSteps/Step18.vue';
import Step19ExploracionFisica from '../steps/exploracionFisicaSteps/Step19.vue';
import Step20ExploracionFisica from '../steps/exploracionFisicaSteps/Step20.vue';
import Step21ExploracionFisica from '../steps/exploracionFisicaSteps/Step21.vue';
import Step22ExploracionFisica from '../steps/exploracionFisicaSteps/Step22.vue';
import Step23ExploracionFisica from '../steps/exploracionFisicaSteps/Step23.vue';
import Step24ExploracionFisica from '../steps/exploracionFisicaSteps/Step24.vue';
import Step25ExploracionFisica from '../steps/exploracionFisicaSteps/Step25.vue';
import Step26ExploracionFisica from '../steps/exploracionFisicaSteps/Step26.vue';
import Step27ExploracionFisica from '../steps/exploracionFisicaSteps/Step27.vue';
import Step28ExploracionFisica from '../steps/exploracionFisicaSteps/Step28.vue';
import Step29ExploracionFisica from '../steps/exploracionFisicaSteps/Step29.vue';
import Step30ExploracionFisica from '../steps/exploracionFisicaSteps/Step30.vue';
import Step31ExploracionFisica from '../steps/exploracionFisicaSteps/Step31.vue';
import Step1HistoriaClinica from '../steps/historiaClinicaSteps/Step1.vue';
import Step2HistoriaClinica from '../steps/historiaClinicaSteps/Step2.vue';
import Step3HistoriaClinica from '../steps/historiaClinicaSteps/Step3.vue';
import Step4HistoriaClinica from '../steps/historiaClinicaSteps/Step4.vue';
import Step5HistoriaClinica from '../steps/historiaClinicaSteps/Step5.vue';
import Step6HistoriaClinica from '../steps/historiaClinicaSteps/Step6.vue';
import Step7HistoriaClinica from '../steps/historiaClinicaSteps/Step7.vue';
import Step8HistoriaClinica from '../steps/historiaClinicaSteps/Step8.vue';
import Step9HistoriaClinica from '../steps/historiaClinicaSteps/Step9.vue';
import Step10HistoriaClinica from '../steps/historiaClinicaSteps/Step10.vue';
import Step11HistoriaClinica from '../steps/historiaClinicaSteps/Step11.vue';
import Step12HistoriaClinica from '../steps/historiaClinicaSteps/Step12.vue';
import Step13HistoriaClinica from '../steps/historiaClinicaSteps/Step13.vue';
import Step14HistoriaClinica from '../steps/historiaClinicaSteps/Step14.vue';
import Step15HistoriaClinica from '../steps/historiaClinicaSteps/Step15.vue';
import Step16HistoriaClinica from '../steps/historiaClinicaSteps/Step16.vue';
import Step17HistoriaClinica from '../steps/historiaClinicaSteps/Step17.vue';
import Step18HistoriaClinica from '../steps/historiaClinicaSteps/Step18.vue';
import Step19HistoriaClinica from '../steps/historiaClinicaSteps/Step19.vue';
import Step20HistoriaClinica from '../steps/historiaClinicaSteps/Step20.vue';
import Step21HistoriaClinica from '../steps/historiaClinicaSteps/Step21.vue';
import Step22HistoriaClinica from '../steps/historiaClinicaSteps/Step22.vue';
import Step23HistoriaClinica from '../steps/historiaClinicaSteps/Step23.vue';
import Step24HistoriaClinica from '../steps/historiaClinicaSteps/Step24.vue';
import Step25HistoriaClinica from '../steps/historiaClinicaSteps/Step25.vue';
import Step26HistoriaClinica from '../steps/historiaClinicaSteps/Step26.vue';
import Step27HistoriaClinica from '../steps/historiaClinicaSteps/Step27.vue';
import Step28HistoriaClinica from '../steps/historiaClinicaSteps/Step28.vue';
import Step29HistoriaClinica from '../steps/historiaClinicaSteps/Step29.vue';
import Step30HistoriaClinica from '../steps/historiaClinicaSteps/Step30.vue';
import Step31HistoriaClinica from '../steps/historiaClinicaSteps/Step31.vue';
import Step32HistoriaClinica from '../steps/historiaClinicaSteps/Step32.vue';
import Step33HistoriaClinica from '../steps/historiaClinicaSteps/Step33.vue';
import Step34HistoriaClinica from '../steps/historiaClinicaSteps/Step34.vue';
import Step35HistoriaClinica from '../steps/historiaClinicaSteps/Step35.vue';
import Step36HistoriaClinica from '../steps/historiaClinicaSteps/Step36.vue';
import Step37HistoriaClinica from '../steps/historiaClinicaSteps/Step37.vue';
import Step38HistoriaClinica from '../steps/historiaClinicaSteps/Step38.vue';
import Step39HistoriaClinica from '../steps/historiaClinicaSteps/Step39.vue';
import Step40HistoriaClinica from '../steps/historiaClinicaSteps/Step40.vue';
import Step41HistoriaClinica from '../steps/historiaClinicaSteps/Step41.vue';
import Step42HistoriaClinica from '../steps/historiaClinicaSteps/Step42.vue';
import Step43HistoriaClinica from '../steps/historiaClinicaSteps/Step43.vue';
import Step44HistoriaClinica from '../steps/historiaClinicaSteps/Step44.vue';
import Step45HistoriaClinica from '../steps/historiaClinicaSteps/Step45.vue';
import Step46HistoriaClinica from '../steps/historiaClinicaSteps/Step46.vue';
import Step1NotaMedica from '../steps/notaMedicaSteps/Step1.vue';
import Step2NotaMedica from '../steps/notaMedicaSteps/Step2.vue';
import Step3NotaMedica from '../steps/notaMedicaSteps/Step3.vue';
import Step4NotaMedica from '../steps/notaMedicaSteps/Step4.vue';
import Step5NotaMedica from '../steps/notaMedicaSteps/Step5.vue';
import Step6NotaMedica from '../steps/notaMedicaSteps/Step6.vue';
import Step7NotaMedica from '../steps/notaMedicaSteps/Step7.vue';
import Step8NotaMedica from '../steps/notaMedicaSteps/Step8.vue';
import Step9NotaMedica from '../steps/notaMedicaSteps/Step9.vue';
import Step1ControlPrenatal from '../steps/controlPrenatalSteps/Step1.vue';
import Step2ControlPrenatal from '../steps/controlPrenatalSteps/Step2.vue';
import ModalFaltanCampos from '../ModalFaltanCampos.vue';

export default {
  components: { Step1Antidoping, Step2Antidoping, Step1Aptitud, Step2Aptitud, Step3Aptitud, Step4Aptitud, Step5Aptitud, Step6Aptitud, Step7Aptitud, Step8Aptitud, Step9Aptitud, Step10Aptitud, Step11Aptitud, Step1Certificado, Step2Certificado, Step1ExamenVista, Step2ExamenVista, Step3ExamenVista, Step4ExamenVista, Step5ExamenVista, Step6ExamenVista, Step1ExploracionFisica, Step2ExploracionFisica, Step3ExploracionFisica, Step4ExploracionFisica, Step5ExploracionFisica, Step6ExploracionFisica, Step7ExploracionFisica, Step8ExploracionFisica, Step9ExploracionFisica, Step10ExploracionFisica, Step11ExploracionFisica, Step12ExploracionFisica, Step13ExploracionFisica, Step14ExploracionFisica, Step15ExploracionFisica, Step16ExploracionFisica, Step17ExploracionFisica, Step18ExploracionFisica, Step19ExploracionFisica, Step20ExploracionFisica, Step21ExploracionFisica, Step22ExploracionFisica, Step23ExploracionFisica, Step24ExploracionFisica, Step25ExploracionFisica, Step26ExploracionFisica, Step27ExploracionFisica, Step28ExploracionFisica, Step29ExploracionFisica, Step30ExploracionFisica, Step31ExploracionFisica, Step1HistoriaClinica, Step2HistoriaClinica, Step3HistoriaClinica, Step4HistoriaClinica, Step5HistoriaClinica, Step6HistoriaClinica, Step7HistoriaClinica, Step8HistoriaClinica, Step9HistoriaClinica, Step10HistoriaClinica, Step11HistoriaClinica, Step12HistoriaClinica, Step13HistoriaClinica, Step14HistoriaClinica, Step15HistoriaClinica, Step16HistoriaClinica, Step17HistoriaClinica, Step18HistoriaClinica, Step19HistoriaClinica, Step20HistoriaClinica, Step21HistoriaClinica, Step22HistoriaClinica, Step23HistoriaClinica, Step24HistoriaClinica, Step25HistoriaClinica, Step26HistoriaClinica, Step27HistoriaClinica, Step28HistoriaClinica, Step29HistoriaClinica, Step30HistoriaClinica, Step31HistoriaClinica, Step32HistoriaClinica, Step33HistoriaClinica, Step34HistoriaClinica, Step35HistoriaClinica, Step36HistoriaClinica, Step37HistoriaClinica, Step38HistoriaClinica, Step39HistoriaClinica, Step40HistoriaClinica, Step41HistoriaClinica, Step42HistoriaClinica, Step43HistoriaClinica, Step44HistoriaClinica, Step45HistoriaClinica, Step46HistoriaClinica, Step1NotaMedica, Step2NotaMedica, Step3NotaMedica, Step4NotaMedica, Step5NotaMedica, Step6NotaMedica, Step7NotaMedica, Step8NotaMedica, Step9NotaMedica, Step1ControlPrenatal, Step2ControlPrenatal, ModalFaltanCampos },
  setup() {
    const empresas = useEmpresasStore();
    const trabajadores = useTrabajadoresStore();
    const formData = useFormDataStore();
    const documentos = useDocumentosStore();
    const stepsStore = useStepsStore();
    const router = useRouter();
    const route = useRoute();

    const toast = inject('toast');

    // Computed properties para mejor UX
    const progressPercentage = computed(() => {
      // El porcentaje debe reflejar los pasos completados, no el paso actual
      // Si estamos en el paso 3, significa que hemos completado 2 pasos (pasos 1 y 2)
      const pasosCompletados = Math.max(0, stepsStore.currentStep - 1);
      return Math.round((pasosCompletados / stepsStore.steps.length) * 100);
    });

    const currentStepDisplay = computed(() => {
      return Math.min(stepsStore.currentStep, stepsStore.steps.length);
    });

    // Establece los pasos al montar el componente
    onMounted(() => {
      documentos.setCurrentTypeOfDocument(route.params.tipoDocumento);

      if (documentos.currentTypeOfDocument === 'antidoping') {
        stepsStore.setSteps([
          { component: Step1Antidoping, name: 'Paso 1' },
          { component: Step2Antidoping, name: 'Paso 2' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'aptitud') {
        stepsStore.setSteps([
          { component: Step1Aptitud, name: 'Paso 1' },
          { component: Step2Aptitud, name: 'Paso 2' },
          { component: Step3Aptitud, name: 'Paso 3' },
          { component: Step4Aptitud, name: 'Paso 4' },
          { component: Step5Aptitud, name: 'Paso 5' },
          { component: Step6Aptitud, name: 'Paso 6' },
          { component: Step7Aptitud, name: 'Paso 7' },
          { component: Step8Aptitud, name: 'Paso 8' },
          { component: Step9Aptitud, name: 'Paso 9' },
          { component: Step10Aptitud, name: 'Paso 10' },
          { component: Step11Aptitud, name: 'Paso 11' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'certificado') {
        stepsStore.setSteps([
          { component: Step1Certificado, name: 'Paso 1' },
          { component: Step2Certificado, name: 'Paso 2' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'examenVista') {
        stepsStore.setSteps([
          { component: Step1ExamenVista, name: 'Paso 1' },
          { component: Step2ExamenVista, name: 'Paso 2' },
          { component: Step3ExamenVista, name: 'Paso 3' },
          { component: Step4ExamenVista, name: 'Paso 4' },
          { component: Step5ExamenVista, name: 'Paso 5' },
          { component: Step6ExamenVista, name: 'Paso 6' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'exploracionFisica') {
        stepsStore.setSteps([
          { component: Step1ExploracionFisica, name: 'Paso 1' },
          { component: Step2ExploracionFisica, name: 'Paso 2' },
          { component: Step3ExploracionFisica, name: 'Paso 3' },
          { component: Step4ExploracionFisica, name: 'Paso 4' },
          { component: Step5ExploracionFisica, name: 'Paso 5' },
          { component: Step6ExploracionFisica, name: 'Paso 6' },
          { component: Step7ExploracionFisica, name: 'Paso 7' },
          { component: Step8ExploracionFisica, name: 'Paso 8' },
          { component: Step9ExploracionFisica, name: 'Paso 9' },
          { component: Step10ExploracionFisica, name: 'Paso 10' },
          { component: Step11ExploracionFisica, name: 'Paso 11' },
          { component: Step12ExploracionFisica, name: 'Paso 12' },
          { component: Step13ExploracionFisica, name: 'Paso 13' },
          { component: Step14ExploracionFisica, name: 'Paso 14' },
          { component: Step15ExploracionFisica, name: 'Paso 15' },
          { component: Step16ExploracionFisica, name: 'Paso 16' },
          { component: Step17ExploracionFisica, name: 'Paso 17' },
          { component: Step18ExploracionFisica, name: 'Paso 18' },
          { component: Step19ExploracionFisica, name: 'Paso 19' },
          { component: Step20ExploracionFisica, name: 'Paso 20' },
          { component: Step21ExploracionFisica, name: 'Paso 21' },
          { component: Step22ExploracionFisica, name: 'Paso 22' },
          { component: Step23ExploracionFisica, name: 'Paso 23' },
          { component: Step24ExploracionFisica, name: 'Paso 24' },
          { component: Step25ExploracionFisica, name: 'Paso 25' },
          { component: Step26ExploracionFisica, name: 'Paso 26' },
          { component: Step27ExploracionFisica, name: 'Paso 27' },
          { component: Step28ExploracionFisica, name: 'Paso 28' },
          { component: Step29ExploracionFisica, name: 'Paso 29' },
          { component: Step30ExploracionFisica, name: 'Paso 30' },
          { component: Step31ExploracionFisica, name: 'Paso 31' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'historiaClinica') {
        const historiaClinicaSteps = [
          { component: Step1HistoriaClinica, name: 'Paso 1' },
          { component: Step2HistoriaClinica, name: 'Paso 2' },
          { component: Step3HistoriaClinica, name: 'Paso 3' },
          { component: Step4HistoriaClinica, name: 'Paso 4' },
          { component: Step5HistoriaClinica, name: 'Paso 5' },
          { component: Step6HistoriaClinica, name: 'Paso 6' },
          { component: Step7HistoriaClinica, name: 'Paso 7' },
          { component: Step8HistoriaClinica, name: 'Paso 8' },
          { component: Step9HistoriaClinica, name: 'Paso 9' },
          { component: Step10HistoriaClinica, name: 'Paso 10' },
          { component: Step11HistoriaClinica, name: 'Paso 11' },
          { component: Step12HistoriaClinica, name: 'Paso 12' },
          { component: Step13HistoriaClinica, name: 'Paso 13' },
          { component: Step14HistoriaClinica, name: 'Paso 14' },
          { component: Step15HistoriaClinica, name: 'Paso 15' },
          { component: Step16HistoriaClinica, name: 'Paso 16' },
          { component: Step17HistoriaClinica, name: 'Paso 17' },
          { component: Step18HistoriaClinica, name: 'Paso 18' },
          { component: Step19HistoriaClinica, name: 'Paso 19' },
          { component: Step20HistoriaClinica, name: 'Paso 20' },
          { component: Step21HistoriaClinica, name: 'Paso 21' },
          { component: Step22HistoriaClinica, name: 'Paso 22' },
          { component: Step23HistoriaClinica, name: 'Paso 23' },
          { component: Step24HistoriaClinica, name: 'Paso 24' },
          { component: Step25HistoriaClinica, name: 'Paso 25' },
          { component: Step26HistoriaClinica, name: 'Paso 26' },
          { component: Step27HistoriaClinica, name: 'Paso 27' }
        ];

        // Agregar pasos condicionalmente según el sexo del trabajador
        if (trabajadores.currentTrabajador.sexo === 'Femenino') {
          historiaClinicaSteps.push(
            { component: Step28HistoriaClinica, name: 'Paso 28' },
            { component: Step29HistoriaClinica, name: 'Paso 29' },
            { component: Step30HistoriaClinica, name: 'Paso 30' },
            { component: Step31HistoriaClinica, name: 'Paso 31' },
            { component: Step32HistoriaClinica, name: 'Paso 32' },
            { component: Step33HistoriaClinica, name: 'Paso 33' },
            { component: Step34HistoriaClinica, name: 'Paso 34' },
            { component: Step35HistoriaClinica, name: 'Paso 35' },
            { component: Step36HistoriaClinica, name: 'Paso 36' },
            { component: Step37HistoriaClinica, name: 'Paso 37' },
            { component: Step38HistoriaClinica, name: 'Paso 38' },
            { component: Step39HistoriaClinica, name: 'Paso 39' },
            { component: Step40HistoriaClinica, name: 'Paso 40' },
            { component: Step41HistoriaClinica, name: 'Paso 41' },
          );
        }

        historiaClinicaSteps.push(
          { component: Step42HistoriaClinica, name: 'Paso 42' },
          { component: Step43HistoriaClinica, name: 'Paso 43' },
          { component: Step44HistoriaClinica, name: 'Paso 44' },
          { component: Step45HistoriaClinica, name: 'Paso 45' },
          { component: Step46HistoriaClinica, name: 'Paso 46' }
        );

        stepsStore.setSteps(historiaClinicaSteps);
      } else if (documentos.currentTypeOfDocument === 'notaMedica') {
        stepsStore.setSteps([
          { component: Step1NotaMedica, name: 'Paso 1' },
          { component: Step2NotaMedica, name: 'Paso 2' },
          { component: Step3NotaMedica, name: 'Paso 3' },
          { component: Step4NotaMedica, name: 'Paso 4' },
          { component: Step5NotaMedica, name: 'Paso 5' },
          { component: Step6NotaMedica, name: 'Paso 6' },
          { component: Step7NotaMedica, name: 'Paso 7' },
          { component: Step8NotaMedica, name: 'Paso 8' },
          { component: Step9NotaMedica, name: 'Paso 9' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'controlPrenatal') {
        stepsStore.setSteps([
          { component: Step1ControlPrenatal, name: 'Paso 1' },
          { component: Step2ControlPrenatal, name: 'Paso 2' },
        ]);
      } else {
        console.error(`Tipo de documento no reconocido: ${documentos.currentTypeOfDocument}`);
      }

      // Verifica si se está editando
      if (documentos.currentDocument) {
        // Si se está editando, mostrar mensaje final
        stepsStore.currentStep = stepsStore.steps.length + 1;
      }
    });

    // Manejo de eventos de teclado
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;

      // Permitir navegación en campos de entrada
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return; // Salir si un campo de texto está enfocado
      }

      // ¿Cambiar Enter y Backspace por ArrowRight y ArrowLeft?

      // Manejar Enter y Backspace
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevenir comportamiento por defecto de Enter
        stepsStore.nextStep();
      } else if (event.key === 'Backspace') {
        event.preventDefault(); // Prevenir comportamiento por defecto de Backspace
        stepsStore.previousStep();
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });


    // Función para limpiar valores undefined
    function limpiarValoresUndefined(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
      );
    }

    // Función para convertir todas las fechas al formato ISO
    function convertirFechasAISO(obj) {
      const result = { ...obj }; // Clonar el objeto para evitar modificar el original
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          const value = result[key];
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            // Si el valor es una fecha en formato YYYY-MM-DD, conviértelo a ISO
            result[key] = new Date(value).toISOString();
          }
        }
      }
      return result;
    }

    const user = ref(
        JSON.parse(localStorage.getItem('user')) || null // Recuperar usuario guardado o establecer null si no existe
    );
    // console.log('Usuario:', user.value);

    const handleSubmit = async () => {
      let datosLimpios;

      // Limpiar datos del formulario según el tipo de documento
      if (documentos.currentTypeOfDocument === 'antidoping') {
        datosLimpios = limpiarValoresUndefined(formData.formDataAntidoping);
      } else if (documentos.currentTypeOfDocument === 'aptitud') {
        datosLimpios = limpiarValoresUndefined(formData.formDataAptitud);
      } else if (documentos.currentTypeOfDocument === 'certificado') {
        datosLimpios = limpiarValoresUndefined(formData.formDataCertificado);
      } else if (documentos.currentTypeOfDocument === 'documento Externo') {
        datosLimpios = limpiarValoresUndefined(formData.formDataDocumentoExterno);
      } else if (documentos.currentTypeOfDocument === 'examenVista') {
        datosLimpios = limpiarValoresUndefined(formData.formDataExamenVista);
      } else if (documentos.currentTypeOfDocument === 'exploracionFisica') {
        datosLimpios = limpiarValoresUndefined(formData.formDataExploracionFisica);
      } else if (documentos.currentTypeOfDocument === 'historiaClinica') {
        datosLimpios = limpiarValoresUndefined(formData.formDataHistoriaClinica);
      } else if (documentos.currentTypeOfDocument === 'notaMedica') {
        datosLimpios = limpiarValoresUndefined(formData.formDataNotaMedica);
      } else if (documentos.currentTypeOfDocument === 'controlPrenatal') {
        datosLimpios = limpiarValoresUndefined(formData.formDataControlPrenatal);
      } else {
        console.error(`Tipo de documento no reconocido: ${documentos.currentTypeOfDocument}`);
        return; // Salir si el tipo de documento no es válido
      }

      // Convertir todas las fechas en los datos al formato ISO
      datosLimpios = convertirFechasAISO(datosLimpios);

      // console.log('Datos limpios para enviar al backend:', datosLimpios);

      try {
        let response;
        if (datosLimpios._id) {
          // console.log(datosLimpios)
          
          // Actualizar el documento
          response = await documentos.updateDocument(
            documentos.currentTypeOfDocument,
            trabajadores.currentTrabajadorId,
            datosLimpios._id,
            datosLimpios
          );
          toast.open({ message: 'Documento actualizado exitosamente.' });
        } else {

          // Crear un nuevo documento
          response = await documentos.createDocument(
            documentos.currentTypeOfDocument,
            trabajadores.currentTrabajadorId,
            datosLimpios
          );
          toast.open({ message: 'Documento creado exitosamente.' });
        }

        if (!response || !response.data || !response.data._id) {
          throw new Error('La respuesta del backend no contiene un ID válido');
        }

        const documentId = response.data._id;

        // Llamada al backend para generar el informe
        const apiEndpoint = `${import.meta.env.VITE_API_URL}/informes/${documentos.currentTypeOfDocument}/${empresas.currentEmpresaId}/${trabajadores.currentTrabajadorId}/${documentId}/${user.value._id}`;

        const informeResponse = await axios.get(apiEndpoint);
        // console.log("Respuesta del backend para el informe:", informeResponse.data);

      } catch (error) {
        console.error('Error en el proceso de creación o generación del informe:', error);
        toast.open({ message: 'Hubo un error, por favor intente nuevamente.', type: 'error' });
        if (error.response) {
          console.error('Detalles del error (respuesta del backend):', error.response.data);
        }
      }

      // Reiniciar el estado del formulario después de enviar
      formData.resetFormData();

      documentos.currentTypeOfDocument = null;
      router.back();
    };

    return {
      stepsStore,
      handleSubmit,
      progressPercentage,
      currentStepDisplay,
    };
  },
};
</script>

<template>
  <!-- Modal para campos faltantes -->
  <Transition appear name="fade">
    <ModalFaltanCampos v-if="stepsStore.showMissingFieldsModal" 
      @close="stepsStore.showMissingFieldsModal = false"/>
  </Transition>

  <div
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-7 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-md mx-auto">

    <!-- Barra de progreso mejorada -->
    <div class="relative w-full h-2 mb-4 bg-gray-200 rounded-full overflow-hidden">
      <div class="progress-bar absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-300"
        :style="{ width: ((stepsStore.currentStep - 1) / stepsStore.steps.length) * 100 + '%' }"></div>
    </div>

    <!-- Indicador sutil de progreso -->
    <div class="flex justify-between items-center mb-4 text-xs text-gray-500">
      <span>Paso {{ currentStepDisplay }} de {{ stepsStore.steps.length }}</span>
      <span class="font-medium text-emerald-600">{{ progressPercentage }}% completado</span>
    </div>

    <!-- Formulario dinámico -->
    <transition name="fade-slide" mode="out-in">
      <div v-if="stepsStore.currentStep <= stepsStore.steps.length && stepsStore.steps.length > 0"
        :key="stepsStore.currentStep">
        <component :is="stepsStore.steps[stepsStore.currentStep - 1].component" />
      </div>
    </transition>

    <!-- Navegación entre pasos -->
    <div v-if="stepsStore.currentStep <= stepsStore.steps.length && stepsStore.steps.length > 0"
      class="flex flex-col mt-6">
      <div class="flex justify-between">
        <button :class="{ invisible: stepsStore.currentStep === 1 }" @click="stepsStore.previousStep"
          class="px-4 py-2 text-xs md:text-base text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300">
          &lt; Anterior
        </button>
  
        <button :class="{ invisible: stepsStore.currentStep > stepsStore.steps.length }" @click="stepsStore.nextStep"
          class="px-4 py-2 text-xs md:text-base text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
          Siguiente &gt;
        </button>
      </div>

      <button @click="handleSubmit"
        class="text-xs md:text-sm mt-6 text-gray-500"
      >
        Guardar cambios
      </button>
    </div>

    <!-- Mensaje final -->
    <div v-else>
      <transition name="fade-slide" mode="out-in">
        <div>
          <p class="text-center text-2xl font-bold mb-2 text-emerald-600">¡Completado!</p>
          <p class="text-center text-sm font-medium text-gray-500 mb-6">
            Todos los pasos se han completado correctamente. Puedes guardar el PDF o revisar nuevamente.
          </p>
          <div class="flex justify-between">
            <button @click="stepsStore.previousStep"
              class="px-4 py-2 text-xs md:text-base text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300 shadow-md">
              &lt; Anterior
            </button>
            <button @click="handleSubmit"
              class="px-4 py-2 text-xs md:text-base rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-transform duration-200 ease-in-out hover:scale-110 glow-animation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              Crear PDF
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease, filter 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-5%);
  filter: blur(10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10%);
  filter: blur(10px);
}

.progress-bar {
  transition: all 0.3s ease-in-out;
}

button {
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

/* Estilos específicos para los botones verdes al ser presionados */
.bg-emerald-600:active {
  transform: translateY(2px) scale(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  background-color: #059669;
  /* Tono más oscuro de verde */
}

/* Estilos específicos para los botones grises al ser presionados */
.bg-gray-500:active {
  transform: translateY(2px) scale(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  background-color: #4b5563;
  /* Mantiene un tono de gris similar al hover */
}

.glow-animation {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.glow-animation::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, rgba(56, 248, 158, 0.1), rgba(56, 248, 158, 0.3));
  opacity: 0.8;
  transform: rotate(0deg);
  z-index: -1;
  animation: glow 3s linear infinite;
  border-radius: inherit;
  /* Asegura que siga la forma del botón */
}

@keyframes glow {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
