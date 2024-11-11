import api from '@/lib/axios'

export default {
    getAntidopings(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/antidoping`);
    },

    getAptitudes(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/aptitud`);
    },

    getCertificados(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/certificado`);
    },
    getDocumentosExternos(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/documentoExterno`);
    },

    getExamenesVista(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/examenVista`);
    },

    getExploracionesFisicas(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/exploracionFisica`);
    },

    getHistoriasClinicas(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/historiaClinica`);
    },

}