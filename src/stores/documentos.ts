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

            const [antidopings, aptitudes, certificados, documentosExternos, examenesVista, exploracionesFisicas, historiasClinicas] = await Promise.all([
                DocumentosAPI.getAntidopings(trabajadorId),
                DocumentosAPI.getAptitudes(trabajadorId),
                DocumentosAPI.getCertificados(trabajadorId),
                DocumentosAPI.getDocumentosExternos(trabajadorId),
                DocumentosAPI.getExamenesVista(trabajadorId),
                DocumentosAPI.getExploracionesFisicas(trabajadorId),
                DocumentosAPI.getHistoriasClinicas(trabajadorId),
            ])

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

            addAntidopingsByYear(antidopings.data);
            addAptitudesByYear(aptitudes.data);
            addCertificadosByYear(certificados.data);
            addDocumentosExternosByYear(documentosExternos.data);
            addExamenesVistaByYear(examenesVista.data);
            addExploracionesFisicasByYear(exploracionesFisicas.data);
            addHistoriasClinicasByYear(historiasClinicas.data);

        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        documentsByYear,
        fetchAllDocuments
    }
})