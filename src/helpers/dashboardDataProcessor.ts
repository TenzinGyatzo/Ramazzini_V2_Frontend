import { calcularEdad } from "./dates";
import { parseISO, isAfter, subDays } from 'date-fns';

// GRUPOS ETARIOS
const gruposEtarios = [
    { rango: '16–20', min: 16, max: 20 },
    { rango: '21–25', min: 21, max: 25 },
    { rango: '26–30', min: 26, max: 30 },
    { rango: '31–35', min: 31, max: 35 },
    { rango: '36–40', min: 36, max: 40 },
    { rango: '41–45', min: 41, max: 45 },
    { rango: '46–50', min: 46, max: 50 },
    { rango: '51–55', min: 51, max: 55 },
    { rango: '56–60', min: 56, max: 60 },
    { rango: '61–65', min: 61, max: 65 },
    { rango: '66–70', min: 66, max: 70 },
  ];
  
  export function obtenerGrupoEtario(edad: number): string | null {
    const grupo = gruposEtarios.find(({ min, max }) => edad >= min && edad <= max);
    return grupo ? grupo.rango : null;
  }
  

  export function clasificarPorEdadYSexo(
    data: { sexo: string, fechaNacimiento: string }[][]
  ): Record<string, { Masculino: number, Femenino: number }> {
    const resultado: Record<string, { Masculino: number, Femenino: number }> = {};
  
    data.flat().forEach(({ sexo, fechaNacimiento }) => {
      const edad = calcularEdad(fechaNacimiento);
      const grupo = obtenerGrupoEtario(edad);
  
      if (!grupo) return;
  
      if (!resultado[grupo]) {
        resultado[grupo] = { Masculino: 0, Femenino: 0 };
      }
  
      if (sexo === 'Masculino') resultado[grupo].Masculino++;
      else if (sexo === 'Femenino') resultado[grupo].Femenino++;
    });
  
    return resultado;
  }
  
  export function ordenarPorGrupoEtario(
    resultado: Record<string, { Masculino: number, Femenino: number }>
  ): [string, { Masculino: number, Femenino: number }][] {
    return Object.entries(resultado).sort(
      ([grupoA], [grupoB]) => parseInt(grupoA.split('–')[0]) - parseInt(grupoB.split('–')[0])
    );
  }
  
// INDICE DE MASA CORPORAL
export const categoriasIMCOrdenadas = [
  'Bajo peso',
  'Normal',
  'Sobrepeso',
  'Obesidad clase I',
  'Obesidad clase II',
  'Obesidad clase III'
];

export function contarPorCategoriaIMC(data: { categoriaIMC: string | null }[]): [string, number][] {
  const conteo: Record<string, number> = {};

  for (const item of data) {
    if (item.categoriaIMC && categoriasIMCOrdenadas.includes(item.categoriaIMC)) {
      conteo[item.categoriaIMC] = (conteo[item.categoriaIMC] || 0) + 1;
    }
  }

  return categoriasIMCOrdenadas.map((categoria) => [categoria, conteo[categoria] || 0]);
}

export function contarPorCategoriaIMCConPorcentaje(
  data: { categoriaIMC: string | null }[]
): [string, number, number][] {
  const conteo: Record<string, number> = {};
  let total = 0;

  for (const item of data) {
    if (item.categoriaIMC && categoriasIMCOrdenadas.includes(item.categoriaIMC)) {
      conteo[item.categoriaIMC] = (conteo[item.categoriaIMC] || 0) + 1;
      total++;
    }
  }

  return categoriasIMCOrdenadas.map((categoria) => {
    const cantidad = conteo[categoria] || 0;
    const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
    return [categoria, cantidad, porcentaje];
  });
}


// ANTECEDENTES RELACIONADOS CON ENFERMEDADES CRÓNICAS
export const etiquetasEnfermedades: Record<string, string> = {
  diabeticosPP: 'Diabéticos',
  hipertensivosPP: 'Hipertensivos',
  cardiopaticosPP: 'Cardiopáticos',
  epilepticosPP: 'Epilépticos',
  alergicos: 'Alérgicos'
};

export const camposEnfermedadesOrdenadas = [
  'diabeticosPP',
  'hipertensivosPP',
  'cardiopaticosPP',
  'epilepticosPP',
  'alergicos'
];

export function contarEnfermedadesCronicas(data: any[]): [string, number, number][] {
  const total = data.length;
  const conteo: Record<string, number> = {};

  for (const campo of [
    'diabeticosPP',
    'hipertensivosPP',
    'cardiopaticosPP',
    'epilepticosPP',
    'alergicos'
  ]) {
    conteo[campo] = data.filter((d) => d[campo] === 'Si').length;
  }

  return Object.entries(conteo).map(([campo, cantidad]) => [
    campo,
    cantidad,
    total > 0 ? Math.round((cantidad / total) * 100) : 0
  ]);
}


// ANTECEDENTES DE PROBLEMAS LOCALIZADOS
export const etiquetasAntecedentesReferidos: Record<string, string> = {
  lumbalgias: 'Lumbalgias',
  accidentes: 'Accidentes',
  quirurgicos: 'Cirugías',
  traumaticos: 'Traumatismos'
};


export const camposAntecedentesReferidos = [
  'lumbalgias',
  'accidentes',
  'quirurgicos',
  'traumaticos'
];

export function contarAntecedentesReferidos(data: any[]): [string, number, number][] {
  const total = data.length;
  const campos = ['lumbalgias', 'accidentes', 'quirurgicos', 'traumaticos'];
  const conteo: Record<string, number> = {};

  for (const campo of campos) {
    conteo[campo] = data.filter((d) => d[campo] === 'Si').length;
  }

  return campos.map((campo) => [
    campo,
    conteo[campo] || 0,
    total > 0 ? Math.round((conteo[campo] / total) * 100) : 0
  ]);
}

// AGUDEZA VISUAL
export const etiquetasVisionSinCorreccion: Record<string, string> = {
  'Visión excepcional': 'Excepcional',
  'Visión normal': 'Normal',
  'Visión ligeramente reducida': 'Ligeramente reducida',
  'Visión moderadamente reducida': 'Moderadamente red.',
  'Visión significativamente reducida': 'Significativamente red.',
  'Visión muy reducida': 'Muy reducida'
};

export function calcularRequierenLentes(examenes: any[]): { requieren: number; noRequieren: number } {
  let requieren = 0;
  let noRequieren = 0;

  /* for (const examen of examenes) {
    const interpretacion = examen.sinCorreccionLejanaInterpretacion?.trim();

    if (interpretacion === 'Visión normal' || interpretacion === 'Visión excepcional') {
      noRequieren++;
    } else {
      requieren++;
    }
  } */

  for (const examen of examenes) {
    const requiere = examen.requiereLentesUsoGeneral?.trim();

    if (requiere === 'No') {
      noRequieren++;
    } else if (requiere === 'Si') {
      requieren++;
    }
  }

  return { requieren, noRequieren };
}

export const categoriasVisionOrdenadas = [
  'Visión excepcional',
  'Visión normal',
  'Visión ligeramente reducida',
  'Visión moderadamente reducida',
  'Visión significativamente reducida',
  'Visión muy reducida'
];

export function contarVisionSinCorreccion(examenes: any[]): [string, number, number][] {
  const total = examenes.length;
  const conteo: Record<string, number> = {};

  for (const examen of examenes) {
    const categoria = examen.sinCorreccionLejanaInterpretacion?.trim();
    if (categoria && categoriasVisionOrdenadas.includes(categoria)) {
      conteo[categoria] = (conteo[categoria] || 0) + 1;
    }
  }

  return categoriasVisionOrdenadas.map((categoria) => {
    const cantidad = conteo[categoria] || 0;
    const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
    return [categoria, cantidad, porcentaje];
  });
}

export function calcularVistaCorregida(examenes: any[]) {
  const { requieren } = calcularRequierenLentes(examenes);

  let usan = 0;

  for (const examen of examenes) {
    const interpretacion = examen.sinCorreccionLejanaInterpretacion?.trim();

    const requiereLentes = interpretacion !== 'Visión normal' && interpretacion !== 'Visión excepcional';

    if (requiereLentes) {
      const usaIzquierdo = Number(examen.ojoIzquierdoLejanaConCorreccion) > 0;
      const usaDerecho = Number(examen.ojoDerechoLejanaConCorreccion) > 0;

      if (usaIzquierdo || usaDerecho) {
        usan++;
      }
    }
  }

  const porcentaje = requieren > 0 ? Math.round((usan / requieren) * 100) : 0;

  return {
    usan,
    requieren,
    porcentaje,
    chart: {
      labels: ['Usan lentes', 'No usan lentes'],
      datasets: [
        {
          data: [usan, requieren - usan],
          backgroundColor: ['#10b981', '#D1D5DB'] // Esmeralda #059669 + gris claro 
        }
      ]
    }
  };
}

export function calcularDaltonismo(examenes: any[]) {
  let conDaltonismo = 0;
  let sinDaltonismo = 0;

  for (const examen of examenes) {
    const interpretacion = examen.interpretacionIshihara?.trim();

    if (interpretacion && interpretacion !== 'Normal') {
      conDaltonismo++;
    } else {
      sinDaltonismo++;
    }
  }

  const total = conDaltonismo + sinDaltonismo;
  const porcentaje = total > 0 ? Math.round((conDaltonismo / total) * 100) : 0;

  return {
    conDaltonismo,
    porcentaje,
    chart: {
      labels: ['Daltónicos', 'Sin daltonismo'],
      datasets: [
        {
          data: [conDaltonismo, sinDaltonismo],
          backgroundColor: ['#F97316', '#D1D5DB'] // Naranja cálido + gris claro
        }
      ]
    }
  };
}

// APTITUD AL PUESTO
export const etiquetasAptitudPuesto: Record<string, string> = {
  'Apto Sin Restricciones': 'Sin restricciones',
  'Apto Con Precaución': 'Con precaución',
  'Apto Con Restricciones': 'Con restricciones',
  'No Apto': 'No apto',
  'Evaluación No Completada': 'No completada'
};

export const etiquetasAptitudPuestoTabla: Record<string, string> = {
  'Apto Sin Restricciones': 'Apto sin restricciones',
  'Apto Con Precaución': 'Apto con precaución',
  'Apto Con Restricciones': 'Apto con restricciones',
  'No Apto': 'No apto',
  'Evaluación No Completada': 'No completada'
};

export const categoriasAptitud = [
  "Apto Sin Restricciones",
  "Apto Con Precaución",
  "Apto Con Restricciones",
  "No Apto",
  "Evaluación No Completada"
];

export function contarPorAptitudPuesto(data: { aptitudPuesto: string | null }[]): [string, number, number][] {
  const total = data.length;
  const conteo: Record<string, number> = {};

  for (const item of data) {
    if (item.aptitudPuesto && categoriasAptitud.includes(item.aptitudPuesto)) {
      conteo[item.aptitudPuesto] = (conteo[item.aptitudPuesto] || 0) + 1;
    }
  }

  return categoriasAptitud.map((categoria) => {
    const cantidad = conteo[categoria] || 0;
    const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
    return [categoria, cantidad, porcentaje];
  });
}

// CIRCUNFERENCIA CINTURA
export function calcularCircunferenciaCintura(data: any[]) {
  let alto = 0;
  let aumentado = 0;
  let bajo = 0;

  for (const item of data) {
    const categoria = item.categoriaCircunferenciaCintura?.trim();
    if (categoria === 'Alto Riesgo') alto++;
    else if (categoria === 'Riesgo Aumentado') aumentado++;
    else if (categoria === 'Bajo Riesgo') bajo++;
  }

  const total = alto + aumentado + bajo;
  const porcentaje = total > 0 ? Math.round((alto / total) * 100) : 0;

  return {
    alto,
    porcentaje,
    chart: {
      labels: ['Alto Riesgo', 'Riesgo Aumentado', 'Bajo Riesgo'],
      datasets: [
        {
          data: [alto, aumentado, bajo],
          // backgroundColor: ['#F97316', '#FBBF24', '#D1D5DB'] // Naranja cálido, amarillo cálido y gris claro
          backgroundColor: ['#e11d48', '#F97316', '#D1D5DB'] // Rojo, naranja cálido y gris claro
        }
      ]
    }
  };
}

// CONSULTAS
export function contarConsultasUltimos30Dias(fechas: string[]): number {
  const hoy = new Date();
  const hace30Dias = subDays(hoy, 30);

  return fechas.filter((fecha) => {
    const parsed = parseISO(fecha);
    return isAfter(parsed, hace30Dias);
  }).length;
}

// EXPOSICIÓN A AGENTES DE RIESGO
export const etiquetasAgentesRiesgo: Record<string, string> = {
  'Ergonómicos': 'Ergonómicos',
  'Ruido': 'Ruido',
  'Polvos': 'Polvos',
  'Químicos': 'Químicos',
  'Psicosociales': 'Psicosociales',
  'Temperaturas elevadas': 'Temp. elevadas',
  'Temperaturas abatidas': 'Temp. abatidas',
  'Vibraciones': 'Vibraciones',
  'Biológicos Infecciosos': 'Biológicos'
};

export function contarAgentesRiesgo(data: { agentesRiesgoActuales?: string[] }[]): [string, number, number][] {
  const totalTrabajadores = data.length;
  const conteo: Record<string, number> = {};

  for (const trabajador of data) {
    const agentes = trabajador.agentesRiesgoActuales || [];
    for (const agente of agentes) {
      conteo[agente] = (conteo[agente] || 0) + 1;
    }
  }

  return Object.keys(etiquetasAgentesRiesgo).map((agente) => {
    const cantidad = conteo[agente] || 0;
    const porcentaje = totalTrabajadores > 0 ? Math.round((cantidad / totalTrabajadores) * 100) : 0;
    return [agente, cantidad, porcentaje];
  });
}





