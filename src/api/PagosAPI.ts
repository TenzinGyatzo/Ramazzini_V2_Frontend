import pagos from "@/lib/axiosPagos";

export default {
    createSubscription(subscrtiptionData: any) {
        return pagos.post(`crear-suscripcion/`, subscrtiptionData);
    },

    getSubscription(subscriptionId: string) {
        return pagos.get(`obtener-suscripcion/${subscriptionId}`);
    },

    deleteSubscription(subscriptionId: string) {
        return pagos.delete(`eliminar-suscripcion/${subscriptionId}`);
    }
};