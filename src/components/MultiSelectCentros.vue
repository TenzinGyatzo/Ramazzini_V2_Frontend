<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    
    <!-- Input de búsqueda -->
    <div class="relative">
      <input
        v-model="searchTerm"
        type="text"
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @focus="showDropdown = true"
        @blur="handleBlur"
      />
      <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
    </div>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      <!-- Opciones filtradas -->
      <div
        v-for="item in filteredItems"
        :key="item._id"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
        @click="toggleItem(item)"
      >
        <div>
          <span class="text-sm font-medium">{{ item.nombreCentro }}</span>
          <div class="text-xs text-gray-500">{{ item.idEmpresa?.nombreComercial || item.empresa?.nombreComercial || 'Sin empresa' }}</div>
        </div>
        <i 
          v-if="isSelected(item._id)"
          class="fas fa-check text-blue-600"
        ></i>
      </div>
      
      <!-- Mensaje si no hay resultados -->
      <div v-if="filteredItems.length === 0" class="px-3 py-2 text-sm text-gray-500">
        No se encontraron resultados
      </div>
    </div>

    <!-- Chips de selección -->
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-2 mt-2">
      <div
        v-for="item in selectedItems"
        :key="item._id"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        {{ item.nombreCentro }}
        <button
          @click="removeItem(item._id)"
          class="ml-1 hover:text-blue-600"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex gap-2 mt-2">
      <button
        v-if="items.length > 0"
        @click="selectAll"
        class="text-xs text-blue-600 hover:text-blue-800"
      >
        Seleccionar todos
      </button>
      <button
        v-if="selectedItems.length > 0"
        @click="clearAll"
        class="text-xs text-red-600 hover:text-red-800"
      >
        Limpiar selección
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Empresa {
  _id: string;
  nombreComercial: string;
}

interface CentroTrabajo {
  _id: string;
  nombreCentro: string;
  idEmpresa?: {
    _id: string;
    nombreComercial: string;
  };
  empresa?: Empresa;
}

interface Props {
  items: CentroTrabajo[];
  selectedIds: string[];
  label: string;
  placeholder: string;
  empresasSeleccionadas: string[];
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedIds': [value: string[]];
}>();

const searchTerm = ref('');
const showDropdown = ref(false);
const selectedItems = ref<CentroTrabajo[]>([]);

// Filtrar items basado en el término de búsqueda y empresas seleccionadas
const filteredItems = computed(() => {
  let filtered = props.items;
  
  // Filtrar por empresas seleccionadas
  if (props.empresasSeleccionadas.length > 0) {
    filtered = filtered.filter(item => {
      const empresaId = item.idEmpresa?._id || item.empresa?._id;
      return empresaId && props.empresasSeleccionadas.includes(empresaId);
    });
  }
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    filtered = filtered.filter(item => 
      item.nombreCentro.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  
  return filtered;
});

// Verificar si un item está seleccionado
const isSelected = (id: string) => {
  return props.selectedIds.includes(id);
};

// Toggle de selección de item
const toggleItem = (item: CentroTrabajo) => {
  const newSelectedIds = [...props.selectedIds];
  const index = newSelectedIds.indexOf(item._id);
  
  if (index > -1) {
    newSelectedIds.splice(index, 1);
  } else {
    newSelectedIds.push(item._id);
  }
  
  emit('update:selectedIds', newSelectedIds);
};

// Remover item de la selección
const removeItem = (id: string) => {
  const newSelectedIds = props.selectedIds.filter(selectedId => selectedId !== id);
  emit('update:selectedIds', newSelectedIds);
};

// Seleccionar todos los items filtrados
const selectAll = () => {
  const allIds = filteredItems.value.map(item => item._id);
  const newSelectedIds = [...new Set([...props.selectedIds, ...allIds])];
  emit('update:selectedIds', newSelectedIds);
};

// Limpiar toda la selección
const clearAll = () => {
  emit('update:selectedIds', []);
};

// Manejar blur del input
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

// Actualizar selectedItems cuando cambien los selectedIds
watch(() => props.selectedIds, (newIds) => {
  selectedItems.value = props.items.filter(item => newIds.includes(item._id));
}, { immediate: true });

// Actualizar selectedItems cuando cambien los items
watch(() => props.items, (newItems) => {
  selectedItems.value = newItems.filter(item => props.selectedIds.includes(item._id));
}, { immediate: true });
</script>
