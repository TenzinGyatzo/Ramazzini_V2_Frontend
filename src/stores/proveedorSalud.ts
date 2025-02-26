import { ref } from "vue";
import { defineStore } from "pinia";
import ProveedorSaludAPI from "@/api/ProveedorSaludAPI";

interface AddOn {
    tipo: string; // 'usuario_adicional', 'empresas_extra', u otros
    cantidad: number;
}

interface ProveedorSalud {
    _id: string;
    nombreComercial: string;
    razonSocial: string;
    RFC: string;
    logotipoEmpresa: {
        data: string;
        contentType: string;
    };
    direccion: string;
    ciudad: string;
    municipio: string;
    estado: string;
    codigoPostal: string;
    telefono: string;
    correoElectronico: string;
    sitioWeb: string;
    referenciaPlan: string;
    maxUsuariosPermitidos: number;
    maxEmpresasPermitidas: number;
    estadoSuscripcion: string;
    fechaInicioTrial: Date;
    periodoDePruebaFinalizado: boolean;
    addOns: AddOn[];
    mercadoPagoSubscriptionId: string;
    payerEmail: string;
}

// Define el store
export const useProveedorSaludStore = defineStore("proveedorSalud", () => {
    const loading = ref(true);
    const proveedorSalud = ref<ProveedorSalud | null>(null);

    async function loadProveedorSalud(idProveedorSalud: string) {
        try {
            loading.value = true;
            const { data } = await ProveedorSaludAPI.getProveedorById(idProveedorSalud);
            proveedorSalud.value = data;
            // console.log("Proveedor Salud desde Store", proveedorSalud.value);
            localStorage.setItem('proveedorSalud', JSON.stringify(proveedorSalud.value));
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
        } finally {
            loading.value = false;
        }
    }

    async function getProveedorById(idProveedorSalud: string) {
        try {
            loading.value = true;
            const { data } = await ProveedorSaludAPI.getProveedorById(idProveedorSalud);
            proveedorSalud.value = data;
            return data;
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
        } finally {
            loading.value = false;
        }
    }

    async function createProveedor(proveedorSaludData: ProveedorSalud) {
        try {
            loading.value = true;
            const { data } = await ProveedorSaludAPI.createProveedor(proveedorSaludData);
            proveedorSalud.value = data;
            // console.log("Proveedor Salud", proveedorSalud.value);
            return data
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function updateProveedorById(idProveedorSalud: string, proveedorSaludData: ProveedorSalud) {
        try {
            loading.value = true;
            const { data } = await ProveedorSaludAPI.updateProveedorById(idProveedorSalud, proveedorSaludData);
            proveedorSalud.value = data;
            // console.log("Proveedor Salud", proveedorSalud.value);
            return data;
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
        } finally {
            loading.value = false;
        }
    }

    async function removeProveedorById(idProveedorSalud: string) {
        try {
            loading.value = true;
            const resultado = await ProveedorSaludAPI.removeProveedorById(idProveedorSalud)
            return resultado.data
        } catch (error) {
            console.error("Error al eliminar el proveedor de salud")
        } finally {
            loading.value = false;
        }
    }

    async function verificarPeriodoDePrueba (idProveedorSalud: string) {
        try {
            // console.log("Store");
            loading.value = true;
            const resultado = await ProveedorSaludAPI.verificarPeriodoDePrueba(idProveedorSalud)
            return resultado.data
        } catch (error) {
            console.error("Error al verificar el periodo de prueba")
        } finally {
            loading.value = false;
        }
    }

    async function verificarFinSuscripcion (idProveedorSalud: string) {
        try {
            // console.log("Store");
            loading.value = true;
            const resultado = await ProveedorSaludAPI.verificarFinSuscripcion(idProveedorSalud)
            return resultado.data
        } catch (error) {
            console.error("Error al verificar el fin de la suscripción")
        } finally {
            loading.value = false;
        }
    }

    return {
        proveedorSalud,
        loading,
        loadProveedorSalud,
        getProveedorById,
        createProveedor,
        updateProveedorById,
        removeProveedorById,
        verificarPeriodoDePrueba,
        verificarFinSuscripcion
    };
});
