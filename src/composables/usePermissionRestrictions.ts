import { computed, inject } from 'vue';
import { useUserStore } from '@/stores/user';

// Definir el tipo del toast
interface Toast {
  open: (options: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    position?: string;
  }) => void;
}

export function usePermissionRestrictions() {
  const userStore = useUserStore();
  const toast = inject<Toast>('toast');

  // Computed para obtener el rol del usuario actual
  const userRole = computed(() => userStore.user?.role);

  // Función para verificar si un usuario puede gestionar empresas
  const canManageEmpresas = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarEmpresas || false;
  });

  // Función para verificar si un usuario puede gestionar centros de trabajo
  const canManageCentrosTrabajo = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarCentrosTrabajo || false;
  });

  // Función para verificar si un usuario puede gestionar trabajadores
  const canManageTrabajadores = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarTrabajadores || false;
  });

  // Función para verificar si un usuario puede gestionar documentos de diagnóstico
  const canManageDocumentosDiagnostico = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarDocumentosDiagnostico || false;
  });

  // Función para verificar si un usuario puede gestionar documentos de evaluación
  const canManageDocumentosEvaluacion = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarDocumentosEvaluacion || false;
  });

  const canManageDocumentosExternos = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarDocumentosExternos || false;
  });

  const canManageCuestionariosAdicionales = computed(() => {
    if (!userRole.value) return false;
    if (userRole.value === 'Principal' || userRole.value === 'Administrador') return true;
    return userStore.user?.permisos?.gestionarCuestionariosAdicionales || false;
  });

  // Tipos de documentos de diagnóstico y certificación
  const documentosDiagnostico = ['aptitud', 'certificado'];
  
  // Tipos de cuestionarios adicionales
  const cuestionariosAdicionales = ['controlPrenatal', 'historiaOtologica', 'previoEspirometria', 'certificadoExpedito'];

  // Función para verificar si un usuario puede crear un tipo específico de documento
  const canCreateDocument = (documentType: string): boolean => {
    if (!userRole.value) return false;
    
    // Verificar si es un documento de diagnóstico
    if (documentosDiagnostico.includes(documentType)) {
      return canManageDocumentosDiagnostico.value;
    }
    
    // Para otros documentos, verificar permiso de evaluación
    return canManageDocumentosEvaluacion.value;
  };

  // Función para verificar si un documento específico está restringido para el usuario actual
  const isDocumentRestricted = (documentType: string): boolean => {
    return !canCreateDocument(documentType);
  };

  // Función para obtener el mensaje de restricción apropiado
  const getRestrictionMessage = (documentType: string): string => {
    const documentNames = {
      'aptitud': 'Aptitud para el Puesto',
      'certificado': 'Certificado Médico',
      'certificadoExpedito': 'Certificado Expedito',
      'historiaClinica': 'Historia Clínica',
      'exploracionFisica': 'Exploración Física',
      'examenVista': 'Examen de la Vista',
      'antidoping': 'Antidoping',
      'audiometria': 'Audiometría',
      'documentoExterno': 'Documento Externo',
      'notaMedica': 'Nota Médica',
    };
    
    const documentName = documentNames[documentType] || documentType;
    
    if (documentosDiagnostico.includes(documentType)) {
      return `No tienes permisos para gestionar documentos de diagnóstico y certificación.`;
    } else {
      return `No tienes permisos para gestionar documentos de evaluación como ${documentName}.`;
    }
  };


  // === FUNCIONES DE VALIDACIÓN CON TOAST ===

  // Validar gestión de empresas con toast
  const validateEmpresaManagement = (action: string = 'realizar esta acción'): boolean => {
    if (!canManageEmpresas.value) {
      toast?.open({
        message: `No tienes permisos para gestionar empresas. No puedes ${action}.`,
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // Validar gestión de centros de trabajo con toast
  const validateCentroTrabajoManagement = (action: string = 'realizar esta acción'): boolean => {
    if (!canManageCentrosTrabajo.value) {
      toast?.open({
        message: `No tienes permisos para gestionar centros de trabajo. No puedes ${action}.`,
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // Validar gestión de trabajadores con toast
  const validateTrabajadorManagement = (action: string = 'realizar esta acción'): boolean => {
    if (!canManageTrabajadores.value) {
      toast?.open({
        message: `No tienes permisos para gestionar trabajadores. No puedes ${action}.`,
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // Validar creación de documentos con toast
  const validateDocumentCreation = (documentType: string): boolean => {
    if (!canCreateDocument(documentType)) {
      toast?.open({
        message: getRestrictionMessage(documentType),
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // Validar gestión de documentos externos con toast
  const validateDocumentosExternos = (action: string = 'gestionar documentos externos'): boolean => {
    if (!canManageDocumentosExternos.value) {
      toast?.open({
        message: `No tienes permisos para gestionar documentos externos.`,
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // Validar gestión de cuestionarios adicionales con toast
  const validateCuestionariosAdicionales = (action: string = 'acceder a cuestionarios adicionales'): boolean => {
    if (!canManageCuestionariosAdicionales.value) {
      toast?.open({
        message: `No tienes permisos para gestionar cuestionarios adicionales.`,
        type: 'warning',
        position: 'top-right'
      });
      return false;
    }
    return true;
  };

  // === FUNCIONES DE ACCIÓN CONDICIONAL ===

  // Ejecutar acción solo si tiene permisos para empresas
  const executeIfCanManageEmpresas = (callback: () => void, action: string = 'realizar esta acción') => {
    if (validateEmpresaManagement(action)) {
      callback();
    }
  };

  // Ejecutar acción solo si tiene permisos para centros de trabajo
  const executeIfCanManageCentrosTrabajo = (callback: () => void, action: string = 'realizar esta acción') => {
    if (validateCentroTrabajoManagement(action)) {
      callback();
    }
  };

  // Ejecutar acción solo si tiene permisos para trabajadores
  const executeIfCanManageTrabajadores = (callback: () => void, action: string = 'realizar esta acción') => {
    if (validateTrabajadorManagement(action)) {
      callback();
    }
  };

  // Ejecutar acción solo si puede crear el documento
  const executeIfCanCreateDocument = (documentType: string, callback: () => void) => {
    if (validateDocumentCreation(documentType)) {
      callback();
    }
  };

  // Ejecutar acción solo si puede gestionar documentos externos
  const executeIfCanManageDocumentosExternos = (callback: () => void, action: string = 'gestionar documentos externos') => {
    if (validateDocumentosExternos(action)) {
      callback();
    }
  };

  // Ejecutar acción solo si puede gestionar cuestionarios adicionales
  const executeIfCanManageCuestionariosAdicionales = (callback: () => void, action: string = 'acceder a cuestionarios adicionales') => {
    if (validateCuestionariosAdicionales(action)) {
      callback();
    }
  };

  // Ejecutar acción solo si puede gestionar documentos de diagnóstico
  const executeIfCanManageDocumentosDiagnostico = (callback: () => void, action: string = 'gestionar documentos de diagnóstico') => {
    if (!canManageDocumentosDiagnostico.value) {
      toast?.open({
        message: `No tienes permisos para gestionar documentos de diagnóstico y certificación.`,
        type: 'warning',
        position: 'top-right'
      });
      return;
    }
    callback();
  };

  // Ejecutar acción solo si puede gestionar documentos de evaluación
  const executeIfCanManageDocumentosEvaluacion = (callback: () => void, action: string = 'gestionar documentos de evaluación') => {
    if (!canManageDocumentosEvaluacion.value) {
      toast?.open({
        message: `No tienes permisos para gestionar documentos de evaluación.`,
        type: 'warning',
        position: 'top-right'
      });
      return;
    }
    callback();
  };

  return {
    // Computed properties
    userRole,
    canManageEmpresas,
    canManageCentrosTrabajo,
    canManageTrabajadores,
    canManageDocumentosDiagnostico,
    canManageDocumentosEvaluacion,
    canManageDocumentosExternos,
    canManageCuestionariosAdicionales,
    
    // Funciones de verificación
    canCreateDocument,
    isDocumentRestricted,
    getRestrictionMessage,
    
    // Funciones de validación con toast
    validateEmpresaManagement,
    validateCentroTrabajoManagement,
    validateTrabajadorManagement,
    validateDocumentCreation,
    validateDocumentosExternos,
    validateCuestionariosAdicionales,
    
    // Funciones de acción condicional
    executeIfCanManageEmpresas,
    executeIfCanManageCentrosTrabajo,
    executeIfCanManageTrabajadores,
    executeIfCanCreateDocument,
    executeIfCanManageDocumentosExternos,
    executeIfCanManageCuestionariosAdicionales,
    executeIfCanManageDocumentosDiagnostico,
    executeIfCanManageDocumentosEvaluacion
  };
}
