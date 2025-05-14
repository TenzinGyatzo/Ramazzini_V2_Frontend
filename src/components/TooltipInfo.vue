<template>
  <div class="relative group" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" @click="toggleTooltip">
    <i :class="tooltipIcon" class="text-lg cursor-pointer"></i>
    <div 
      v-if="showTooltip"
      class="absolute right-full -mr-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-90 text-white border border-gray-700 rounded-md shadow-lg p-3 text-sm w-64 transition-opacity duration-300 opacity-0 group-hover:opacity-100 tooltip-content"
    >
      <p class="font-semibold mb-1 text-base">{{ title }}</p>
      <ul v-if="items" class="list-disc pl-4 mt-2 text-gray-300">
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  title: String,
  items: Array as () => string[],
  icon: {
    type: String,
    default: 'fa-solid fa-circle-info text-amber-500'
  }
});

const showTooltip = ref(false);

const tooltipIcon = computed(() => props.icon);

function toggleTooltip() {
  showTooltip.value = !showTooltip.value;
}

onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.group')) {
      showTooltip.value = false;
    }
  });
});
</script>

<style scoped>
.group:hover .absolute {
  display: block;
}

.group .absolute {
  opacity: 0;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.group:hover .absolute {
  opacity: 1;
  transform: translate(-29px, -26px);
}

/* Flecha del Tooltip */
.tooltip-content::before {
  content: '';
  position: absolute;
  top: 10px; /* Cerca del borde superior */
  right: -14px; /* Sobre el borde derecho */
  width: 0;
  height: 0;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  border-left: 14px solid black; /* Color del fondo del tooltip */
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); /* Borde blanco sutil */
}
</style>
