import medicoFirmante from "@/lib/axiosMedicoFirmante";

export default {
    getMedicoFirmanteById(medicoFirmanteId: string) {
        return medicoFirmante.get(`obtener-medico/${medicoFirmanteId}`);
    },

    getMedicoFirmanteByUserId(idUsuario: string) {
        return medicoFirmante.get(`obtener-medico-por-usuario/${idUsuario}`);
    },

    updateMedicoFirmanteById(medicoFirmanteId: string, medicoFirmanteData: any) {
        return medicoFirmante.patch(`actualizar-medico/${medicoFirmanteId}`, medicoFirmanteData);
    },

    createMedicoFirmante(medicoFirmanteData: any) {
        return medicoFirmante.post("registrar-medico", medicoFirmanteData);
    },
}
