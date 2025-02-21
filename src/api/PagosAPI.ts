import pagos from "@/lib/axiosPagos";

export default {
    createSubscription(subscrtiptionData: any) {
        return pagos.post(`crear-suscripcion/`, subscrtiptionData);
    },

    getSubscriptionFromAPI(subscriptionId: string) {
        return pagos.get(`obtener-suscripcion-api/${subscriptionId}`);
    },

    getSubscriptionFromDB(subscriptionId: string) {
        return pagos.get(`obtener-suscripcion-db/${subscriptionId}`);
    },

    deleteSubscription(subscriptionId: string) {
        return pagos.delete(`eliminar-suscripcion/${subscriptionId}`);
    }
};