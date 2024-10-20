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
    }
}