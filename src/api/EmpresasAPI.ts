import api from '@/lib/axios'

export default {
    getEmpresas() {
        return api.get('/empresas')
    },
}