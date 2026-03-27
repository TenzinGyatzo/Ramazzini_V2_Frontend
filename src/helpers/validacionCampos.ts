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

/** Obligatorio solo si `alteracionesPensamiento === 'Sí'` */
function validarDescripcionAlteracionesPensamientoSiAplica(valor: any, datos?: any): boolean {
  if (!datos || datos.alteracionesPensamiento !== 'Sí') return true;
  return validarTexto(valor);
}

/** Obligatorio solo si `alteracionesPerceptuales === 'Sí'` */
function validarDescripcionAlteracionesPerceptualesSiAplica(valor: any, datos?: any): boolean {
  if (!datos || datos.alteracionesPerceptuales !== 'Sí') return true;
  return validarTexto(valor);
}

/** Obligatorio solo si `ideacionSuicida === 'Sí'` */
function validarObservacionesIdeacionSuicidaSiAplica(valor: any, datos?: any): boolean {
  if (!datos || datos.ideacionSuicida !== 'Sí') return true;
  return validarTexto(valor);
}

// Definición de campos requeridos por tipo de documento
const camposRequeridosPorTipo: Record<
  string,
  Array<{
    campo: string;
    nombre: string;
    tipo: string;
    paso?: number;
    /** El segundo argumento es opcional: datos completos del formulario para reglas condicionales */
    validacion?: (valor: any, datosFormulario?: any) => boolean;
  }>
> = {
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
    { campo: 'diagnostico', nombre: 'Diagnóstico', tipo: 'texto', paso: 6, validacion: validarTexto }
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

  entrevistaPsicologica: [
    { campo: 'fechaEntrevistaPsicologica', nombre: 'Fecha de la entrevista psicológica', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'apariencia', nombre: 'Apariencia', tipo: 'seleccion', paso: 2, validacion: validarSeleccion },
    { campo: 'actitudHaciaEvaluador', nombre: 'Actitud hacia el evaluador', tipo: 'seleccion', paso: 3, validacion: validarSeleccion },
    { campo: 'nivelCooperacion', nombre: 'Nivel de cooperación', tipo: 'seleccion', paso: 4, validacion: validarSeleccion },
    { campo: 'contactoVisual', nombre: 'Contacto visual', tipo: 'seleccion', paso: 5, validacion: validarSeleccion },
    { campo: 'conductaMotora', nombre: 'Conducta motora', tipo: 'seleccion', paso: 6, validacion: validarSeleccion },
    { campo: 'estadoAnimoPredominante', nombre: 'Estado de ánimo predominante', tipo: 'seleccion', paso: 7, validacion: validarSeleccion },
    { campo: 'afecto', nombre: 'Afecto', tipo: 'seleccion', paso: 8, validacion: validarSeleccion },
    { campo: 'intensidadEmocional', nombre: 'Intensidad emocional', tipo: 'seleccion', paso: 9, validacion: validarSeleccion },
    { campo: 'cursoPensamiento', nombre: 'Curso del pensamiento', tipo: 'seleccion', paso: 10, validacion: validarSeleccion },
    { campo: 'alteracionesPensamiento', nombre: 'Alteraciones del pensamiento', tipo: 'seleccion', paso: 11, validacion: validarSeleccion },
    { campo: 'descripcionAlteracionesPensamiento', nombre: 'Descripción de alteraciones del pensamiento', tipo: 'texto', paso: 11, validacion: validarDescripcionAlteracionesPensamientoSiAplica },
    { campo: 'alteracionesPerceptuales', nombre: 'Alteraciones perceptuales', tipo: 'seleccion', paso: 12, validacion: validarSeleccion },
    { campo: 'descripcionAlteracionesPerceptuales', nombre: 'Descripción de alteraciones perceptuales', tipo: 'texto', paso: 12, validacion: validarDescripcionAlteracionesPerceptualesSiAplica },
    { campo: 'orientacion', nombre: 'Orientación', tipo: 'seleccion', paso: 13, validacion: validarSeleccion },
    { campo: 'atencionConcentracion', nombre: 'Atención y concentración', tipo: 'seleccion', paso: 14, validacion: validarSeleccion },
    { campo: 'memoria', nombre: 'Memoria', tipo: 'seleccion', paso: 15, validacion: validarSeleccion },
    { campo: 'juicio', nombre: 'Juicio', tipo: 'seleccion', paso: 16, validacion: validarSeleccion },
    { campo: 'concienciaEstado', nombre: 'Conciencia de estado', tipo: 'seleccion', paso: 17, validacion: validarSeleccion },
    { campo: 'relacionesInterpersonales', nombre: 'Relaciones interpersonales', tipo: 'seleccion', paso: 18, validacion: validarSeleccion },
    { campo: 'desempenoLaboralAutorreporte', nombre: 'Desempeño laboral (autorreporte)', tipo: 'seleccion', paso: 19, validacion: validarSeleccion },
    { campo: 'manejoEstres', nombre: 'Manejo del estrés', tipo: 'seleccion', paso: 20, validacion: validarSeleccion },
    { campo: 'ideacionSuicida', nombre: 'Ideación suicida', tipo: 'seleccion', paso: 21, validacion: validarSeleccion },
    { campo: 'observacionesIdeacionSuicida', nombre: 'Observaciones (ideación suicida)', tipo: 'texto', paso: 21, validacion: validarObservacionesIdeacionSuicidaSiAplica },
    { campo: 'conclusionClinica', nombre: 'Conclusión clínica', tipo: 'texto', paso: 22, validacion: validarTexto },
  ],
};

// Función principal para validar campos requeridos
export function validarCamposRequeridos(tipoDocumento: string, datosFormulario: any): ValidacionResultado {
  const camposRequeridos = camposRequeridosPorTipo[tipoDocumento];
  
  if (!camposRequeridos) {
    console.warn(`No se encontraron campos requeridos para el tipo de documento: ${tipoDocumento}`);
    return { esValido: true, camposFaltantes: [] };
  }
  
  const camposFaltantes: CampoFaltante[] = [];
  
  for (const campoRequerido of camposRequeridos) {
    const valor = datosFormulario[campoRequerido.campo];
    
    // Usar la función de validación específica si está definida, sino usar validación general
    // El segundo argumento permite reglas condicionales (p. ej. descripción solo si "Sí")
    const esValido = campoRequerido.validacion 
      ? campoRequerido.validacion(valor, datosFormulario)
      : !esValorVacio(valor);
    
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

