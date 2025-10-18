import auth from "@/lib/axiosAuth";

export default {
  updateUserPermissions(userId: string, permisos: any) {
    return auth.patch(`/users/permisos/${userId}`, permisos);
  },
  
  toggleAccountStatus(userId: string, cuentaActiva: boolean) {
    return auth.patch(`/users/estado-cuenta/${userId}`, { cuentaActiva });
  }
};
