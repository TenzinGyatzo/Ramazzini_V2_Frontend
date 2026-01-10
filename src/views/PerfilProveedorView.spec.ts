import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PerfilProveedorView from './PerfilProveedorView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useNom024Fields } from '@/composables/useNom024Fields';

describe('PerfilProveedorView - CLUES Field Visibility', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const createSiresPolicy = () => ({
    regime: 'SIRES_NOM024' as const,
    features: {
      sessionTimeoutEnabled: true,
      enforceDocumentImmutabilityUI: true,
      documentImmutabilityEnabled: true,
      showSiresUI: true,
      giisExportEnabled: true,
      notaAclaratoriaEnabled: true,
      cluesFieldVisible: true,
    },
    validation: {
      curpFirmantes: 'required' as const,
      workerCurp: 'required_strict' as const,
      cie10Principal: 'required' as const,
      geoFields: 'required' as const,
    },
  });

  const createSinRegimenPolicy = () => ({
    regime: 'SIN_REGIMEN' as const,
    features: {
      sessionTimeoutEnabled: false,
      enforceDocumentImmutabilityUI: false,
      documentImmutabilityEnabled: false,
      showSiresUI: false,
      giisExportEnabled: false,
      notaAclaratoriaEnabled: false,
      cluesFieldVisible: false,
    },
    validation: {
      curpFirmantes: 'optional' as const,
      workerCurp: 'optional' as const,
      cie10Principal: 'optional' as const,
      geoFields: 'optional' as const,
    },
  });

  it('should show CLUES field for SIRES_NOM024', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSiresPolicy(),
    } as any;

    const { cluesFieldVisible } = useNom024Fields();
    expect(cluesFieldVisible.value).toBe(true);
  });

  it('should NOT show CLUES field for SIN_REGIMEN', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSinRegimenPolicy(),
    } as any;

    const { cluesFieldVisible } = useNom024Fields();
    expect(cluesFieldVisible.value).toBe(false);
  });
});
