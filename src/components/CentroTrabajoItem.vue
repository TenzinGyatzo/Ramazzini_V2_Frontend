<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';

const router = useRouter();

defineProps({
    centro: {
        type: Object as () => CentroTrabajo | null,
        required: false,
    },
    empresa: {
        type: Object as () => Empresa | null,
        required: false,
    },
});

defineEmits<{
    (event: 'editarCentro', empresa: Empresa, centro: CentroTrabajo): void;
    (event: 'eliminarCentro', id: string, nombreCentro: string): void;
}>();
</script>

<template>
    <div v-if="centro && empresa">
        <div class="w-full px-6 py-2 grid grid-cols-1 gap-2 2xl:grid-cols-10 2xl:gap-8">
            <button type="button"
                class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-5 2xl:p-7 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-md hover:shadow-xl bg-gray-50 hover:bg-gray-100"
                @click="router.push({ name: 'trabajadores', params: { idEmpresa: empresa._id, idCentroTrabajo: centro._id } })">
                <p class="text-3xl font-bold leading-7 mb-2">{{ centro.nombreCentro }}</p>
                <p class="text-base font-light leading-5">
                    {{ centro.direccionCentro }}, {{ centro.codigoPostal }}, {{ centro.municipio }}, {{ centro.estado }}
                </p>
            </button>
            <div
                class="w-full md:w-1/2 lg:w-1/2 grid grid-cols-2 gap-4 2xl:gap-0 2xl:w-full 2xl:grid-cols-1 2xl:grid-rows-2">
                <div class="flex items-center justify-center">
                    <button type="button" @click="$emit('editarCentro', empresa, centro)"
                        class="text-xs sm:text-sm md:text-base 2xl:text-lg w-full bg-gray-600 hover:bg-slate-700 text-white uppercase  rounded-lg p-1 transition duration-300">
                        Editar
                    </button>
                </div>
                <div class="flex items-center justify-center">
                    <button type="button" @click="$emit('eliminarCentro', centro._id, centro.nombreCentro)"
                        class="text-xs sm:text-sm md:text-base 2xl:text-lg w-full bg-red-600 hover:bg-red-700 text-white uppercase  rounded-lg p-1 transition duration-300">
                        Eliminar
                    </button>
                </div>
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