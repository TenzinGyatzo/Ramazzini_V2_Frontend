// helpers/dashboardRiesgosProcessor.ts

// NATURALEZA LESIÓN - Contar por Sexo
export function contarPorNaturalezaLesion(
  data: { naturalezaLesion?: string, sexoTrabajador?: string }[]
): [string, number, number, number][] {
  const conteo: Record<string, { Masculino: number; Femenino: number }> = {};

  data.forEach((riesgo) => {
    if (typeof riesgo.naturalezaLesion === "string" && riesgo.naturalezaLesion.trim()) {
      const tipo = riesgo.naturalezaLesion.trim();
      const sexo = riesgo.sexoTrabajador === "Femenino" ? "Femenino" : "Masculino"; // Por defecto masculino

      if (!conteo[tipo]) {
        conteo[tipo] = { Masculino: 0, Femenino: 0 };
      }

      conteo[tipo][sexo]++;
    }
  });

  // Convertimos a array y calculamos el total general
  return Object.entries(conteo)
    .map(([etiqueta, { Masculino, Femenino }]): [string, number, number, number] => {
      const total = Masculino + Femenino;
      return [etiqueta, Masculino, Femenino, total];
    })
    .sort((a, b) => b[3] - a[3]); // Ordenamos por total de casos, de mayor a menor
}

// PARTE DE CUERPO AFECTADA
export function contarPorParteCuerpo(data: { parteCuerpoAfectada?: string, sexoTrabajador?: string }[]): [string, number, number][] {
  const conteo: Record<string, { hombres: number; mujeres: number }> = {};

  data.forEach((riesgo) => {
    if (riesgo.parteCuerpoAfectada) {
      const parte = riesgo.parteCuerpoAfectada;
      const esHombre = riesgo.sexoTrabajador === "Masculino";

      if (!conteo[parte]) {
        conteo[parte] = { hombres: 0, mujeres: 0 };
      }

      if (esHombre) {
        conteo[parte].hombres += 1;
      } else {
        conteo[parte].mujeres += 1;
      }
    }
  });

  return Object.entries(conteo).map(([parte, { hombres, mujeres }]) => [parte, hombres, mujeres]);
}

// TIPO DE RIESGO
export const tiposRiesgo = ['Accidente de Trabajo', 'Accidente de Trayecto', 'Enfermedad de Trabajo'];

// Mapa de etiquetas personalizadas para los tipos de riesgo
export const etiquetasTiposRiesgo = {
  'Accidente de Trabajo': 'Trabajo',
  'Accidente de Trayecto': 'Trayecto',
  'Enfermedad de Trabajo': 'Enfermedad',
};

// TIPO DE RIESGO 
export function contarPorTipoRiesgo(data: { tipoRiesgo?: string, sexoTrabajador?: string }[]): Record<string, { hombres: number, mujeres: number }> {
  const conteo: Record<string, { hombres: number, mujeres: number }> = {
    'Accidente de Trabajo': { hombres: 0, mujeres: 0 },
    'Accidente de Trayecto': { hombres: 0, mujeres: 0 },
    'Enfermedad de Trabajo': { hombres: 0, mujeres: 0 },
  };

  data.forEach((riesgo) => {
    if (riesgo.tipoRiesgo && tiposRiesgo.includes(riesgo.tipoRiesgo)) {
      const esHombre = riesgo.sexoTrabajador === "Masculino";
      const genero = esHombre ? "hombres" : "mujeres";
      conteo[riesgo.tipoRiesgo][genero]++;
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
export function contarPorPuestosTrabajo(data: { puestoTrabajador?: string, sexoTrabajador?: string }[]): [string, number, number][] {
  const conteo: Record<string, { hombres: number; mujeres: number }> = {};

  data.forEach((riesgo) => {
    if (riesgo.puestoTrabajador) {
      const puesto = riesgo.puestoTrabajador;
      const esHombre = riesgo.sexoTrabajador === "Masculino";

      if (!conteo[puesto]) {
        conteo[puesto] = { hombres: 0, mujeres: 0 };
      }

      if (esHombre) {
        conteo[puesto].hombres += 1;
      } else {
        conteo[puesto].mujeres += 1;
      }
    }
  });

  return Object.entries(conteo).map(([puesto, { hombres, mujeres }]) => [puesto, hombres, mujeres]);
}

// DÍAS DE INCAPACIDAD
export function calcularTotalDiasIncapacidad(data: { diasIncapacidad?: number }[]): number {
  return data.reduce((total, riesgo) => {
    return total + (riesgo.diasIncapacidad || 0);
  }, 0);
}

// DISTRIBUCIÓN DE DÍAS DE INCAPACIDAD
export const rangosDiasIncapacidad = ['0–10', '11–30', '31–60', '61–90', '91–120', '121–150', '> 150'];

// DISTRIBUCIÓN DE DÍAS DE INCAPACIDAD
export function contarPorRangoDiasIncapacidad(data: { diasIncapacidad?: number, sexoTrabajador?: string }[]): Record<string, { hombres: number, mujeres: number }> {
  const conteo: Record<string, { hombres: number, mujeres: number }> = {
    '0–10': { hombres: 0, mujeres: 0 },
    '11–30': { hombres: 0, mujeres: 0 },
    '31–60': { hombres: 0, mujeres: 0 },
    '61–90': { hombres: 0, mujeres: 0 },
    '91–120': { hombres: 0, mujeres: 0 },
    '121–150': { hombres: 0, mujeres: 0 },
    '> 150': { hombres: 0, mujeres: 0 },
  };

  data.forEach((riesgo) => {
    const dias = riesgo.diasIncapacidad || 0;
    const esHombre = riesgo.sexoTrabajador === "Masculino";
    const genero = esHombre ? "hombres" : "mujeres";

    if (dias <= 10) conteo['0–10'][genero]++;
    else if (dias <= 30) conteo['11–30'][genero]++;
    else if (dias <= 60) conteo['31–60'][genero]++;
    else if (dias <= 90) conteo['61–90'][genero]++;
    else if (dias <= 120) conteo['91–120'][genero]++;
    else if (dias <= 150) conteo['121–150'][genero]++;
    else conteo['> 150'][genero]++;
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
