import type { Trabajador } from '@/interfaces/trabajador.interface';
import api from '@/lib/axios'

export default {
    getTrabajadores(empresaId: string, centroTrabajoId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/trabajadores`)
    },

    getTrabajadorById(empresaId: string, centroTrabajoId: string, trabajadorId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/${trabajadorId}`)
    },

    createTrabajador(empresaId: string, centroTrabajoId: string, trabajadorData: Trabajador) {
        return api.post(`/${empresaId}/${centroTrabajoId}/registrar-trabajador`, trabajadorData)
    },

    updateTrabajador(empresaId: string, centroTrabajoId: string, trabajadorId: string, trabajadorData: Trabajador) {
        return api.patch(`/${empresaId}/${centroTrabajoId}/actualizar-trabajador/${trabajadorId}`, trabajadorData)
    },

    importTrabajadores(empresaId: string, centroTrabajoId: string, formData: FormData) {
        return api.post(`/${empresaId}/${centroTrabajoId}/importar-trabajadores`, formData)
    },

    deleteTrabajadorById(empresaId: string, centroTrabajoId: string, trabajadorId: string) {
        return api.delete(`/${empresaId}/${centroTrabajoId}/eliminar-trabajador/${trabajadorId}`)
    }
}