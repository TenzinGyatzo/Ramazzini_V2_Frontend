<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true,
    default: 'Button',
  },
});

const emit = defineEmits(['click']);
</script>

<template>
  <button type="button"
    @click="$emit('click')"
    class="min-w-48 bg-emerald-600 text-white font-medium rounded-full px-6 py-2 md:text-xl transition-transform duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600">
    {{ text }}
  </button>
</template>

<style scoped>
/* Estilo de borde y transición en hover */
button {
  transition: box-shadow 300ms ease, transform 300ms ease, background-color 300ms ease;
}

/* Efecto especial en hover */
button:hover {
  box-shadow: 0 4px 8px rgba(0, 128, 0, 0.3);
}
</style>
