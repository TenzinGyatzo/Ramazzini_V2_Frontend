import { ref } from "vue";
import { defineStore } from "pinia";
import ProveedorSaludAPI from "@/api/ProveedorSaludAPI";

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
            console.log("Proveedor Salud", proveedorSalud.value);
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
        } finally {
            loading.value = false;
        }
    }

    async function updateProveedorById(idProveedorSalud: string, proveedorSaludData: ProveedorSalud) {
        try {
            loading.value = true;
            const { data } = await ProveedorSaludAPI.updateProveedorById(idProveedorSalud, proveedorSaludData);
            proveedorSalud.value = data;
            console.log("Proveedor Salud", proveedorSalud.value);
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
        } catch (error) {
            console.error("Error al cargar proveedor de salud:", error);
        } finally {
            loading.value = false;
        }
    }

    return {
        proveedorSalud,
        loading,
        loadProveedorSalud,
        updateProveedorById,
        createProveedor,
    };
});
