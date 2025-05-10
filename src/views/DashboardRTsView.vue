<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import type { ComponentPublicInstance } from 'vue';
import { startOfMonth, endOfMonth, subMonths, subDays, startOfYear, endOfYear, subYears } from 'date-fns';
import { exportarRiesgosTrabajoDesdeFrontend } from '@/helpers/exportarExcel';

/* =====================
   Variables y Stores
===================== */
const route = useRoute();
const router = useRouter();
const empresasStore = useEmpresasStore();
const centrosStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const empresaId = String(route.params.idEmpresa);
const datosCargados = ref(false);
const riesgosEmpresa = ref<RiesgoTrabajo[]>([]);
const centrosAbiertos = ref<Record<string, boolean>>({});
const totalRiesgos = ref(0);

/* =====================
   Filtros Reactivos
===================== */
const mostrarFiltros = ref(false);
const centroSeleccionado = ref<string>('todos');
const sexoSeleccionado = ref<string>('todos');
const puestoSeleccionado = ref<string>('todos');
const periodoSeleccionado = ref<string>('todos');
const edadSeleccionada = ref<string>('todos');
const antiguedadSeleccionada = ref<string>('todos');
const naturalezaSeleccionada = ref<string>('todos');
const parteCuerpoSeleccionada = ref<string>('todos');
const recaidaSeleccionada = ref<string>('todos');
const tipoRiesgoSeleccionado = ref<string>('todos');
const manejoSeleccionado = ref<string>('todos');
const altaSeleccionada = ref<string>('todos');
const diasIncapacidadSeleccionados = ref<string>('todos');
const secuelasSeleccionadas = ref<string>('todos');
const busquedaTexto = ref<string>("");
const riesgosOriginales = ref<RiesgoTrabajo[]>([]);
const inputBusqueda = ref<HTMLInputElement | null>(null);

/* =====================
   Computed: Filtros Dinámicos
===================== */
const hayFiltrosActivos = computed(() => {
  return (
    sexoSeleccionado.value !== 'todos' ||
    puestoSeleccionado.value !== 'todos' ||
    periodoSeleccionado.value !== 'todos' ||
    edadSeleccionada.value !== 'todos' ||
    antiguedadSeleccionada.value !== 'todos' ||
    naturalezaSeleccionada.value !== 'todos' ||
    parteCuerpoSeleccionada.value !== 'todos' ||
    recaidaSeleccionada.value !== 'todos' ||
    tipoRiesgoSeleccionado.value !== 'todos' ||
    manejoSeleccionado.value !== 'todos' ||
    altaSeleccionada.value !== 'todos' ||
    diasIncapacidadSeleccionados.value !== 'todos' ||
    secuelasSeleccionadas.value !== 'todos'
  );
});

const puestosDisponibles = computed(() => {
  const puestosSet = new Set<string>();
  riesgosEmpresa.value.forEach(riesgo => {
    if (riesgo.puestoTrabajador) puestosSet.add(riesgo.puestoTrabajador);
  });
  return Array.from(puestosSet).sort();
});

const opcionesPeriodo = [ "Este mes", "Mes anterior", "Últimos 90 días", "Últimos 6 meses", "Este año", "Año anterior" ];

const rangoFechas = computed(() => {
  const ahora = new Date();

  switch (periodoSeleccionado.value) {
    case "Este mes":
      return {
        inicio: startOfMonth(ahora),
        fin: endOfMonth(ahora),
      };
    case "Mes anterior":
      const mesAnterior = subMonths(ahora, 1);
      return {
        inicio: startOfMonth(mesAnterior),
        fin: endOfMonth(mesAnterior),
      };
    case "Últimos 90 días":
      return {
        inicio: subDays(ahora, 90),
        fin: ahora,
      };
    case "Últimos 6 meses":
      return {
        inicio: subMonths(ahora, 6),
        fin: ahora,
      };
    case "Este año":
      return {
        inicio: startOfYear(ahora),
        fin: endOfYear(ahora),
      };
    case "Año anterior":
      const anoAnterior = subYears(ahora, 1);
      return {
        inicio: startOfYear(anoAnterior),
        fin: endOfYear(anoAnterior),
      };
    default:
      return { inicio: null, fin: null };
  }
});

const opcionesEdad = ["16–20", "21–25", "26–30", "31–35", "36–40", "41–45", "46–50", "51–55", "56–60", "61–65" ];

function obtenerEdadMinima(rango: string): number {
  if (rango === "todos") return 0;
  return Number(rango.split("–")[0]);
}

function obtenerEdadMaxima(rango: string): number {
  if (rango === "todos") return 120;
  return Number(rango.split("–")[1]);
}

const opcionesAntiguedad = [ "0–1", "1–5", "5–10", "10–15", "15–20", "20–30", "> 30" ];

function calcularAntiguedadAnios(fechaIngreso: string): number {
  const fechaInicio = new Date(fechaIngreso);
  const fechaActual = new Date();
  const diferenciaAnios = fechaActual.getFullYear() - fechaInicio.getFullYear();
  return diferenciaAnios;
}

// Computed para calcular el rango de antigüedad
function obtenerAntiguedadMinima(rango: string): number {
  if (rango === "todos") return 0;
  if (rango === "> 30") return 31;
  return Number(rango.split("–")[0]);
}

function obtenerAntiguedadMaxima(rango: string): number {
  if (rango === "todos") return 100;
  if (rango === "> 30") return 100;
  return Number(rango.split("–")[1]);
}

const naturalezasDisponibles = computed(() => {
  const naturalezasSet = new Set<string>();
  riesgosEmpresa.value.forEach(riesgo => {
    if (riesgo.naturalezaLesion) naturalezasSet.add(riesgo.naturalezaLesion);
  });
  return Array.from(naturalezasSet).sort();
});

const parteCuerpoDisponibles = computed(() => {
  const partesSet = new Set<string>();
  
  // Recorremos los riesgos para extraer las partes únicas
  riesgosEmpresa.value.forEach(riesgo => {
    if (riesgo.parteCuerpoAfectada) {
      partesSet.add(riesgo.parteCuerpoAfectada);
    }
  });

  // Convertimos el Set a un array y lo ordenamos alfabéticamente
  return Array.from(partesSet).sort();
});

const opcionesDiasIncapacidad = [ "0–10", "11–30", "31–60", "61–90", "91–120", "121–150", "> 150" ];

function cumpleRangoDiasIncapacidad(dias: number, rango: string): boolean {
  if (rango === "> 150") return dias > 150;

  const [inicio, fin] = rango.split("–").map(Number);
  return dias >= inicio && dias <= fin;
}

function filtrarPorBusqueda() {
  const texto = busquedaTexto.value.trim().toLowerCase();

  if (texto) {
    riesgosEmpresa.value = riesgosOriginales.value.filter((riesgo) => {
      // Caso 1: Buscar "Recaída"
      if (/^r(ec(a(i(d(a)?)?)?)?)?$/.test(texto)) {
        return riesgo.recaida === "Si";
      }

      // Caso 2: Buscar "Secuelas"
      if (/^s(ec(u(e(l(a(s)?)?)?)?)?)?$/.test(texto)) {
        return riesgo.secuelas === "Si";
      }

      // Caso 3: Buscar "IPP"
      if (/^i(pp?)?$/.test(texto)) {
        return riesgo.porcentajeIPP && parseInt(String(riesgo.porcentajeIPP)) > 0;
      }

      // Caso General: Filtrado por texto libre en cualquier campo
      return (
        (riesgo.nombreTrabajador && riesgo.nombreTrabajador.toLowerCase().includes(texto)) ||
        (riesgo.sexoTrabajador && riesgo.sexoTrabajador.toLowerCase().includes(texto)) ||
        (riesgo.puestoTrabajador && riesgo.puestoTrabajador.toLowerCase().includes(texto)) ||
        (riesgo.naturalezaLesion && riesgo.naturalezaLesion.toLowerCase().includes(texto)) ||
        (riesgo.parteCuerpoAfectada && riesgo.parteCuerpoAfectada.toLowerCase().includes(texto)) ||
        (riesgo.tipoRiesgo && riesgo.tipoRiesgo.toLowerCase().includes(texto)) ||
        (riesgo.manejo && riesgo.manejo.toLowerCase().includes(texto)) ||
        (riesgo.alta && riesgo.alta.toLowerCase().includes(texto)) ||
        (riesgo.secuelas && riesgo.secuelas.toLowerCase().includes(texto)) ||
        (riesgo.recaida && riesgo.recaida.toLowerCase().includes(texto)) ||
        (riesgo.notas && riesgo.notas.toLowerCase().includes(texto)) ||
        (riesgo.NSS && riesgo.NSS.toLowerCase().includes(texto)) ||
        (riesgo.fechaRiesgo && new Date(riesgo.fechaRiesgo).toLocaleDateString().includes(texto)) ||
        (riesgo.fechaIngreso && new Date(riesgo.fechaIngreso).toLocaleDateString().includes(texto)) ||
        (riesgo.fechaAlta && new Date(riesgo.fechaAlta).toLocaleDateString().includes(texto)) ||
        (riesgo.diasIncapacidad && String(riesgo.diasIncapacidad).includes(texto)) ||
        (riesgo.porcentajeIPP && String(riesgo.porcentajeIPP).includes(texto))
      );
    });
  } else {
    // Si el texto está vacío, restauramos los datos originales sin recargar desde el backend
    riesgosEmpresa.value = [...riesgosOriginales.value];
  }
}

watch(busquedaTexto, (newVal, oldVal) => {
  if (inputBusqueda.value) {
    inputBusqueda.value.focus();
  }
});

/* =====================
   Computed: Agrupación de Riesgos
===================== */
const riesgosAgrupados = computed(() => {
  if (!datosCargados.value || !Array.isArray(riesgosEmpresa.value)) return [];

  return centrosStore.centrosTrabajo
    .filter(c => centroSeleccionado.value === 'todos' || c._id === centroSeleccionado.value)
    .map(centro => {
      const riesgos = riesgosEmpresa.value.filter(r => {
        // Filtros básicos (Centro, Sexo, Puesto, Naturaleza, Antigüedad)
        const cumpleFiltroBasico = 
          r.idCentroTrabajo === centro._id &&
          (sexoSeleccionado.value === 'todos' || r.sexoTrabajador === sexoSeleccionado.value) &&
          (puestoSeleccionado.value === 'todos' || r.puestoTrabajador === puestoSeleccionado.value) &&
          (naturalezaSeleccionada.value === 'todos' || r.naturalezaLesion === naturalezaSeleccionada.value) &&
          (parteCuerpoSeleccionada.value === 'todos' || r.parteCuerpoAfectada === parteCuerpoSeleccionada.value) &&
          (tipoRiesgoSeleccionado.value === 'todos' || r.tipoRiesgo === tipoRiesgoSeleccionado.value) &&
          (manejoSeleccionado.value === 'todos' || r.manejo === manejoSeleccionado.value) &&
          (altaSeleccionada.value === 'todos' || r.alta === altaSeleccionada.value) &&
          (secuelasSeleccionadas.value === 'todos' || r.secuelas === secuelasSeleccionadas.value);

        // Filtro por Recaída (Sí, No, o vacío)
        const cumpleFiltroRecaida = 
        recaidaSeleccionada.value === 'todos' ||
        (recaidaSeleccionada.value === 'Si' && r.recaida === 'Si') ||
        (recaidaSeleccionada.value === 'No' && (r.recaida === 'No' || r.recaida == null));

        // Filtro por Periodo
        const { inicio, fin } = rangoFechas.value;
        const cumpleFiltroPeriodo = periodoSeleccionado.value === 'todos' || 
          (!inicio || !fin) || 
          (r.fechaRiesgo && new Date(r.fechaRiesgo) >= inicio && new Date(r.fechaRiesgo) <= fin);

        // Filtro por Edad
        const cumpleFiltroEdad = edadSeleccionada.value === 'todos' || 
          (r.fechaNacimiento && calcularEdad(r.fechaNacimiento) >= obtenerEdadMinima(edadSeleccionada.value) && 
          calcularEdad(r.fechaNacimiento) <= obtenerEdadMaxima(edadSeleccionada.value));
        
        // Filtro por Antigüedad
        const cumpleFiltroAntiguedad = antiguedadSeleccionada.value === 'todos' || 
          (r.fechaIngreso && calcularAntiguedadAnios(r.fechaIngreso) >= obtenerAntiguedadMinima(antiguedadSeleccionada.value) && 
          calcularAntiguedadAnios(r.fechaIngreso) <= obtenerAntiguedadMaxima(antiguedadSeleccionada.value));

        // Filtro por Días de Incapacidad
        const cumpleFiltroDiasIncapacidad = 
          diasIncapacidadSeleccionados.value === 'todos' ||
          (r.diasIncapacidad && cumpleRangoDiasIncapacidad(r.diasIncapacidad, diasIncapacidadSeleccionados.value));

        return cumpleFiltroBasico && cumpleFiltroRecaida && cumpleFiltroPeriodo && cumpleFiltroEdad && cumpleFiltroAntiguedad && cumpleFiltroDiasIncapacidad;
      });

      return {
        centroId: centro._id,
        centroNombre: centro.nombreCentro,
        centroDireccion: centro.direccionCentro,
        riesgos,
      };
    });
});

/* =====================
   Inicialización: Fetch de Datos
===================== */
onMounted(async () => {
  await empresasStore.fetchEmpresaById(empresaId);
  await centrosStore.fetchCentrosTrabajo(empresaId);

  const riesgos = await trabajadoresStore.fetchRiesgosTrabajoPorEmpresa(empresaId);
  riesgosOriginales.value = [...riesgos]; // Guardamos una copia de los riesgos completos
  riesgosEmpresa.value = riesgosOriginales.value; // Mostramos los riesgos
  console.log('Riesgos de trabajo:', riesgosEmpresa.value);

  totalRiesgos.value = riesgosEmpresa.value.length;

  datosCargados.value = true;
});
</script>

<template>
  <div class="mx-auto">
    <div v-if="!empresasStore.currentEmpresa" class="text-center py-8">
      <p class="text-gray-600 text-lg">Loading empresa data...</p>
    </div>

    <div v-else>
      <!-- Header con logo a la izquierda y datos a la derecha -->
      <div class="flex items-center gap-6 mb-6">
        <img
          v-if="empresasStore.currentEmpresa.logotipoEmpresa?.data"
          :src="'/uploads/logos/' + empresasStore.currentEmpresa.logotipoEmpresa.data + '?t=' + empresasStore.currentEmpresa.updatedAt"
          :alt="'Logo de ' + empresasStore.currentEmpresa.nombreComercial"
          class="w-24 h-24 object-contain rounded"
        />
        <div v-else class="w-1/4 h-32 flex flex-col items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 rounded mb-4 text-center px-4 border-2 border-dashed border-gray-400">
            <i class="fas fa-camera text-4xl mb-2"></i> <!-- Icono de FontAwesome -->
            <span class="text-xs text-center">Identifica más rápido a tu cliente agregando un logotipo</span>
        </div>

        <div class="hidden sm:block">
            <h1 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">{{ empresasStore.currentEmpresa.nombreComercial }}</h1>
            <h2 class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mt-1">{{ empresasStore.currentEmpresa.razonSocial }}</h2>
        </div>

        <!-- Ajustado a nivel del encabezado -->
        <div class="mb-4 ml-auto flex items-end gap-6">
          <!-- Indicador de total de trabajadores -->
          <div class="bg-white border border-gray-200 shadow-md rounded-xl px-6 py-2 text-center self-center">
            <div class="text-xs text-gray-500"><i class="fas fa-users mr-1 text-gray-400"></i><span class="hidden md:block">RTs</span></div>
            <div class="text-2xl font-bold text-emerald-600 leading-tight">{{ totalRiesgos }}</div>
          </div>

          <!-- Selector de centro de trabajo -->
          <div class="self-end">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Centro de trabajo</label>
            <select
              v-model="centroSeleccionado"
              class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white transition duration-150 ease-in-out mt-1"
            >
              <option v-for="centro in centrosStore.centrosTrabajo" :key="centro._id" :value="centro._id">{{ centro.nombreCentro }}</option>
            </select>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8 auto-rows-[370px] sm:auto-rows-[400px] md:auto-rows-[425px] lg:auto-rows-[450px]">

      </div>

      <button
        @click="$router.back()"
        class="inline-block text-gray-700 hover:text-emerald-500 font-medium"
      >
        ← Regresar
      </button>
    </div>
  </div>
</template>