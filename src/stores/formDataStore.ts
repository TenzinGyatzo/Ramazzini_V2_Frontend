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

  const setFormDataFromDocument = (documento, tipoDocumento) => {
    if (!documento) {
      console.error('Documento es nulo o indefinido:', documento);
      return;
    }
    console.log('Seteando datos en formDataStore:', { documento, tipoDocumento });

    switch (tipoDocumento) {
      case 'antidoping':
        formDataAntidoping.value = { ...documento };
        console.log('Datos cargados en formDataAntidoping:', formDataAntidoping.value);
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
      default:
        console.error('Tipo de documento no reconocido:', tipoDocumento);
        break;
    }
    console.log('Estado actualizado en formDataStore:', {
      tipoDocumento,
      formData: formDataAntidoping.value,
    });
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
  };

  return { 
    formDataAntidoping,
    formDataAptitud,
    formDataCertificado,
    formDataDocumentoExterno,
    formDataExamenVista,
    formDataExploracionFisica,
    formDataHistoriaClinica, 
    setFormDataFromDocument,
    resetFormData 
  };
});
