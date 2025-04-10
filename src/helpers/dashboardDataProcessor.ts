import { calcularEdad } from "./dates";

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
  