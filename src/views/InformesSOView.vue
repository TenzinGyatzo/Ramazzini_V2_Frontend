<script setup>
import { useEmpresasStore } from '@/stores/empresas';
import GreenButton from '@/components/GreenButton.vue';

const empresasStore = useEmpresasStore();

</script>

<template>
    <div class="mx-auto">
        <div v-if="!empresasStore.currentEmpresa" class="text-center py-8">
            <p class="text-gray-600 text-lg">Loading empresa data...</p>
        </div>

        <div v-else>
            <!-- Header con logo a la izquierda y datos a la derecha -->
            <div class="flex items-center gap-6 mb-2">
                <img
                v-if="empresasStore.currentEmpresa.logotipoEmpresa?.data"
                :src="'/uploads/logos/' + empresasStore.currentEmpresa.logotipoEmpresa.data + '?t=' + empresasStore.currentEmpresa.updatedAt"
                :alt="'Logo de ' + empresasStore.currentEmpresa.nombreComercial"
                class="w-24 h-24 object-contain rounded"
                />
                <div v-else class="w-1/4 h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
                    <i class="fas fa-camera text-4xl mb-2"></i>
                    <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
                </div>

                <div class="hidden sm:block">
                    <h1 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">{{ empresasStore.currentEmpresa.nombreComercial }}</h1>
                    <h2 class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mt-1">{{ empresasStore.currentEmpresa.razonSocial }}</h2>
                </div>

                <!-- Botón: centrado en el espacio restante -->
                <div class="flex-grow flex justify-center">
                    <GreenButton text="Nuevo Informe +" @click="openModal(null)" />
                </div>

            </div>
        </div>
    </div>

    <div>
      <button
        @click="$router.back()"
        class="inline-block text-gray-700 hover:text-emerald-500 font-medium"
      >
        ← Regresar
      </button>
    </div>
</template>