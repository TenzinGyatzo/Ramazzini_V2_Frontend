<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import { contarPorNaturalezaLesion } from '@/helpers/dashboardRiesgosProcessor';
import GraficaBarras from '@/components/graficas/GraficaBarras.vue';
import GraficaAnillo from '@/components/graficas/GraficaAnillo.vue';
import { calcularEdad } from '@/helpers/dates';
import { startOfMonth, endOfMonth, subMonths, subDays, startOfYear, endOfYear, subYears } from 'date-fns';

/* =====================
   Variables y Stores
===================== */
const route = useRoute();
const router = useRouter();
const empresasStore = useEmpresasStore();
const centrosStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const empresaId = String(route.params.idEmpresa);
const centrosTrabajo = ref<CentroTrabajo[]>([]);
const centroSeleccionado = ref('Todos');
const riesgosEmpresa = ref<RiesgoTrabajo[]>([]);
const riesgosOriginales = ref<RiesgoTrabajo[]>([]);
const totalRiesgos = ref(0);
const datosCargados = ref(false);

/* =====================
   Watchers y Fetch de Datos
===================== */
watch(() => route.params.idEmpresa, cargarDatos, { immediate: true });

async function cargarDatos() {
  if (!empresaId) return;

  // 1. Empresa
  await empresasStore.fetchEmpresaById(empresaId);

  // 2. Centros
  centrosTrabajo.value = await centrosStore.fetchCentrosTrabajo(empresaId);
  if (centrosTrabajo.value.length > 0) {
    centroSeleccionado.value = centrosTrabajo.value[0].nombreCentro;
  }

  // 3. Riesgos de Trabajo
  riesgosOriginales.value = await trabajadoresStore.fetchRiesgosTrabajoPorEmpresa(empresaId);
  riesgosEmpresa.value = [...riesgosOriginales.value];
  totalRiesgos.value = riesgosEmpresa.value.length;
  datosCargados.value = true;
}

/* =====================
   Computed: Opciones y Configuración
===================== */
const centrosTrabajoOptions = computed(() => [
  'Todos',
  ...centrosTrabajo.value.map((centro) => centro.nombreCentro),
]);

// Computed para filtrar riesgos por centro seleccionado
const riesgosFiltrados = computed(() => {
  if (centroSeleccionado.value === 'Todos') {
    return riesgosEmpresa.value;
  }

  return riesgosEmpresa.value.filter((riesgo) =>
    centrosTrabajo.value.some(
      (centro) =>
        centro.nombreCentro === centroSeleccionado.value &&
        riesgo.idCentroTrabajo === centro._id
    )
  );
});

/* =====================
   Computed: Data de Gráfica
===================== */
const graficaNaturalezaLesionData = computed(() => {
  if (!riesgosFiltrados.value.length) return { labels: [], datasets: [] };

  const resultados = contarPorNaturalezaLesion(riesgosFiltrados.value);

  return {
    labels: resultados.map(([label]) => label),
    datasets: [
      {
        data: resultados.map(([_, cantidad]) => cantidad),
        backgroundColor: '#4B5563'
      }
    ]
  };
});

/* =====================
   Manejo de Eventos
===================== */
function handleClickGraficaNaturalezaLesion(event) {
  const index = event[0]?.index;
  if (index !== undefined) {
    const naturaleza = graficaNaturalezaLesionData.value.labels[index];
    console.log('Clic en naturaleza:', naturaleza);
  }
}

/* =====================
   Filtros Reactivos
===================== */
const mostrarFiltros = ref(false);
interface CentroTrabajo { nombreCentro: string; [key: string]: any; }
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

/* Funciones Utiles */
function limpiarFiltros() {
  sexoSeleccionado.value = 'todos';
  puestoSeleccionado.value = 'todos';
  periodoSeleccionado.value = 'todos';
  edadSeleccionada.value = 'todos';
  antiguedadSeleccionada.value = 'todos';
  naturalezaSeleccionada.value = 'todos';
  parteCuerpoSeleccionada.value = 'todos';
  recaidaSeleccionada.value = 'todos';
  tipoRiesgoSeleccionado.value = 'todos';
  manejoSeleccionado.value = 'todos';
  altaSeleccionada.value = 'todos';
  diasIncapacidadSeleccionados.value = 'todos';
  secuelasSeleccionadas.value = 'todos';
}

/* =====================
   Variables Reactivas para Gráfica de Naturaleza Lesión
===================== */
const vistaNaturalezaLesion = ref('grafico');
const vistaNaturalezaLesionKey = ref(0);
const tablaNaturalezaLesion = ref<Record<string, number>>({});

/* =====================
   Computed: Opciones de la Gráfica
===================== */
const graficaNaturalezaLesionOptions = {
  indexAxis: 'y',
  responsive: true,
  layout: {
    padding: {
      right: 60
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const value = context.raw;
          const total = graficaNaturalezaLesionData.value.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0;
          const porcentaje = total > 0 ? Math.round((value / total) * 100) : 0;
          return `Casos: ${value} (${porcentaje}%)`;
        }
      }
    },
    datalabels: {
      color: '#374151',
      anchor: 'end',
      align: 'end',
      formatter: (value) => {
        const total = graficaNaturalezaLesionData.value.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0;
        const porcentaje = total > 0 ? Math.round((value / total) * 100) : 0;
        return `${value} (${porcentaje}%)`;
      },
      font: {
        weight: 'bold',
        size: 12
      },
      clamp: true
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { display: false },
      ticks: {
        stepSize: 1,
        color: '#374151',
        font: { size: 12 }
      }
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#374151',
        font: { size: 12 }
      }
    }
  },
  onHover: (event, elements) => {
    const canvas = event.chart?.canvas;
    if (canvas) {
      canvas.style.cursor = elements.length ? 'pointer' : 'default';
    }
  }
};

/* =====================
   Manejo de Eventos
===================== */

function handleClickTablaNaturalezaLesion(naturaleza) {
  console.log('Clic en naturaleza (Tabla):', naturaleza);
}

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
            <div class="text-xs text-gray-500">
              <i class="fas fa-users mr-1 text-gray-400"></i>
              <span class="lg:hidden">RTs</span>
              <span class="hidden lg:block">Riesgos de Trabajo</span>
            </div>
            <div class="text-2xl font-bold text-emerald-600 leading-tight">{{ riesgosFiltrados.length }}</div>
            </div>

          <!-- Selector de centro de trabajo -->
          <div class="self-end">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Centro de trabajo</label>
            <select
              v-model="centroSeleccionado"
              class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white transition duration-150 ease-in-out mt-1"
            >
              <option v-for="centro in centrosTrabajoOptions" :key="centro" :value="centro">{{ centro }}</option>
            </select>
          </div>
        </div>

      </div>

      <!-- =======================
        Toggle Filtros + Indicador
      ======================= -->
      <div class="flex justify-between items-center gap-3 my-4">
        <div class="w-32"></div> <!-- Spacer para alinear el toggle al centro -->
        
        <div class="flex items-center gap-3">
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

        <div class="relative w-40 md:w-60 lg:w-80">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="fa-solid fa-magnifying-glass text-gray-500 focus:text-emerald-500"></i>
          </span>
          <input
            v-model="busquedaTexto"
            type="text"
            @input="filtrarPorBusqueda"
            placeholder="Buscar..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 hover:shadow-md rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      <!-- =======================
          Filtros Desplegables (Con Toggle)
      ======================= -->
      <Transition name="desplegar" mode="out-in">
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

          <!-- Filtro por Periodo -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Periodo</label>
            <select
              v-model="periodoSeleccionado"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                periodoSeleccionado !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option v-for="opcion in opcionesPeriodo" :key="opcion" :value="opcion">
                {{ opcion }}
              </option>
            </select>

            <!-- Testigo de Filtro Aplicado (Periodo) -->
            <div v-if="periodoSeleccionado !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Edad -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Edad</label>
            <select
              v-model="edadSeleccionada"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                edadSeleccionada !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option v-for="rango in opcionesEdad" :key="rango" :value="rango">
                {{ rango }}
              </option>
            </select>

            <!-- Testigo de Filtro Aplicado (Edad) -->
            <div v-if="edadSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Antigüedad -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Antigüedad</label>
            <select
              v-model="antiguedadSeleccionada"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                antiguedadSeleccionada !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option v-for="rango in opcionesAntiguedad" :key="rango" :value="rango">
                {{ rango }}
              </option>
            </select>

            <!-- Testigo de Filtro Aplicado (Antigüedad) -->
            <div v-if="antiguedadSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
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

          <!-- Filtro por Parte del Cuerpo Afectada -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Parte del Cuerpo Afectada</label>
            <select
              v-model="parteCuerpoSeleccionada"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                parteCuerpoSeleccionada !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option v-for="parte in parteCuerpoDisponibles" :key="parte" :value="parte">
                {{ parte }}
              </option>
            </select>

            <!-- Testigo de Filtro Aplicado (Parte del Cuerpo) -->
            <div v-if="parteCuerpoSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Recaída -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Recaída</label>
            <select
              v-model="recaidaSeleccionada"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                recaidaSeleccionada !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>

            <!-- Testigo de Filtro Aplicado (Recaída) -->
            <div v-if="recaidaSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>
          
          <!-- Filtro por Tipo de Riesgo -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Tipo de Riesgo</label>
            <select
              v-model="tipoRiesgoSeleccionado"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                tipoRiesgoSeleccionado !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option value="Accidente de Trabajo">Accidente de Trabajo</option>
              <option value="Accidente de Trayecto">Accidente de Trayecto</option>
              <option value="Enfermedad de Trabajo">Enfermedad de Trabajo</option>
            </select>

            <!-- Testigo de Filtro Aplicado (Tipo de Riesgo) -->
            <div v-if="tipoRiesgoSeleccionado !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>
          
          <!-- Filtro por Manejo -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Manejo</label>
            <select
              v-model="manejoSeleccionado"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                manejoSeleccionado !== 'todos'
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option value="IMSS">IMSS</option>
              <option value="Interno">Interno</option>
            </select>

            <!-- Testigo de Filtro Aplicado (Manejo) -->
            <div v-if="manejoSeleccionado !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Alta -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Alta</label>
            <select
              v-model="altaSeleccionada"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                altaSeleccionada !== 'todos'
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option value="Incapacidad Activa">Incapacidad Activa</option>
              <option value="Alta ST2">Alta ST2</option>
              <option value="Alta Interna">Alta Interna</option>
            </select>

            <!-- Testigo de Filtro Aplicado (Alta) -->
            <div v-if="altaSeleccionada !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Días de Incapacidad -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Días de Incapacidad</label>
            <select
              v-model="diasIncapacidadSeleccionados"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                diasIncapacidadSeleccionados !== 'todos' 
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' 
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option v-for="rango in opcionesDiasIncapacidad" :key="rango" :value="rango">
                {{ rango }}
              </option>
            </select>

            <!-- Testigo de Filtro Aplicado (Días de Incapacidad) -->
            <div v-if="diasIncapacidadSeleccionados !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Filtro por Secuelas -->
          <div class="ml-4 items-center gap-2">
            <label class="block text-xs md:text-sm font-medium text-gray-700">Secuelas</label>
            <select
              v-model="secuelasSeleccionadas"
              :class="[
                'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
                secuelasSeleccionadas !== 'todos'
                  ? 'border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              ]"
            >
              <option value="todos">Todos</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>

            <!-- Testigo de Filtro Aplicado (secuelas) -->
            <div v-if="secuelasSeleccionadas !== 'todos'" class="flex items-center gap-1 mt-1">
              <i class="fas fa-filter text-xs text-emerald-500"></i>
              <span class="text-emerald-600 text-xs">Filtro aplicado</span>
            </div>
          </div>

          <!-- Botón para limpiar filtros -->
          <div class="text-xs ml-4 items-center gap-2">
            <label class="block text-xs font-medium text-gray-100 mb-0.5">Filtros</label>
            <button
              @click="limpiarFiltros"
              class="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1.5 px-3 rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-filter-circle-xmark"></i>
              Quitar Filtros
            </button>
          </div>
        </div>
      </Transition>

      <div class="mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8 auto-rows-[370px] sm:auto-rows-[400px] md:auto-rows-[425px] lg:auto-rows-[450px]">

        <!-- Naturaleza Lesión: 2 columnas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-1 sm:col-span-2 xl:col-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
              Naturaleza Lesión
              <span class="relative cursor-help">
                <i class="fas fa-info-circle text-gray-400 hover:text-emerald-600 peer"></i>
                <span
                  class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:left-full md:ml-2 md:-translate-x-0 md:-translate-y-1/2 w-72 text-sm font-normal bg-white text-gray-700 border border-gray-300 rounded shadow-lg px-3 py-2 opacity-0 peer-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                >
                  Muestra la distribución de riesgos de trabajo según la naturaleza de la lesión.
                </span>
              </span>
            </h3>
            <div class="flex gap-2">
              <button
                @click="vistaNaturalezaLesion = 'grafico'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaNaturalezaLesion === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaNaturalezaLesion = 'tabla'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaNaturalezaLesion === 'tabla'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Tabla
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-x-auto">
            <Transition name="fade" mode="out-in">
              <template v-if="vistaNaturalezaLesion === 'grafico'">
                <GraficaBarras
                  :data="graficaNaturalezaLesionData"
                  :options="graficaNaturalezaLesionOptions"
                />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg">Naturaleza Lesión</th>
                      <th class="py-2 px-4 text-center text-lg">Casos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(cantidad, naturaleza) in tablaNaturalezaLesion"
                      :key="naturaleza"
                      class="border-t hover:bg-gray-200 transition cursor-pointer"
                      @click="handleClickTablaNaturalezaLesion(naturaleza)"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg">{{ naturaleza }}</td>
                      <td class="py-1 px-4 text-center text-lg">{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>
          </div>
        </div>

          <!-- Parte de Cuerpo Afectada: 2 columnas -->
          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-1 sm:col-span-2 xl:col-span-2">
            <h3 class="text-xl font-semibold text-gray-800">Parte de Cuerpo Afectada</h3>
          </div>

          <!-- Tipo de Riesgo, Estado Alta, Puestos de Trabajo -->
          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Tipo de Riesgo</h3>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Estado Alta</h3>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-1 sm:col-span-2 xl:col-span-2">
            <h3 class="text-xl font-semibold text-gray-800">Puestos de Trabajo</h3>
          </div>

          <!-- Total Días, Distribución Días, Casos IPP -->
          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Total de Días</h3>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-1 sm:col-span-2 xl:col-span-2">
            <h3 class="text-xl font-semibold text-gray-800">Distribución de Días de Incapacidad</h3>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Casos IPP</h3>
          </div>

          <!-- Manejo y Recaídas -->
          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Manejo</h3>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
            <h3 class="text-xl font-semibold text-gray-800">Recaídas</h3>
          </div>

        </div>
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