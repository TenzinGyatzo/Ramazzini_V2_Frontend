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
  logotipoEmpresa?: {
    data: string;
    contentType: string;
  };
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const useEmpresasStore = defineStore("empresas", () => {
  const loading = ref(true);
  const loadingModal = ref(false);
  const empresas = ref<Empresa[]>([]);
  const currentEmpresaId = ref<string | null>(null);
  const currentEmpresa = ref<Empresa | null>(null);

  function resetCurrentEmpresa() {
    currentEmpresa.value = {
      _id: "",
      nombreComercial: "",
      razonSocial: "",
      RFC: "",
      giroDeEmpresa: "",
      baseOperaciones: "",
      logotipoEmpresa: { data: "", contentType: "" },
      createdBy: "",
      updatedBy: "",
      createdAt: "",
      updatedAt: "",
    };
    currentEmpresaId.value = null;
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
      loadingModal.value = true; // Indicamos que se está cargando
      const { data } = await EmpresasAPI.getEmpresaById(id);
      currentEmpresa.value = data; // Guardamos los datos de la empresa en el store
    } catch (error) {
      console.error("Error al cargar la empresa:", error);
    } finally {
      loadingModal.value = false; // Nos aseguramos de que loading sea false cuando termina la petición
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

  async function updateEmpresaById(id: string, empresa: FormData) {
    try {
      loading.value = true;
      await EmpresasAPI.updateEmpresaById(id, empresa);
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
    loadingModal,
    empresas,
    currentEmpresaId,
    currentEmpresa,
    resetCurrentEmpresa,
    fetchEmpresas,
    fetchEmpresaById,
    createEmpresa,
    updateEmpresaById,
    deleteEmpresaById,
  };
});
