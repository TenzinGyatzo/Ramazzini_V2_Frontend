function convertirFechaISOaDDMMYYYY(dateString: string): string {
  const fecha = new Date(dateString);

  if (isNaN(fecha.getTime())) {
    throw new Error("La fecha proporcionada no es válida.");
  }

  const dia = String(fecha.getUTCDate()).padStart(2, "0"); // Obtiene el día en UTC
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // Mes en UTC (suma 1 porque empieza en 0)
  const año = fecha.getUTCFullYear(); // Año en UTC

  return `${dia}-${mes}-${año}`;
}

function convertirFechaISOaYYYYMMDD(dateString: string): string {
  if (!dateString) {
    return ""; // Retorna un string vacío si el parámetro es una cadena vacía
  }

  const fecha = new Date(dateString);

  if (isNaN(fecha.getTime())) {
    throw new Error("La fecha proporcionada no es válida.");
  }

  const dia = String(fecha.getUTCDate()).padStart(2, "0"); // Obtiene el día en UTC con dos dígitos
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0, por eso se suma 1
  const año = fecha.getUTCFullYear(); // Obtiene el año completo en UTC

  return `${año}-${mes}-${dia}`;
}

function calcularEdad(dateString: string): number {
  const fechaNacimiento = new Date(dateString);
  // if (isNaN(fechaNacimiento.getTime())) {
  //   throw new Error("La fecha proporcionada no es válida.");
  // }

  const hoy = new Date().getTime();
  const edad = Math.floor(
    (hoy - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  return edad;
}

function calcularAntiguedad(dateString: string): string {
  const fechaIngreso = new Date(dateString);
  const fechaIngresoMilisegundos = fechaIngreso.getTime();
  const hoy = new Date();
  const hoyMilisegundos = new Date().getTime();
  const milisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  const antiguedadEnMilisegundos = hoyMilisegundos - fechaIngresoMilisegundos;
  if (antiguedadEnMilisegundos <= milisecondsPerWeek) {
    return "Nuevo Ingreso";
  }
  const totalMonths =
    (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 +
    hoy.getMonth() -
    fechaIngreso.getMonth();
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} años, ${months} meses`;
}

  function formatDateDDMMYYYY(date) {
    if (!date) return '';
  
    const d = new Date(date); // Sin modificar la fecha
    if (isNaN(d.getTime())) return ''; // Validar si la fecha es válida
  
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
  
    return `${day}-${month}-${year}`;
  }

  function formatDateYYYYMMDD(date) {
    if (!date) return '';
  
    const d = new Date(date); // Sin modificar la fecha
    if (isNaN(d.getTime())) return ''; // Validar si la fecha es válida
  
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
  
    return `${year}-${month}-${day}`;
  }
  
  function convertirYYYYMMDDaISO(dateString) {
    if (!dateString) {
      throw new Error("La fecha proporcionada no es válida o está vacía.");
    }
  
    // Dividimos el string en partes (YYYY, MM, DD)
    const [year, month, day] = dateString.split("-").map(Number);
  
    // Validamos que los valores sean correctos
    if (!year || !month || !day || month > 12 || day > 31) {
      throw new Error("La fecha proporcionada no tiene un formato válido (YYYY-MM-DD).");
    }
  
    // Crear una fecha en UTC
    const fecha = new Date(Date.UTC(year, month - 1, day));
  
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha no pudo ser convertida a ISO.");
    }
  
    return fecha.toISOString(); // Convertimos la fecha a formato ISO
  }

  const determinarVistaCorregida = (
    requiereLentesUsoGeneral?: string | null,
    ojoIzquierdoLejanaConCorreccion?: number | null,
    ojoDerechoLejanaConCorreccion?: number | null
  ): string => {
    if (requiereLentesUsoGeneral === 'No') return 'No requiere';
    if (requiereLentesUsoGeneral === 'Si') {
      return ((ojoIzquierdoLejanaConCorreccion ?? 0) > 0 || (ojoDerechoLejanaConCorreccion ?? 0) > 0)
        ? 'Corregida' : 'Sin corregir';
    }
    return '-';
  };


export {
  convertirFechaISOaDDMMYYYY,
  convertirFechaISOaYYYYMMDD,
  calcularEdad,
  calcularAntiguedad,
  formatDateDDMMYYYY,
  formatDateYYYYMMDD,
  convertirYYYYMMDDaISO,
  determinarVistaCorregida
};
