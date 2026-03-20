/**
 * Validaciones DIAGNOSTICO_SIS para codigoCIEDiagnostico2 y codigoCIEDiagnostico3 (nota médica).
 * Bloqueo en submit (frontend).
 */

import CatalogsAPI from '@/api/CatalogsAPI';
import {
  TIPO_PERSONAL_MEDICO_ESPECIALISTA,
  TIPO_PERSONAL_MEDICO_GENERAL,
  TIPO_PERSONAL_ENFERMERA,
} from '@/constants/tipoPersonalDgis';
import {
  extractCIE10Code,
  normalizeCIE10Code,
  findCIE10Rule,
  validateCIE10SexAge,
  type CIE10SexAgeValidationParams,
} from './cie10';

/** Médico firmante; la inferencia de tipo personal replica expedientes/helpers/firmante-helper.ts (CEX). */
export type MedicoFirmanteLike = {
  especialistaSaludTrabajo?: string | boolean;
} | null;

/** Presencia de enfermera firmante (sin médico) → tipo personal 6 en CEX. */
export type EnfermeraFirmanteLike = Record<string, unknown> | null;

export interface ValidateNotaMedicaDiagnosticosSisParams {
  formData: Record<string, unknown>;
  trabajadorSexo: string;
  trabajadorFechaNacimiento: Date;
  fechaNotaMedica: Date;
  medicoFirmante: MedicoFirmanteLike;
  enfermeraFirmante?: EnfermeraFirmanteLike;
  /** Si true, pasos de diagnóstico 9/11; si false, 6/8 */
  showSiresUI: boolean;
}

export interface ValidateNotaMedicaDiagnosticosSisResult {
  ok: boolean;
  messageToast?: string;
  paso?: number;
}

function extractCode(value: unknown): string {
  if (value == null || value === undefined) return '';
  return extractCIE10Code(String(value)) || '';
}

/** Código CIE 4 caracteres sin punto, mayúsculas. Vacío si inválido. */
function norm4Chars(value: unknown): string {
  const raw = extractCode(value);
  if (!raw.trim()) return '';
  const n = normalizeCIE10Code(raw) || raw.trim().toUpperCase();
  const w = n.replace(/\./g, '').toUpperCase();
  return /^[A-Z0-9]{4}$/.test(w) ? w : '';
}

/** Índice 1-based en el stepper de nota médica: Step10 (diag. 2). */
function pasoDiag2(showSires: boolean): number {
  return showSires ? 10 : 7;
}

/** Índice 1-based: Step11 (diag. 3). */
function pasoDiag3(showSires: boolean): number {
  return showSires ? 11 : 8;
}

function pasoDiagPrincipal(showSires: boolean): number {
  return showSires ? 9 : 6;
}

/**
 * Tipo efectivo DGIS para validación LETRA (MT/CP), alineado con
 * backend expedientes/helpers/firmante-helper.ts → getPrestadorDataFromUser:
 * - Médico: especialistaSaludTrabajo === "Si" → 4; en otro caso → 2.
 * - Enfermera (sin médico): 6.
 */
export function resolveEffectiveTipoPersonalDgis(
  medico: MedicoFirmanteLike,
  enfermera: EnfermeraFirmanteLike | undefined,
): {
  source: 'medico_infer' | 'enfermera_infer' | 'none';
  value: number | null;
} {
  if (medico) {
    const esp = medico.especialistaSaludTrabajo;
    const value =
      esp === 'Si' || esp === true
        ? TIPO_PERSONAL_MEDICO_ESPECIALISTA
        : TIPO_PERSONAL_MEDICO_GENERAL;
    return { source: 'medico_infer', value };
  }
  if (enfermera && typeof enfermera === 'object') {
    return { source: 'enfermera_infer', value: TIPO_PERSONAL_ENFERMERA };
  }
  return { source: 'none', value: null };
}

async function catalogEntryExists(code: string): Promise<boolean> {
  const key = norm4Chars(code);
  if (!key) return false;
  try {
    await CatalogsAPI.getCIE10ByCode(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida reglas DIAGNOSTICO_SIS para diagnósticos 2 y 3.
 */
export async function validateNotaMedicaDiagnosticos2Y3(
  params: ValidateNotaMedicaDiagnosticosSisParams,
): Promise<ValidateNotaMedicaDiagnosticosSisResult> {
  const p = params.formData;
  const pv2 = p.primeraVezDiagnostico2;
  const pv3 = p.primeraVezDiagnostico3;
  const code2 = extractCode(p.codigoCIEDiagnostico2);
  const code3 = extractCode(p.codigoCIEDiagnostico3);

  const paso2 = pasoDiag2(params.showSiresUI);
  const paso3 = pasoDiag3(params.showSiresUI);

  // 1) primeraVez === -1 ⇒ campo vacío
  if (pv2 === -1 && code2.trim() !== '') {
    return {
      ok: false,
      messageToast:
        'Si el diagnóstico 2 no aplica (primera vez = No aplica), el código CIE-10 debe estar vacío.',
      paso: paso2,
    };
  }
  if (pv3 === -1 && code3.trim() !== '') {
    return {
      ok: false,
      messageToast:
        'Si el diagnóstico 3 no aplica (primera vez = No aplica), el código CIE-10 debe estar vacío.',
      paso: paso3,
    };
  }

  const tipoRes = resolveEffectiveTipoPersonalDgis(
    params.medicoFirmante,
    params.enfermeraFirmante,
  );

  const validateOneDiag = async (
    label: '2' | '3',
    codigoRaw: string,
    primeraVez: unknown,
  ): Promise<ValidateNotaMedicaDiagnosticosSisResult | null> => {
    if (!codigoRaw.trim()) return null;
    if (primeraVez === -1) {
      return {
        ok: false,
        messageToast: `No puede haber código CIE en diagnóstico ${label} cuando primera vez es no aplica.`,
        paso: label === '2' ? paso2 : paso3,
      };
    }

    const norm = norm4Chars(codigoRaw);
    if (!norm) {
      return {
        ok: false,
        messageToast: `Diagnóstico ${label}: el código CIE-10 debe tener exactamente 4 caracteres.`,
        paso: label === '2' ? paso2 : paso3,
      };
    }

    const exists = await catalogEntryExists(codigoRaw);
    if (!exists) {
      return {
        ok: false,
        messageToast: `Diagnóstico ${label}: el código ${norm} no está en el catálogo DIAGNOSTICO_SIS.`,
        paso: label === '2' ? paso2 : paso3,
      };
    }

    const rule = await findCIE10Rule(norm);
    const letra = rule?.letra?.trim().toUpperCase();
    if (letra === 'MT' || letra === 'CP') {
      const required =
        letra === 'MT'
          ? TIPO_PERSONAL_MEDICO_GENERAL
          : TIPO_PERSONAL_MEDICO_ESPECIALISTA;
      if (tipoRes.source === 'none' || tipoRes.value == null) {
        return {
          ok: false,
          messageToast: `El diagnóstico ${label} (${letra}) requiere un firmante médico o de enfermería registrado para validar el tipo de personal.`,
          paso: label === '2' ? paso2 : paso3,
        };
      }
      if (tipoRes.source === 'enfermera_infer') {
        return {
          ok: false,
          messageToast: `El diagnóstico ${label} (${letra}) requiere firmante médico (tipo personal ${required === TIPO_PERSONAL_MEDICO_GENERAL ? '2 — general' : '4 — especialista'}).`,
          paso: label === '2' ? paso2 : paso3,
        };
      }
      if (tipoRes.value !== required) {
        return {
          ok: false,
          messageToast: `El diagnóstico ${label} (${letra}) requiere tipo de personal ${required === TIPO_PERSONAL_MEDICO_GENERAL ? '2 (médica/o general)' : '4 (médica/o especialista)'}.`,
          paso: label === '2' ? paso2 : paso3,
        };
      }
    }

    return null;
  };

  const r2 = await validateOneDiag('2', code2, pv2);
  if (r2) return r2;
  const r3 = await validateOneDiag('3', code3, pv3);
  if (r3) return r3;

  // Sexo/edad (reutilizar helper existente) — solo códigos presentes
  const sexAgeParams: CIE10SexAgeValidationParams = {
    codigoCIE10Principal: (p.codigoCIE10Principal as string) || undefined,
    codigosCIE10Complementarios: (p.codigosCIE10Complementarios as string[]) || undefined,
    codigoCIEDiagnostico2: code2.trim() ? (p.codigoCIEDiagnostico2 as string) : undefined,
    codigoCIEDiagnostico3: code3.trim() ? (p.codigoCIEDiagnostico3 as string) : undefined,
    trabajadorSexo: params.trabajadorSexo,
    trabajadorFechaNacimiento: params.trabajadorFechaNacimiento,
    fechaNotaMedica: params.fechaNotaMedica,
  };

  const sexAgeIssues = await validateCIE10SexAge(sexAgeParams);
  if (sexAgeIssues.length > 0) {
    const first = sexAgeIssues[0];
    const field = first.field;
    const pasoPrinc = pasoDiagPrincipal(params.showSiresUI);
    const paso =
      field === 'codigoCIEDiagnostico3'
        ? paso3
        : field === 'codigoCIEDiagnostico2'
          ? paso2
          : pasoPrinc;
    return {
      ok: false,
      messageToast: first.messageToast,
      paso,
    };
  }

  return { ok: true };
}
