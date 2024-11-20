<script>
import { ref, reactive } from 'vue';
import Step1 from '../steps/antidopingSteps/Step1.vue';
import Step2 from '../steps/antidopingSteps/Step2.vue';
import Step3 from '../steps/antidopingSteps/Step3.vue';

export default {
  components: { Step1, Step2, Step3 },
  setup() {
    const currentStep = ref(1);
    const formData = reactive({});
    const steps = [
      { component: Step1, name: 'Paso 1' },
      { component: Step2, name: 'Paso 2' },
      { component: Step3, name: 'Paso 3' },
    ];

    const handleNext = (data) => {
      Object.assign(formData, data); // Mezcla los datos recibidos en formData
      if (currentStep.value < steps.length) {
        currentStep.value++;
      }
    };

    const handlePrevious = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const handleSubmit = () => {
      console.log('Datos del formulario:', formData);
      // Aquí puedes enviar los datos al backend
    };

    return {
      currentStep,
      formData,
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
    class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-5 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-gray-50"
  >
    <div v-if="currentStep <= steps.length">
      <!-- Formulario dinámico -->
      <component
        :is="steps[currentStep - 1].component"
        @next="handleNext"
        @previous="handlePrevious"
        :form-data="formData"
      />

      <!-- Navegación entre pasos -->
      <div class="flex justify-between mt-4">
        <button
          v-if="currentStep > 1"
          @click="handlePrevious"
          class="px-4 py-2 text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-all duration-300"
        >
          &lt; Anterior
        </button>
        <button
          v-if="currentStep < steps.length"
          @click="handleNext({})"
          class="px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
        >
          Siguiente &gt;
        </button>
      </div>
    </div>

    <!-- Mensaje final -->
    <div v-else>
      <p class="text-center font-bold text-lg">¡Formulario completado!</p>
      <button
        @click="handleSubmit"
        class="mt-4 px-6 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-300"
      >
        Guardar
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Aquí puedes añadir estilos específicos del componente */
</style>
