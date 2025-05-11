// helpers/dashboardRiesgosProcessor.ts

// NATURALEZA LESIÓN
export function contarPorNaturalezaLesion(
  data: { naturalezaLesion?: string }[]
): [string, number, number][] {
  const conteo: Record<string, number> = {};
  let total = 0;

  data.forEach((riesgo) => {
    if (riesgo.naturalezaLesion) {
      const tipo = riesgo.naturalezaLesion.trim();
      conteo[tipo] = (conteo[tipo] || 0) + 1;
      total++;
    }
  });

  // Convertimos a array y calculamos porcentajes
  return Object.entries(conteo).map(([etiqueta, cantidad]): [string, number, number] => {
    const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
    return [etiqueta, cantidad, porcentaje];
  }).sort((a, b) => b[1] - a[1]); // Ordenamos de mayor a menor
}

// PARTE DE CUERPO AFECTADA
export function contarPorParteCuerpo(data: { parteCuerpoAfectada?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {};

  data.forEach((riesgo) => {
    if (riesgo.parteCuerpoAfectada) {
      conteo[riesgo.parteCuerpoAfectada] = (conteo[riesgo.parteCuerpoAfectada] || 0) + 1;
    }
  });

  return conteo;
}

// TIPO DE RIESGO
export const tiposRiesgo = ['Accidente de Trabajo', 'Accidente de Trayecto', 'Enfermedad de Trabajo'];

export function contarPorTipoRiesgo(data: { tipoRiesgo?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {
    'Accidente de Trabajo': 0,
    'Accidente de Trayecto': 0,
    'Enfermedad de Trabajo': 0,
  };

  data.forEach((riesgo) => {
    if (riesgo.tipoRiesgo && tiposRiesgo.includes(riesgo.tipoRiesgo)) {
      conteo[riesgo.tipoRiesgo]++;
    }
  });

  return conteo;
}

// ESTADO ALTA
export const estadosAlta = ['Incapacidad Activa', 'Alta ST2', 'Alta Interna'];

export function contarPorEstadoAlta(data: { alta?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {
    'Incapacidad Activa': 0,
    'Alta ST2': 0,
    'Alta Interna': 0,
  };

  data.forEach((riesgo) => {
    if (riesgo.alta && estadosAlta.includes(riesgo.alta)) {
      conteo[riesgo.alta]++;
    }
  });

  return conteo;
}

// PUESTOS DE TRABAJO
export function contarPorPuesto(data: { puestoTrabajador?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {};

  data.forEach((riesgo) => {
    if (riesgo.puestoTrabajador) {
      conteo[riesgo.puestoTrabajador] = (conteo[riesgo.puestoTrabajador] || 0) + 1;
    }
  });

  return conteo;
}

// DÍAS DE INCAPACIDAD
export function calcularTotalDiasIncapacidad(data: { diasIncapacidad?: number }[]): number {
  return data.reduce((total, riesgo) => {
    return total + (riesgo.diasIncapacidad || 0);
  }, 0);
}

// DISTRIBUCIÓN DE DÍAS DE INCAPACIDAD
export const rangosDiasIncapacidad = ['0–10', '11–30', '31–60', '61–90', '91–120', '121–150', '> 150'];

export function contarPorRangoDiasIncapacidad(data: { diasIncapacidad?: number }[]): Record<string, number> {
  const conteo: Record<string, number> = {
    '0–10': 0,
    '11–30': 0,
    '31–60': 0,
    '61–90': 0,
    '91–120': 0,
    '121–150': 0,
    '> 150': 0,
  };

  data.forEach((riesgo) => {
    const dias = riesgo.diasIncapacidad || 0;
    if (dias <= 10) conteo['0–10']++;
    else if (dias <= 30) conteo['11–30']++;
    else if (dias <= 60) conteo['31–60']++;
    else if (dias <= 90) conteo['61–90']++;
    else if (dias <= 120) conteo['91–120']++;
    else if (dias <= 150) conteo['121–150']++;
    else conteo['> 150']++;
  });

  return conteo;
}

// CASOS IPP
export function contarCasosIPP(data: { secuelas?: string }[]): number {
  return data.filter((riesgo) => riesgo.secuelas === 'Si').length;
}

// MANEJO
export const opcionesManejo = ['IMSS', 'Interno'];

export function contarPorManejo(data: { manejo?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {
    'IMSS': 0,
    'Interno': 0,
  };

  data.forEach((riesgo) => {
    if (riesgo.manejo && opcionesManejo.includes(riesgo.manejo)) {
      conteo[riesgo.manejo]++;
    }
  });

  return conteo;
}

// RECAÍDAS
export function contarRecaidas(data: { recaida?: string }[]): Record<string, number> {
  const conteo: Record<string, number> = {
    'Si': 0,
    'No': 0,
  };

  data.forEach((riesgo) => {
    if (riesgo.recaida === 'Si') conteo['Si']++;
    else conteo['No']++;
  });

  return conteo;
}
