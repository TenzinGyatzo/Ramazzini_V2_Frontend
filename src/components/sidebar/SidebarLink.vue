<script lang="ts" setup>
    import { useRoute, RouterLink } from 'vue-router';
    import { computed, defineProps } from 'vue';
    import { useSidebarStore } from '../../stores/sidebar';

    const sidebar = useSidebarStore();

    const props = defineProps({
        to: { type: String, required: true },
        icon: { type: String, required: true },
    })

    const route = useRoute();
    const isActive = computed(() => route.path === props.to);
</script>

<template>
    <RouterLink
        :to="to"
        class="link text-lg"
        :class="{ 'active': isActive }"
    >
        <i class="icon" :class="icon"></i>
        <Transition name="fade">
            <span v-if="!sidebar.collapsed">
                <slot></slot>
            </span>
        </Transition>
    </RouterLink>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.link {
    display: flex;
    align-items: center;
    
    cursor: pointer;
    position: relative;
    font-weight: 400;
    user-select: none;

    margin: 0.1em 0;
    padding: 0.5em;
    border-radius: 0.25em;
    /* height: 5em; */
    min-height: 5em;
    height: auto;

    color: white;
    text-decoration: none;
}

.link:hover {
    background-color: var(--sidebar-item-hover);
}

.link.active {
    background-color: var(--sidebar-item-active);
}

.link .icon {
    flex-shrink: 0;
    width: 25px;
    margin-right: 10px;
}
</style>