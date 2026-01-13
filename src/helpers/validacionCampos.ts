// Helper para validar campos requeridos según el tipo de documento
export interface CampoFaltante {
  nombre: string;
  tipo: string;
  paso?: number;
}

export interface ValidacionResultado {
  esValido: boolean;
  camposFaltantes: CampoFaltante[];
}

// Función para verificar si un valor está vacío o es inválido
function esValorVacio(valor: any): boolean {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return valor.trim() === '';
  if (typeof valor === 'number') return isNaN(valor);
  if (Array.isArray(valor)) return valor.length === 0;
  return false;
}

// Función para validar campos de fecha
function validarFecha(fecha: any): boolean {
  if (esValorVacio(fecha)) return false;
  if (typeof fecha === 'string') {
    // Verificar si es una fecha válida en formato ISO o YYYY-MM-DD
    const date = new Date(fecha);
    return !isNaN(date.getTime());
  }
  return fecha instanceof Date && !isNaN(fecha.getTime());
}

// Función para validar campos numéricos
function validarNumero(numero: any): boolean {
  if (esValorVacio(numero)) return false;
  const num = Number(numero);
  return !isNaN(num) && isFinite(num);
}

// Función para validar campos de texto
function validarTexto(texto: any): boolean {
  if (esValorVacio(texto)) return false;
  return typeof texto === 'string' && texto.trim().length > 0;
}

// Función para validar listas de texto (mínimo un elemento no vacío)
function validarListaTexto(lista: any): boolean {
  if (!Array.isArray(lista) || lista.length === 0) return false;
  return lista.every(item => typeof item === 'string' && item.trim().length > 0);
}

// Función para validar campos de selección
function validarSeleccion(seleccion: any): boolean {
  if (esValorVacio(seleccion)) return false;
  return typeof seleccion === 'string' && seleccion.trim().length > 0;
}

// Función helper para extraer código CIE-10 del formato "CODE - DESCRIPTION"
function extractCode(value: string): string {
  if (!value) return '';
  if (!value.includes(' - ')) return value;
  return value.split(' - ')[0].trim();
}

// Función para determinar si requiere confirmación diagnóstica
function requiereConfirmacionDiagnostica(codigoCIE10Principal: any): boolean {
  if (!codigoCIE10Principal) return false;
  const codigo = extractCode(codigoCIE10Principal).toUpperCase();
  const esCronico = codigo.startsWith('E11') || codigo.startsWith('I1');
  const esCancer = codigo.startsWith('C');
  return esCronico || esCancer;
}

// Función para determinar si requiere causa externa
function requiereCausaExterna(codigoCIE10Principal: any): boolean {
  if (!codigoCIE10Principal) return false;
  const codigo = extractCode(codigoCIE10Principal);
  const primeraLetra = codigo.charAt(0).toUpperCase();
  // Cap. XIX (S, T) o Cap. XX (V-Y)
  return primeraLetra === 'S' || primeraLetra === 'T' || (primeraLetra >= 'V' && primeraLetra <= 'Y');
}

// Función para validar relación temporal
function validarRelacionTemporal(valor: any): boolean {
  // Debe ser 0 (Primera Vez) o 1 (Subsecuente)
  return valor === 0 || valor === 1;
}

// Función para validar confirmación diagnóstica (condicional)
function validarConfirmacionDiagnostica(valor: any, datosFormulario: any): boolean {
  // Si no se requiere, no validar (siempre válido)
  if (!requiereConfirmacionDiagnostica(datosFormulario.codigoCIE10Principal)) {
    return true;
  }
  // Si se requiere, debe estar definido (true o false explícito)
  return valor !== undefined && valor !== null;
}

// Función para validar causa externa (condicional)
function validarCausaExterna(valor: any, datosFormulario: any): boolean {
  // Si no se requiere, no validar (siempre válido)
  if (!requiereCausaExterna(datosFormulario.codigoCIE10Principal)) {
    return true;
  }
  // Si se requiere, debe estar presente
  return validarSeleccion(valor);
}

// Definición de campos requeridos por tipo de documento
const camposRequeridosPorTipo: Record<string, Array<{
  campo: string, 
  nombre: string, 
  tipo: string, 
  paso?: number, 
  validacion?: (valor: any, datosFormulario?: any) => boolean,
  condicional?: boolean
}>> = {
  antidoping: [
    { campo: 'fechaAntidoping', nombre: 'Fecha de la prueba', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'marihuana', nombre: 'Resultados', tipo: 'seleccion', paso: 2, validacion: validarSeleccion }
  ],
  
  aptitud: [
    { campo: 'fechaAptitudPuesto', nombre: 'Fecha del informe ', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'aptitudPuesto', nombre: 'Aptitud al Puesto', tipo: 'seleccion', paso: 8, validacion: validarSeleccion },
    { campo: 'alteracionesSalud', nombre: 'Alteraciones de Salud', tipo: 'texto', paso: 9, validacion: validarTexto },
    { campo: 'resultados', nombre: 'Resultados', tipo: 'texto', paso: 10, validacion: validarTexto },
    { campo: 'medidasPreventivas', nombre: 'Medidas Preventivas', tipo: 'texto', paso: 11, validacion: validarTexto },
  ],
  
  audiometria: [
    { campo: 'fechaAudiometria', nombre: 'Fecha de audiometría', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'metodoAudiometria', nombre: 'Método de audiometría', tipo: 'seleccion', paso: 1, validacion: validarSeleccion },
    { campo: 'oidoDerecho125', nombre: 'Valores oido derecho', tipo: 'medida', paso: 2, validacion: validarNumero },
    { campo: 'oidoIzquierdo125', nombre: 'Valores oido izquierdo', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'diagnosticoAudiometria', nombre: 'Diagnóstico', tipo: 'texto', paso: 6, validacion: validarTexto },
  ],
  
  certificado: [
    { campo: 'fechaCertificado', nombre: 'Fecha del Certificado', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'impedimentosFisicos', nombre: 'Impedimentos Físicos', tipo: 'texto', paso: 2, validacion: validarTexto }
  ],
  
  certificadoExpedito: [
    { campo: 'fechaCertificadoExpedito', nombre: 'Fecha del certificado', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'cuerpoCertificado', nombre: 'Cuerpo del certificado', tipo: 'texto', paso: 2, validacion: validarTexto },
    { campo: 'tensionArterialSistolica', nombre: 'Tensión Arterial', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'frecuenciaCardiaca', nombre: 'Frecuencia Cardíaca', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'frecuenciaRespiratoria', nombre: 'Frecuencia Respiratoria', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'temperaturaCorporal', nombre: 'Temperatura Corporal', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'peso', nombre: 'Peso', tipo: 'medida', paso: 4, validacion: validarNumero },
    { campo: 'altura', nombre: 'Altura', tipo: 'medida', paso: 4, validacion: validarNumero },
    { campo: 'impedimentosFisicos', nombre: 'Impedimentos Físicos', tipo: 'texto', paso: 5, validacion: validarTexto },
    { campo: 'gradoSalud', nombre: 'Grado de Salud', tipo: 'seleccion', paso: 6, validacion: validarSeleccion },
    { campo: 'aptitudPuesto', nombre: 'Aptitud Puesto', tipo: 'seleccion', paso: 7, validacion: validarSeleccion },
  ],
  
  examenVista: [
    { campo: 'fechaExamenVista', nombre: 'Fecha de examen de vista', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'sinCorreccionLejanaInterpretacion', nombre: 'Agudeza visual lejana sin lentes', tipo: 'seleccion', paso: 2, validacion: validarSeleccion },
    { campo: 'sinCorreccionCercanaInterpretacion', nombre: 'Agudeza visual cercana sin lentes', tipo: 'seleccion', paso: 3, validacion: validarSeleccion },
    { campo: 'interpretacionIshihara', nombre: 'Prueba de Ishihara', tipo: 'seleccion', paso: 6, validacion: validarSeleccion },
  ],
  
  exploracionFisica: [
    { campo: 'fechaExploracionFisica', nombre: 'Fecha de exploración física', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'peso', nombre: 'Peso', tipo: 'medida', paso: 2, validacion: validarNumero },
    { campo: 'altura', nombre: 'Altura', tipo: 'medida', paso: 2, validacion: validarNumero },
    { campo: 'indiceMasaCorporal', nombre: 'IMC', tipo: 'medida', paso: 2, validacion: validarNumero },
    { campo: 'circunferenciaCintura', nombre: 'Circunferencia Cintura', tipo: 'medida', paso: 2, validacion: validarNumero },
    { campo: 'tensionArterialSistolica', nombre: 'Tensión Arterial', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'frecuenciaCardiaca', nombre: 'Frecuencia Cardíaca', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'frecuenciaRespiratoria', nombre: 'Frecuencia Respiratoria', tipo: 'medida', paso: 3, validacion: validarNumero },
    { campo: 'saturacionOxigeno', nombre: 'Saturación de Oxígeno', tipo: 'medida', paso: 3, validacion: validarNumero },
  ],
  
  historiaClinica: [
    { campo: 'motivoExamen', nombre: 'Motivo del examen', tipo: 'seleccion', paso: 1, validacion: validarSeleccion },
    { campo: 'fechaHistoriaClinica', nombre: 'Fecha de historia clínica', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'resumenHistoriaClinica', nombre: 'Resumen de historia clínica', tipo: 'texto', paso: 32, validacion: validarTexto }
  ],
  
  notaMedica: [
    { campo: 'fechaNotaMedica', nombre: 'Fecha de la nota médica', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'motivoConsulta', nombre: 'Motivo de consulta', tipo: 'texto', paso: 2, validacion: validarTexto },
    { campo: 'codigoCIE10Principal', nombre: 'Diagnóstico principal', tipo: 'seleccion', paso: 6, validacion: validarSeleccion },
    { campo: 'relacionTemporal', nombre: 'Relación temporal', tipo: 'seleccion', paso: 6, validacion: validarRelacionTemporal },
    { 
      campo: 'confirmacionDiagnostica', 
      nombre: 'Confirmación diagnóstica', 
      tipo: 'booleano', 
      paso: 6, 
      validacion: (valor: any, datosFormulario: any) => validarConfirmacionDiagnostica(valor, datosFormulario),
      condicional: true
    },
    { 
      campo: 'codigoCIECausaExterna', 
      nombre: 'Causa externa', 
      tipo: 'seleccion', 
      paso: 6, 
      validacion: (valor: any, datosFormulario: any) => validarCausaExterna(valor, datosFormulario),
      condicional: true
    },
  ],

  notaAclaratoria: [
    { campo: 'fechaNotaAclaratoria', nombre: 'Fecha de la nota aclaratoria', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'documentoOrigenId', nombre: 'Documento que aclara', tipo: 'seleccion', paso: 2, validacion: validarSeleccion },
    { campo: 'alcanceAclaracion', nombre: 'Alcance de la aclaración', tipo: 'seleccion', paso: 3, validacion: validarSeleccion },
    { campo: 'impactoClinico', nombre: 'Impacto clínico', tipo: 'seleccion', paso: 4, validacion: validarSeleccion },
    { campo: 'motivoAclaracion', nombre: 'Motivo de la aclaración', tipo: 'texto', paso: 5, validacion: validarTexto },
    { campo: 'descripcionAclaracion', nombre: 'Descripción de la aclaración', tipo: 'texto', paso: 6, validacion: validarTexto },
  ],
  
  controlPrenatal: [
    { campo: 'fechaInicioControlPrenatal', nombre: 'Fecha de inicio del control prenatal', tipo: 'fecha', paso: 1, validacion: validarFecha },
  ],
  
  historiaOtologica: [
    { campo: 'fechaHistoriaOtologica', nombre: 'Fecha de historia otológica', tipo: 'fecha', paso: 1, validacion: validarFecha },
  ],
  
  previoEspirometria: [
    { campo: 'fechaPrevioEspirometria', nombre: 'Fecha del cuestionario', tipo: 'fecha', paso: 1, validacion: validarFecha },
  ],

  receta: [
    { campo: 'fechaReceta', nombre: 'Fecha de la receta', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'tratamiento', nombre: 'Tratamiento', tipo: 'lista', paso: 2, validacion: validarListaTexto },
  ],
};

// Función principal para validar campos requeridos
export function validarCamposRequeridos(
  tipoDocumento: string, 
  datosFormulario: any,
  options?: { cie10Required?: boolean }
): ValidacionResultado {
  let camposRequeridos = camposRequeridosPorTipo[tipoDocumento];
  
  if (!camposRequeridos) {
    console.warn(`No se encontraron campos requeridos para el tipo de documento: ${tipoDocumento}`);
    return { esValido: true, camposFaltantes: [] };
  }
  
  // Filtrar codigoCIE10Principal solo si explícitamente no es requerido
  // NOTA: Actualmente codigoCIE10Principal es obligatorio para todos los regímenes (SIRES_NOM024 y SIN_REGIMEN)
  // Esta lógica se mantiene por compatibilidad, pero normalmente cie10Required será true
  if (tipoDocumento === 'notaMedica' && options?.cie10Required === false) {
    camposRequeridos = camposRequeridos.filter(
      campo => campo.campo !== 'codigoCIE10Principal'
    );
  }
  
  const camposFaltantes: CampoFaltante[] = [];
  
  for (const campoRequerido of camposRequeridos) {
    const valor = datosFormulario[campoRequerido.campo];
    
    // Para validaciones condicionales, pasar datosFormulario completo
    let esValido: boolean;
    if (campoRequerido.validacion) {
      if (campoRequerido.condicional) {
        // Validaciones condicionales reciben (valor, datosFormulario)
        esValido = campoRequerido.validacion(valor, datosFormulario);
      } else {
        // Validaciones normales reciben solo (valor)
        esValido = campoRequerido.validacion(valor);
      }
    } else {
      esValido = !esValorVacio(valor);
    }
    
    if (!esValido) {
      camposFaltantes.push({
        nombre: campoRequerido.nombre,
        tipo: campoRequerido.tipo,
        paso: campoRequerido.paso
      });
    }
  }
  
  return {
    esValido: camposFaltantes.length === 0,
    camposFaltantes
  };
}

// Función para obtener campos requeridos por tipo de documento (para debugging)
export function obtenerCamposRequeridos(tipoDocumento: string) {
  return camposRequeridosPorTipo[tipoDocumento] || [];
}

