import { ref } from "vue";
import { defineStore } from "pinia";

interface MedicoFirmante {
    _id: string;
    nombre: string;
    tituloProfesional?: string;
    numeroCedulaProfesional?: string;
    especialistaSaludTrabajo?: boolean;
    numeroCedulaEspecialista?: string;
    nombreCredencialAdicional?: string;
    numeroCredencialAdicional?: string;
    firma?: {
        data: string;
        contentType: string
    };
    firmaConAntefirma?: {
        data: string;
        contentType: string
    };
    idUser: string;
}

// Define el store
export const useMedicoFirmanteStore = defineStore("medicoFirmante", () => {
    const loading = ref(true);
    const medicoFirmante = ref<MedicoFirmante | null>(null);

    async function loadMedicoFirmante(idMedicoFirmante: string) {
        try {
            console.log("Medico Firmante", idMedicoFirmante);
            // loading.value = true;
            // const { data } = await MedicoFirmanteAPI.getMedicoFirmanteById(idMedicoFirmante);
            // medicoFirmante.value = data;
            // console.log("Medico Firmante", medicoFirmante.value);
        } catch (error) {
            console.error("Error al cargar médico firmante:", error);
        } finally {
            loading.value = false;
        }
    }

    async function createMedicoFirmante(medicoFirmanteData: MedicoFirmante) {
        try {
            loading.value = true;
            // const { data } = await MedicoFirmanteAPI.createMedicoFirmante(medicoFirmanteData);
            // medicoFirmante.value = data;
            console.log("Medico Firmante", medicoFirmante.value);
            return medicoFirmanteData;
        } catch (error) {
            console.error("Error al cargar médico firmante:", error);
        } finally {
            loading.value = false;
        }
    }

    async function updateMedicoFirmanteById(idMedicoFirmante: string, medicoFirmanteData: MedicoFirmante) {
        try {
            loading.value = true;
            // const { data } = await MedicoFirmanteAPI.updateMedicoFirmanteById(idMedicoFirmante, medicoFirmanteData);
            // medicoFirmante.value = data;
            console.log("Medico Firmante", medicoFirmante.value);
            return medicoFirmanteData;
        } catch (error) {
            console.error("Error al cargar médico firmante:", error);
        } finally {
            loading.value = false;
        }
    }

    return {
        medicoFirmante,
        loading,
        loadMedicoFirmante,
        createMedicoFirmante,
        updateMedicoFirmanteById,
    };
});