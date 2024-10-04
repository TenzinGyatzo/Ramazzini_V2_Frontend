<script lang="ts" setup>
  import SidebarLink from './SidebarLink.vue';
  import { useSidebarStore } from '@/stores/sidebar';
  import { useEmpresasStore } from '@/stores/empresas';
  import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
  import { useTrabajadoresStore } from '@/stores/trabajadores';
  
  const sidebar = useSidebarStore();
  const empresas = useEmpresasStore();
  const centrosTrabajo = useCentrosTrabajoStore();
  const trabajadores = useTrabajadoresStore();

  const temporalHide = true;

  const cleanSidebar = (link: string) => {
    if (link === 'empresas') {
      empresas.currentEmpresa = {}
      centrosTrabajo.currentCentroTrabajo = {}  
      trabajadores.currentTrabajador = {}
      return;    
    } 

    if (link === 'centros-trabajo') {
      centrosTrabajo.currentCentroTrabajo = {}
      trabajadores.currentTrabajador = {}
      return;
    }

    if (link === 'trabajadores') {
      trabajadores.currentTrabajador = {}
      return;
    }
  }
</script>

<template>
  <div class="sidebar" :style="{ width: sidebar.sidebarWidth}">
    <h1 class="text-2xl text-center my-5" :class="{ 'text-xl': sidebar.collapsed }">
      <span v-if="sidebar.collapsed">
        <div>N</div>
        <div>A</div>
        <div>V</div>
      </span>
      <span v-else>Navegación</span>
    </h1>

    <SidebarLink 
      to="/empresas" 
      icon="fas fa-industry" 
      @click="cleanSidebar('empresas')"
    >
      <p>Empresas</p>
      <p class="text-sm">Ver todas las empresas</p>
    </SidebarLink>

    <SidebarLink 
      v-if="empresas.currentEmpresa?._id" 
      :to="{ 
        name: 'centros-trabajo', 
        params: { idEmpresa: empresas.currentEmpresaId || '' } 
      }"
      icon="fas fa-warehouse"
      class="leading-5" 
      @click="cleanSidebar('centros-trabajo')"
    >
      <p>{{ empresas.currentEmpresa?.nombreComercial || 'Nombre no disponible' }}</p>
      <p class="text-xs" >{{ empresas.currentEmpresa?.razonSocial || 'Nombre no disponible' }}</p>
    </SidebarLink>

    <SidebarLink 
      v-if="centrosTrabajo.currentCentroTrabajo?._id" 
      :to="{
        name: 'trabajadores',
        params: {
          idEmpresa: empresas.currentEmpresaId || '',
          idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId || ''
        }
      }" 
      icon="fas fa-users" 
      class="leading-5"
      @click="cleanSidebar('trabajadores')"
    >
      <p>{{ centrosTrabajo.currentCentroTrabajo?.nombreCentro }}</p>
      <p class="text-xs">{{ centrosTrabajo.currentCentroTrabajo?.direccionCentro }}</p>
    </SidebarLink>

    <SidebarLink 
      v-if="trabajadores.currentTrabajador?._id" 
      :to="{
        name: 'expediente-medico',
        params: {
          idEmpresa: empresas.currentEmpresaId || '',
          idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId || '',
          idTrabajador: trabajadores.currentTrabajadorId || ''
        }
      }" 
      icon="fa-regular fa-folder-open" 
      class="leading-5"
    >
      <p>{{ trabajadores.currentTrabajador?.nombre }}</p>
      <p class="text-xs">Expediente Médico</p>
    </SidebarLink>

    <SidebarLink v-if="!temporalHide" to="/historia-clinica" icon="fas fa-file-pdf" class="leading-5">
      <p>Historia Clínica</p>
      <p class="text-xs">Informe</p>
    </SidebarLink>

    <span
      class="collapse-icon"
      :class="{ 'rotate-180': sidebar.collapsed }"
      @click="sidebar.toggleSidebar()"
    >
      <i class="fas fa-angle-double-left"></i>
    </span>
  </div>
</template>

<style>
:root {
  --sidebar-bg-color: #2f855a;
  --sidebar-item-hover: #38a169;
  --sidebar-item-active: #276749;
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);

  float: left;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 0.5em;

  transition: 0.3s ease;

  display: flex;
  flex-direction: column;
}

.collapse-icon {
  position: absolute;
  bottom: 0;
  padding: 0.5em;
  color: rgba(255, 255, 255, 0.7);
  transition: 0.2s linear;
  cursor: pointer;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}
</style>