import type { Trabajador } from '@/interfaces/trabajador.interface';
import api from '@/lib/axios'

export default {
    getAntidopings(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/antidoping`);
    },

}