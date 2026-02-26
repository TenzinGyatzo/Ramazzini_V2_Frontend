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

// Función para validar listas de números (mínimo un elemento, máx 5)
function validarListaNumeros(lista: any): boolean {
  if (!Array.isArray(lista) || lista.length === 0) return false;
  if (lista.length > 5) return false;
  return lista.every(item => typeof item === 'number' && !isNaN(item));
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

// Validadores condicionales para LES (Reporte de Lesión)
function validarAgenteLesion(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  const tv = datosFormulario?.tipoViolencia;
  const tieneFisicaSexual = Array.isArray(tv) && (tv.includes(6) || tv.includes(7));
  if ((int !== 1 && int !== 4) && !tieneFisicaSexual) return true;
  return validarNumero(valor);
}
function validarTipoViolencia(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  if (int !== 2 && int !== 3) return true;
  if (!Array.isArray(valor) || valor.length === 0) return false;
  return true;
}
function validarEspecifique(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.agenteLesion !== 25) return true;
  return validarTexto(valor);
}
function validarEspecifiqueServicio(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.servicioAtencion !== 5) return true;
  return validarTexto(valor);
}
function validarEspecifiqueArea(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.areaAnatomica !== 16) return true;
  return validarTexto(valor);
}
function validarEspecifiqueConsecuencia(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.consecuenciaGravedad !== 22) return true;
  return validarTexto(valor);
}

// Validadores Step5: descripción afección y causa externa (reglas LES: min 2, max 250, empieza con letra)
function validarDescripcionAfeccionPrincipal(valor: any): boolean {
  if (!valor || typeof valor !== 'string') return false;
  const t = valor.trim();
  if (t.length === 0) return false;
  if (t.length < 2) return false;
  if (t.length > 250) return false;
  return /^[A-Za-zÁáÉéÍíÓóÚúÑñ]/.test(t);
}
function validarCausaExternaLES(valor: any): boolean {
  if (!valor || typeof valor !== 'string') return false;
  const t = valor.trim();
  if (t.length === 0) return false;
  if (t.length < 2) return false;
  if (t.length > 250) return false;
  return /^[A-Za-zÁáÉéÍíÓóÚúÑñ]/.test(t);
}
function validarEspecifiqueDestino(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.despuesAtencion !== 11) return true;
  return validarTexto(valor);
}
function validarFolioCertificadoDefuncion(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.despuesAtencion !== 5 || datosFormulario?.ministerioPublico !== 2) return true;
  if (!valor || typeof valor !== 'string') return false;
  return /^\d{9}$/.test(valor.trim());
}

// Validadores condicionales Step3 (violencia: intenc 2 o 3)
function validarNumeroAgresores(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  if (int !== 2 && int !== 3) return true;
  return validarNumero(valor);
}
function validarParentescoAfectado(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  const num = datosFormulario?.numeroAgresores;
  if (int !== 2 && int !== 3) return true;
  if (num !== 1) return true;
  if (valor == null || valor === -1) return false;
  return validarNumero(valor);
}
function validarSexoAgresor(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  const num = datosFormulario?.numeroAgresores;
  if (int !== 2 && int !== 3) return true;
  if (num !== 1) return true;
  if (valor == null || valor === -1) return false;
  return validarNumero(valor);
}
function validarEdadAgresor(valor: any, datosFormulario: any): boolean {
  const int = datosFormulario?.intencionalidad;
  const num = datosFormulario?.numeroAgresores;
  if (int !== 2 && int !== 3) return true;
  if (num !== 1) return true;
  if (valor == null || valor === '') return false;
  const n = Number(valor);
  return !isNaN(n) && n >= 0 && n <= 999;
}

// Validadores condicionales Step3 (agente 20: vehículo motor)
function validarLesionadoVehiculoMotor(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.agenteLesion !== 20) return true;
  if (valor == null || valor === -1) return false;
  return validarNumero(valor);
}
function validarUsoEquipoSeguridad(valor: any, datosFormulario: any): boolean {
  const lesionado = datosFormulario?.lesionadoVehiculoMotor;
  if (lesionado !== 1 && lesionado !== 2) return true;
  if (valor == null || valor === -1) return false;
  return validarNumero(valor);
}
function validarEquipoUtilizado(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.usoEquipoSeguridad !== 1) return true;
  if (valor == null || valor === -1) return false;
  return validarNumero(valor);
}
function validarEspecifiqueEquipo(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.equipoUtilizado !== 4) return true;
  return validarTexto(valor);
}

// Validadores de formato para lesion (evitar fallos en backend)
const CIE_AFECCION_REGEX = /^[A-Z][0-9]{2,3}(\.[0-9]{1,2})?$/;
const CIE_CAUSA_REGEX = /^[VWXY][0-9]{2,3}(\.[0-9]{1,2})?$/;
const HORA_HHMM_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

function validarCodigoCIELesionAfeccion(valor: any): boolean {
  const code = extractCode(valor);
  if (!code || typeof code !== 'string') return false;
  return CIE_AFECCION_REGEX.test(code.trim().toUpperCase()) && hasCIE10Exact4Chars(code);
}
function validarCodigoCIELesionCausa(valor: any): boolean {
  const code = extractCode(valor);
  if (!code || typeof code !== 'string') return false;
  return CIE_CAUSA_REGEX.test(code.trim().toUpperCase()) && hasCIE10Exact4Chars(code);
}
function validarHoraHHMM(valor: any): boolean {
  if (valor === null || valor === undefined || valor === '') return true;
  if (valor === '99:99') return true;
  if (typeof valor !== 'string') return false;
  return HORA_HHMM_REGEX.test(valor.trim());
}

// Hora del evento (lesión): obligatoria — debe ser HH:mm válido o '99:99' (se desconoce)
function validarHoraEventoRequerida(valor: any): boolean {
  if (valor === null || valor === undefined || valor === '') return false;
  if (valor === '99:99') return true;
  if (typeof valor !== 'string') return false;
  return HORA_HHMM_REGEX.test(valor.trim());
}
function validarTiempoTrasladoUH(valor: any, datosFormulario: any): boolean {
  if (datosFormulario?.atencionPreHospitalaria !== 1) return true;
  if (valor === null || valor === undefined || valor === '') return false;
  if (valor === '99:99') return true;
  if (typeof valor !== 'string') return false;
  const t = valor.trim();
  if (t.length < 5 || /[^\d:]/.test(t)) return false;
  if (!/^\d{1,2}:\d{2}$/.test(t)) return false;
  const [h, m] = t.split(':').map(Number);
  if (h < 0 || h > 48 || (h === 48 && m > 0) || m < 0 || m > 59) return false;
  if (h === 0 && m === 0) return false;
  return true;
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

  lesion: [
    { campo: 'fechaReporteLesion', nombre: 'Fecha de reporte', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'fechaEvento', nombre: 'Fecha del evento', tipo: 'fecha', paso: 1, validacion: validarFecha },
    { campo: 'horaEvento', nombre: 'Hora del evento', tipo: 'hora', paso: 1, validacion: validarHoraEventoRequerida },
    { campo: 'diaFestivo', nombre: 'Día festivo', tipo: 'seleccion', paso: 1, validacion: validarNumero },
    { campo: 'sitioOcurrencia', nombre: 'Sitio de ocurrencia', tipo: 'seleccion', paso: 2, validacion: validarNumero },
    { campo: 'intencionalidad', nombre: 'Intencionalidad', tipo: 'seleccion', paso: 3, validacion: validarNumero },
    { campo: 'eventoRepetido', nombre: 'Evento repetido', tipo: 'seleccion', paso: 3, validacion: validarNumero },
    { campo: 'agenteLesion', nombre: 'Agente de lesión', tipo: 'seleccion', paso: 3, validacion: validarAgenteLesion, condicional: true },
    { campo: 'tipoViolencia', nombre: 'Tipo de violencia', tipo: 'lista', paso: 3, validacion: validarTipoViolencia, condicional: true },
    { campo: 'especifique', nombre: 'Especifique (agente)', tipo: 'texto', paso: 3, validacion: validarEspecifique, condicional: true },
    { campo: 'numeroAgresores', nombre: 'Número de agresores', tipo: 'seleccion', paso: 3, validacion: validarNumeroAgresores, condicional: true },
    { campo: 'parentescoAfectado', nombre: 'Parentesco afectado', tipo: 'seleccion', paso: 3, validacion: validarParentescoAfectado, condicional: true },
    { campo: 'sexoAgresor', nombre: 'Sexo agresor', tipo: 'seleccion', paso: 3, validacion: validarSexoAgresor, condicional: true },
    { campo: 'edadAgresor', nombre: 'Edad agresor', tipo: 'medida', paso: 3, validacion: validarEdadAgresor, condicional: true },
    { campo: 'lesionadoVehiculoMotor', nombre: 'Lesionado en vehículo motor', tipo: 'seleccion', paso: 3, validacion: validarLesionadoVehiculoMotor, condicional: true },
    { campo: 'usoEquipoSeguridad', nombre: 'Uso equipo de seguridad', tipo: 'seleccion', paso: 3, validacion: validarUsoEquipoSeguridad, condicional: true },
    { campo: 'equipoUtilizado', nombre: 'Equipo utilizado', tipo: 'seleccion', paso: 3, validacion: validarEquipoUtilizado, condicional: true },
    { campo: 'especifiqueEquipo', nombre: 'Especifique equipo', tipo: 'texto', paso: 3, validacion: validarEspecifiqueEquipo, condicional: true },
    { campo: 'tiempoTrasladoUH', nombre: 'Tiempo traslado a UH', tipo: 'texto', paso: 3, validacion: validarTiempoTrasladoUH, condicional: true },
    { campo: 'fechaAtencion', nombre: 'Fecha de atención', tipo: 'fecha', paso: 4, validacion: validarFecha },
    { campo: 'horaAtencion', nombre: 'Hora de atención', tipo: 'hora', paso: 4, validacion: validarHoraEventoRequerida },
    { campo: 'servicioAtencion', nombre: 'Servicio que otorgó la atención', tipo: 'seleccion', paso: 4, validacion: validarNumero },
    { campo: 'tipoAtencion', nombre: 'Tipo de atención', tipo: 'lista', paso: 4, validacion: validarListaNumeros },
    { campo: 'areaAnatomica', nombre: 'Área anatómica', tipo: 'seleccion', paso: 5, validacion: validarNumero },
    { campo: 'consecuenciaGravedad', nombre: 'Consecuencia/gravedad', tipo: 'seleccion', paso: 5, validacion: validarNumero },
    { campo: 'codigoCIEAfeccionPrincipal', nombre: 'Código CIE afección principal', tipo: 'seleccion', paso: 5, validacion: validarCodigoCIELesionAfeccion },
    { campo: 'descripcionAfeccionPrincipal', nombre: 'Descripción afección principal', tipo: 'texto', paso: 5, validacion: validarDescripcionAfeccionPrincipal },
    { campo: 'codigoCIECausaExterna', nombre: 'Código CIE causa externa', tipo: 'seleccion', paso: 5, validacion: validarCodigoCIELesionCausa },
    { campo: 'causaExterna', nombre: 'Descripción causa externa', tipo: 'texto', paso: 5, validacion: validarCausaExternaLES },
    { campo: 'especifiqueServicio', nombre: 'Especifique servicio', tipo: 'texto', paso: 4, validacion: validarEspecifiqueServicio, condicional: true },
    { campo: 'especifiqueArea', nombre: 'Especifique área', tipo: 'texto', paso: 5, validacion: validarEspecifiqueArea, condicional: true },
    { campo: 'especifiqueConsecuencia', nombre: 'Especifique consecuencia', tipo: 'texto', paso: 5, validacion: validarEspecifiqueConsecuencia, condicional: true },
    { campo: 'especifiqueDestino', nombre: 'Especifique destino', tipo: 'texto', paso: 6, validacion: validarEspecifiqueDestino, condicional: true },
    { campo: 'folioCertificadoDefuncion', nombre: 'Folio certificado de defunción', tipo: 'texto', paso: 6, validacion: validarFolioCertificadoDefuncion, condicional: true },
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

// Exportar para validación de formato hora en FormStepper (lesion)
export function validarFormatoHoraHHMM(valor: any): boolean {
  return validarHoraHHMM(valor);
}

/** Valida que hora de atención sea posterior a hora del evento cuando son el mismo día. No bloquea si alguna es 99:99 o vacía. */
export function validarHoraAtencionPosteriorEvento(datosFormulario: any): {
  valido: boolean;
  mensaje?: string;
} {
  const msg =
    'La hora de atención debe ser posterior a la hora del evento cuando ocurren el mismo día';
  if (!datosFormulario) return { valido: true };

  const fe = datosFormulario.fechaEvento;
  const fa = datosFormulario.fechaAtencion;
  if (!fe || !fa) return { valido: true };

  const d1 = new Date(fe).toDateString();
  const d2 = new Date(fa).toDateString();
  if (d1 !== d2) return { valido: true };

  const he = String(datosFormulario.horaEvento ?? '').trim();
  const ha = String(datosFormulario.horaAtencion ?? '').trim();
  if (!he || he === '99:99') return { valido: true };
  if (!ha || ha === '99:99') return { valido: true };

  if (!HORA_HHMM_REGEX.test(he) || !HORA_HHMM_REGEX.test(ha)) return { valido: true };

  const [h1, m1] = he.split(':').map(Number);
  const [h2, m2] = ha.split(':').map(Number);
  const minutosEvento = h1 * 60 + m1;
  const minutosAtencion = h2 * 60 + m2;

  if (minutosAtencion <= minutosEvento) return { valido: false, mensaje: msg };
  return { valido: true };
}

// Validación tiempo traslado (00:01-48:00 o 99:99) cuando atencionPreHospitalaria === 1
export function validarFormatoTiempoTrasladoUH(valor: any, datosLesion: any): boolean {
  return validarTiempoTrasladoUH(valor, datosLesion);
}

/** CIE-10: código debe tener exactamente 4 caracteres (sin punto). Ej: S00.0→S000, F41.9→F419 */
function hasCIE10Exact4Chars(code: string | null | undefined): boolean {
  if (!code || typeof code !== 'string') return false;
  const c = extractCode(code).trim().toUpperCase();
  if (!c || !/^[A-Z][0-9]/.test(c)) return false;
  const withoutDot = c.replace(/\./g, '');
  return withoutDot.length === 4;
}

/** Valida todas las reglas de lesion interceptables antes del submit. Retorna primer error encontrado. */
export function validarLesionPreSubmit(
  datosFormulario: any,
  trabajador?: { fechaNacimiento?: string | Date } | null
): { valido: boolean; mensaje?: string; paso?: number } {
  if (!datosFormulario) return { valido: true };

  const df = datosFormulario;
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  // 1. Fechas: atención >= evento, atención <= hoy
  const fe = df.fechaEvento ? new Date(df.fechaEvento) : null;
  const fa = df.fechaAtencion ? new Date(df.fechaAtencion) : null;
  if (fe && fa) {
    if (fa < fe) {
      return { valido: false, mensaje: 'La fecha de atención no puede ser anterior a la fecha del evento', paso: 4 };
    }
    if (fa > hoy) {
      return { valido: false, mensaje: 'La fecha de atención no puede ser futura', paso: 4 };
    }
  }

  // 2. Si trabajador tiene fechaNacimiento: evento >= nacimiento, edad < 100
  const fn = trabajador?.fechaNacimiento ? new Date(trabajador.fechaNacimiento) : null;
  if (fn && fe) {
    if (fe < fn) {
      return { valido: false, mensaje: 'La fecha del evento no puede ser anterior a la fecha de nacimiento', paso: 1 };
    }
    const edad = hoy.getFullYear() - fn.getFullYear();
    if (edad >= 100) {
      return { valido: false, mensaje: 'La edad calculada debe ser menor a 100 años', paso: 1 };
    }
  }

  // 3. Campos numéricos: sitio >= 0, área >= 1, consecuencia >= 1
  if (df.sitioOcurrencia !== undefined && df.sitioOcurrencia !== null && df.sitioOcurrencia !== '') {
    const v = Number(df.sitioOcurrencia);
    if (!Number.isInteger(v) || v < 0) {
      return { valido: false, mensaje: 'Sitio de ocurrencia debe ser un número entero mayor o igual a 0', paso: 2 };
    }
  }
  if (df.areaAnatomica !== undefined && df.areaAnatomica !== null && df.areaAnatomica !== '') {
    const v = Number(df.areaAnatomica);
    if (!Number.isInteger(v) || v < 1) {
      return { valido: false, mensaje: 'Área anatómica debe ser un número entero mayor o igual a 1', paso: 5 };
    }
  }
  if (df.consecuenciaGravedad !== undefined && df.consecuenciaGravedad !== null && df.consecuenciaGravedad !== '') {
    const v = Number(df.consecuenciaGravedad);
    if (!Number.isInteger(v) || v < 1) {
      return { valido: false, mensaje: 'Consecuencia/gravedad debe ser un número entero mayor o igual a 1', paso: 5 };
    }
  }

  // 4. Condicionales: agente (int 1/4), tipoViolencia (int 2/3), tipoAtencion
  const int = df.intencionalidad;
  if (int === 1 || int === 4) {
    if (!df.agenteLesion && df.agenteLesion !== 0) {
      return { valido: false, mensaje: 'Agente de lesión es obligatorio para eventos accidentales o autoinfligidos', paso: 3 };
    }
    const av = Number(df.agenteLesion);
    if (!Number.isInteger(av) || av < 1) {
      return { valido: false, mensaje: 'Agente de lesión debe ser un número entero mayor o igual a 1', paso: 3 };
    }
  }
  if (int === 2 || int === 3) {
    const tv = df.tipoViolencia;
    if (!Array.isArray(tv) || tv.length === 0) {
      return { valido: false, mensaje: 'Tipo de violencia es obligatorio para eventos de violencia', paso: 3 };
    }
    const invalid = tv.some((t: any) => !Number.isInteger(Number(t)) || Number(t) < 1);
    if (invalid) {
      return { valido: false, mensaje: 'Cada tipo de violencia debe ser un número entero mayor o igual a 1', paso: 3 };
    }
  }
  if (df.tipoAtencion && Array.isArray(df.tipoAtencion) && df.tipoAtencion.length > 0) {
    const invalid = df.tipoAtencion.some((t: any) => !Number.isInteger(Number(t)) || Number(t) < 1);
    if (invalid) {
      return { valido: false, mensaje: 'Cada tipo de atención debe ser un número entero mayor o igual a 1', paso: 4 };
    }
  }

  // 5. CIE-10: formato y exactamente 4 caracteres (sin punto). Ej: S00.0→S000, F41.9→F419
  const CIE_CAUSA_REGEX = /^[V-Y][0-9]{2,3}(\.[0-9]{1,2})?$/i;
  if (df.codigoCIEAfeccionPrincipal) {
    if (!hasCIE10Exact4Chars(df.codigoCIEAfeccionPrincipal)) {
      return { valido: false, mensaje: 'Código CIE-10 afección principal debe tener exactamente 4 caracteres (ej. S000, F419)', paso: 5 };
    }
  }
  if (df.codigoCIECausaExterna) {
    const code = extractCode(df.codigoCIECausaExterna).trim();
    if (code && !CIE_CAUSA_REGEX.test(code)) {
      return { valido: false, mensaje: 'Código CIE-10 causa externa debe ser del Capítulo XX (V01-Y98)', paso: 5 };
    }
    if (code && !hasCIE10Exact4Chars(code)) {
      return { valido: false, mensaje: 'Código CIE-10 causa externa debe tener exactamente 4 caracteres', paso: 5 };
    }
  }
  if (df.afeccionPrincipalReseleccionada) {
    const code = (typeof df.afeccionPrincipalReseleccionada === 'string' ? df.afeccionPrincipalReseleccionada : '').trim();
    if (code && !hasCIE10Exact4Chars(code)) {
      return { valido: false, mensaje: 'Código CIE-10 afección reseleccionada debe tener exactamente 4 caracteres', paso: 5 };
    }
  }
  if (df.afeccionesTratadas && Array.isArray(df.afeccionesTratadas)) {
    for (let i = 0; i < df.afeccionesTratadas.length; i++) {
      const item = df.afeccionesTratadas[i];
      if (typeof item !== 'string' || !item) continue;
      const parts = item.split('#');
      const cieCode = parts.length >= 3 ? parts[2]?.trim() : undefined;
      if (cieCode && !hasCIE10Exact4Chars(cieCode)) {
        return { valido: false, mensaje: `Código CIE en afección tratada ${i + 1} debe tener exactamente 4 caracteres`, paso: 5 };
      }
    }
  }

  return { valido: true };
}

/** Calcula edad en años entre fecha nacimiento y fecha referencia. */
function calcularEdad(fechaNacimiento: Date, fechaReferencia: Date): number {
  if (isNaN(fechaNacimiento.getTime()) || isNaN(fechaReferencia.getTime())) return 0;
  let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
  const monthDiff = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
  const dayDiff = fechaReferencia.getDate() - fechaNacimiento.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) edad--;
  return Math.max(0, edad);
}

/** Valida reglas pre-submit de nota médica (CEX NOM-024). Fechas, edad, sistólica/diastólica. */
export function validarNotaMedicaPreSubmit(
  datosFormulario: any,
  trabajador?: { fechaNacimiento?: string | Date } | null
): { valido: boolean; mensaje?: string; paso?: number } {
  if (!datosFormulario) return { valido: true };

  const df = datosFormulario;
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  const fechaNotaMedica = df.fechaNotaMedica ? new Date(df.fechaNotaMedica) : null;
  const fn = trabajador?.fechaNacimiento ? new Date(trabajador.fechaNacimiento) : null;

  // 1. fechaNotaMedica no puede ser anterior a fechaNacimiento
  if (fn && fechaNotaMedica && fechaNotaMedica < fn) {
    return {
      valido: false,
      mensaje: 'La fecha de consulta no puede ser anterior a la fecha de nacimiento del paciente',
      paso: 1,
    };
  }

  // 2. Edad <= 120 años (CEX)
  if (fn && fechaNotaMedica) {
    const edad = calcularEdad(fn, fechaNotaMedica);
    if (edad > 120) {
      return {
        valido: false,
        mensaje: 'La edad del paciente no debe ser mayor a 120 años',
        paso: 1,
      };
    }
  }

  // 3. fechaNotaMedica no puede ser futura
  if (fechaNotaMedica && fechaNotaMedica > hoy) {
    return {
      valido: false,
      mensaje: 'La fecha de consulta no puede ser posterior al día de hoy',
      paso: 1,
    };
  }

  // 4. sistolica >= diastolica cuando ambas > 0
  const sistolica = Number(df.tensionArterialSistolica);
  const diastolica = Number(df.tensionArterialDiastolica);
  if (sistolica > 0 && diastolica > 0 && sistolica < diastolica) {
    return {
      valido: false,
      mensaje: 'La presión sistólica debe ser mayor o igual a la diastólica',
      paso: 5,
    };
  }

  return { valido: true };
}

/** Valida que todos los códigos CIE-10 de nota médica tengan exactamente 4 caracteres (sin punto). */
export function validarNotaMedicaCIEExact4Chars(datosFormulario: any): { valido: boolean; mensaje?: string; paso?: number } {
  if (!datosFormulario) return { valido: true };

  const campos: Array<{ valor: any; nombre: string; paso: number }> = [
    { valor: datosFormulario.codigoCIE10Principal, nombre: 'Diagnóstico principal', paso: 6 },
    { valor: datosFormulario.codigoCIEDiagnostico2, nombre: 'Diagnóstico 2', paso: 6 },
    { valor: datosFormulario.codigoCIECausaExterna, nombre: 'Causa externa', paso: 6 },
  ];

  for (const { valor, nombre, paso } of campos) {
    if (!valor) continue;
    const code = typeof valor === 'string' ? extractCode(valor) : extractCode(String(valor));
    if (code && code.trim() && !hasCIE10Exact4Chars(code)) {
      return { valido: false, mensaje: `${nombre}: el código CIE-10 debe tener exactamente 4 caracteres`, paso };
    }
  }

  const comp = datosFormulario.codigosCIE10Complementarios;
  if (Array.isArray(comp)) {
    for (let i = 0; i < comp.length; i++) {
      const c = comp[i];
      if (!c) continue;
      const code = typeof c === 'string' ? extractCode(c) : extractCode(String(c));
      if (code && code.trim() && !hasCIE10Exact4Chars(code)) {
        return { valido: false, mensaje: `Código CIE complementario ${i + 1} debe tener exactamente 4 caracteres`, paso: 6 };
      }
    }
  }

  return { valido: true };
}

