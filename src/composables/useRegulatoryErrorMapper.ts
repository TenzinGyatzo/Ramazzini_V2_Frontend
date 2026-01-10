import { computed } from 'vue';
import { useRegulatoryPolicy } from './useRegulatoryPolicy';
import { mapRegulatoryErrorMessage } from '@/utils/regulatory-error-messages';
import type { RegulatoryErrorResponse, RegulatoryErrorDetails } from '@/types/regulatory-error';
import type { RegulatoryErrorMessage } from '@/utils/regulatory-error-messages';

/**
 * Composable para mapear errores regulatorios a mensajes UX
 * 
 * Este composable toma errores del backend con errorCode y los mapea
 * a mensajes UX apropiados según el régimen regulatorio del proveedor.
 * 
 * @example
 * ```typescript
 * const { mapRegulatoryError } = useRegulatoryErrorMapper();
 * 
 * try {
 *   await someAPI();
 * } catch (error) {
 *   if (error.response?.data?.errorCode) {
 *     const errorMessage = mapRegulatoryError(error.response.data);
 *     toast.open({
 *       message: errorMessage.message,
 *       type: errorMessage.type,
 *       position: 'top-right'
 *     });
 *   }
 * }
 * ```
 */
export function useRegulatoryErrorMapper() {
  const { isSIRES, isSinRegimen } = useRegulatoryPolicy();

  /**
   * Mapea un error regulatorio del backend a un mensaje UX
   * 
   * @param errorResponse - Respuesta de error del backend con errorCode
   * @returns Mensaje de error mapeado para UX
   */
  const mapRegulatoryError = (
    errorResponse: RegulatoryErrorResponse | any,
  ): RegulatoryErrorMessage => {
    // Verificar que es un error regulatorio
    if (!errorResponse?.errorCode) {
      // Fallback para errores sin errorCode
      return {
        title: 'Error',
        message: errorResponse?.message || 'Ha ocurrido un error inesperado',
        type: 'error',
      };
    }

    // Determinar régimen del proveedor
    const regime = computed(() => {
      if (isSIRES.value) {
        return 'SIRES_NOM024';
      }
      if (isSinRegimen.value) {
        return 'SIN_REGIMEN';
      }
      // Fallback si no se puede determinar
      return 'SIN_REGIMEN';
    });

    // Mapear error a mensaje UX
    return mapRegulatoryErrorMessage(
      errorResponse.errorCode,
      regime.value,
      errorResponse.details,
    );
  };

  /**
   * Verifica si un error es un error regulatorio
   * 
   * @param error - Error de axios o cualquier error
   * @returns true si el error tiene errorCode regulatorio
   */
  const isRegulatoryError = (error: any): boolean => {
    return !!(
      error?.response?.data?.errorCode ||
      error?.errorCode
    );
  };

  /**
   * Extrae el error regulatorio de una respuesta de error
   * 
   * @param error - Error de axios o cualquier error
   * @returns RegulatoryErrorResponse si es un error regulatorio, null en caso contrario
   */
  const extractRegulatoryError = (
    error: any,
  ): RegulatoryErrorResponse | null => {
    if (!isRegulatoryError(error)) {
      return null;
    }

    const errorData = error.response?.data || error;
    return {
      statusCode: errorData.statusCode || error.response?.status || 400,
      message: errorData.message || 'Error regulatorio',
      errorCode: errorData.errorCode,
      details: errorData.details,
    };
  };

  return {
    mapRegulatoryError,
    isRegulatoryError,
    extractRegulatoryError,
  };
}
