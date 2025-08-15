// Función para formatear el nombre completo del trabajador
export const formatNombreCompleto = (trabajador: any): string => {
  if (!trabajador) return '';
  
  const partes: string[] = [];
  if (trabajador.primerApellido) partes.push(trabajador.primerApellido);
  if (trabajador.segundoApellido) partes.push(trabajador.segundoApellido);
  if (trabajador.nombre) partes.push(trabajador.nombre);
  
  return partes.join(' ');
};

// Función específica para formatear el nombre del trabajador en riesgos de trabajo
export const formatNombreCompletoRiesgo = (riesgo: any): string => {
  if (!riesgo) return '';

  // Construir el nombre completo con los campos individuales
  const partes: string[] = [];
  if (riesgo.primerApellidoTrabajador) partes.push(riesgo.primerApellidoTrabajador);
  if (riesgo.segundoApellidoTrabajador) partes.push(riesgo.segundoApellidoTrabajador);
  if (riesgo.nombreTrabajador) partes.push(riesgo.nombreTrabajador);
  
  const resultado = partes.join(' ');
  console.log('🔍 Resultado de formatNombreCompletoRiesgo:', resultado);
  return resultado;
};
