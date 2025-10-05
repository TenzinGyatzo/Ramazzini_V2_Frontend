import { defineStore } from "pinia";
import { ref } from "vue";
import DocumentosAPI from "@/api/DocumentosAPI";
import type {
  Antidoping,
  Aptitud,
  Audiometria,
  Certificado,
  CertificadoExpedito,
  DocumentoExterno,
  ExamenVista,
  ExploracionFisica,
  HistoriaClinica,
  NotaMedica,
  ControlPrenatal,
  HistoriaOtologica,
  PrevioEspirometria,
} from "@/interfaces/documentos.inteface";

export type DocumentsByYear = {
  [year: string]: {
    antidopings?: Antidoping[];
    aptitudes?: Aptitud[];
    audiometrias?: Audiometria[];
    certificados?: Certificado[];
    certificadosExpedito?: CertificadoExpedito[];
    documentosExternos?: DocumentoExterno[];
    examenesVista?: ExamenVista[];
    exploracionesFisicas?: ExploracionFisica[];
    historiasClinicas?: HistoriaClinica[];
    notasMedicas?: NotaMedica[];
    controlPrenatal?: ControlPrenatal[];
    historiaOtologica?: HistoriaOtologica[];
    previoEspirometria?: PrevioEspirometria[];
  };
};

export const useDocumentosStore = defineStore("documentos", () => {
  const documentsByYear = ref<DocumentsByYear>({});
  const loading = ref(true);
  const currentTypeOfDocument = ref<string | null>(null);
  const currentDocumentId = ref<string | null>(null);
  const currentDocument = ref<any | null>(null);

  async function fetchDocumentById(documentType: string, trabajadorId: string, documentId: string) {
    try {
      currentDocument.value = null;

      const response = await DocumentosAPI.getDocumentById(documentType, trabajadorId, documentId);
      currentDocument.value = response.data;
    } catch (error) {
      console.error(`Error al obtener el documento ${documentId} de tipo ${documentType}:`, error);
    }
  }

  async function fetchAllDocuments(trabajadorId: string) {
    try {
      loading.value = true;
      documentsByYear.value = {};

      // Realizar todas las solicitudes en paralelo
      const [
        antidopings,
        aptitudes,
        audiometrias,
        certificados,
        certificadosExpedito,
        documentosExternos,
        examenesVista,
        exploracionesFisicas,
        historiasClinicas,
        notasMedicas,
        controlPrenatal,
        historiaOtologica,
        previoEspirometria
      ] = await Promise.all([
        DocumentosAPI.getAntidopings(trabajadorId).catch(error => {
          console.error("Error al obtener antidopings", error);
          return { data: [] };
        }),
        DocumentosAPI.getAptitudes(trabajadorId).catch(error => {
          console.error("Error al obtener aptitudes", error);
          return { data: [] };
        }),
        DocumentosAPI.getAudiometrias(trabajadorId).catch(error => {
          console.error("Error al obtener audiometrias", error);
          return { data: [] };
        }),
        DocumentosAPI.getCertificados(trabajadorId).catch(error => {
          console.error("Error al obtener certificados", error);
          return { data: [] };
        }),
        DocumentosAPI.getCertificadosExpedito(trabajadorId).catch(error => {
          console.error("Error al obtener certificadosExpedito", error);
          return { data: [] };
        }),
        DocumentosAPI.getDocumentosExternos(trabajadorId).catch(error => {
          console.error("Error al obtener documentosExternos", error);
          return { data: [] };
        }),
        DocumentosAPI.getExamenesVista(trabajadorId).catch(error => {
          console.error("Error al obtener examenesVista", error);
          return { data: [] };
        }),
        DocumentosAPI.getExploracionesFisicas(trabajadorId).catch(error => {
          console.error("Error al obtener exploracionesFisicas", error);
          return { data: [] };
        }),
        DocumentosAPI.getHistoriasClinicas(trabajadorId).catch(error => {
          console.error("Error al obtener historiasClinicas", error);
          return { data: [] };
        }),
        DocumentosAPI.getNotasMedicas(trabajadorId).catch(error => {
          console.error("Error al obtener notasMedicas", error);
          return { data: [] };
        }),
        DocumentosAPI.getControlPrenatal(trabajadorId).catch(error => {
          console.error("Error al obtener controlPrenatal", error);
          return { data: [] };
        }),
        DocumentosAPI.getHistoriaOtologica(trabajadorId).catch(error => {
          console.error("Error al obtener historiaOtologica", error);
          return { data: [] };
        }),
        DocumentosAPI.getPrevioEspirometria(trabajadorId).catch(error => {
          console.error("Error al obtener previoEspirometria", error);
          return { data: [] };
        })
      ]);

      // Agrupar documentos por año (solo si es un array)
      const documentosAgrupados = {
        antidopings: Array.isArray(antidopings.data) ? antidopings.data : [],
        aptitudes: Array.isArray(aptitudes.data) ? aptitudes.data : [],
        audiometrias: Array.isArray(audiometrias.data) ? audiometrias.data : [],
        certificados: Array.isArray(certificados.data) ? certificados.data : [],
        certificadosExpedito: Array.isArray(certificadosExpedito.data) ? certificadosExpedito.data : [],
        documentosExternos: Array.isArray(documentosExternos.data) ? documentosExternos.data : [],
        examenesVista: Array.isArray(examenesVista.data) ? examenesVista.data : [],
        exploracionesFisicas: Array.isArray(exploracionesFisicas.data) ? exploracionesFisicas.data : [],
        historiasClinicas: Array.isArray(historiasClinicas.data) ? historiasClinicas.data : [],
        notasMedicas: Array.isArray(notasMedicas.data) ? notasMedicas.data : [],
        controlPrenatal: Array.isArray(controlPrenatal.data) ? controlPrenatal.data : [],
        historiaOtologica: Array.isArray(historiaOtologica.data) ? historiaOtologica.data : [],
        previoEspirometria: Array.isArray(previoEspirometria.data) ? previoEspirometria.data : []
      };

      // Procesar documentos y agrupar por año
      Object.entries(documentosAgrupados).forEach(([tipoDocumento, documentos]) => {
        if (!Array.isArray(documentos)) return; // Verificación adicional

        documentos.forEach((documento) => {
          const fechaCampo = obtenerCampoFecha(tipoDocumento, documento);
          if (!fechaCampo) return; // Evita errores si el campo de fecha es nulo

          const year = new Date(fechaCampo).getFullYear();
          
          if (!documentsByYear.value[year]) {
            documentsByYear.value[year] = {};
          }
          if (!documentsByYear.value[year][tipoDocumento]) {
            documentsByYear.value[year][tipoDocumento] = [];
          }
          documentsByYear.value[year][tipoDocumento].push(documento);
        });
      });

    } catch (error) {
      console.error("Error general al obtener documentos", error);
    } finally {
      loading.value = false;
    }
  }

  // Función para obtener el campo de fecha correctamente
  function obtenerCampoFecha(tipoDocumento: string, documento: any): string {
    const fechaCampos = {
      antidopings: "fechaAntidoping",
      aptitudes: "fechaAptitudPuesto",
      audiometrias: "fechaAudiometria",
      certificados: "fechaCertificado",
      certificadosExpedito: "fechaCertificadoExpedito",
      documentosExternos: "fechaDocumento",
      examenesVista: "fechaExamenVista",
      exploracionesFisicas: "fechaExploracionFisica",
      historiasClinicas: "fechaHistoriaClinica",
      notasMedicas: "fechaNotaMedica",
      controlPrenatal: "fechaInicioControlPrenatal",
      historiaOtologica: "fechaHistoriaOtologica",
      previoEspirometria: "fechaPrevioEspirometria"
    };

    return documento?.[fechaCampos[tipoDocumento]] || "";
  }

  function setCurrentTypeOfDocument(type: string) {
    currentTypeOfDocument.value = type;
  }

  function setCurrentDocument(documentType: string, documentId: string) {
    currentTypeOfDocument.value = documentType;
    currentDocumentId.value = documentId;
  }  

  function resetCurrentTypeOfDocument() {
    currentTypeOfDocument.value = "";
    currentDocumentId.value = "";
  }

  async function createDocument(documentType: string, trabajadorId: string, data: any) {
    try {
      loading.value = true;
      const response = await DocumentosAPI.createDocument(documentType, trabajadorId, data);
      return response.data; // Retorna solo los datos relevantes
    } catch (error) {
      console.error('Error al crear el documento en el store:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateDocument(documentType: string, trabajadorId: string, documentId: string, data: any) {
    try {
      loading.value = true;
      const response = await DocumentosAPI.updateDocument(documentType, trabajadorId, documentId, data);
      return response.data; // Retorna solo los datos relevantes
    } catch (error) {
      console.error('Error al actualizar el documento en el store:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function uploadExternalDocument(trabajadorId: string, formData: FormData) {
    try {
      loading.value = true;
      const response = await DocumentosAPI.uploadExternalDocument(trabajadorId, formData);
      return response.data; // Retorna solo los datos relevantes
    } catch (error) {
      console.error('Error al crear el documento en el store:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteDocumentById(documentType: string, trabajadorId: string, documentId: string) {
    try {
      loading.value = true;
      await DocumentosAPI.deleteDocumentById(documentType, trabajadorId, documentId);
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    documentsByYear,
    currentTypeOfDocument,
    currentDocumentId,
    currentDocument,
    fetchDocumentById,
    fetchAllDocuments,
    setCurrentDocument,
    setCurrentTypeOfDocument,
    resetCurrentTypeOfDocument,
    createDocument,
    updateDocument,
    uploadExternalDocument,
    deleteDocumentById
  };
});
