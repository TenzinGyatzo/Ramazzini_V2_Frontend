export interface RiesgoTrabajo {
    _id: string;
    fechaRiesgo: Date;
    NSS?: string;
    tipoRiesgo?: string;
    naturalezaLesion?: string;
    parteCuerpoAfectada?: string;
    manejo?: string;
    alta?: string;
    fechaAlta?: Date;
    diasIncapacidad?: number;
    secuelas?: string;
    porcentajeIPP?: number;
    notas?: string;
    idTrabajador: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
  }
  