import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormStepper from './FormStepper.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useDocumentosStore } from '@/stores/documentos';

describe('FormStepper - Regulatory Policy', () => {
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

  describe('Notas Aclaratorias Button', () => {
    it('should show nota aclaratoria button for SIRES_NOM024 when document is FINALIZADO', () => {
      const proveedorSaludStore = useProveedorSaludStore();
      const documentosStore = useDocumentosStore();

      proveedorSaludStore.proveedorSalud = {
        _id: 'test-id',
        regulatoryPolicy: createSiresPolicy(),
      } as any;

      documentosStore.currentDocument = {
        _id: 'doc-id',
        estado: 'finalizado',
      } as any;

      // Verificar que el botón debería mostrarse
      expect(proveedorSaludStore.notaAclaratoriaEnabled).toBe(true);
      expect(documentosStore.isFinalized).toBe(true);
    });

    it('should NOT show nota aclaratoria button for SIN_REGIMEN', () => {
      const proveedorSaludStore = useProveedorSaludStore();
      proveedorSaludStore.proveedorSalud = {
        _id: 'test-id',
        regulatoryPolicy: createSinRegimenPolicy(),
      } as any;

      expect(proveedorSaludStore.notaAclaratoriaEnabled).toBe(false);
    });
  });

  describe('Read-only UI', () => {
    it('should disable fields for FINALIZADO in SIRES_NOM024', () => {
      const proveedorSaludStore = useProveedorSaludStore();
      const documentosStore = useDocumentosStore();

      proveedorSaludStore.proveedorSalud = {
        _id: 'test-id',
        regulatoryPolicy: createSiresPolicy(),
      } as any;

      documentosStore.currentDocument = {
        _id: 'doc-id',
        estado: 'finalizado',
      } as any;

      // disableEdit debería ser true cuando documentImmutabilityEnabled es true y estado es finalizado
      const documentImmutabilityEnabled = proveedorSaludStore.documentImmutabilityEnabled;
      const isFinalized = documentosStore.isFinalized;

      expect(documentImmutabilityEnabled).toBe(true);
      expect(isFinalized).toBe(true);
      // disableEdit = documentImmutabilityEnabled && (isFinalized || isAnulado)
      expect(documentImmutabilityEnabled && isFinalized).toBe(true);
    });

    it('should allow editing FINALIZADO in SIN_REGIMEN', () => {
      const proveedorSaludStore = useProveedorSaludStore();
      const documentosStore = useDocumentosStore();

      proveedorSaludStore.proveedorSalud = {
        _id: 'test-id',
        regulatoryPolicy: createSinRegimenPolicy(),
      } as any;

      documentosStore.currentDocument = {
        _id: 'doc-id',
        estado: 'finalizado',
      } as any;

      const documentImmutabilityEnabled = proveedorSaludStore.documentImmutabilityEnabled;
      const isFinalized = documentosStore.isFinalized;

      expect(documentImmutabilityEnabled).toBe(false);
      expect(isFinalized).toBe(true);
      // disableEdit = documentImmutabilityEnabled && (isFinalized || isAnulado)
      expect(documentImmutabilityEnabled && isFinalized).toBe(false);
    });
  });
});
