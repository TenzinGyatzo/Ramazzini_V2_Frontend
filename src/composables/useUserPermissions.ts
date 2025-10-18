import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

export function useUserPermissions() {
  const userStore = useUserStore();

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
    
    // Verificar si es un cuestionario adicional
    if (cuestionariosAdicionales.includes(documentType)) {
      return canManageCuestionariosAdicionales.value;
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
      'controlPrenatal': 'Control Prenatal',
      'historiaOtologica': 'Historia Otológica',
      'previoEspirometria': 'Previo Espirometría',
    };
    
    const documentName = documentNames[documentType] || documentType;
    
    if (documentosDiagnostico.includes(documentType)) {
      return `No tienes permisos para gestionar documentos de diagnóstico y certificación.`;
    } else if (cuestionariosAdicionales.includes(documentType)) {
      return `No tienes permisos para gestionar cuestionarios adicionales como ${documentName}.`;
    } else {
      return `No tienes permisos para gestionar documentos de evaluación como ${documentName}.`;
    }
  };

  return {
    userRole,
    canCreateDocument,
    isDocumentRestricted,
    getRestrictionMessage,
    canManageEmpresas,
    canManageCentrosTrabajo,
    canManageTrabajadores,
    canManageDocumentosDiagnostico,
    canManageDocumentosEvaluacion,
    canManageDocumentosExternos,
    canManageCuestionariosAdicionales
  };
}
