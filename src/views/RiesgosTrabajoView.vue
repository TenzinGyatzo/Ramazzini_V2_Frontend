<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import type { ComponentPublicInstance } from 'vue';

/* =====================
   Variables y Stores
===================== */
const route = useRoute();
const empresasStore = useEmpresasStore();
const centrosStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const empresaId = String(route.params.idEmpresa);
const datosCargados = ref(false);
const riesgosEmpresa = ref<RiesgoTrabajo[]>([]);
const centrosAbiertos = ref<Record<string, boolean>>({});

/* =====================
   Filtros Reactivos
===================== */
const mostrarFiltros = ref(false);
const centroSeleccionado = ref<string>('todos');
const sexoSeleccionado = ref<string>('todos');
const puestoSeleccionado = ref<string>('todos');
const naturalezaSeleccionada = ref<string>('todos');

/* =====================
   Computed: Filtros Dinámicos
===================== */
const hayFiltrosActivos = computed(() => {
  return (
    sexoSeleccionado.value !== 'todos' ||
    puestoSeleccionado.value !== 'todos' ||
    naturalezaSeleccionada.value !== 'todos'
  );
});
const puestosDisponibles = computed(() => {
  const puestosSet = new Set<string>();
  riesgosEmpresa.value.forEach(riesgo => {
    if (riesgo.puestoTrabajador) puestosSet.add(riesgo.puestoTrabajador);
  });
  return Array.from(puestosSet).sort();
});

const naturalezasDisponibles = computed(() => {
  const naturalezasSet = new Set<string>();
  riesgosEmpresa.value.forEach(riesgo => {
    if (riesgo.naturalezaLesion) naturalezasSet.add(riesgo.naturalezaLesion);
  });
  return Array.from(naturalezasSet).sort();
});

/* =====================
   Computed: Agrupación de Riesgos
===================== */
const riesgosAgrupados = computed(() => {
  if (!datosCargados.value || !Array.isArray(riesgosEmpresa.value)) return [];

  return centrosStore.centrosTrabajo
    .filter(c => centroSeleccionado.value === 'todos' || c._id === centroSeleccionado.value)
    .map(centro => {
      const riesgos = riesgosEmpresa.value.filter(
        r => r.idCentroTrabajo === centro._id &&
             (sexoSeleccionado.value === 'todos' || r.sexoTrabajador === sexoSeleccionado.value) &&
             (puestoSeleccionado.value === 'todos' || r.puestoTrabajador === puestoSeleccionado.value) &&
             (naturalezaSeleccionada.value === 'todos' || r.naturalezaLesion === naturalezaSeleccionada.value)
      );
      return {
        centroId: centro._id,
        centroNombre: centro.nombreCentro,
        riesgos,
      };
    });
});

/* =====================
   Notas: Expandir y Verificar Overflow
===================== */
const notasExpandibles = ref<Record<string, boolean>>({});
const refsNotas = ref<Record<string, HTMLElement | null>>({});
const notasConOverflow = ref<Record<string, boolean>>({});

function toggleNota(id: string) {
  notasExpandibles.value[id] = !notasExpandibles.value[id];
}

function asignarRefNota(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) refsNotas.value[id] = el;
  else refsNotas.value[id] = null;
}

function verificarOverflow(id: string) {
  const el = refsNotas.value[id];
  if (el) {
    notasConOverflow.value[id] = el.scrollHeight > el.clientHeight;
  }
}

/* =====================
   Funciones de Utilidad
===================== */
function toggleCentro(centroId: string) {
  centrosAbiertos.value[centroId] = !centrosAbiertos.value[centroId];
}

function limpiarFiltros() {
  sexoSeleccionado.value = 'todos';
  puestoSeleccionado.value = 'todos';
  naturalezaSeleccionada.value = 'todos';
}

/* =====================
   Inicialización: Fetch de Datos
===================== */
onMounted(async () => {
  await empresasStore.fetchEmpresaById(empresaId);
  await centrosStore.fetchCentrosTrabajo(empresaId);

  riesgosEmpresa.value = await trabajadoresStore.fetchRiesgosTrabajoPorEmpresa(empresaId);
  console.log('Riesgos de trabajo:', riesgosEmpresa.value);

  datosCargados.value = true;

  await nextTick();
  setTimeout(() => {
    for (const grupo of riesgosAgrupados.value) {
      for (const riesgo of grupo.riesgos) {
        verificarOverflow(riesgo._id);
      }
    }
  }, 0);
});
</script>


<template>
  <!-- =======================
       Indicador de Carga
  ======================= -->
  <div v-if="trabajadoresStore.loading" class="flex items-center justify-center">
    <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
  </div>

  <div v-else>
    <!-- =======================
         Encabezado y Logo Empresa
    ======================= -->
    <div class="flex items-center gap-6 mb-6">
      <img
        v-if="empresasStore.currentEmpresa?.logotipoEmpresa?.data"
        :src="'/uploads/logos/' + empresasStore.currentEmpresa?.logotipoEmpresa.data + '?t=' + empresasStore.currentEmpresa?.updatedAt"
        :alt="'Logo de ' + empresasStore.currentEmpresa?.nombreComercial"
        class="w-24 h-24 object-contain rounded"
      />
      <div v-else class="w-1/4 h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
        <i class="fas fa-camera text-4xl mb-2"></i>
        <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
      </div>

      <div class="hidden sm:block">
        <h1 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">
          {{ empresasStore.currentEmpresa?.nombreComercial }}
        </h1>
        <h2 class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mt-1">
          {{ empresasStore.currentEmpresa?.razonSocial }}
        </h2>
      </div>

      <!-- Filtro por Centro de Trabajo -->
      <div class="ml-auto items-center gap-2">
        <label class="block text-xs md:text-sm font-medium text-gray-700">Centro de trabajo</label>
        <select
          v-model="centroSeleccionado"
          class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white transition duration-150 ease-in-out mt-1"
        >
          <option value="todos">Todos</option>
          <option v-for="centro in centrosStore.centrosTrabajo" :key="centro._id" :value="centro._id">
            {{ centro.nombreCentro }}
          </option>
        </select>
      </div>
    </div>

    <!-- =======================
      Toggle Filtros + Indicador
    ======================= -->
    <div class="flex justify-center items-center gap-3 my-4">
      <button
        @click="mostrarFiltros = !mostrarFiltros"
        class="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition duration-200 flex items-center gap-2"
      >
        <i :class="mostrarFiltros ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
        {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </button>

      <div v-if="hayFiltrosActivos" class="flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Filtros activos
      </div>
    </div>

    <!-- =======================
         Filtros Desplegables (Con Toggle)
    ======================= -->
    <Transition name="desplegar-filtros" mode="out-in">
      <div v-if="mostrarFiltros" class="flex flex-wrap gap-4 my-6 justify-center">
      <!-- Filtro por Sexo -->
      <div class="ml-4 items-center gap-2">
        <label class="block text-xs md:text-sm font-medium text-gray-700">Sexo</label>
        <select
          v-model="sexoSeleccionado"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            sexoSeleccionado !== 'todos' 
              ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="todos">Todos</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
        <!-- Testigo de Filtro Aplicado (Sexo) -->
        <div v-if="sexoSeleccionado !== 'todos'" class="flex items-center gap-1 mt-1">
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">Filtro aplicado</span>
        </div>
      </div>
  
      <!-- Filtro por Puesto -->
      <div class="ml-4 items-center gap-2">
        <label class="block text-xs md:text-sm font-medium text-gray-700">Puesto</label>
        <select
          v-model="puestoSeleccionado"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            puestoSeleccionado !== 'todos' 
              ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="todos">Todos</option>
          <option v-for="puesto in puestosDisponibles" :key="puesto" :value="puesto">
            {{ puesto }}
          </option>
        </select>
        <!-- Testigo de Filtro Aplicado (Puesto) -->
        <div v-if="puestoSeleccionado !== 'todos'" class="flex items-center gap-1 mt-1">
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">Filtro aplicado</span>
        </div>
      </div>

      <!-- Filtro por Naturaleza de la Lesión -->
      <div class="ml-4 items-center gap-2">
        <label class="block text-xs md:text-sm font-medium text-gray-700">Naturaleza de la Lesión</label>
        <select
          v-model="naturalezaSeleccionada"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            naturalezaSeleccionada !== 'todos' 
              ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="todos">Todos</option>
          <option v-for="naturaleza in naturalezasDisponibles" :key="naturaleza" :value="naturaleza">
            {{ naturaleza }}
          </option>
        </select>
        <!-- Testigo de Filtro Aplicado (Naturaleza) -->
        <div v-if="naturalezaSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">Filtro aplicado</span>
        </div>
      </div>

        <!-- Botón para limpiar filtros -->
        <div class="text-xs ml-4 items-center gap-2">
          <label class="block text-xs font-medium text-gray-100 mb-0.5">Filtros</label>
          <button
            @click="limpiarFiltros"
            class="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-filter-circle-xmark"></i>
            Quitar Filtros
          </button>
        </div>
      </div>
    </Transition>

    <!-- =======================
         Lista de Riesgos Agrupados por Centro
    ======================= -->
    <div v-for="grupo in riesgosAgrupados" :key="grupo.centroId" class="mb-4">
      <button
        class="text-lg font-semibold flex items-center justify-between w-full text-left hover:bg-gray-200 p-4 rounded-lg border border-gray-300 shadow-sm transition"
        @click="toggleCentro(grupo.centroId)"
      >
        <h2 class="text-lg font-semibold text-gray-800">
          {{ grupo.centroNombre }} 
          <span class="ml-2 text-sm font-medium px-2 py-0.5 rounded-full border" :class="grupo.riesgos.length === 0 ? 'bg-gray-200 text-gray-600 border-gray-300' : 'bg-amber-100 text-amber-700 border-amber-300'">
            {{ grupo.riesgos.length }} RT{{ grupo.riesgos.length === 1 ? '' : 's' }}
          </span>
        </h2>
        <i :class="centrosAbiertos[grupo.centroId] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>

      <!-- Riesgos del Centro (Expandibles) -->
      <div v-if="centrosAbiertos[grupo.centroId]" class="mt-2 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        <div v-if="grupo.riesgos.length === 0" class="text-sm italic text-gray-400 mb-4">
          Este centro no tiene riesgos registrados.
        </div>

        <div v-for="riesgo in grupo.riesgos" :key="riesgo._id" class="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-1 hover:shadow-lg transition-all">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ riesgo.nombreTrabajador }} ({{ riesgo.sexoTrabajador.charAt(0) }}) - {{ riesgo.puestoTrabajador }}
          </h3>
          <p class="text-sm text-gray-600">{{ riesgo.naturalezaLesion || 'Sin descripción de lesión' }}</p>
        </div>
      </div>
    </div>

    <!-- =======================
         Botón de Regreso
    ======================= -->
    <button @click="$router.back()" class="inline-block text-gray-700 hover:text-emerald-500 font-medium mt-4">
      ← Regresar
    </button>
  </div>
</template>
