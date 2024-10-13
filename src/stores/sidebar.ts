import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {

    const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');

    function toggleSidebar() {
        collapsed.value = !collapsed.value
        localStorage.setItem('sidebarCollapsed', collapsed.value.toString());
    }

    const SIDEBAR_WIDTH = 230
    const SIDEBAR_WIDTH_COLLAPSED = 55
    const sidebarWidth = computed(() => `${collapsed.value ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`)

    watch(collapsed, (newValue) => {
        localStorage.setItem('sidebarCollapsed', newValue.toString());
    });

    return {
        collapsed,
        toggleSidebar,
        sidebarWidth
    }
})