import proveedor from "@/lib/axiosProveedor";

export default {
    getProveedorById(proveedorId: string) {
        return proveedor.get(`obtener-proveedor-salud/${proveedorId}`);
    },

    updateProveedorById(proveedorId: string, proveedorData: any) {
        return proveedor.patch(`actualizar-proveedor-salud/${proveedorId}`, proveedorData);
    },

    createProveedor(proveedorData: any) {
        return proveedor.post("crear-proveedor-salud", proveedorData);
    },
}
