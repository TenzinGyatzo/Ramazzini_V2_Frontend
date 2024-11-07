import { defineStore } from "pinia";
import { ref } from "vue";
import DocumentosAPI from "@/api/DocumentosAPI";

export const useDocumentosStore = defineStore("documentos", () => {
    const antidopings = ref([])
    const aptitudes = ref([])
    const certificados = ref([])
    const documentosExternos = ref([])
    const examenesVista = ref([])
    const exploracionesFisicas = ref([])
    const historiasClinicas = ref([])



    return {
        antidopings,
        aptitudes,
        certificados,
        documentosExternos,
        examenesVista,
        exploracionesFisicas,
        historiasClinicas,
    }
})