import type { Trabajador } from '@/interfaces/trabajador.interface';
import api from '@/lib/axios'

export default {
    getTrabajadores(empresaId: string, centroTrabajoId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/trabajadores`)
    },

    getTrabajadoresConHistoria(empresaId: string, centroTrabajoId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/trabajadores-con-historia`);
    }, 
    
    getSexosYFechasNacimientoActivos(empresaId: string, centroTrabajoId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/sexos-y-fechas-nacimiento-activos`);
    },

    getDashboardData(empresaId: string, centroTrabajoId: string, inicio?: string, fin?: string) {
    const params: any = {};
    if (inicio) params.inicio = inicio;
    if (fin) params.fin = fin;

    return api.get(`/${empresaId}/${centroTrabajoId}/dashboard`, { params });
    },

    getTrabajadorById(empresaId: string, centroTrabajoId: string, trabajadorId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/${trabajadorId}`)
    },

    createTrabajador(empresaId: string, centroTrabajoId: string, trabajadorData: Trabajador) {
        return api.post(`/${empresaId}/${centroTrabajoId}/registrar-trabajador`, trabajadorData)
    },

    updateTrabajador(empresaId: string, centroTrabajoId: string, trabajadorId: string, trabajadorData: Partial<Trabajador>) {
        return api.patch(`/${empresaId}/${centroTrabajoId}/actualizar-trabajador/${trabajadorId}`, trabajadorData)
    },

    importTrabajadores(empresaId: string, centroTrabajoId: string, formData: FormData) {
        return api.post(`/${empresaId}/${centroTrabajoId}/importar-trabajadores`, formData)
    },

    deleteTrabajadorById(empresaId: string, centroTrabajoId: string, trabajadorId: string) {
        return api.delete(`/${empresaId}/${centroTrabajoId}/eliminar-trabajador/${trabajadorId}`)
    },

    exportTrabajadores(empresaId: string, centroTrabajoId: string) {
        return api.get(`/${empresaId}/${centroTrabajoId}/exportar-trabajadores`, {
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'blob'
        });
    },

    transferirTrabajador(empresaId: string, centroTrabajoId: string, trabajadorId: string, nuevoCentroId: string) {
        return api.patch(`/${empresaId}/${centroTrabajoId}/transferir-trabajador/${trabajadorId}`, {
            nuevoCentroId,
            updatedBy: '6650f38308ac3beedf5ac41b' // TODO: Obtener el ID del usuario actual
        });
    }

}