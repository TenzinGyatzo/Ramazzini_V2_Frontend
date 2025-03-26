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
    },

    verificarPeriodoDePrueba(proveedorId: string) {
        return proveedor.get(`verificar-periodo-prueba/${proveedorId}`);
    },

    verificarFinSuscripcion(proveedorId: string) {
        return proveedor.get(`verificar-fin-suscripcion/${proveedorId}`);
    },

    getTopEmpresasByWorkers(proveedorId: string) {
    return proveedor.get(`/top-empresas-por-trabajadores/${proveedorId}`);
    },

    getHistoriasClinicasDelMes(proveedorId: string) {
        return proveedor.get(`/historias-clinicas-del-mes/${proveedorId}`);
    },

    getNotasMedicasDelMes(proveedorId: string) {
        return proveedor.get(`/notas-medicas-del-mes/${proveedorId}`);
    },

    getAllProveedores() {
        return proveedor.get("/obtener-proveedores-salud");
    }
}
