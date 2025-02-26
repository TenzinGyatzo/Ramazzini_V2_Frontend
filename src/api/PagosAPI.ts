import pagos from "@/lib/axiosPagos";

export default {
    createSubscription(subscrtiptionData: any) {
        return pagos.post(`crear-suscripcion/`, subscrtiptionData);
    },

    updateSubscription(subscriptionId: string, subscriptionData: any) {
        return pagos.put(`actualizar-suscripcion/${subscriptionId}`, subscriptionData);
    },

    getSubscriptionFromAPI(subscriptionId: string) {
        return pagos.get(`obtener-suscripcion-api/${subscriptionId}`);
    },

    getSubscriptionFromDB(subscriptionId: string) {
        return pagos.get(`obtener-suscripcion-db/${subscriptionId}`);
    },

    cancelSubscription(subscriptionId: string) {
        return pagos.put(`cancelar-suscripcion/${subscriptionId}`);
    }
};