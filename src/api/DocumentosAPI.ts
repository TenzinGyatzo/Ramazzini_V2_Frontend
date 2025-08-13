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

    getNotasMedicas(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/notaMedica`);
    },

    getRecetas(trabajadorId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/receta`);
    },

    createDocument(documentType: string, trabajadorId: string, data: any) {
        return api.post(`/expedientes/${trabajadorId}/documentos/${documentType}/crear`, data);
    },

    updateDocument(documentType: string, trabajadorId: string, documentId: string, data: any) {
        return api.patch(`/expedientes/${trabajadorId}/documentos/${documentType}/actualizar/${documentId}`, data);
    },

    uploadExternalDocument(trabajadorId: string, formData: FormData) {
        return api.post(`/expedientes/${trabajadorId}/documentos/documentoExterno/subir`, formData);
    },

    getDocumentById(documentType: string, trabajadorId: string, documentoId: string) {
        return api.get(`/expedientes/${trabajadorId}/documentos/${documentType}/${documentoId}`);
    },

    deleteDocumentById(documentType: string, trabajadorId: string, documentoId: string) {
        return api.delete(`/expedientes/${trabajadorId}/documentos/${documentType}/eliminar/${documentoId}`);
    },
}