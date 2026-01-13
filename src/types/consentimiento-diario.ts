/**
 * Tipos e interfaces para Consentimiento Diario
 * Basados en los DTOs del backend
 */

/**
 * Método de consentimiento
 */
export enum ConsentMethod {
  VERBAL = 'VERBAL',
  AUTOGRAFO = 'AUTOGRAFO',
}

/**
 * Estado del consentimiento diario
 */
export interface ConsentimientoStatus {
  hasConsent: boolean;
  dateKey: string; // YYYY-MM-DD
  consent?: {
    acceptedAt: Date | string;
    acceptedByUserId: string;
    consentMethod: string;
    consentTextVersion: string;
  };
}

/**
 * Consentimiento creado
 */
export interface ConsentimientoCreated {
  _id: string;
  proveedorSaludId: string;
  trabajadorId: string;
  dateKey: string; // YYYY-MM-DD
  acceptedAt: Date | string;
  acceptedByUserId: string;
  consentMethod: string;
  consentTextVersion: string;
  createdAt: Date | string;
}

/**
 * DTO para crear consentimiento
 */
export interface CreateConsentimientoDiarioDto {
  trabajadorId: string;
  consentMethod: ConsentMethod;
  dateKey?: string; // YYYY-MM-DD, opcional
}

/**
 * Estado del composable
 */
export type ConsentState = 'idle' | 'checking' | 'submitting' | 'error';

/**
 * Error de consentimiento
 */
export interface ConsentError {
  code?: string;
  message: string;
}
