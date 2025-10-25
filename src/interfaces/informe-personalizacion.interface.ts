export interface RecomendacionItem {
  hallazgo: string;
  medidaPreventiva: string;
}

export interface InformePersonalizacion {
  _id?: string;
  idEmpresa: string;
  idCentroTrabajo?: string;
  conclusiones?: string;
  formatoRecomendaciones: 'texto' | 'tabla';
  recomendacionesTexto?: string;
  recomendacionesTabla?: RecomendacionItem[];
  createdBy: string;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInformePersonalizacionDto {
  idEmpresa: string;
  idCentroTrabajo?: string;
  conclusiones?: string;
  formatoRecomendaciones?: 'texto' | 'tabla';
  recomendacionesTexto?: string;
  recomendacionesTabla?: RecomendacionItem[];
  createdBy: string;
  updatedBy: string;
}

export interface UpdateInformePersonalizacionDto {
  conclusiones?: string;
  formatoRecomendaciones?: 'texto' | 'tabla';
  recomendacionesTexto?: string;
  recomendacionesTabla?: RecomendacionItem[];
  updatedBy: string;
}
