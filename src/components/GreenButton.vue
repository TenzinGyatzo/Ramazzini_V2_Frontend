<script setup lang="ts">
defineProps({
    text: {
        type: String,
        required: true,
        default: 'Button',
    }
});
</script>

<template>
    <button type="button"
        class="border-emerald text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-2xl bg-emerald-600  text-white hover:font-medium hover:text-emerald-700 font-light rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-50">
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