<script setup lang="ts">
    defineProps({
        text: {
            type: String,
            required: true,
            default: 'Button',
        }
    })
</script>

<template>
    <button
        type="button"
        class="border-emerald text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl bg-emerald-600 hover:bg-white text-white hover:text-emerald-700 font-light rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
    >
        {{ text }}
    </button>
</template>

<style scoped>
.border-emerald {
  transition: all 300ms ease-in-out;
}

.border-emerald:hover {
    box-shadow: 0 0 2px 0 #059669 inset, 0 0 4px 2px #059669;
}
</style>