// Función para formatear el nombre completo del trabajador
export const formatNombreCompleto = (trabajador: any): string => {
  if (!trabajador) return '';
  
  const partes: string[] = [];
  if (trabajador.primerApellido) partes.push(trabajador.primerApellido);
  if (trabajador.segundoApellido) partes.push(trabajador.segundoApellido);
  if (trabajador.nombre) partes.push(trabajador.nombre);
  
  return partes.join(' ');
};
