import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { informePersonalizacionService } from '@/api/informe-personalizacion.service';
import type { 
  InformePersonalizacion, 
  CreateInformePersonalizacionDto, 
  UpdateInformePersonalizacionDto 
} from '@/interfaces/informe-personalizacion.interface';

export const useInformePersonalizacionStore = defineStore('informePersonalizacion', () => {
  // Estado
  const personalizaciones = ref<InformePersonalizacion[]>([]);
  const currentPersonalizacion = ref<InformePersonalizacion | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getPersonalizacionByEmpresa = computed(() => {
    return (idEmpresa: string) => 
      personalizaciones.value.find(p => p.idEmpresa === idEmpresa);
  });

  const getPersonalizacionByEmpresaAndCentro = computed(() => {
    return (idEmpresa: string, idCentroTrabajo?: string) => {
      if (!idCentroTrabajo) {
        return personalizaciones.value.find(p => 
          p.idEmpresa === idEmpresa && !p.idCentroTrabajo
        );
      }
      return personalizaciones.value.find(p => 
        p.idEmpresa === idEmpresa && p.idCentroTrabajo === idCentroTrabajo
      );
    };
  });

  // Actions
  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const loadPersonalizacionesByEmpresa = async (idEmpresa: string) => {
    try {
      setLoading(true);
      clearError();
      const data = await informePersonalizacionService.findByEmpresa(idEmpresa);
      personalizaciones.value = data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar personalizaciones');
      console.error('Error loading personalizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalizacionByEmpresaAndCentro = async (
    idEmpresa: string, 
    idCentroTrabajo?: string
  ) => {
    try {
      setLoading(true);
      clearError();
      
      let data: InformePersonalizacion | null = null;
      
      if (idCentroTrabajo) {
        data = await informePersonalizacionService.findByEmpresaAndCentro(
          idEmpresa, 
          idCentroTrabajo
        );
      } else {
        data = await informePersonalizacionService.findByEmpresaOnly(idEmpresa);
      }
      
      currentPersonalizacion.value = data;
      
      // Actualizar también en el array de personalizaciones
      if (data) {
        const existingIndex = personalizaciones.value.findIndex(p => 
          p.idEmpresa === idEmpresa && p.idCentroTrabajo === idCentroTrabajo
        );
        
        if (existingIndex >= 0) {
          personalizaciones.value[existingIndex] = data;
        } else {
          personalizaciones.value.push(data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar personalización');
      console.error('Error loading personalizacion:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPersonalizacion = async (data: CreateInformePersonalizacionDto) => {
    try {
      setLoading(true);
      clearError();
      const newPersonalizacion = await informePersonalizacionService.create(data);
      personalizaciones.value.push(newPersonalizacion);
      currentPersonalizacion.value = newPersonalizacion;
      return newPersonalizacion;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear personalización');
      console.error('Error creating personalizacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalizacion = async (
    id: string, 
    data: UpdateInformePersonalizacionDto
  ) => {
    try {
      setLoading(true);
      clearError();
      const updatedPersonalizacion = await informePersonalizacionService.update(id, data);
      
      // Actualizar en el array
      const index = personalizaciones.value.findIndex(p => p._id === id);
      if (index >= 0) {
        personalizaciones.value[index] = updatedPersonalizacion;
      }
      
      // Actualizar currentPersonalizacion si es la misma
      if (currentPersonalizacion.value?._id === id) {
        currentPersonalizacion.value = updatedPersonalizacion;
      }
      
      return updatedPersonalizacion;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar personalización');
      console.error('Error updating personalizacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upsertPersonalizacion = async (
    idEmpresa: string,
    idCentroTrabajo: string | undefined,
    data: UpdateInformePersonalizacionDto
  ) => {
    try {
      setLoading(true);
      clearError();
      
      let updatedPersonalizacion: InformePersonalizacion;
      
      if (idCentroTrabajo) {
        updatedPersonalizacion = await informePersonalizacionService.upsertByEmpresaAndCentro(
          idEmpresa,
          idCentroTrabajo,
          data
        );
      } else {
        updatedPersonalizacion = await informePersonalizacionService.upsertByEmpresa(
          idEmpresa,
          data
        );
      }
      
      // Actualizar en el array
      const existingIndex = personalizaciones.value.findIndex(p => 
        p.idEmpresa === idEmpresa && p.idCentroTrabajo === idCentroTrabajo
      );
      
      if (existingIndex >= 0) {
        personalizaciones.value[existingIndex] = updatedPersonalizacion;
      } else {
        personalizaciones.value.push(updatedPersonalizacion);
      }
      
      currentPersonalizacion.value = updatedPersonalizacion;
      return updatedPersonalizacion;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar personalización');
      console.error('Error upserting personalizacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePersonalizacion = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await informePersonalizacionService.delete(id);
      
      // Remover del array
      personalizaciones.value = personalizaciones.value.filter(p => p._id !== id);
      
      // Limpiar currentPersonalizacion si es la misma
      if (currentPersonalizacion.value?._id === id) {
        currentPersonalizacion.value = null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar personalización');
      console.error('Error deleting personalizacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentPersonalizacion = () => {
    currentPersonalizacion.value = null;
  };

  const clearAll = () => {
    personalizaciones.value = [];
    currentPersonalizacion.value = null;
    error.value = null;
    loading.value = false;
  };

  return {
    // Estado
    personalizaciones,
    currentPersonalizacion,
    loading,
    error,
    
    // Getters
    getPersonalizacionByEmpresa,
    getPersonalizacionByEmpresaAndCentro,
    
    // Actions
    loadPersonalizacionesByEmpresa,
    loadPersonalizacionByEmpresaAndCentro,
    createPersonalizacion,
    updatePersonalizacion,
    upsertPersonalizacion,
    deletePersonalizacion,
    clearCurrentPersonalizacion,
    clearAll,
    setError,
    clearError,
  };
});
