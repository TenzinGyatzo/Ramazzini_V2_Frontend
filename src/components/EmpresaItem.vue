<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Empresa } from '@/interfaces/empresa.interface';

const router = useRouter();

defineProps({
    empresa: {
        type: Object as () => Empresa,
        required: true,
    }
})

const emit = defineEmits<{
  (event: 'eliminarEmpresa', id: string, nombreComercial: string): void;
  (event: 'editarEmpresa', empresa: Empresa | null): void;
}>();
</script>

<template>
    <div
        class="border-shadow rounded-lg p-7 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gray-50 hover:bg-gray-100 h-full min-h-60"
    >
        <button
            type="button"
            class="w-full text-center"
             @click="empresa?._id ? router.push({ name: 'centros-trabajo', params: { idEmpresa: empresa._id } }) : null"
        >
            <img
                v-if="empresa.nombreComercial"
                :src="'/uploads/logos/' + empresa.logotipoEmpresa?.data"
                :alt="'Logo de ' + empresa.nombreComercial"
                class="w-full h-32 object-contain mb-4 rounded"
            />
            <p class="text-3xl font-bold leading-7 mb-2">{{ empresa.nombreComercial }}</p>
            <p class="text-base font-light leading-5">
                {{ empresa.razonSocial }}
            </p>
        </button>
        <div class="mt-4 flex justify-center gap-4">
            <button
                type="button"
                @click="$emit('editarEmpresa', empresa)"
                class="text-xs w-1/4 bg-gray-600 hover:bg-slate-700 text-white rounded-lg p-1 transition duration-300"
            >
                Editar
            </button>
            <button
                type="button"
                @click="$emit('eliminarEmpresa', empresa._id, empresa.nombreComercial)"
                class="text-xs w-1/4 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 transition duration-300"
            >
                Eliminar
            </button>
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
