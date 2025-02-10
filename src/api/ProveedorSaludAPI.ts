import proveedor from "@/lib/axiosProveedor";

export default {
    getProveedorById(proveedorId: string) {
        return proveedor.get(`obtener-proveedor-salud/${proveedorId}`);
    },

    updateProveedorById(proveedorId: string, proveedorData: any) {
        return proveedor.post(`actualizar-proveedor-salud/${proveedorId}`, proveedorData);
    },

    createProveedor(proveedorData: any) {
        return proveedor.post("crear-proveedor-salud", proveedorData);
    },

    removeProveedorById(proveedorId: string) {
        return proveedor.delete(`eliminar-proveedor-salud/${proveedorId}`)
    }
}
