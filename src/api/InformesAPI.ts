import informes from '@/lib/axiosInformes'

export default {
    // Descargar formato de historia clínica en blanco
    descargarFormatoHistoriaClinica(empresaId: string, trabajadorId: string, userId: string) {
        return informes.get(`/formato-historia-clinica/descargar/${empresaId}/${trabajadorId}/${userId}`, {
            responseType: 'blob'
        });
    },

    // Ver formato de historia clínica en blanco (inline)
    verFormatoHistoriaClinica(empresaId: string, trabajadorId: string, userId: string) {
        return informes.get(`/formato-historia-clinica/${empresaId}/${trabajadorId}/${userId}`, {
            responseType: 'blob'
        });
    },

    // Descargar formato de exploración física en blanco
    descargarFormatoExploracionFisica(empresaId: string, trabajadorId: string, userId: string) {
        return informes.get(`/formato-exploracion-fisica/descargar/${empresaId}/${trabajadorId}/${userId}`, {
            responseType: 'blob'
        });
    },

    // Ver formato de exploración física en blanco (inline)
    verFormatoExploracionFisica(empresaId: string, trabajadorId: string, userId: string) {
        return informes.get(`/formato-exploracion-fisica/${empresaId}/${trabajadorId}/${userId}`, {
            responseType: 'blob'
        });
    }
} 