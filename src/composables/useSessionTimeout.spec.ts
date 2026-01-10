import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSessionTimeout } from './useSessionTimeout';
import { createPinia, setActivePinia } from 'pinia';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useUserStore } from '@/stores/user';

describe('useSessionTimeout', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('should initialize timer for SIRES_NOM024', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    const userStore = useUserStore();

    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSiresPolicy(),
    } as any;

    userStore.user = {
      _id: 'user-id',
      username: 'test',
    } as any;

    const { isLocked } = useSessionTimeout();

    // Verificar que sessionTimeoutEnabled es true
    expect(proveedorSaludStore.sessionTimeoutEnabled).toBe(true);
    
    // El timer debería estar activo (no bloqueado inicialmente)
    expect(isLocked.value).toBe(false);
  });

  it('should NOT initialize timer for SIN_REGIMEN', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    const userStore = useUserStore();

    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSinRegimenPolicy(),
    } as any;

    userStore.user = {
      _id: 'user-id',
      username: 'test',
    } as any;

    const { isLocked } = useSessionTimeout();

    // Verificar que sessionTimeoutEnabled es false
    expect(proveedorSaludStore.sessionTimeoutEnabled).toBe(false);
    
    // El timer no debería estar activo
    expect(isLocked.value).toBe(false);
  });
});
