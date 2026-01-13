import { ref } from 'vue';
import { useRegulatoryPolicy } from './useRegulatoryPolicy';
import { useRegulatoryErrorMapper } from './useRegulatoryErrorMapper';
import { useDailyConsent } from './useDailyConsent';
import type { ConsentimientoCreated } from '@/types/consentimiento-diario';

/**
 * Composable para manejar el gate de consentimiento diario
 * Ejecuta acciones protegidas y maneja el modal de consentimiento automáticamente
 */
export function useDailyConsentGate() {
  const { dailyConsentEnabled } = useRegulatoryPolicy();
  const { extractRegulatoryError } = useRegulatoryErrorMapper();
  const { checkStatus } = useDailyConsent();
  
  const showModal = ref(false);
  const modalTrabajadorId = ref('');
  const modalTrabajadorNombre = ref('');
  const modalTrabajadorSexo = ref<string>('');
  const pendingAction = ref<(() => Promise<any>) | null>(null);
  const resolveAction = ref<((value: any) => void) | null>(null);
  const rejectAction = ref<((error: any) => void) | null>(null);

  /**
   * Ejecuta una acción protegida por consentimiento diario
   * Si falta consentimiento, abre modal y reintenta automáticamente
   * 
   * @param actionFn - Función que ejecuta la acción protegida
   * @param trabajadorId - ID del trabajador
   * @param trabajadorNombre - Nombre completo del trabajador
   * @param trabajadorSexo - Sexo del trabajador ('Masculino' | 'Femenino') para texto dinámico
   * @returns Resultado de la acción o null si se canceló
   */
  async function runWithDailyConsent<T>(
    actionFn: () => Promise<T>,
    trabajadorId: string,
    trabajadorNombre: string,
    trabajadorSexo?: string
  ): Promise<T | null> {
    // Si consentimiento no está habilitado, ejecutar acción directamente
    if (!dailyConsentEnabled.value) {
      return await actionFn();
    }

    try {
      // Intentar ejecutar acción
      return await actionFn();
    } catch (error: any) {
      // Verificar si es CONSENT_REQUIRED
      const regulatoryError = extractRegulatoryError(error);
      
      if (regulatoryError?.errorCode === 'CONSENT_REQUIRED') {
        // Abrir modal y esperar respuesta
        return await new Promise<T | null>((resolve, reject) => {
          pendingAction.value = actionFn;
          modalTrabajadorId.value = trabajadorId;
          modalTrabajadorNombre.value = trabajadorNombre;
          modalTrabajadorSexo.value = trabajadorSexo || '';
          resolveAction.value = resolve;
          rejectAction.value = reject;
          showModal.value = true;
        });
      }
      
      // Otro error, propagar
      throw error;
    }
  }

  /**
   * Maneja el evento cuando se registra el consentimiento
   * Reintenta la acción original automáticamente
   */
  async function handleConsentRegistered(consent: ConsentimientoCreated) {
    showModal.value = false;
    
    if (!pendingAction.value) {
      resolveAction.value?.(null);
      return;
    }

    try {
      // Reintentar acción
      const result = await pendingAction.value();
      resolveAction.value?.(result);
    } catch (error: any) {
      // Si es CONSENT_ALREADY_EXISTS (race condition), refrescar y reintentar
      const regulatoryError = extractRegulatoryError(error);
      if (regulatoryError?.errorCode === 'CONSENT_ALREADY_EXISTS') {
        // Refrescar status y reintentar una vez más
        await checkStatus(modalTrabajadorId.value);
        try {
          const result = await pendingAction.value();
          resolveAction.value?.(result);
        } catch (retryError) {
          rejectAction.value?.(retryError);
        }
      } else {
        rejectAction.value?.(error);
      }
    } finally {
      pendingAction.value = null;
      resolveAction.value = null;
      rejectAction.value = null;
    }
  }

  /**
   * Maneja el evento cuando se cancela el modal
   * No reintenta la acción
   */
  function handleConsentCancel() {
    showModal.value = false;
    resolveAction.value?.(null);
    pendingAction.value = null;
    resolveAction.value = null;
    rejectAction.value = null;
  }

  return {
    runWithDailyConsent,
    showModal,
    modalTrabajadorId,
    modalTrabajadorNombre,
    modalTrabajadorSexo,
    handleConsentRegistered,
    handleConsentCancel,
  };
}
