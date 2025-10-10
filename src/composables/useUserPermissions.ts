import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

export function useUserPermissions() {
  const userStore = useUserStore();

  // Computed para obtener el rol del usuario actual
  const userRole = computed(() => userStore.user?.role);

  // Tipos de documentos restringidos para enfermeros
  const restrictedDocumentsForNurse = ['aptitud', 'certificado', 'certificadoExpedito'];

  // Función para verificar si un usuario puede crear un tipo específico de documento
  const canCreateDocument = (documentType: string): boolean => {
    if (!userRole.value) return false;
    
    // Si es enfermero/a, verificar si el documento está restringido
    if (userRole.value === 'Enfermero/a') {
      return !restrictedDocumentsForNurse.includes(documentType);
    }
    
    // Otros roles pueden crear todos los documentos
    return true;
  };

  // Función para verificar si un documento específico está restringido para el usuario actual
  const isDocumentRestricted = (documentType: string): boolean => {
    return !canCreateDocument(documentType);
  };

  // Función para obtener el mensaje de restricción apropiado
  const getRestrictionMessage = (documentType: string): string => {
    if (userRole.value === 'Enfermero/a' && restrictedDocumentsForNurse.includes(documentType)) {
      const documentNames = {
        'aptitud': 'Aptitud para el Puesto',
        'certificado': 'Certificado Médico',
        'certificadoExpedito': 'Certificado Expedito'
      };
      
      const documentName = documentNames[documentType] || documentType;
      return `Como Enfermero/a, no tienes permisos para crear ${documentName}. Contacta con un Médico para crear este documento.`;
    }
    
    return 'No tienes permisos para realizar esta acción.';
  };

  // Computed para verificar si el usuario actual es enfermero
  const isNurse = computed(() => userRole.value === 'Enfermero/a');

  // Computed para obtener lista de documentos restringidos para el usuario actual
  const restrictedDocuments = computed(() => {
    if (isNurse.value) {
      return restrictedDocumentsForNurse;
    }
    return [];
  });

  return {
    userRole,
    isNurse,
    restrictedDocuments,
    canCreateDocument,
    isDocumentRestricted,
    getRestrictionMessage,
    restrictedDocumentsForNurse
  };
}
