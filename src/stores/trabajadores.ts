import { defineStore } from "pinia";
import { ref } from "vue";
import TrabajadoresAPI from "../api/TrabajadoresAPI";

interface Trabajador {
  _id: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: string;
  escolaridad: string;
  puesto: string;
  fechaIngreso: string;
  telefono: string;
  estadoCivil: string;
  hijos: number;
  idCentroTrabajo: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const useTrabajadoresStore = defineStore("trabajadores", () => {
  const loading = ref(true);
  const loadingOnSidebar = ref(false);
  const loadingModal = ref(false);
  const trabajadores = ref<Trabajador[]>([]);
  const currentTrabajadorId = ref<string>();
  const currentTrabajador = ref<Trabajador>();

  function resetCurrentTrabajador() {
    currentTrabajador.value = {
      _id: "",
      nombre: "",
      fechaNacimiento: "",
      sexo: "",
      escolaridad: "",
      puesto: "",
      fechaIngreso: "",
      telefono: "",
      estadoCivil: "",
      hijos: 0,
      idCentroTrabajo: "",
      createdBy: "",
      updatedBy: "",
      createdAt: "",
      updatedAt: "",
    };
    currentTrabajadorId.value = "";
  }

  async function fetchTrabajadores(empresaId: string, centroTrabajoId: string) {
    try {
      loading.value = true;
      const { data } = await TrabajadoresAPI.getTrabajadores(
        empresaId,
        centroTrabajoId
      );
      trabajadores.value = data;
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTrabajadorById(
    empresaId: string,
    centroTrabajoId: string,
    trabajadorId: string
  ) {
    try {
      loadingOnSidebar.value = true;
      loadingModal.value = true;
      const { data } = await TrabajadoresAPI.getTrabajadorById(
        empresaId,
        centroTrabajoId,
        trabajadorId
      );
      currentTrabajador.value = data;
      currentTrabajadorId.value = trabajadorId;
    } catch (error) {
      console.log(error);
    } finally {
      loadingOnSidebar.value = false;
      loadingModal.value = false;
    }
  }

  async function createTrabajador(
    empresaId: string,
    centroTrabajoId: string,
    trabajadorData: Trabajador
  ) {
    try {
      loading.value = true;
      await TrabajadoresAPI.createTrabajador(
        empresaId,
        centroTrabajoId,
        trabajadorData
      );
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateTrabajador(
    empresaId: string,
    centroTrabajoId: string,
    trabajadorId: string,
    trabajadorData: Trabajador
  ) {
    try {
      loading.value = true;
      await TrabajadoresAPI.updateTrabajador(
        empresaId,
        centroTrabajoId,
        trabajadorId,
        trabajadorData
      );
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function importTrabajadores(
    empresaId: string,
    centroTrabajoId: string,
    formData: FormData
  ) {
    try {
      loading.value = true;
      const response = await TrabajadoresAPI.importTrabajadores(
        empresaId,
        centroTrabajoId,
        formData
      );
      return response;
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTrabajadorById(
    empresaId: string,
    centroTrabajoId: string,
    trabajadorId: string
  ) {
    try {
      loading.value = true;
      await TrabajadoresAPI.deleteTrabajadorById(
        empresaId,
        centroTrabajoId,
        trabajadorId
      );
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function exportTrabajadores(
    empresaId: string,
    centroTrabajoId: string
  ) {
    try {
      const response = await TrabajadoresAPI.exportTrabajadores(
        empresaId,
        centroTrabajoId
      );

      // Crear una URL para el archivo Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "trabajadores.xlsx"); // nombre del archivo
      document.body.appendChild(link);
      link.click();

      // Limpiar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar los trabajadores", error);
      throw error;
    }
  }

  return {
    loading,
    loadingOnSidebar,
    loadingModal,
    trabajadores,
    currentTrabajadorId,
    currentTrabajador,
    resetCurrentTrabajador,
    fetchTrabajadores,
    fetchTrabajadorById,
    createTrabajador,
    updateTrabajador,
    importTrabajadores,
    deleteTrabajadorById,
    exportTrabajadores,
  };
});
