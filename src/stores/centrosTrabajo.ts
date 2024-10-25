import { defineStore } from 'pinia'
import { ref } from 'vue'
import CentrosTrabajoAPI from '../api/CentrosTrabajoAPI'

interface CentroTrabajo {
    _id: string
    nombreCentro: string
    direccionCentro: string
    codigoPostal: string
    estado: string
    municipio: string
    idEmpresa: string
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
}

export const useCentrosTrabajoStore = defineStore('centros-trabajo', () => {

    const centrosTrabajo = ref<CentroTrabajo[]>([]);
    const loading = ref(true);
    const loadingModal = ref(false);
    const currentCentroTrabajoId = ref<string>();
    const currentCentroTrabajo = ref<CentroTrabajo>();

    function resetCurrentCentroTrabajo() {
        currentCentroTrabajo.value = {
            _id: '',
            nombreCentro: '',
            direccionCentro: '',
            codigoPostal: '',
            estado: '',
            municipio: '',
            idEmpresa: '',
            createdBy: '',
            updatedBy: '',
            createdAt: '',
            updatedAt: ''
        };
    }

    async function fetchCentrosTrabajo(empresaId: string) {
        try {
            loading.value = true;
            const { data } = await CentrosTrabajoAPI.getCentrosTrabajo(empresaId);
            centrosTrabajo.value = data;
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchCentroTrabajoById(empresaId: string, centroTrabajoId: string) {
        try {
            loadingModal.value = true;
            const { data } = await CentrosTrabajoAPI.getCentroTrabajoById(empresaId, centroTrabajoId);
            currentCentroTrabajo.value = data;
        } catch (error) {
            console.log(error);
        } finally {
            loadingModal.value = false;
        }
    }

    async function createCentroTrabajo(empresaId: string, centroTrabajo: CentroTrabajo) {
        try {
            loading.value = true;
            await CentrosTrabajoAPI.createCentroTrabajo(empresaId, centroTrabajo);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function updateCentroTrabajoById(empresaId: string, centroTrabajoId: string, centroTrabajo: CentroTrabajo) {
        try {
            loading.value = true;
            await CentrosTrabajoAPI.updateCentroTrabajoById(empresaId, centroTrabajoId, centroTrabajo);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function deleteCentroTrabajoById(empresaId: string, centroTrabajoId: string) {
        try {
            loading.value = true;
            await CentrosTrabajoAPI.deleteCentroTrabajoById(empresaId, centroTrabajoId);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        loadingModal,
        centrosTrabajo,
        currentCentroTrabajoId,
        currentCentroTrabajo,
        resetCurrentCentroTrabajo,
        fetchCentrosTrabajo,
        fetchCentroTrabajoById,
        createCentroTrabajo,
        updateCentroTrabajoById,
        deleteCentroTrabajoById
    }
})