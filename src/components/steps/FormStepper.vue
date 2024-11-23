<script>
import { ref, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import Step1Antidoping from '../steps/antidopingSteps/Step1.vue';
import Step2Antidoping from '../steps/antidopingSteps/Step2.vue';
import Step1HistoriaClinica from '../steps/historiaClinicaSteps/Step1.vue';
import Step2HistoriaClinica from '../steps/historiaClinicaSteps/Step2.vue';

export default {
  props: {
    tipoDocumento: {
      type: String,
      required: true,
    },
  },
  components: { Step1Antidoping, Step2Antidoping, Step1HistoriaClinica, Step2HistoriaClinica },
  setup(props) {
    const { formData, updateFormData } = useFormDataStore();
    const currentStep = ref(1);

    // Computed property para obtener los pasos según el tipo de documento
    const steps = computed(() => {
      if (props.tipoDocumento === 'Antidoping') {
        return [
          { component: Step1Antidoping, name: 'Paso 1' },
          { component: Step2Antidoping, name: 'Paso 2' },
        ];
      } else if (props.tipoDocumento === 'Historia Clinica') {
        return [
          { component: Step1HistoriaClinica, name: 'Paso 1' },
          { component: Step2HistoriaClinica, name: 'Paso 2' },
        ];
      }
      // Agregar más documentos aquí
      return [];
    });

    const handleNext = () => {
      if (currentStep.value < steps.value.length) {
        currentStep.value++;
      } else {
        currentStep.value = steps.value.length + 1; // Marca el formulario como completado
      }
    };

    const handlePrevious = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const handleSubmit = () => {
      updateFormData(formData);
      console.log('Datos enviados:', formData);
    };

    return {
      formData,
      currentStep,
      steps,
      handleNext,
      handlePrevious,
      handleSubmit,
    };
  },
};
</script>

<template>
  <div
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-7 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-lg mx-auto">
    <!-- Formulario dinámico -->
    <div v-if="currentStep <= steps.length">
      <component :is="steps[currentStep - 1].component" :form-data="formData" />

      <!-- Navegación entre pasos -->
      <div class="flex justify-between mt-6">
        <!-- Botón Anterior -->
        <button :class="{ 'invisible': currentStep === 1 }" @click="handlePrevious"
          class="px-4 py-2 text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300">
          &lt; Anterior
        </button>

        <!-- Botón Siguiente -->
        <button :class="{ 'invisible': currentStep > steps.length }" @click="handleNext"
          class="px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all duration-300">
          Siguiente &gt;
        </button>
      </div>
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
