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
    resetFormData 
  };
});
