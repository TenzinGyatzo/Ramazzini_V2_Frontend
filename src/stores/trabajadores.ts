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
    const loadingModal = ref(false)
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
            loadingModal.value = true
            const { data } = await TrabajadoresAPI.getTrabajadorById(empresaId, centroTrabajoId, trabajadorId)
            currentTrabajador.value = data
        } catch (error) {
            console.log(error)
        } finally {
            loadingModal.value = false
        }
    }

    async function createTrabajador(empresaId: string, centroTrabajoId: string, trabajadorData: Trabajador) {
        try {
            loading.value = true
            await TrabajadoresAPI.createTrabajador(empresaId, centroTrabajoId, trabajadorData)
        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    async function updateTrabajador(empresaId: string, centroTrabajoId: string, trabajadorId: string, trabajadorData: Trabajador) {
        try {
            loading.value = true
            await TrabajadoresAPI.updateTrabajador(empresaId, centroTrabajoId, trabajadorId, trabajadorData)
        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    return { 
        loading, 
        loadingModal,
        trabajadores,
        currentTrabajadorId,
        currentTrabajador,
        resetCurrentTrabajador, 
        fetchTrabajadores,
        fetchTrabajadorById,
        createTrabajador,
        updateTrabajador
    }
})