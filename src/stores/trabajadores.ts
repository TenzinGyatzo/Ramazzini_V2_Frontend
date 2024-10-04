import { defineStore } from 'pinia'
import { ref } from 'vue'
import TrabajadoresAPI from '../api/TrabajadoresAPI'

interface Trabajador {
    _id?: string
    nombre?: string
    fechaNacimiento?: Date
    sexo?: string
    escolaridad?: string
    puesto?: string
    fechaIngreso?: Date
    telefono?: string
    estadoCivil?: string
    hijos?: number
    idCentroTrabajo?: string
    createdBy?: string
    updatedBy?: string
}

export const useTrabajadoresStore = defineStore('trabajadores', () => {

    const loading = ref(true)
    const trabajadores = ref<Trabajador[]>([])
    const currentTrabajadorId = ref<string>()
    const currentTrabajador = ref<Trabajador>()

    async function fetchTrabajadores(empresaId: string, centroTrabajoId: string) {
        try {
            loading.value = true
            const { data } = await TrabajadoresAPI.getTrabajadores(empresaId, centroTrabajoId)
            trabajadores.value = data
        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    async function fetchTrabajadorById(empresaId: string, centroTrabajoId: string, trabajadorId: string) {
        try {
            loading.value = true
            const { data } = await TrabajadoresAPI.getTrabajadorById(empresaId, centroTrabajoId, trabajadorId)
            currentTrabajador.value = data
        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    return { 
        loading, 
        trabajadores,
        currentTrabajadorId,
        currentTrabajador, 
        fetchTrabajadores,
        fetchTrabajadorById
    }
})