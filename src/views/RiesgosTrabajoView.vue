<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import type { ComponentPublicInstance } from 'vue';

const route = useRoute();
const empresasStore = useEmpresasStore();
const centrosStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const empresaId = String(route.params.idEmpresa);
const centroSeleccionado = ref<string>('todos');

const datosCargados = ref(false);
const riesgosEmpresa = ref<RiesgoTrabajo[]>([]);
const centrosAbiertos = ref({});
const notasExpandibles = ref<Record<string, boolean>>({});

function toggleNota(id: string) {
  notasExpandibles.value[id] = !notasExpandibles.value[id];
}

const mapaCentros = computed(() => {
  return new Map(centrosStore.centrosTrabajo.map(c => [c._id, c.nombreCentro]));
});

function nombreCentro(id: string): string {
  return mapaCentros.value.get(id) || 'Centro desconocido';
}

function toggleCentro(centroId: string) {
  centrosAbiertos.value[centroId] = !centrosAbiertos.value[centroId];
}

const refsNotas = ref<Record<string, HTMLElement | null>>({});
const notasConOverflow = ref<Record<string, boolean>>({});

function verificarOverflow(id: string) {
  const el = refsNotas.value[id];
  if (el) {
    const tieneOverflow = el.scrollHeight > el.clientHeight;
    notasConOverflow.value[id] = tieneOverflow;
  }
}

function asignarRefNota(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    refsNotas.value[id] = el;
  } else {
    refsNotas.value[id] = null;
  }
}

onMounted(async () => {
  await empresasStore.fetchEmpresaById(empresaId);
  await centrosStore.fetchCentrosTrabajo(empresaId);

  riesgosEmpresa.value = await trabajadoresStore.fetchRiesgosTrabajoPorEmpresa(empresaId);

  for (const centro of centrosStore.centrosTrabajo) {
    centrosAbiertos.value[centro._id] = true;
  }

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


// Riesgos agrupados por centro de trabajo (respetando el filtro)
const riesgosAgrupados = computed(() => {
  if (!datosCargados.value || !Array.isArray(riesgosEmpresa.value)) return [];

  return centrosStore.centrosTrabajo
    .filter(c => centroSeleccionado.value === 'todos' || c._id === centroSeleccionado.value)
    .map(centro => {
      const riesgos = riesgosEmpresa.value.filter(
        r => r.idCentroTrabajo === centro._id
      );
      return {
        centroId: centro._id,
        centroNombre: centro.nombreCentro,
        riesgos,
      };
    });
});

</script>

<template>
  <div v-if="trabajadoresStore.loading" class="flex items-center justify-center">
    <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
  </div>

  <div v-else>
    <h1 class="text-2xl font-semibold mb-4">
      Riesgos de Trabajo - {{ empresasStore.currentEmpresa?.nombreComercial }}
    </h1>

    <!-- Filtro de centro -->
    <label class="block mb-2">Centro de Trabajo</label>
    <select v-model="centroSeleccionado" class="border p-2 rounded mb-4">
      <option value="todos">Todos</option>
      <option
        v-for="centro in centrosStore.centrosTrabajo"
        :key="centro._id"
        :value="centro._id"
      >
        {{ centro.nombreCentro }}
      </option>
    </select>

    <!-- Lista agrupada por centro -->
    <div v-for="grupo in riesgosAgrupados" :key="grupo.centroId" class="mb-6">

      <button
        class="text-lg font-semibold flex items-center justify-between w-full text-left hover:bg-gray-200 p-2 rounded"
        @click="toggleCentro(grupo.centroId)"
      >
        <h2 class="text-lg font-semibold text-gray-800 flex items-center justify-between">
          {{ grupo.centroNombre }}&nbsp;&nbsp; 
          <span
            :class="[
              'text-sm font-medium px-2 py-0.5 rounded-full border',
              grupo.riesgos.length === 0
                ? 'bg-gray-200 text-gray-600 border-gray-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            ]"
          >
            {{ grupo.riesgos.length }} RT{{ grupo.riesgos.length === 1 ? '' : 's' }}
          </span>
        </h2>
        <span>
          <i :class="centrosAbiertos[grupo.centroId] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </span>
      </button>
      
      <div v-if="centrosAbiertos[grupo.centroId]" class="mt-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-if="grupo.riesgos.length === 0" class="text-sm italic text-gray-400 mb-4">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Este centro no tiene riesgos registrados.
        </div>
        <div
          v-for="riesgo in grupo.riesgos"
          :key="riesgo._id"
          class="bg-white border border-gray-300 rounded-lg shadow-sm p-4 mb-4 space-y-2"
        >
          <!-- Encabezado -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ riesgo.nombreTrabajador }} <span class="italic text-sm text-gray-600"> — {{ riesgo.puestoTrabajador }}</span>
            </h3>
            <span class="text-sm text-gray-500">
              {{ riesgo.fechaRiesgo ? new Date(riesgo.fechaRiesgo).toLocaleDateString() : 'Fecha no disponible' }}
            </span>
          </div>

          
          <!-- Edad, Antigüedad y NSS-->
          <div class="text-sm text-gray-600">
            <span>Edad: </span>
            <span class="font-semibold">{{ riesgo.fechaNacimiento ? calcularEdad(riesgo.fechaNacimiento) + ' años' : 'Edad desconocida' }} &nbsp;</span>
            <span>| Antigüedad: </span>
            <span class="font-semibold">{{ riesgo.fechaIngreso ? calcularAntiguedad(riesgo.fechaIngreso) : 'Antigüedad desconocida' }} &nbsp;</span>
            <span v-if="riesgo.NSS">| NSS: </span>
            <span class="font-semibold">{{ riesgo.NSS }}</span>
          </div>
          
          <!-- Naturaleza y parte afectada -->
          <div class="text-lg font-medium text-emerald-700">
            {{ riesgo.naturalezaLesion || 'Sin descripción de lesión' }}
            <span v-if="riesgo.parteCuerpoAfectada" class="text-sm text-gray-600">- {{ riesgo.parteCuerpoAfectada }}</span>
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-2 text-sm">
            <!-- Manejo -->
            <span
              v-if="riesgo.manejo"
              :class="riesgo.manejo === 'IMSS'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'"
              class="px-2 py-1 rounded-full"
            >
             {{ riesgo.manejo === 'IMSS' ? 'IMSS' : 'Manejo Interno' }}
            </span>

            <!-- Tipo de Riesgo -->
            <span
              v-if="riesgo.tipoRiesgo"
              :class="{
                'bg-red-100 text-red-700': riesgo.tipoRiesgo === 'Accidente de Trabajo',
                'bg-orange-100 text-orange-700': riesgo.tipoRiesgo === 'Accidente de Trayecto',
                'bg-fuchsia-100 text-fuchsia-700': riesgo.tipoRiesgo === 'Enfermedad de Trabajo'
              }"
              class="px-2 py-1 rounded-full flex items-center gap-1"
            >
              <template v-if="riesgo.tipoRiesgo === 'Accidente de Trayecto'">🏍️</template>
              <template v-if="riesgo.tipoRiesgo === 'Accidente de Trabajo'">🛠️</template>
              <template v-if="riesgo.tipoRiesgo === 'Enfermedad de Trabajo'">🦠</template>
              {{ riesgo.tipoRiesgo }}
            </span>

            <!-- Alta / Días de Incapacidad -->
            <span v-if="riesgo.alta === 'Incapacidad Activa'" class="bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Incapacidad activa
            </span>
            <span
              v-else-if="riesgo.alta"
              class="bg-green-100 text-green-700 px-2 py-1 rounded-full"
            >
              Alta:
              <span v-if="riesgo.fechaAlta">{{ new Date(riesgo.fechaAlta).toLocaleDateString() }}</span>
              <span v-else>Fecha no disponible</span>
              ({{ riesgo.alta.replace('Alta ', '') }})
            </span>
            <span v-if="riesgo.diasIncapacidad" class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              {{ riesgo.diasIncapacidad }} días de incapacidad
            </span>

            <!-- Secuelas e IPP -->
            <span
              v-if="riesgo.secuelas === 'Si'"
              class="bg-pink-100 text-pink-700 px-2 py-1 rounded-full"
            >
              Secuelas: {{ riesgo.porcentajeIPP || 0 }}% IPP
            </span>
          </div>

          <!-- Notas -->
          <div
            v-if="riesgo.notas"
            class="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 relative"
          >
            <strong>Notas:</strong><br />
            <div
              :ref="el => asignarRefNota(riesgo._id, el)"
              :class="{
                'line-clamp-1': !notasExpandibles[riesgo._id],
                'whitespace-pre-wrap': true
              }"
            >
              {{ riesgo.notas }}
            </div>

            <button
              v-if="notasConOverflow[riesgo._id]"
              @click="toggleNota(riesgo._id)"
              class="mt-2 text-xs text-emerald-600 hover:underline"
            >
              {{ notasExpandibles[riesgo._id] ? 'Ver menos' : 'Leer más' }}
            </button>
          </div>

        </div>
      </div>

    </div>

    <!-- Botón regresar -->
    <button
      @click="$router.back()"
      class="inline-block text-gray-700 hover:text-emerald-500 font-medium"
    >
      ← Regresar
    </button>
  </div>
</template>
