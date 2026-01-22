import api from '@/lib/axios'

export default {
  createResultado(data: any) {
    return api.post('/resultados-clinicos', data);
  },

  updateResultado(id: string, data: any) {
    return api.patch(`/resultados-clinicos/${id}`, data);
  },

  deleteResultado(id: string) {
    return api.delete(`/resultados-clinicos/${id}`);
  },

  getByTrabajador(trabajadorId: string, params?: { tipo?: string }) {
    const queryParams = params?.tipo ? `?tipo=${params.tipo}` : '';
    return api.get(`/resultados-clinicos/trabajador/${trabajadorId}${queryParams}`);
  },

  getByTrabajadorGrouped(trabajadorId: string) {
    return api.get(`/resultados-clinicos/trabajador/${trabajadorId}/expediente`);
  },

  getResultadoById(id: string) {
    return api.get(`/resultados-clinicos/${id}`);
  },
}
