import { defineStore } from "pinia";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useEmpresasStore } from "./empresas";
import { useCentrosTrabajoStore } from "./centrosTrabajo";
import { useTrabajadoresStore } from "./trabajadores";
import { useDocumentosStore } from "./documentos";

export const useSidebarStore = defineStore("sidebar", () => {
  const empresas = useEmpresasStore();
  const centrosTrabajo = useCentrosTrabajoStore();
  const trabajadores = useTrabajadoresStore();
  const documentos = useDocumentosStore();

  async function initializeState(params: { idEmpresa?: string | string[]; idCentroTrabajo?: string | string[]; idTrabajador?: string | string[], tipoDocumento?: string | string[] }) {
    const idEmpresa = Array.isArray(params.idEmpresa) ? params.idEmpresa[0] : params.idEmpresa;
    const idCentroTrabajo = Array.isArray(params.idCentroTrabajo) ? params.idCentroTrabajo[0] : params.idCentroTrabajo;
    const idTrabajador = Array.isArray(params.idTrabajador) ? params.idTrabajador[0] : params.idTrabajador;
    const tipoDocumento = Array.isArray(params.tipoDocumento) ? params.tipoDocumento[0] : params.tipoDocumento;
  
    if (idEmpresa) await empresas.fetchEmpresaById(idEmpresa);
    if (idCentroTrabajo) await centrosTrabajo.fetchCentroTrabajoById(idEmpresa!, idCentroTrabajo);
    if (idTrabajador) await trabajadores.fetchTrabajadorById(idEmpresa!, idCentroTrabajo!, idTrabajador);
    if (tipoDocumento) await documentos.setCurrentTypeOfDocument(tipoDocumento!);
  }
  

  const collapsed = ref(
    localStorage.getItem("sidebarCollapsed") === "true" || !localStorage.getItem("sidebarCollapsed")
  );
  

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
    initializeState,
    toggleSidebar,
    sidebarWidth,
    sidebarWidthCollapsed,
  };
});
