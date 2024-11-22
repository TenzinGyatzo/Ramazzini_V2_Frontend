import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useFormDataStore = defineStore('formData', () => {
  const formData = reactive({}); // Estado compartido

  const updateFormData = (data) => {
    Object.assign(formData, data); // Actualiza los datos
  };

  return { formData, updateFormData };
});
