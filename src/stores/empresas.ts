import { defineStore } from "pinia";
import { ref } from "vue";
import EmpresasAPI from "../api/EmpresasAPI";

interface Empresa {
    _id?: string;
    nombreComercial?: string;
    razonSocial?: string;
    RFC?: string;
    giroDeEmpresa?: string;
    baseOperaciones?: string;
    logotipo?: string;
    createdBy?: string;
    updatedBy?: string;
}

export const useEmpresasStore = defineStore("empresas", () => {

    const loading = ref(true);
    const empresas = ref<Empresa[]>([]);
    const currentEmpresaId = ref<string>();
    const currentEmpresa = ref<Empresa>();

    async function fetchEmpresas() {
        try {
            loading.value = true;
            const { data } = await EmpresasAPI.getEmpresas();
            empresas.value = data;
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchEmpresaById(id: string) {
        try {
            loading.value = true;
            const { data } = await EmpresasAPI.getEmpresaById(id);
            currentEmpresa.value = data;
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        empresas,
        currentEmpresaId,
        currentEmpresa,
        fetchEmpresas,
        fetchEmpresaById
    }
})