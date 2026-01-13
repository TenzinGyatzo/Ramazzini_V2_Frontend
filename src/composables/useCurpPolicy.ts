import { computed } from 'vue';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

/**
 * Composable para manejar la política de CURP en firmantes
 * Basado en el régimen regulatorio del proveedor
 */
export function useCurpPolicy() {
  const proveedorSaludStore = useProveedorSaludStore();

  /**
   * Indica si CURP es requerido según la política regulatoria
   */
  const curpRequired = computed<boolean>(() => {
    return (
      proveedorSaludStore.regulatoryPolicy?.validation?.curpFirmantes ===
      'required'
    );
  });

  /**
   * Indica si se debe mostrar el campo CURP
   * - SIRES_NOM024: siempre mostrar (requerido)
   * - SIN_REGIMEN: mostrar (opcional, pero permitir ingresarlo)
   */
  const showCurpField = computed<boolean>(() => {
    const regime = proveedorSaludStore.regulatoryPolicy?.regime;
    // Mostrar en ambos regímenes, pero con diferentes validaciones
    return regime === 'SIRES_NOM024' || regime === 'SIN_REGIMEN';
  });

  /**
   * Reglas de validación para FormKit
   * Retorna 'required' si CURP es requerido, string vacío si es opcional
   */
  const curpValidationRules = computed<string>(() => {
    return curpRequired.value ? 'required' : '';
  });

  /**
   * Indica si el régimen es SIRES_NOM024
   */
  const isSIRES = computed<boolean>(() => {
    return proveedorSaludStore.regulatoryPolicy?.regime === 'SIRES_NOM024';
  });

  /**
   * Indica si el régimen es SIN_REGIMEN
   */
  const isSinRegimen = computed<boolean>(() => {
    return proveedorSaludStore.regulatoryPolicy?.regime === 'SIN_REGIMEN';
  });

  return {
    curpRequired,
    showCurpField,
    curpValidationRules,
    isSIRES,
    isSinRegimen,
  };
}
