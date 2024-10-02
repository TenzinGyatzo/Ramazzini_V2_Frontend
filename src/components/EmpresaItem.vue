<script setup lang="ts">
import { useRouter } from 'vue-router';

    const router = useRouter();

    defineProps({
        empresa: {
            type: Object,
            default: () => ({})
        }
    })
</script>

<template>

    <button
        type="button"
        class="rounded-lg p-7 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gray-50 hover:bg-gray-100 h-full min-h-60 "
        @click="router.push({ name: 'centros-trabajo', params: { idEmpresa: empresa._id } })"
    >
        <p class="text-3xl font-bold leading-7 mb-2">{{ empresa.nombreComercial }}</p>
        <p class="text-base font-light leading-5">
            {{ empresa.razonSocial }}
        </p>
    </button>

<!--     <button class="text-xs bg-gray-600 hover:bg-green-700 text-white uppercase  rounded-lg p-1 mt-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200">Editar</button> -->

</template>