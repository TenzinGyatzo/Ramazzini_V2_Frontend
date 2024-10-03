import { defineStore } from 'pinia'
import { ref } from 'vue'
import TrabajadoresAPI from '../api/TrabajadoresAPI'

interface Trabajador {
    _id: string
    nombre: string
    fechaNacimiento: Date
    sexo: string
    escolaridad: string
    puesto: string
    fechaIngreso: Date
    telefono: string
    estadoCivil: string
    hijos: number
    idCentroTrabajo: string
    createdBy: string
    updatedBy: string
}

export const useTrabajadoresStore = defineStore('trabajadores', () => {

    const trabajadores = ref<Trabajador[]>([])
    const loading = ref(true)

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

    return { trabajadores, loading, fetchTrabajadores }
})