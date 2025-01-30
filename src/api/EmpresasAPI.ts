import api from "@/lib/axios";

export default {
  getEmpresas(idProveedorSalud: string) { 
    return api.get(`/empresas/${idProveedorSalud}`);
  },

  getEmpresaById(empresaId: string) {
    return api.get(`/${empresaId}`);
  },

  createEmpresa(empresaData) {
    return api.post("/crear-empresa", empresaData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateEmpresaById(empresaId: string, empresaData) {
    return api.patch(`/actualizar-empresa/${empresaId}`, empresaData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteEmpresaById(empresaId: string) {
    return api.delete(`/eliminar-empresa/${empresaId}`);
  },
};
