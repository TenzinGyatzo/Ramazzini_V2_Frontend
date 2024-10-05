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
        class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-light rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
    >
        {{ text }}
    </button>
</template>