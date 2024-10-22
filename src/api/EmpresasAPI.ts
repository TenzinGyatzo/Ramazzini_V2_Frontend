import api from '@/lib/axios'

export default {
    getEmpresas() {
        return api.get('/empresas')
    },

    getEmpresaById(empresaId: string) {
        return api.get(`/${empresaId}`)
    },

    createEmpresa(empresaData) {
        return api.post('/crear-empresa', empresaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    updateEmpresaById(empresaId: string, empresaData) {
        return api.put(`/actualizar-empresa/${empresaId}`, empresaData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    deleteEmpresaById(empresaId: string) {
        return api.delete(`/eliminar-empresa/${empresaId}`)
    }
}