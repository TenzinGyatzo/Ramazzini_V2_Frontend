import tecnicoFirmante from "@/lib/axiosTecnicoFirmante";

export default {
  getTecnicoFirmanteById(id: string) {
    return tecnicoFirmante.get(`obtener-tecnico/${id}`);
  },

  getTecnicoFirmanteByUserId(idUser: string) {
    return tecnicoFirmante.get(`obtener-tecnico-por-usuario/${idUser}`);
  },

  updateTecnicoFirmanteById(id: string, data: any) {
    return tecnicoFirmante.patch(`actualizar-tecnico/${id}`, data);
  },

  createTecnicoFirmante(data: any) {
    return tecnicoFirmante.post("registrar-tecnico", data);
  },
};


