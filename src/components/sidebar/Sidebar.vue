<script lang="ts" setup>
  import SidebarLink from './SidebarLink.vue';
  import { useSidebarStore } from '@/stores/sidebar';
  import { useEmpresasStore } from '@/stores/empresas';
  
  const sidebar = useSidebarStore();
  const empresas = useEmpresasStore();

  const temporalHide = true;
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

    <SidebarLink to="/empresas" icon="fas fa-home" >
      <p>Inicio</p>
      <p class="text-sm" >Ver Empresas</p>
    </SidebarLink>    
    <SidebarLink 
      v-if="empresas.currentEmpresa" 
      :to="{ name: 'centros-trabajo', params: { idEmpresa: empresas.currentEmpresa?._id || '' } }"
      icon="fas fa-columns" 
    >
      <p>{{ empresas.currentEmpresa?.nombreComercial || 'Nombre no disponible' }}</p>
      <p class="text-xs" >{{ empresas.currentEmpresa?.razonSocial || 'Nombre no disponible' }}</p>
    </SidebarLink>
    <SidebarLink v-if="!temporalHide" to="/trabajadores" icon="fas fa-chart-bar" class="leading-5">
      <p>Proyecto Edificio de control</p>
      <p class="text-xs">Los Mochis - Topolobampo, Los Mochis, Sin.</p>
      
    </SidebarLink>
    <SidebarLink v-if="!temporalHide" to="/expediente-medico" icon="fas fa-users" class="leading-5">
      <p>Edgar Omar Coronel Gonzalez</p>
      <p class="text-xs">Supervisor de Seguridad e Higiene</p>
      </SidebarLink>
    <SidebarLink v-if="!temporalHide" to="/historia-clinica" icon="fas fa-image" class="leading-5">Historia Clínica</SidebarLink>

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