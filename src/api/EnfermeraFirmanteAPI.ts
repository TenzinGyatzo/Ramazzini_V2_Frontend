import enfermeraFirmante from "@/lib/axiosEnfermeraFirmante";

export default {
    getEnfermeraFirmanteById(enfermeraFirmanteId: string) {
        return enfermeraFirmante.get(`obtener-enfermera/${enfermeraFirmanteId}`);
    },

    getEnfermeraFirmanteByUserId(idUser: string) {
        return enfermeraFirmante.get(`obtener-enfermera-por-usuario/${idUser}`);
    },

    updateEnfermeraFirmanteById(enfermeraFirmanteId: string, enfermeraFirmanteData: any) {
        return enfermeraFirmante.patch(`actualizar-enfermera/${enfermeraFirmanteId}`, enfermeraFirmanteData);
    },

    createEnfermeraFirmante(enfermeraFirmanteData: any) {
        return enfermeraFirmante.post("registrar-enfermera", enfermeraFirmanteData);
    },
}
