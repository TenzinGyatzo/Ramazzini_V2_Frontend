import api from '@/lib/axios'

export default {
    getCentrosTrabajo(empresaId: string) {
        return api.get(`${empresaId}/centros-trabajo`)
    },
}