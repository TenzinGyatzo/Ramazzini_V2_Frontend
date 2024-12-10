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

    createDocument(documentType: string, trabajadorId: string, data: any) {
        return api.post(`/expedientes/${trabajadorId}/documentos/${documentType}/crear`, data);
    },

    deleteDocumentById(documentType: string, trabajadorId: string, documentoId: string) {
        return api.delete(`/expedientes/${trabajadorId}/documentos/${documentType}/eliminar/${documentoId}`);
    },
}