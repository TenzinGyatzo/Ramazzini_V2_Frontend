import pagos from "@/lib/axiosPagos";

export default {
    createSubscription(subscrtiptionData: any) {
        return pagos.post(`crear-suscripcion/`, subscrtiptionData);
    },

    deleteSubscription(subscriptionId: string) {
        return pagos.delete(`eliminar-suscripcion/${subscriptionId}`);
    }
};