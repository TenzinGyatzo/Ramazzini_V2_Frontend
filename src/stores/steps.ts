import { defineStore } from "pinia";
import { ref, markRaw } from "vue";
import { useTrabajadoresStore } from "./trabajadores";

const trabajadores = useTrabajadoresStore();

// Evento personalizado para campos faltantes
const showMissingFieldsModal = ref(false);

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
      // Filtrar inputs visibles y vacíos, excluyendo los específicos
      .filter((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
  
        // Excluir inputs con un atributo específico
        if (element.hasAttribute("data-skip-validation")) {
          return false; // Excluir este input del proceso de validación
        }
  
        return element.offsetParent !== null && !element.value.trim();
      });
  
    if (visibleInputs.length > 0) {
      showMissingFieldsModal.value = true;
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
    }, 700);
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
    // Se usa el mapa de redirección para compensar la diferencia de pasos entre los trabajadores masculinos y femeninos
    // debido a los antecedentes Gineco Obstétricos
    const redirectionMap: Record<number, number> = {
      42: 28,
      43: 29,
      44: 30,
      45: 31,
      46: 32,
    };
  
    // Si el paso solicitado está en el mapa de redirección y el trabajador no es femenino
    if (
      redirectionMap[stepNumber] &&
      trabajadores.currentTrabajador?.sexo !== 'Femenino'
    ) {
      stepNumber = redirectionMap[stepNumber];
    }
  
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
    showMissingFieldsModal,
  };
});
