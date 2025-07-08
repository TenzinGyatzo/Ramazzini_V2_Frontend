export interface RiesgoTrabajo {
  _id: string;
  idTrabajador: string;
  nombreTrabajador: string;
  sexoTrabajador: string;
  puestoTrabajador: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  numeroEmpleado?: string;
  recaida?: string;
  NSS?: string;
  idCentroTrabajo: string;
  tipoRiesgo?: string;
  fechaRiesgo?: string;
  naturalezaLesion?: string;
  parteCuerpoAfectada?: string;
  alta?: string;
  fechaAlta?: string;
  diasIncapacidad?: number;
  porcentajeIPP?: number;
  secuelas?: string;
  manejo?: string;
  notas?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  
}

  