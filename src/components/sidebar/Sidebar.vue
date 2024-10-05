<script lang="ts" setup>
  import { ref } from 'vue';
  import SidebarLink from './SidebarLink.vue';
  import { useSidebarStore } from '@/stores/sidebar';
  import { useEmpresasStore } from '@/stores/empresas';
  import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
  import { useTrabajadoresStore } from '@/stores/trabajadores';
  import { onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const sidebar = useSidebarStore();
  const empresas = useEmpresasStore();
  const centrosTrabajo = useCentrosTrabajoStore();
  const trabajadores = useTrabajadoresStore();
  
  const isMounted = ref(false);
  const temporalHide = true;
  
  onMounted(() => {
    isMounted.value = true;
    console.log(route.path);
  })

  const cleanSidebar = (link: string) => {
    if (link === 'empresas') {
      empresas.resetCurrentEmpresa()
      centrosTrabajo.resetCurrentCentroTrabajo()  
      trabajadores.resetCurrentTrabajador()
      return;    
    } 

    if (link === 'centros-trabajo') {
      centrosTrabajo.resetCurrentCentroTrabajo()
      trabajadores.resetCurrentTrabajador()
      return;
    }

    if (link === 'trabajadores') {
      trabajadores.resetCurrentTrabajador()
      return;
    }
  }
</script>

<template>
  <div 
    class="sidebar" 
    :style="{ width: sidebar.sidebarWidth}"
    @mouseenter="sidebar.toggleSidebar()"
    @mouseleave="sidebar.toggleSidebar()"
  >
    <h1 class="text-2xl text-center my-5" :class="{ 'text-xl': sidebar.collapsed }">
      <span v-if="sidebar.collapsed">
        <div>N</div>
        <div>A</div>
        <div>V</div>
      </span>
      <div v-else class="flex flex-col items-center">
        <br>
        <div>Navegación</div>
        <br>
      </div>
    </h1>
    <Transition appear name="enter-left-exit-bounce">
      <SidebarLink
        v-if="route.path !== '/'"
        to="/empresas" 
        icon="fas fa-industry" 
        @click="cleanSidebar('empresas')"
        :class="{ 'fade-in': isMounted }"
      >
        <p>Empresas</p>
        <p class="text-sm">Ver todas las empresas</p>
      </SidebarLink>
    </Transition>

    <Transition name="enter-left-exit-bounce">
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
    </Transition>

    <Transition name="enter-left-exit-bounce">
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
    </Transition>

    <Transition name="enter-left-exit-bounce">
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
    </Transition>

    <Transition name="enter-left-exit-bounce">
      <SidebarLink v-if="!temporalHide" to="/historia-clinica" icon="fas fa-file-pdf" class="leading-5">
        <p>Historia Clínica</p>
        <p class="text-xs">Informe</p>
      </SidebarLink>
    </Transition>

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

/* Transitions */
.enter-left-exit-bounce-enter-active {
  transition: all 0.3s ease-out;
}

.enter-left-exit-bounce-leave-active {
  transition: all 0.3s ease-out;
}

.enter-left-exit-bounce-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.enter-left-exit-bounce-leave-active {
  animation: enter-left-exit-bounce-in 0.5s reverse;
}
@keyframes enter-left-exit-bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
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