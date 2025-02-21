import { defineStore } from "pinia";
import PagosAPI from "@/api/PagosAPI";

export const usePagosStore = defineStore("pagos", () => {

    async function createSubscription(subscrtiptionData) {
        try {
            const { data } = await PagosAPI.createSubscription(subscrtiptionData);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async function getSubscriptionFromAPI(subscriptionId) {
        try {
            const { data } = await PagosAPI.getSubscriptionFromAPI(subscriptionId);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async function getSubscriptionFromDB(subscriptionId) {
        try {
            const { data } = await PagosAPI.getSubscriptionFromDB(subscriptionId);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async function deleteSubscription(subscriptionId) {
        try {
            const { data } = await PagosAPI.deleteSubscription(subscriptionId);
            return data;
        } catch (error) {
            console.log(error);

        }
    }

    return {
        createSubscription,
        getSubscriptionFromAPI,
        getSubscriptionFromDB,
        deleteSubscription
    }
});