import { defineStore } from "pinia";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

export const useSidebarStore = defineStore("sidebar", () => {
  const collapsed = ref(localStorage.getItem("sidebarCollapsed") === "true");

  const isSmallScreen = ref(window.innerWidth < 640);

  function handleResize() {
    isSmallScreen.value = window.innerWidth < 640;
  }

  function toggleSidebar() {
    collapsed.value = !collapsed.value;
    localStorage.setItem("sidebarCollapsed", collapsed.value.toString());
  }

  const SIDEBAR_WIDTH = 230;
  const SIDEBAR_WIDTH_COLLAPSED = 55;
  const sidebarWidth = computed(
    () => `${collapsed.value ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`
  );
  const sidebarWidthCollapsed = computed(() => `${SIDEBAR_WIDTH_COLLAPSED}px`);

  watch(collapsed, (newValue) => {
    localStorage.setItem("sidebarCollapsed", newValue.toString());
  });

  onMounted(() => {
    window.addEventListener("resize", handleResize); // Escucha cambios en el tamaño de la pantalla
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize); // Limpieza al desmontar
  });

  return {
    isSmallScreen,
    collapsed,
    toggleSidebar,
    sidebarWidth,
    sidebarWidthCollapsed,
  };
});
