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
}

export const useCentrosTrabajoStore = defineStore('centros-trabajo', () => {

    const centrosTrabajo = ref<CentroTrabajo[]>([]);
    const loading = ref(true);

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

    return {
        centrosTrabajo,
        loading,
        fetchCentrosTrabajo
    }
})