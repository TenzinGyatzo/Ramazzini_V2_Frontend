<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import SidebarLink from './SidebarLink.vue';
import { useSidebarStore } from '@/stores/sidebar';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useRoute } from 'vue-router';

const route = useRoute();
const sidebar = useSidebarStore();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();

const isMounted = ref(false);

onMounted(async () => {
  try {
    const { idEmpresa, idCentroTrabajo, idTrabajador, tipoDocumento } = route.params;
    await sidebar.initializeState({ idEmpresa, idCentroTrabajo, idTrabajador, tipoDocumento });
    isMounted.value = true;
  } catch (error) {
    console.error('Error inicializando el estado:', error);
  }
});

watch(() => route.params, async (newParams) => {
  try {
    await sidebar.initializeState(newParams);
  } catch (error) {
    console.error('Error al actualizar estado con route.params:', error);
  }
});

watch(() => empresas.currentEmpresa, (newEmpresa, oldEmpresa) => {
  if (newEmpresa?._id !== oldEmpresa?._id) {
    // Si currentEmpresa cambia, reinicia centrosTrabajo y trabajadores
    centrosTrabajo.resetCurrentCentroTrabajo();
    trabajadores.resetCurrentTrabajador();
    documentos.resetCurrentTypeOfDocument();
  }
});

watch(() => centrosTrabajo.currentCentroTrabajo, (newCentro, oldCentro) => {
  if (newCentro?._id !== oldCentro?._id) {
    // Si currentCentroTrabajo cambia, reinicia trabajadores
    trabajadores.resetCurrentTrabajador();
    documentos.resetCurrentTypeOfDocument();
  }
});

watch(() => trabajadores.currentTrabajador, (newTrabajador, oldTrabajador) => {
  if (newTrabajador?._id !== oldTrabajador?._id) {
    // Si currentCentroTrabajo cambia, reinicia trabajadores
    documentos.resetCurrentTypeOfDocument();
  }
});

const documentTypeLabels = {
  aptitud: "Aptitud al Puesto",
  historiaClinica: "Historia Clínica",
  exploracionFisica: "Exploración Física",
  examenVista: "Examen de la Vista",
  antidoping: "Antidoping",
  certificado: "Certificado",
};

</script>

<template>
  <div class="sidebar cursor-pointer" :style="{ width: sidebar.sidebarWidth }" @click="sidebar.toggleSidebar()">
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
      <SidebarLink v-if="route.path !== '/' && route.path !== '/login'" to="/empresas" icon="fas fa-industry" :class="{ 'fade-in': isMounted }"
        @click.stop>
        <p>Empresas</p>
        <p class="text-sm">Ver todas las empresas</p>
      </SidebarLink>
    </Transition>

    <Transition appear name="enter-left-exit-bounce">
      <SidebarLink v-if="empresas.currentEmpresaId"
        :to="{ name: 'centros-trabajo', params: { idEmpresa: empresas.currentEmpresaId } }" icon="fas fa-warehouse"
        class="leading-5" @click.stop>
        <p>{{ empresas.currentEmpresa?.nombreComercial || 'Nombre no disponible' }}</p>
        <p class="text-xs">{{ empresas.currentEmpresa?.razonSocial || 'Nombre no disponible' }}</p>
      </SidebarLink>
    </Transition>

    <Transition name="enter-left-exit-bounce">
      <SidebarLink v-if="centrosTrabajo.currentCentroTrabajoId && empresas.currentEmpresaId" :to="{
        name: 'trabajadores',
        params: {
          idEmpresa: empresas.currentEmpresaId || '',
          idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId || ''
        }
      }" icon="fas fa-users" class="leading-5" @click.stop>
        <p>{{ centrosTrabajo.currentCentroTrabajo?.nombreCentro }}</p>
        <p class="text-xs">{{ centrosTrabajo.currentCentroTrabajo?.direccionCentro }}</p>
      </SidebarLink>
    </Transition>

    <Transition name="enter-left-exit-bounce">
      <SidebarLink v-if="trabajadores.currentTrabajadorId && centrosTrabajo.currentCentroTrabajoId && empresas.currentEmpresaId" :to="{
        name: 'expediente-medico',
        params: {
          idEmpresa: empresas.currentEmpresaId || '',
          idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId || '',
          idTrabajador: trabajadores.currentTrabajadorId || ''
        }
      }" icon="fa-regular fa-folder-open" class="leading-5" @click.stop>
        <p>{{ trabajadores.currentTrabajador?.nombre }}</p>
        <p class="text-xs">Expediente Médico</p>
      </SidebarLink>
    </Transition>

    <Transition name="enter-left-exit-bounce">
      <SidebarLink v-if="documentos.currentTypeOfDocument && trabajadores.currentTrabajadorId && centrosTrabajo.currentCentroTrabajoId && empresas.currentEmpresaId" :to="{
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId || '',
          idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId || '',
          idTrabajador: trabajadores.currentTrabajadorId || '',
          tipoDocumento: documentos.currentTypeOfDocument,
          idDocumento: documentos.currentDocument?._id
        }
      }" icon="fas fa-file-pdf" class="leading-5" @click.stop>
        <p>{{ documentTypeLabels[documentos.currentTypeOfDocument] || 'Documento desconocido' }}</p>
        <p v-if="documentos.currentDocument" class="text-xs">Editando</p>
        <p v-else class="text-xs">Creando nuevo</p>
      </SidebarLink>
    </Transition>

    <span class="collapse-icon cursor-pointer" :class="{ 'rotate-180': sidebar.collapsed }"
      @click.stop="sidebar.toggleSidebar()">
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

  transition: 0.5s ease;

  display: flex;
  flex-direction: column;
}

.collapse-icon {
  position: absolute;
  bottom: 0;
  padding: 0.5em;
  color: rgba(255, 255, 255, 0.7);
  transition: 0.2s linear;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}
</style>