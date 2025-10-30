<script setup>
import { computed } from 'vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  empresas: { type: Array, default: () => [] },
  visibleEmpresas: { type: Array, default: () => [] },
  filteredCount: { type: Number, default: 0 },
  selectedId: { type: [String, null], default: null },
});

const emit = defineEmits(['select', 'load-more']);

const canLoadMore = computed(() => props.visibleEmpresas.length < props.filteredCount);
</script>

<template>
  <div class="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100 bg-white">
    <template v-if="loading">
      <div v-for="n in 6" :key="n" class="px-3 py-3">
        <div class="flex items-center gap-3 animate-pulse">
          <div class="w-8 h-8 rounded-md bg-gray-200"></div>
          <div class="flex-1 min-w-0">
            <div class="h-3 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div class="h-2 w-2/3 bg-gray-200 rounded mb-1"></div>
            <div class="h-2 w-1/3 bg-gray-100 rounded"></div>
          </div>
          <div class="h-3 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <button
        v-for="empresa in visibleEmpresas"
        :key="empresa._id"
        type="button"
        class="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-emerald-50 focus:outline-none"
        :class="selectedId === empresa._id ? 'bg-emerald-50' : ''"
        @click="emit('select', empresa)">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold overflow-hidden">
            <span>{{ (empresa.nombreComercial || empresa.razonSocial || '?').split(/\s+/).slice(0,2).map(p=>p.charAt(0).toUpperCase()).join('') }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900">{{ empresa.nombreComercial }}</div>
            <div class="text-xs text-gray-500 truncate">{{ empresa.razonSocial }}</div>
            <div class="text-[11px] text-gray-400" v-if="(empresa.RFC || empresa.rfc)">RFC: {{ empresa.RFC || empresa.rfc }}</div>
          </div>
          <div class="text-xs text-gray-600 whitespace-nowrap">
            {{ (empresa.centros?.length || 0) }} centros
          </div>
        </div>
      </button>
      <div v-if="canLoadMore" class="px-3 py-2">
        <button type="button" class="w-full text-center text-sm px-3 py-2 border rounded-md hover:bg-gray-50"
                @click="emit('load-more')">
          Cargar más ({{ visibleEmpresas.length }} / {{ filteredCount }})
        </button>
      </div>
      <div v-if="!visibleEmpresas.length" class="px-3 py-4 text-sm text-gray-500">
        No encontramos empresas. Verifica tus permisos o intenta con otros términos.
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>


