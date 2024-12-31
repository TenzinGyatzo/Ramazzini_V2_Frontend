
export const findNearestDocument = (documents, referenceDateField, dateField) => {
    if (!referenceDateField || !documents.length) {
      // console.log('No hay fecha válida o el array de documentos está vacío.');
      return null;
    }
  
    const referenceDate = new Date(referenceDateField);
  
    if (isNaN(referenceDate.getTime())) {
      console.error('Fecha de referencia no válida:', referenceDateField);
      return null;
    }
  
    return documents.reduce((closest, current) => {
      const currentDate = current[dateField] ? new Date(current[dateField]) : null;
  
      if (!currentDate || isNaN(currentDate.getTime())) {
        console.error('Fecha de documento no válida:', current[dateField]);
        return closest;
      }
  
      const currentDiff = Math.abs(currentDate.getTime() - referenceDate.getTime());
      const closestDiff = closest
        ? Math.abs(new Date(closest[dateField]).getTime() - referenceDate.getTime())
        : Infinity;
  
      return currentDiff < closestDiff ? current : closest;
    }, null);
  };
  