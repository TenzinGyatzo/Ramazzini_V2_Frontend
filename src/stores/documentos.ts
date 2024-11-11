import { defineStore } from "pinia";
import { ref } from "vue";
import DocumentosAPI from "@/api/DocumentosAPI";
import type { Antidoping, Aptitud, Certificado, DocumentoExterno, ExamenVista, ExploracionFisica, HistoriaClinica } from "@/interfaces/documentos.inteface";

function groupDocumentsByYear<T>(
    documentosArray: T[],
    campoFecha: keyof T // Permite usar una clave específica en cada interfaz sin restricciones adicionales
): { [year: string]: T[] } {
    const documentosAgrupados: { [year: string]: T[] } = {};

    documentosArray.forEach((documento) => {
        const fecha = documento[campoFecha] as unknown as Date; // Convierte temporalmente a Date
        const year = new Date(fecha).getFullYear();
        if (!documentosAgrupados[year]) {
            documentosAgrupados[year] = [];
        }
        documentosAgrupados[year].push(documento);
    });

    return documentosAgrupados;
}


export const useDocumentosStore = defineStore("documentos", () => {
    const antidopings = ref<{ [year: string]: Antidoping[] }>({});
    const aptitudes = ref<{ [year: string]: Aptitud[] }>({});
    const certificados = ref<{ [year: string]: Certificado[] }>({});
    const documentosExternos = ref<{ [year: string]: DocumentoExterno[] }>({});
    const examenesVista = ref<{ [year: string]: ExamenVista[] }>({});
    const exploracionesFisicas = ref<{ [year: string]: ExploracionFisica[] }>({});
    const historiasClinicas = ref<{ [year: string]: HistoriaClinica[] }>({});

    const loading = ref(true);

    async function fetchAntidopings(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getAntidopings(trabajadorId);
            antidopings.value = groupDocumentsByYear<Antidoping>(data, 'fechaAntidoping');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchAptitudes(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getAptitudes(trabajadorId);
            aptitudes.value = groupDocumentsByYear<Aptitud>(data, 'fechaAptitudPuesto');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchCertificados(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getCertificados(trabajadorId);
            certificados.value = groupDocumentsByYear<Certificado>(data, 'fechaCertificado');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchDocumentosExternos(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getDocumentosExternos(trabajadorId);
            documentosExternos.value = groupDocumentsByYear<DocumentoExterno>(data, 'fechaDocumento');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchExamenesVista(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getExamenesVista(trabajadorId);
            examenesVista.value = groupDocumentsByYear<ExamenVista>(data, 'fechaExamenVista');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchExploracionesFisicas(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getExploracionesFisicas(trabajadorId);
            exploracionesFisicas.value = groupDocumentsByYear<ExploracionFisica>(data, 'fechaExploracionFisica');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchHistoriasClinicas(trabajadorId: string) {
        try {
            loading.value = true;
            const { data } = await DocumentosAPI.getHistoriasClinicas(trabajadorId);
            historiasClinicas.value = groupDocumentsByYear<HistoriaClinica>(data, 'fechaHistoriaClinica');
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    return {
        antidopings,
        aptitudes,
        certificados,
        documentosExternos,
        examenesVista,
        exploracionesFisicas,
        historiasClinicas,
        fetchAntidopings,
        fetchAptitudes,
        fetchCertificados,
        fetchDocumentosExternos,
        fetchExamenesVista,
        fetchExploracionesFisicas,
        fetchHistoriasClinicas
    }
})