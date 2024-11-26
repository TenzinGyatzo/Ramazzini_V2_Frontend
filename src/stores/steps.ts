import { defineStore } from "pinia";
import { ref, markRaw } from "vue";

export const useStepsStore = defineStore("steps", () => {
  // Lista de pasos
  const steps = ref<Array<{ component: any; name: string }>>([]);

  // Paso actual
  const currentStep = ref(1);

  // Bandera para evitar múltiples entradas rápidas
  const isNavigating = ref(false);

  // Establece los pasos y marca los componentes como no reactivos
  const setSteps = (newSteps: Array<{ component: any; name: string }>) => {
    steps.value = newSteps.map((step) => ({
      ...step,
      component: markRaw(step.component),
    }));
    currentStep.value = 1; // Reinicia el paso actual
  };

  // Validar los campos visibles del paso actual
  const validateCurrentStep = (): boolean => {
    const visibleInputs = Array.from(
      document.querySelectorAll("input:required, textarea:required")
    )
      // Aseguramos que TypeScript trate cada elemento como un HTMLInputElement o HTMLTextAreaElement
      .filter((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        return element.offsetParent !== null && !element.value.trim();
      });
  
    if (visibleInputs.length > 0) {
      alert("Por favor, completa los campos obligatorios antes de continuar.");
      return false;
    }
  
    return true;
  };
  

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (isNavigating.value) return;

    if (!validateCurrentStep()) return; // Detener navegación si la validación falla

    isNavigating.value = true;

    if (currentStep.value < steps.value.length) {
      currentStep.value++;
    } else {
      currentStep.value = steps.value.length + 1;
    }

    setTimeout(() => {
      isNavigating.value = false;
    }, 500);
  };

  // Retroceder al paso anterior
  const previousStep = () => {
    if (isNavigating.value) return;

    isNavigating.value = true;

    if (currentStep.value > 1) {
      currentStep.value--;
    }

    setTimeout(() => {
      isNavigating.value = false;
    }, 300);
  };

  // Ir a un paso específico
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.value.length) {
      currentStep.value = stepNumber;
    } else {
      console.error(`El paso ${stepNumber} no es válido.`);
    }
  };

  return {
    steps,
    currentStep,
    setSteps,
    validateCurrentStep,
    nextStep,
    previousStep,
    goToStep,
  };
});
