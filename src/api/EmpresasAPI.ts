import api from '@/lib/axios'

export default {
    getEmpresas() {
        return api.get('/empresas')
    },

    getEmpresaById(empresaId: string) {
        return api.get(`/${empresaId}`)
    }
}