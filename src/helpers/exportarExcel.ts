import * as xlsx from 'xlsx';

export function exportarTrabajadoresDesdeFrontend(trabajadoresFiltrados: any[], nombreArchivo = 'trabajadores.xlsx') {
  const trabajadoresData = trabajadoresFiltrados.map(trabajador => ({
    Nombre: trabajador.nombre,
    Edad: trabajador.edad,
    Sexo: trabajador.sexo,
    Escolaridad: trabajador.escolaridad,
    Puesto: trabajador.puesto,
    Antigüedad: trabajador.antiguedad,
    Teléfono: trabajador.telefono,
    EstadoCivil: trabajador.estadoCivil,
    Hijos: trabajador.hijos,
    IMC: trabajador.imc,
    CircunferenciaCintura: trabajador.cintura,
    Aptitud: trabajador.aptitud,
    'Requiere Lentes': trabajador.requiereLentes,
    'Vista Corregida': trabajador.correccionVisual,
    'Agudeza Visual': trabajador.agudeza,
    Daltonismo: trabajador.daltonismo,
    Diabético: trabajador.diabetico,
    Hipertensivo: trabajador.hipertensivo,
    'Accidente Laboral': trabajador.accidente,
    'Agentes de Riesgo': trabajador.agentesRiesgo,
    Consultas: trabajador.consultas,
    'Estado Laboral': trabajador.estadoLaboral,
  }));  

  const worksheet = xlsx.utils.json_to_sheet([]);

  // Agregar encabezados y datos como tabla desde A1
  xlsx.utils.sheet_add_json(worksheet, trabajadoresData, {
    origin: 'A1',
    skipHeader: false
  });

  // Agregar propiedad para que Excel lo trate como tabla
  worksheet['!autofilter'] = {
    ref: worksheet['!ref'] || ''
  };

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

  const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(link.href);
}


