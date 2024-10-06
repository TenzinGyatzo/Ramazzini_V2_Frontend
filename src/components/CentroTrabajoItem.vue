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
    <div class="w-full px-6 py-2 bg-white grid grid-cols-1 gap-2 2xl:grid-cols-10 2xl:gap-8">
        <button
            type="button"
            class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-5 2xl:p-7 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-md hover:shadow-xl bg-gray-50 hover:bg-gray-100"
            @click="router.push({ name: 'trabajadores', params: { idEmpresa: empresa._id, idCentroTrabajo: centro._id } })"
        >
            <p class="text-3xl font-bold leading-7 mb-2">{{ centro.nombreCentro }}</p>
            <p class="text-base font-light leading-5">
                {{ centro.direccionCentro }}, {{ centro.codigoPostal }}, {{ centro.municipio }}, {{ centro.estado }}
            </p>    
        </button> 
        <div class="w-full md:w-1/2 lg:w-1/2 grid grid-cols-2 gap-4 2xl:gap-0 2xl:w-full 2xl:grid-cols-1 2xl:grid-rows-2">
            <div class="flex items-center justify-center">
                <button class="text-base w-full bg-gray-600 hover:bg-slate-700 text-white uppercase  rounded-lg p-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">Editar</button>
            </div>
            <div class="flex items-center justify-center">
                <button class="text-base w-full bg-red-600 hover:bg-red-700 text-white uppercase  rounded-lg p-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">Eliminar</button>
            </div>
        </div>    
    </div>       
</template>

<style scoped>
.border-shadow {
  transition: all 300ms ease-in-out;
}

.border-shadow:hover {
    box-shadow: 0 0 2px 0 #9ca3af inset, 0 0 10px 4px #9ca3af;
}
</style>