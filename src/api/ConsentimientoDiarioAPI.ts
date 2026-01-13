import api from '@/lib/axios';
import type { ConsentimientoStatus, ConsentimientoCreated, CreateConsentimientoDiarioDto } from '@/types/consentimiento-diario';

export default {
  /**
   * Obtiene el estado del consentimiento diario para un trabajador
   * @param trabajadorId - ID del trabajador
   * @param dateKey - Clave de fecha opcional (YYYY-MM-DD), si no se proporciona, backend usa "hoy"
   * @returns Estado del consentimiento
   */
  getStatus(trabajadorId: string, dateKey?: string): Promise<{ data: ConsentimientoStatus }> {
    const params: any = {};
    if (dateKey) {
      params.dateKey = dateKey;
    }
    return api.get(`/consentimiento-diario/status/${trabajadorId}`, { params });
  },

  /**
   * Crea un nuevo consentimiento informado diario
   * @param createDto - Datos para crear el consentimiento
   * @returns Consentimiento creado
   */
  create(createDto: CreateConsentimientoDiarioDto): Promise<{ data: ConsentimientoCreated }> {
    return api.post('/consentimiento-diario', createDto);
  },
};
