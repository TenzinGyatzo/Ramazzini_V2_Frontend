import { convertirFechaISOaDDMMYYYY } from './dates';

export const obtenerRutaDocumento = (documento, tipoDocumento) => {
    if (tipoDocumento === 'Documento Externo') {
        return documento.rutaDocumento || null;
    }
    return documento.rutaPDF || null;
};

export const obtenerNombreArchivo = (documento, tipoDocumento, fecha) => {
    if (tipoDocumento === 'Documento Externo') {
        return `${documento.nombreDocumento || 'Documento'} ${fecha}${documento.extension}`;
    }
    return `${tipoDocumento} ${fecha}.pdf`;
};

export const obtenerFechaDocumento = (documento) => {
    const camposFecha = [
        'fechaAntidoping',
        'fechaAptitudPuesto',
        'fechaCertificado',
        'fechaExamenVista',
        'fechaExploracionFisica',
        'fechaHistoriaClinica',
        'fechaDocumento',
    ];

    for (const campo of camposFecha) {
        if (documento[campo]) {
            return convertirFechaISOaDDMMYYYY(documento[campo]);
        }
    }
    return null;
};