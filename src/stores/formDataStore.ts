import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFormDataStore = defineStore('formData', () => {
  const formDataAntidoping = ref({}); // Estado compartido
  const formDataAptitud = ref({}); // Estado compartido
  const formDataCertificado = ref({}); // Estado compartido
  const formDataDocumentoExterno = ref({}); // Estado compartido
  const formDataExamenVista = ref({}); // Estado compartido
  const formDataExploracionFisica = ref({}); // Estado compartido
  const formDataHistoriaClinica = ref({}); // Estado compartido
  const formDataNotaMedica = ref({}); // Estado compartido
  const formDataControlPrenatal = ref({}); // Estado compartido

  const setFormDataFromDocument = (documento, tipoDocumento) => {
    if (!documento) {
      console.error('Documento es nulo o indefinido:', documento);
      return;
    }

    switch (tipoDocumento) {
      case 'antidoping':
        formDataAntidoping.value = { ...documento };
        break;
      case 'aptitud':
        formDataAptitud.value = { ...documento };
        break;
      case 'certificado':
        formDataCertificado.value = { ...documento };
        break;
      case 'documentoExterno':
        formDataDocumentoExterno.value = { ...documento };
        break;
      case 'examenVista':
        formDataExamenVista.value = { ...documento };
        break;
      case 'exploracionFisica':
        formDataExploracionFisica.value = { ...documento };
        break;
      case 'historiaClinica':
        formDataHistoriaClinica.value = { ...documento };
        break;
      case 'notaMedica':
        formDataNotaMedica.value = { ...documento };
        break;
      case 'controlPrenatal':
        formDataControlPrenatal.value = { ...documento };
        break;
      default:
        console.error('Tipo de documento no reconocido:', tipoDocumento);
        break;
    }
  };  

  const resetFormData = () => {
    // Reiniciar el estado directamente asignando un objeto vacío.
    formDataAntidoping.value = {};
    formDataAptitud.value = {};
    formDataCertificado.value = {};
    formDataDocumentoExterno.value = {};
    formDataExamenVista.value = {};
    formDataExploracionFisica.value = {};
    formDataHistoriaClinica.value = {};
    formDataNotaMedica.value = {};
    formDataControlPrenatal.value = {};
  };

  return { 
    formDataAntidoping,
    formDataAptitud,
    formDataCertificado,
    formDataDocumentoExterno,
    formDataExamenVista,
    formDataExploracionFisica,
    formDataHistoriaClinica, 
    formDataNotaMedica,
    formDataControlPrenatal,
    setFormDataFromDocument,
    resetFormData 
  };
});
