<script>
import { onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useStepsStore } from '@/stores/steps';

import Step1Antidoping from '../steps/antidopingSteps/Step1.vue';
import Step2Antidoping from '../steps/antidopingSteps/Step2.vue';
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


export default {
  components: { Step1Antidoping, Step2Antidoping, Step1HistoriaClinica, Step2HistoriaClinica, Step3HistoriaClinica, Step4HistoriaClinica, Step5HistoriaClinica, Step6HistoriaClinica, Step7HistoriaClinica, Step8HistoriaClinica, Step9HistoriaClinica, Step10HistoriaClinica, Step11HistoriaClinica, Step12HistoriaClinica, Step13HistoriaClinica, Step14HistoriaClinica, Step15HistoriaClinica, Step16HistoriaClinica, Step17HistoriaClinica, Step18HistoriaClinica, Step19HistoriaClinica, Step20HistoriaClinica, Step21HistoriaClinica, Step22HistoriaClinica, Step23HistoriaClinica, Step24HistoriaClinica, Step25HistoriaClinica, Step26HistoriaClinica, Step27HistoriaClinica },
  setup() {
    const formData = useFormDataStore();
    const documentos = useDocumentosStore();
    const stepsStore = useStepsStore();
    const router = useRouter();
    const route = useRoute();

    // Establece los pasos al montar el componente
    onMounted(() => {
      documentos.setCurrentTypeOfDocument(route.params.tipoDocumento);

      if (documentos.currentTypeOfDocument === 'Antidoping') {
        stepsStore.setSteps([
          { component: Step1Antidoping, name: 'Paso 1' },
          { component: Step2Antidoping, name: 'Paso 2' },
        ]);
      } else if (documentos.currentTypeOfDocument === 'Historia Clínica') {
        stepsStore.setSteps([
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
          { component: Step27HistoriaClinica, name: 'Paso 27' },
        ]);
      }
    });

    // Manejo de eventos de teclado
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;

      // Permitir navegación en campos de entrada
      if (activeElement.tagName === 'TEXTAREA') {
        return; // Salir si un campo de texto está enfocado
      }

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


    // Función auxiliar para obtener el formulario plano según el tipo de documento
    const handleSubmit = () => {
      if (documentos.currentTypeOfDocument === 'Antidoping') {
        console.log('Datos enviados:', formData.formDataAntidoping);
      } else if (documentos.currentTypeOfDocument === 'Aptitud') {
        console.log('Datos enviados:', formData.formDataAptitud);
      } else if (documentos.currentTypeOfDocument === 'Certificado') {
        console.log('Datos enviados:', formData.formDataCertificado);
      } else if (documentos.currentTypeOfDocument === 'Documento Externo') {
        console.log('Datos enviados:', formData.formDataDocumentoExterno);
      } else if (documentos.currentTypeOfDocument === 'Examen Vista') {
        console.log('Datos enviados:', formData.formDataExamenVista);
      } else if (documentos.currentTypeOfDocument === 'Exploración Física') {
        console.log('Datos enviados:', formData.formDataExploracionFisica);
      } else if (documentos.currentTypeOfDocument === 'Historia Clínica') {
        console.log('Datos enviados:', formData.formDataHistoriaClinica);
      } else {
        console.error(`Tipo de documento no reconocido: ${documentos.currentTypeOfDocument}`);
        return; // Salir si el tipo de documento no es válido
      }

      // Reiniciar el estado del formulario después de enviar
      formData.resetFormData();
      console.log('Datos reseteados');

      documentos.currentTypeOfDocument = null;
      router.back();
    };

    return {
      stepsStore,
      handleSubmit,
    };
  },
};
</script>

<template>
  <div
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-7 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-md mx-auto">

    <!-- Barra de progreso -->
    <div class="relative w-full h-2 mb-4 bg-gray-200 rounded-full overflow-hidden">
      <div class="progress-bar absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-300"
        :style="{ width: (stepsStore.currentStep / stepsStore.steps.length) * 100 + '%' }"></div>
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
      class="flex justify-between mt-6">
      <button :class="{ invisible: stepsStore.currentStep === 1 }" @click="stepsStore.previousStep"
        class="px-4 py-2 text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300">
        &lt; Anterior
      </button>

      <button :class="{ invisible: stepsStore.currentStep > stepsStore.steps.length }" @click="stepsStore.nextStep"
        class="px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all duration-300">
        Siguiente &gt;
      </button>
    </div>

    <!-- Mensaje final -->
    <div v-else>
      <p class="text-center font-bold text-lg">¡Formulario completado!</p>
      <button @click="handleSubmit"
        class="mt-4 px-6 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-300">
        Guardar
      </button>
    </div>
  </div>
</template>


<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease, filter 0.5s ease;
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
</style>
