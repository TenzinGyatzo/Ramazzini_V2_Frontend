/**
 * Document State Enum
 * 
 * Represents the lifecycle state of medical documents per NOM-024 requirements.
 */
export enum DocumentoEstado {
  BORRADOR = 'borrador',
  FINALIZADO = 'finalizado',
  ANULADO = 'anulado',
}

/**
 * Common properties for NOM-024 compliant documents
 */
export interface NOM024DocumentMetadata {
  estado: DocumentoEstado;
  fechaFinalizacion?: string;
  finalizadoPor?: string;
  codigoCIE10Principal?: string;
  codigosCIE10Secundarios?: string[];
}

