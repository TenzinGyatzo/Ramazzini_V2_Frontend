import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import rt from '@/lib/axiosRTs';

export default {
    getRiesgosTrabajo(trabajadorId: string) {
        return rt.get(`/${trabajadorId}/riesgos-trabajo`)
    },

    getRiesgoTrabajoPorId(trabajadorId: string, riesgoTrabajoId: string) {
        return rt.get(`/${trabajadorId}/${riesgoTrabajoId}`)
    },

    createRiesgoTrabajo(trabajadorId: string, riesgoTrabajoData: RiesgoTrabajo) {
        return rt.post(`/${trabajadorId}/crear`, riesgoTrabajoData)
    },

    updateRiesgoTrabajo(trabajadorId: string, riesgoTrabajoId: string, riesgoTrabajoData: Partial<RiesgoTrabajo>) {
        return rt.patch(`/${trabajadorId}/${riesgoTrabajoId}`, riesgoTrabajoData)
    },

    deleteRiesgoTrabajo(trabajadorId: string, riesgoTrabajoId: string) {
        return rt.delete(`/${trabajadorId}/${riesgoTrabajoId}`)
    },

}