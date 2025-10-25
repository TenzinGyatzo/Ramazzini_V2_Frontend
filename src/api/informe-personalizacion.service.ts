import axios from 'axios';
import type { 
  InformePersonalizacion, 
  CreateInformePersonalizacionDto, 
  UpdateInformePersonalizacionDto 
} from '@/interfaces/informe-personalizacion.interface';

const API_URL = import.meta.env.VITE_API_URL || 'https://ramazzini.app';

class InformePersonalizacionService {
  private baseURL = `${API_URL}/api/informe-personalizacion`;

  private getAuthHeaders() {
    const token = localStorage.getItem('AUTH_TOKEN');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async create(data: CreateInformePersonalizacionDto): Promise<InformePersonalizacion> {
    const response = await axios.post(this.baseURL, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async findByEmpresa(idEmpresa: string): Promise<InformePersonalizacion[]> {
    const response = await axios.get(`${this.baseURL}/empresa/${idEmpresa}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async findByEmpresaAndCentro(
    idEmpresa: string, 
    idCentroTrabajo: string
  ): Promise<InformePersonalizacion | null> {
    const response = await axios.get(
      `${this.baseURL}/empresa/${idEmpresa}/centro/${idCentroTrabajo}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async findByEmpresaOnly(idEmpresa: string): Promise<InformePersonalizacion | null> {
    const response = await axios.get(
      `${this.baseURL}/empresa/${idEmpresa}/centro`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async update(id: string, data: UpdateInformePersonalizacionDto): Promise<InformePersonalizacion> {
    const response = await axios.put(`${this.baseURL}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async upsertByEmpresa(
    idEmpresa: string, 
    data: UpdateInformePersonalizacionDto
  ): Promise<InformePersonalizacion> {
    const response = await axios.put(`${this.baseURL}/upsert/empresa/${idEmpresa}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async upsertByEmpresaAndCentro(
    idEmpresa: string,
    idCentroTrabajo: string,
    data: UpdateInformePersonalizacionDto
  ): Promise<InformePersonalizacion> {
    const response = await axios.put(
      `${this.baseURL}/upsert/empresa/${idEmpresa}/centro/${idCentroTrabajo}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const informePersonalizacionService = new InformePersonalizacionService();
