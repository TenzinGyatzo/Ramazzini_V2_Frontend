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
        class="border-shadow rounded-lg p-7 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gray-50 hover:bg-gray-100 h-full min-h-60 "
        @click="router.push({ name: 'centros-trabajo', params: { idEmpresa: empresa._id } })"
    >
        <p class="text-3xl font-bold leading-7 mb-2">{{ empresa.nombreComercial }}</p>
        <p class="text-base font-light leading-5">
            {{ empresa.razonSocial }}
        </p>
    </button>
</template>

<style scoped>
.border-shadow {
  transition: all 300ms ease-in-out;
}

.border-shadow:hover {
    box-shadow: 0 0 2px 0 #9ca3af inset, 0 0 10px 4px #9ca3af;
}
</style>