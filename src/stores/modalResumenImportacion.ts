import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ImportResult {
  success: boolean
  worker?: any
  error?: string
  validationErrors?: string[]
  // Campos adicionales para normalizaciones
  sexoOriginal?: string
  escolaridadOriginal?: string
  estadoCivilOriginal?: string
  // ✅ ELIMINADO: No se maneja estado laboral en importaciones
  telefonoOriginal?: string
}

export interface ImportResumen {
  message: string
  data: ImportResult[]
  totalProcessed: number
  successful: number
  failed: number
}

export const useModalResumenImportacionStore = defineStore('modalResumenImportacion', () => {
  // Estado del modal
  const isVisible = ref(false)
  const resumen = ref<ImportResumen | null>(null)
  const isLoading = ref(false)

  // Mostrar el modal con el resumen
  const showModal = (resumenData: ImportResumen) => {
    resumen.value = resumenData
    isVisible.value = true
  }

  // Ocultar el modal
  const hideModal = () => {
    isVisible.value = false
    resumen.value = null
  }

  // Mostrar estado de carga
  const showLoading = () => {
    isLoading.value = true
  }

  // Ocultar estado de carga
  const hideLoading = () => {
    isLoading.value = false
  }

  // Crear resumen desde la respuesta del backend
  const createResumenFromResponse = (response: any): ImportResumen => {
    
    // ✅ SOLUCIÓN: Si la respuesta ya tiene el formato correcto, usarla directamente
    if (response.totalProcessed !== undefined && response.successful !== undefined && response.failed !== undefined) {
      return response
    }

    // ✅ SOLUCIÓN: Si la respuesta tiene un array de resultados (exitosos + fallidos)
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      
      // Verificar si los elementos tienen la estructura de ImportResult
      const firstItem = response.data[0]
      
      if (firstItem && typeof firstItem === 'object') {
        // Si tiene la estructura de ImportResult (success, worker, error)
        if ('success' in firstItem) {
          const successful = response.data.filter((r: ImportResult) => r.success).length
          const failed = response.data.filter((r: ImportResult) => !r.success).length
          
          const resumen = {
            message: response.message || 'Importación completada',
            data: response.data,
            totalProcessed: successful + failed,
            successful,
            failed
          }
          return resumen
        } else {
          // Si son trabajadores directos (importación exitosa sin errores)
          const resumen = {
            message: response.message || 'Trabajadores importados exitosamente',
            data: response.data.map((worker: any) => ({
              success: true,
              worker: worker
            })),
            totalProcessed: response.data.length,
            successful: response.data.length,
            failed: 0
          }
          return resumen
        }
      } else {
      }
    } else {
    }

    // ✅ SOLUCIÓN: Si es una respuesta de error o no tiene el formato esperado 
    return {
      message: response.message || 'Importación completada',
      data: [],
      totalProcessed: 0,
      successful: 0,
      failed: 0
    }
  }

  // ✅ FUNCIÓN DE PRUEBA: Crear resumen mixto para testing
  const createTestResumen = (): ImportResumen => {
    return {
      message: 'Importación completada con algunos errores',
      data: [
        {
          success: true,
          worker: {
            nombre: 'Juan Pérez',
            fechaNacimiento: '1990-01-01',
            fechaIngreso: '2020-01-01',
            sexo: 'Masculino',
            escolaridad: 'Universidad',
            puesto: 'Desarrollador',
            estadoCivil: 'Soltero',
            numeroEmpleado: '001',
            telefono: '6681702850'
          }
        },
        {
          success: true,
          worker: {
            nombre: 'María García',
            fechaNacimiento: '1985-05-15',
            fechaIngreso: '2019-03-01',
            sexo: 'Femenino',
            escolaridad: 'Universidad',
            puesto: 'Diseñadora',
            estadoCivil: 'Casada',
            numeroEmpleado: '002',
            telefono: '668 170 28 50'
          }
        },
        {
          success: false,
          worker: {
            nombre: 'Carlos López',
            fechaNacimiento: '2010-12-20', // ✅ PRUEBA: Menor de 15 años
            fechaIngreso: '2021-06-01',
            sexo: 'Masculino',
            escolaridad: 'Primaria',
            puesto: 'Auxiliar',
            estadoCivil: 'Soltero',
            numeroEmpleado: '003',
            telefono: '668170285'
          },
          error: 'La edad mínima para laborar es 15 años. El trabajador tiene 13 años',
          validationErrors: ['La edad mínima para laborar es 15 años. El trabajador tiene 13 años']
        },
        {
          success: false,
          worker: {
            nombre: 'Ana Martínez',
            fechaNacimiento: '2030-06-15', // ✅ PRUEBA: Fecha futura
            fechaIngreso: '2021-01-01',
            sexo: 'Femenino',
            escolaridad: 'Secundaria',
            puesto: 'Secretaria',
            estadoCivil: 'Soltera',
            numeroEmpleado: '004',
            telefono: '66817028501' // ✅ PRUEBA: Más de 10 dígitos
          },
          error: 'La fecha de nacimiento no puede ser en el futuro',
          validationErrors: ['La fecha de nacimiento no puede ser en el futuro']
        },
        {
          success: false,
          worker: {
            nombre: 'Roberto Silva',
            fechaNacimiento: '1995-08-10',
            fechaIngreso: '2020-03-15',
            sexo: 'Masculino',
            escolaridad: 'Preparatoria',
            puesto: 'Vendedor',
            estadoCivil: 'Soltero',
            numeroEmpleado: '005',
            telefono: '668170285' // ✅ PRUEBA: Menos de 10 dígitos
          },
          error: 'El teléfono debe tener exactamente 10 dígitos. Recibido: 9 dígitos',
          validationErrors: ['El teléfono debe tener exactamente 10 dígitos. Recibido: 9 dígitos']
        }
      ],
      totalProcessed: 5,
      successful: 2,
      failed: 3
    }
  }

  return {
    // Estado
    isVisible,
    resumen,
    isLoading,
    
    // Acciones
    showModal,
    hideModal,
    showLoading,
    hideLoading,
    createResumenFromResponse,
    createTestResumen
  }
})
