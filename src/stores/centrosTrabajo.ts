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
            loadingModal.value = true;
        }
    }

    async function createCentroTrabajo(centroTrabajo) {
        try {
            loading.value = true;
            console.log('Creating centro:', centroTrabajo);
            // await EmpresasAPI.createEmpresa(empresa);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function updateCentroTrabajoById(id: string, centroTrabajo) {
        try {
            loading.value = true;
            console.log('Updating empresa:', id, centroTrabajo);
            // await EmpresasAPI.updateEmpresaById(id, empresa);
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
        updateCentroTrabajoById
    }
})