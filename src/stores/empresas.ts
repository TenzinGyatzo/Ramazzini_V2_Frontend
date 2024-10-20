import { defineStore } from "pinia";
import { ref } from "vue";
import EmpresasAPI from "../api/EmpresasAPI";

interface Empresa {
    _id: string;
    nombreComercial: string;
    razonSocial: string;
    RFC: string;
    giroDeEmpresa: string;
    baseOperaciones: string;
    logotipo: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export const useEmpresasStore = defineStore("empresas", () => {

    const loading = ref(true);
    const empresas = ref<Empresa[]>([]);
    const currentEmpresaId = ref<string>();
    const currentEmpresa = ref<Empresa>();

    function resetCurrentEmpresa() {
        currentEmpresa.value = {
            _id: '',
            nombreComercial: '',
            razonSocial: '',
            RFC: '',
            giroDeEmpresa: '',
            baseOperaciones: '',
            logotipo: '',
            createdBy: '',
            updatedBy: '',
            createdAt: '',
            updatedAt: ''
        };
    }

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

    async function createEmpresa(empresa: FormData) {
        try {
            loading.value = true;
            await EmpresasAPI.createEmpresa(empresa);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }

    async function deleteEmpresaById(id: string) {
        try {
            loading.value = true;
            await EmpresasAPI.deleteEmpresaById(id);
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
        resetCurrentEmpresa,
        fetchEmpresas,
        fetchEmpresaById,
        createEmpresa,
        deleteEmpresaById
    }
})