import { ref, computed } from 'vue';
import ConsentimientoDiarioAPI from '@/api/ConsentimientoDiarioAPI';
import { useRegulatoryPolicy } from './useRegulatoryPolicy';
import { useRegulatoryErrorMapper } from './useRegulatoryErrorMapper';
import type { 
  ConsentState, 
  ConsentError, 
  ConsentimientoStatus, 
  ConsentimientoCreated,
  CreateConsentimientoDiarioDto,
  ConsentMethod
} from '@/types/consentimiento-diario';

/**
 * Composable para manejar el consentimiento diario
 * Gestiona estado, validaciones y llamadas API
 */
export function useDailyConsent() {
  const { dailyConsentEnabled } = useRegulatoryPolicy();
  const { mapRegulatoryError, extractRegulatoryError } = useRegulatoryErrorMapper();

  // Estado del composable
  const state = ref<ConsentState>('idle');
  const error = ref<ConsentError | null>(null);
  const status = ref<ConsentimientoStatus | null>(null);
  const currentDateKey = ref<string | null>(null);

  /**
   * Verifica si está en estado de carga
   */
  const isLoading = computed(() => state.value === 'checking' || state.value === 'submitting');

  /**
   * Verifica si hay error
   */
  const hasError = computed(() => state.value === 'error' && error.value !== null);

  /**
   * Resetea el estado a idle
   */
  const reset = () => {
    state.value = 'idle';
    error.value = null;
    status.value = null;
    currentDateKey.value = null;
  };

  /**
   * Obtiene el estado del consentimiento para un trabajador
   * @param trabajadorId - ID del trabajador
   * @param dateKey - Clave de fecha opcional (YYYY-MM-DD)
   */
  const checkStatus = async (trabajadorId: string, dateKey?: string): Promise<ConsentimientoStatus | null> => {
    // Validar policy
    if (!dailyConsentEnabled.value) {
      error.value = {
        code: 'CONSENT_NOT_ENABLED',
        message: 'El consentimiento diario no está habilitado para este proveedor.',
      };
      state.value = 'error';
      return null;
    }

    try {
      state.value = 'checking';
      error.value = null;

      const response = await ConsentimientoDiarioAPI.getStatus(trabajadorId, dateKey);
      status.value = response.data;
      currentDateKey.value = response.data.dateKey;

      state.value = 'idle';
      return response.data;
    } catch (err: any) {
      // Extraer error regulatorio si existe
      const regulatoryError = extractRegulatoryError(err);
      if (regulatoryError) {
        const mappedError = mapRegulatoryError(regulatoryError);
        error.value = {
          code: regulatoryError.errorCode,
          message: mappedError.message,
        };
      } else {
        error.value = {
          message: err.response?.data?.message || 'Error al obtener el estado del consentimiento',
        };
      }

      state.value = 'error';
      return null;
    }
  };

  /**
   * Registra un nuevo consentimiento
   * @param createDto - Datos para crear el consentimiento
   */
  const registerConsent = async (
    createDto: CreateConsentimientoDiarioDto
  ): Promise<ConsentimientoCreated | null> => {
    // Validar policy
    if (!dailyConsentEnabled.value) {
      error.value = {
        code: 'CONSENT_NOT_ENABLED',
        message: 'El consentimiento diario no está habilitado para este proveedor.',
      };
      state.value = 'error';
      return null;
    }

    try {
      state.value = 'submitting';
      error.value = null;

      const response = await ConsentimientoDiarioAPI.create(createDto);

      state.value = 'idle';
      return response.data;
    } catch (err: any) {
      // Extraer error regulatorio si existe
      const regulatoryError = extractRegulatoryError(err);
      if (regulatoryError) {
        const mappedError = mapRegulatoryError(regulatoryError);
        error.value = {
          code: regulatoryError.errorCode,
          message: mappedError.message,
        };
      } else {
        error.value = {
          message: err.response?.data?.message || 'Error al registrar el consentimiento',
        };
      }

      state.value = 'error';
      return null;
    }
  };

  return {
    // Estado
    state,
    error,
    status,
    currentDateKey,
    isLoading,
    hasError,
    // Funciones
    reset,
    checkStatus,
    registerConsent,
    // Policy
    dailyConsentEnabled,
  };
}
