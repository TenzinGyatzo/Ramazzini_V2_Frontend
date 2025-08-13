import { ref } from 'vue'
import { useModalResumenImportacionStore } from '@/stores/modalResumenImportacion'
import TrabajadoresAPI from '@/api/TrabajadoresAPI'
import type { ImportResumen } from '@/stores/modalResumenImportacion'

export const useImportacionTrabajadores = () => {
  const modalStore = useModalResumenImportacionStore()
  const isImporting = ref(false)
  const importProgress = ref(0)

  // Importar trabajadores desde Excel
  const importarTrabajadores = async (
    file: File,
    idCentroTrabajo: string,
    idEmpresa: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    try {
      isImporting.value = true
      importProgress.value = 0
      modalStore.showLoading()

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        if (importProgress.value < 90) {
          importProgress.value += Math.random() * 10
          onProgress?.(importProgress.value)
        }
      }, 200)

      // Crear FormData para la importación
      const formData = new FormData()
      formData.append('file', file)
      formData.append('idCentroTrabajo', idCentroTrabajo)
      
      // Obtener el ID del usuario actual (esto debería venir del contexto)
      const currentUserId = '6650f38308ac3beedf5ac41b' // TODO: Obtener dinámicamente
      formData.append('createdBy', currentUserId)
      formData.append('updatedBy', currentUserId)

      // Realizar la importación
      const response = await TrabajadoresAPI.importTrabajadores(idEmpresa, idCentroTrabajo, formData)
      
      clearInterval(progressInterval)
      importProgress.value = 100
      onProgress?.(100)

      // Crear resumen y mostrar modal
      const resumen = modalStore.createResumenFromResponse(response.data)
      
      modalStore.showModal(resumen)

    } catch (error: any) {
      console.error('[DEBUG] Error inesperado en la importación:', error)
      
      // ✅ SOLUCIÓN: Solo crear resumen de error para errores reales del sistema
      // No para errores de validación que ya vienen en la respuesta
      const errorResumen: ImportResumen = {
        message: 'Error inesperado en el sistema. Por favor, inténtalo de nuevo.',
        data: [],
        totalProcessed: 0,
        successful: 0,
        failed: 1
      }
      
      modalStore.showModal(errorResumen)
      
    } finally {
      isImporting.value = false
      modalStore.hideLoading()
    }
  }

  // Importar trabajadores desde datos JSON (para testing)
  const importarTrabajadoresDesdeDatos = async (
    data: any[],
    idCentroTrabajo: string,
    idEmpresa: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    try {
      isImporting.value = true
      importProgress.value = 0
      modalStore.showLoading()

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        if (importProgress.value < 90) {
          importProgress.value += Math.random() * 10
          onProgress?.(importProgress.value)
        }
      }, 200)

      // Crear FormData con los datos JSON
      const formData = new FormData()
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      formData.append('file', blob, 'data.json')
      formData.append('idCentroTrabajo', idCentroTrabajo)
      
      // Obtener el ID del usuario actual (esto debería venir del contexto)
      const currentUserId = '6650f38308ac3beedf5ac41b' // TODO: Obtener dinámicamente
      formData.append('createdBy', currentUserId)
      formData.append('updatedBy', currentUserId)

      // Realizar la importación
      const response = await TrabajadoresAPI.importTrabajadores(idEmpresa, idCentroTrabajo, formData)
      
      clearInterval(progressInterval)
      importProgress.value = 100
      onProgress?.(100)

      // Crear resumen y mostrar modal
      const resumen = modalStore.createResumenFromResponse(response.data)
      modalStore.showModal(resumen)

    } catch (error: any) {
      console.error('Error en la importación:', error)
      
      // Crear resumen de error
      const errorResumen: ImportResumen = {
        message: error.response?.data?.message || 'Error en la importación',
        data: [],
        totalProcessed: 0,
        successful: 0,
        failed: 1
      }
      
      modalStore.showModal(errorResumen)
      
    } finally {
      isImporting.value = false
      modalStore.hideLoading()
    }
  }

  // Cerrar el modal
  const cerrarModal = () => {
    modalStore.hideModal()
  }

  return {
    // Estado
    isImporting,
    importProgress,
    isModalVisible: modalStore.isVisible,
    resumen: modalStore.resumen,
    
    // Acciones
    importarTrabajadores,
    importarTrabajadoresDesdeDatos,
    cerrarModal
  }
}
