import { defineStore } from 'pinia'
import { ref } from 'vue'
import TrabajadoresAPI from '../api/TrabajadoresAPI'

interface Trabajador {
    _id: string
    nombre: string
    fechaNacimiento: string
    sexo: string
    escolaridad: string
    puesto: string
    fechaIngreso: string
    telefono: string
    estadoCivil: string
    hijos: number
    idCentroTrabajo: string
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
}

export const useTrabajadoresStore = defineStore('trabajadores', () => {

    const loading = ref(true)
    const trabajadores = ref<Trabajador[]>([])
    const currentTrabajadorId = ref<string>()
    const currentTrabajador = ref<Trabajador>()

    function resetCurrentTrabajador() {
        currentTrabajador.value = {
            _id: '',
            nombre: '',
            fechaNacimiento: '',
            sexo: '',
            escolaridad: '',
            puesto: '',
            fechaIngreso: '',
            telefono: '',
            estadoCivil: '',
            hijos: 0,
            idCentroTrabajo: '',
            createdBy: '',
            updatedBy: '',
            createdAt: '',
            updatedAt: ''
          };
    }

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
        resetCurrentTrabajador, 
        fetchTrabajadores,
        fetchTrabajadorById
    }
})