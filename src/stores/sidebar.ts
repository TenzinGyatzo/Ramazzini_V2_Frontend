import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {

    const collapsed = ref(false)

    function toggleSidebar() {
        collapsed.value = !collapsed.value
    }

    const SIDEBAR_WIDTH = 230
    const SIDEBAR_WIDTH_COLLAPSED = 55
    const sidebarWidth = computed(() => `${collapsed.value ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`)


    return {
        collapsed,
        toggleSidebar,
        sidebarWidth
    }
})