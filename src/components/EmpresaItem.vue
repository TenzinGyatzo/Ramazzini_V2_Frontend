<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Empresa } from '@/interfaces/empresa.interface';

const router = useRouter();

defineProps({
    empresa: {
        type: Object as () => Empresa,
        required: true,
    }
});

defineEmits<{
    (event: 'editarEmpresa', empresa: Empresa | null): void;
    (event: 'eliminarEmpresa', id: string, nombreComercial: string): void;
}>();
</script>

<template>
    <div
        class="border-shadow rounded-lg p-7 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gray-50 hover:bg-gray-100 h-full min-h-60">
        <button type="button" class="w-full text-center"
        @click="empresa?._id ? router.push({ name: 'centros-trabajo', params: { idEmpresa: empresa._id } }) : null">
        
        <img v-if="empresa.logotipoEmpresa?.data"
            :src="'/uploads/logos/' + empresa.logotipoEmpresa.data + '?t=' + empresa.updatedAt"
            :alt="'Logo de ' + empresa.nombreComercial"
            class="w-full h-32 object-contain mb-4 rounded" />
        
        <!-- Placeholder si no hay logotipo -->
        <div v-else class="w-4/6 mx-auto h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
            <i class="fas fa-camera text-4xl mb-2"></i> <!-- Icono de FontAwesome -->
            <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
        </div>

        <p class="text-3xl font-bold leading-7 mb-2">{{ empresa.nombreComercial }}</p>
        
        <!-- Si no hay razón social, ocultar o mostrar un mensaje alternativo -->
        <p v-if="empresa.razonSocial" class="text-base font-light leading-5">
            {{ empresa.razonSocial }}
        </p>
        <p v-else class="text-base font-light leading-5 italic text-gray-400">
            Sin razón social registrada
        </p>
        </button>

        <div class="mt-4 flex justify-center gap-4">
        <button type="button" @click="$emit('editarEmpresa', empresa)"
            class="text-xs w-1/4 bg-gray-600 hover:bg-slate-700 text-white rounded-lg p-1 transition duration-300">
            Editar
        </button>
        <button type="button" @click="$emit('eliminarEmpresa', empresa._id, empresa.nombreComercial)"
            class="text-xs w-1/4 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 transition duration-300">
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
