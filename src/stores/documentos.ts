import { defineStore } from "pinia";
import { ref } from "vue";
import DocumentosAPI from "@/api/DocumentosAPI";
import type { Antidoping, Aptitud, Certificado, DocumentoExterno, ExamenVista, ExploracionFisica, HistoriaClinica } from "@/interfaces/documentos.inteface";

export type DocumentsByYear = {
    [year: string]: {
        antidopings?: Antidoping[];
        aptitudes?: Aptitud[];
        certificados?: Certificado[];
        documentosExternos?: DocumentoExterno[];
        examenesVista?: ExamenVista[];
        exploracionesFisicas?: ExploracionFisica[];
        historiasClinicas?: HistoriaClinica[];
    };
};

export const useDocumentosStore = defineStore("documentos", () => {
    const documentsByYear = ref<DocumentsByYear>({});
    const loading = ref(true);

    async function fetchAllDocuments(trabajadorId: string) {

        try {
            loading.value = true;
            documentsByYear.value = {};

            // Fetch con manejo de errores y validación en cada llamada
            try {
                const antidopings = await DocumentosAPI.getAntidopings(trabajadorId);
                if (Array.isArray(antidopings.data)) addAntidopingsByYear(antidopings.data);
            } catch (error) {
                console.error("Error al obtener antidopings", error);
            }
            try {
                const aptitudes = await DocumentosAPI.getAptitudes(trabajadorId);
                if (Array.isArray(aptitudes.data)) addAptitudesByYear(aptitudes.data);
            } catch (error) {
                console.error("Error al obtener aptitudes", error);
            }
            try {
                const certificados = await DocumentosAPI.getCertificados(trabajadorId);
                if (Array.isArray(certificados.data)) addCertificadosByYear(certificados.data);
            } catch (error) {
                console.error("Error al obtener certificados", error);
            }
            try {
                const documentosExternos = await DocumentosAPI.getDocumentosExternos(trabajadorId);
                if (Array.isArray(documentosExternos.data)) addDocumentosExternosByYear(documentosExternos.data);
            } catch (error) {
                console.error("Error al obtener documentosExternos", error);
            }
            try {
                const examenesVista = await DocumentosAPI.getExamenesVista(trabajadorId);
                if (Array.isArray(examenesVista.data)) addExamenesVistaByYear(examenesVista.data);
            } catch (error) {
                console.error("Error al obtener examenesVista", error);
            }
            try {
                const exploracionesFisicas = await DocumentosAPI.getExploracionesFisicas(trabajadorId);
                if (Array.isArray(exploracionesFisicas.data)) addExploracionesFisicasByYear(exploracionesFisicas.data);
            } catch (error) {
                console.error("Error al obtener exploracionesFisicas", error);
            }
            try {
                const historiasClinicas = await DocumentosAPI.getHistoriasClinicas(trabajadorId);
                if (Array.isArray(historiasClinicas.data)) addHistoriasClinicasByYear(historiasClinicas.data);
            } catch (error) {
                console.error("Error al obtener historiasClinicas", error);
            }

            // Funciones de agrupación por año
            function addAntidopingsByYear(data: Antidoping[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaAntidoping).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].antidopings) {
                        documentsByYear.value[year].antidopings = [];
                    }
                    documentsByYear.value[year].antidopings.push(documento);
                });
            }
            
            function addAptitudesByYear(data: Aptitud[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaAptitudPuesto).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].aptitudes) {
                        documentsByYear.value[year].aptitudes = [];
                    }
                    documentsByYear.value[year].aptitudes.push(documento);
                });
            }
            
            function addCertificadosByYear(data: Certificado[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaCertificado).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].certificados) {
                        documentsByYear.value[year].certificados = [];
                    }
                    documentsByYear.value[year].certificados.push(documento);
                });
            }

            function addDocumentosExternosByYear(data: DocumentoExterno[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaDocumento).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].documentosExternos) {
                        documentsByYear.value[year].documentosExternos = [];
                    }
                    documentsByYear.value[year].documentosExternos.push(documento);
                });
            }

            function addExamenesVistaByYear(data: ExamenVista[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaExamenVista).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].examenesVista) {
                        documentsByYear.value[year].examenesVista = [];
                    }
                    documentsByYear.value[year].examenesVista.push(documento);
                });
            }

            function addExploracionesFisicasByYear(data: ExploracionFisica[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaExploracionFisica).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].exploracionesFisicas) {
                        documentsByYear.value[year].exploracionesFisicas = [];
                    }
                    documentsByYear.value[year].exploracionesFisicas.push(documento);
                });
            }

            function addHistoriasClinicasByYear(data: HistoriaClinica[]) {
                data.forEach((documento) => {
                    const year = new Date(documento.fechaHistoriaClinica).getFullYear();
                    if (!documentsByYear.value[year]) {
                        documentsByYear.value[year] = {};
                    }
                    if (!documentsByYear.value[year].historiasClinicas) {
                        documentsByYear.value[year].historiasClinicas = [];
                    }
                    documentsByYear.value[year].historiasClinicas.push(documento);
                });
            }

        } catch (error) {
            console.error("Error al obtener documentos", error);
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        documentsByYear,
        fetchAllDocuments
    }
});
