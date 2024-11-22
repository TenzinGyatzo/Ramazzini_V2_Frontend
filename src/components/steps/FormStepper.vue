<script>
import { ref } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import Step1 from '../steps/antidopingSteps/Step1.vue';
import Step2 from '../steps/antidopingSteps/Step2.vue';

export default {
  components: { Step1, Step2 },
  setup() {
    const { formData, updateFormData } = useFormDataStore();
    const currentStep = ref(1);

    const steps = [
      { component: Step1, name: 'Paso 1' },
      { component: Step2, name: 'Paso 2' },
    ];

    const handleNext = () => {
      if (currentStep.value < steps.length) {
        currentStep.value++;
      } else {
        currentStep.value = steps.length + 1; // Marca el formulario como completado
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
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-5 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-lg mx-auto">
    <!-- Formulario dinámico -->
    <div v-if="currentStep <= steps.length">
      <component :is="steps[currentStep - 1].component" :form-data="formData" />

      <!-- Navegación entre pasos -->
      <div class="flex justify-between mt-6">
        <!-- Botón Anterior -->
        <button
          :class="{ 'invisible': currentStep === 1 }"
          @click="handlePrevious"
          class="px-4 py-2 text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300"
        >
          &lt; Anterior
        </button>

        <!-- Botón Siguiente -->
        <button
          :class="{ 'invisible': currentStep > steps.length }"
          @click="handleNext"
          class="px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
        >
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

