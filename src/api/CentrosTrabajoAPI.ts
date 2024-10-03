import api from '@/lib/axios'

export default {
    getCentrosTrabajo(empresaId: string) {
        return api.get(`${empresaId}/centros-trabajo`)
    },

    getCentroTrabajoById(empresaId: string, centroTrabajoId: string) {
        return api.get(`${empresaId}/${centroTrabajoId}`)
    }
}