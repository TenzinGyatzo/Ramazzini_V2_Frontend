<script setup lang="ts">
import { useRouter } from 'vue-router';

    const router = useRouter();

    defineProps({
        centro: {
            type: Object,
            default: () => ({}),
        },
        empresa: {
            type: Object,
            default: () => ({}),
        },
    });

</script>

<template>

    <button
        type="button"
        class="w-full text-left rounded-lg p-7 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gray-50 hover:bg-gray-100"
        @click="router.push({ name: 'trabajadores', params: { idEmpresa: empresa._id, idCentroTrabajo: centro._id } })"
    >
        <p class="text-3xl font-bold leading-7 mb-2">{{ centro.nombreCentro }}</p>
        <p class="text-base font-light leading-5">
            {{ centro.direccionCentro }}, {{ centro.codigoPostal }}, {{ centro.municipio }}, {{ centro.estado }}
        </p>
    </button>

<!--     <button class="text-xs bg-gray-600 hover:bg-green-700 text-white uppercase  rounded-lg p-1 mt-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200">Editar</button> -->

</template>