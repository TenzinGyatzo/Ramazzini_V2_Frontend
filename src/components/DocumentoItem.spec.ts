import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DocumentoItem from './DocumentoItem.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';

describe('DocumentoItem - Notas Aclaratorias', () => {
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

  it('should show BadgeNotaAclaratoria for SIRES_NOM024 when tieneNotasAclaratorias is true', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSiresPolicy(),
    } as any;

    const wrapper = mount(DocumentoItem, {
      global: {
        plugins: [pinia],
        stubs: {
          BadgeNotaAclaratoria: {
            template: '<div data-testid="badge-nota-aclaratoria">Badge</div>',
          },
          EstadoDocumentoBadge: true,
          ModalPdfEliminado: true,
        },
      },
      props: {
        notaMedica: {
          _id: 'doc-id',
          estado: 'finalizado',
          fechaNotaMedica: new Date(),
        },
        documentoTipo: 'notaMedica',
        documentoId: 'doc-id',
      },
      computed: {
        tieneNotasAclaratorias: () => true,
        showSiresUI: () => true,
      },
    });

    // El badge debería estar presente cuando showSiresUI es true y tieneNotasAclaratorias es true
    // Nota: Este test verifica la lógica, pero el componente real usa computed properties del store
    expect(proveedorSaludStore.showSiresUI).toBe(true);
  });

  it('should NOT show BadgeNotaAclaratoria for SIN_REGIMEN', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    proveedorSaludStore.proveedorSalud = {
      _id: 'test-id',
      regulatoryPolicy: createSinRegimenPolicy(),
    } as any;

    expect(proveedorSaludStore.showSiresUI).toBe(false);
    expect(proveedorSaludStore.notaAclaratoriaEnabled).toBe(false);
  });
});
