<script setup>
import { ref, onMounted, inject, computed, watch } from "vue";
import { useUserStore } from "@/stores/user";
import UserProductivityItem from "@/components/UserProductivityItem.vue";
import UserProductivityAPI from "@/api/UserProductivityAPI";

const toast = inject("toast");
const userStore = useUserStore();
const usuarios = ref([]);
const loading = ref(true);
const fechaInicio = ref(null);
const fechaFin = ref(null);
const periodoPredefinido = ref('');

// Computed para obtener la última actividad global
const ultimaActividadGlobal = computed(() => {
  if (usuariosConProductividad.value.length === 0) return 'Sin datos';
  
  // Encontrar la fecha más reciente entre todos los usuarios
  const fechas = usuariosConProductividad.value
    .map(usuario => usuario.productividad?.ultimoInforme)
    .filter(fecha => fecha !== null && fecha !== undefined)
    .map(fecha => new Date(fecha));
  
  if (fechas.length === 0) return 'Sin actividad';
  
  const fechaMasReciente = new Date(Math.max(...fechas));
  const ahora = new Date();
  const diferenciaMs = ahora - fechaMasReciente;
  const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  
  if (diferenciaHoras < 24) {
    return diferenciaHoras === 0 ? 'Hace menos de 1 hora' : `Hace ${diferenciaHoras}h`;
  } else if (diferenciaDias < 7) {
    return diferenciaDias === 1 ? 'Hace 1 día' : `Hace ${diferenciaDias} días`;
  } else {
    return fechaMasReciente.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});

const user = ref(
  JSON.parse(localStorage.getItem("user")) || null
);

// Opciones de periodos predefinidos
const opcionesPeriodo = [
  'Hoy',
  'Esta semana', 
  'Este mes',
  'Mes anterior',
  'Últimos 3 meses',
  'Últimos 6 meses',
  'Este año',
  'Año anterior'
];

// Función para calcular fechas según el periodo seleccionado
const calcularFechasPeriodo = (periodo) => {
  const hoy = new Date();
  
  switch (periodo) {
    case 'Hoy':
      return {
        inicio: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
        fin: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
      };
    case 'Esta semana':
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
      inicioSemana.setHours(0, 0, 0, 0);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
      finSemana.setHours(23, 59, 59, 999);
      return { inicio: inicioSemana, fin: finSemana };
    case 'Este mes':
      return {
        inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
        fin: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      };
    case 'Mes anterior':
      return {
        inicio: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1),
        fin: new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      };
    case 'Últimos 3 meses':
      const inicio3Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
      const fin3Meses = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      return { inicio: inicio3Meses, fin: fin3Meses };
    case 'Últimos 6 meses':
      const inicio6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
      const fin6Meses = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      return { inicio: inicio6Meses, fin: fin6Meses };
    case 'Este año':
      return {
        inicio: new Date(hoy.getFullYear(), 0, 1),
        fin: new Date(hoy.getFullYear(), 11, 31)
      };
    case 'Año anterior':
      return {
        inicio: new Date(hoy.getFullYear() - 1, 0, 1),
        fin: new Date(hoy.getFullYear() - 1, 11, 31)
      };
    default:
      return { inicio: null, fin: null };
  }
};

// Función para manejar el cambio de periodo predefinido
const manejarCambioPeriodo = (periodo) => {
  if (periodo === '') {
    // Si se selecciona "Seleccionar periodo", limpiar las fechas
    fechaInicio.value = null;
    fechaFin.value = null;
    return;
  }
  
  const fechas = calcularFechasPeriodo(periodo);
  fechaInicio.value = fechas.inicio.toISOString().split('T')[0];
  fechaFin.value = fechas.fin.toISOString().split('T')[0];
};

// Función para limpiar fechas
const limpiarFechas = () => {
  fechaInicio.value = null;
  fechaFin.value = null;
  periodoPredefinido.value = '';
};

// Computed para validar rango de fechas
const rangoInvalido = computed(() => {
  return fechaInicio.value && fechaFin.value && new Date(fechaInicio.value) > new Date(fechaFin.value);
});

// Computed para determinar si hay filtros aplicados
const hayFiltrosAplicados = computed(() => {
  return fechaInicio.value || fechaFin.value;
});

// Sistema de puntuación para ranking (usando configuración reactiva)
const calcularPuntuacion = (productividad) => {
  if (!productividad) return 0;
  
  const puntos = {
    aptitudes: productividad.totalAptitudes * configuracionPuntos.value.aptitudes,
    historias: productividad.totalHistoriasClinicas * configuracionPuntos.value.historias,
    exploraciones: productividad.totalExploracionesFisicas * configuracionPuntos.value.exploraciones,
    examenesVista: productividad.totalExamenesVista * configuracionPuntos.value.examenesVista,
    audiometrias: productividad.totalAudiometrias * configuracionPuntos.value.audiometrias,
    antidopings: productividad.totalAntidopings * configuracionPuntos.value.antidopings,
    notas: productividad.totalNotasMedicas * configuracionPuntos.value.notas,
    externos: productividad.totalDocumentosExternos * configuracionPuntos.value.externos
  };
  
  return puntos.aptitudes + puntos.historias + puntos.exploraciones + 
         puntos.examenesVista + puntos.audiometrias + puntos.antidopings + 
         puntos.notas + puntos.externos;
};

// Computed para ranking de usuarios
const rankingUsuarios = computed(() => {
  return usuariosConProductividad.value
    .map(usuario => ({
      ...usuario,
      puntuacion: calcularPuntuacion(usuario.productividad)
    }))
    .sort((a, b) => b.puntuacion - a.puntuacion);
});

// Computed para top 3 performers
const topPerformers = computed(() => {
  return rankingUsuarios.value.slice(0, 3);
});

// Estado para mostrar todo el ranking
const mostrarRankingCompleto = ref(false);

// Estado para el modal de reglas de puntaje
const mostrarModalReglas = ref(false);

// Configuración de puntos (reactiva para permitir modificaciones)
const configuracionPuntos = ref({
  aptitudes: 3,
  historias: 1,
  exploraciones: 1,
  examenesVista: 1,
  audiometrias: 1,
  antidopings: 1,
  notas: 2,
  externos: 0
});

// Configuración original (para resetear)
const configuracionOriginal = {
  aptitudes: 3,
  historias: 1,
  exploraciones: 1,
  examenesVista: 1,
  audiometrias: 1,
  antidopings: 1,
  notas: 2,
  externos: 0
};

// Datos de ejemplo para la estructura base
const usuariosConProductividad = ref([
  {
    _id: "1",
    username: "Dr. Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "Secundario",
    productividad: {
      totalAptitudes: 32,
      totalHistoriasClinicas: 45,
      totalExploracionesFisicas: 28,
      totalExamenesVista: 15,
      totalAudiometrias: 12,
      totalAntidopings: 8,
      totalNotasMedicas: 5,
      totalDocumentosExternos: 3,
      ultimoInforme: "2025-01-21T10:30:00.000Z",
      totalDocumentos: 148
    }
  },
  {
    _id: "2", 
    username: "Dra. María González",
    email: "maria.gonzalez@empresa.com",
    role: "Secundario",
    productividad: {
      totalAptitudes: 41,
      totalHistoriasClinicas: 38,
      totalExploracionesFisicas: 35,
      totalExamenesVista: 18,
      totalAudiometrias: 14,
      totalAntidopings: 6,
      totalNotasMedicas: 8,
      totalDocumentosExternos: 4,
      ultimoInforme: "2025-01-20T14:15:00.000Z",
      totalDocumentos: 164
    }
  },
  {
    _id: "3",
    username: "Dr. Carlos López",
    email: "carlos.lopez@empresa.com", 
    role: "Secundario",
    productividad: {
      totalAptitudes: 29,
      totalHistoriasClinicas: 52,
      totalExploracionesFisicas: 31,
      totalExamenesVista: 22,
      totalAudiometrias: 16,
      totalAntidopings: 10,
      totalNotasMedicas: 12,
      totalDocumentosExternos: 6,
      ultimoInforme: "2025-01-21T08:45:00.000Z",
      totalDocumentos: 168
    }
  }
]);

// Función para cargar datos con filtros
const cargarDatos = async (inicio, fin) => {
  try {
    loading.value = true;
    
    // Obtener estadísticas de productividad del proveedor con filtros de fecha
    const response = await UserProductivityAPI.getProductivityStatsByProveedor(
      user.value.idProveedorSalud,
      inicio,
      fin
    );
    
    if (response.data) {
      usuariosConProductividad.value = response.data;
      console.log("Estadísticas de productividad obtenidas:", response.data);
    } else {
      throw new Error("No se obtuvieron datos de productividad");
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
    toast.open({
      type: "error",
      message: "Error al cargar los datos de productividad",
      position: "top-right",
    });
    
    // En caso de error, mantener los datos de ejemplo
    console.log("Usando datos de ejemplo debido al error");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  cargarConfiguracionGuardada();
  await cargarDatos(fechaInicio.value, fechaFin.value);
});

// Watcher para recargar datos cuando cambien las fechas
watch([fechaInicio, fechaFin], ([inicio, fin]) => {
  if (inicio && fin && new Date(inicio) > new Date(fin)) {
    toast.open({
      message: 'La fecha de inicio no puede ser mayor que la fecha final.',
      type: 'error'
    });
    return;
  }
  cargarDatos(inicio, fin);
});

// Función para obtener estadísticas de un usuario específico
const obtenerEstadisticasUsuario = async (userId) => {
  try {
    console.log("Obteniendo estadísticas para usuario:", userId);
    
    const response = await UserProductivityAPI.getUserDetailedStats(
      userId, 
      fechaInicio.value, 
      fechaFin.value
    );
    
    if (response.data) {
      return response.data;
    } else {
      throw new Error("No se obtuvieron estadísticas del usuario");
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    toast.open({
      type: "error",
      message: "Error al obtener estadísticas del usuario",
      position: "top-right",
    });
    return null;
  }
};

// Funciones para el modal de reglas de puntaje
const abrirModalReglas = () => {
  mostrarModalReglas.value = true;
};

const cerrarModalReglas = () => {
  mostrarModalReglas.value = false;
};

const guardarConfiguracion = async () => {
  try {
    await UserProductivityAPI.updateReglasPuntaje(user.value.idProveedorSalud, configuracionPuntos.value);
    toast.open({
      type: "success",
      message: "Reglas de puntaje guardadas exitosamente",
      position: "top-right",
    });
    cerrarModalReglas();
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    toast.open({
      type: "error",
      message: "Error al guardar las reglas de puntaje",
      position: "top-right",
    });
  }
};

const resetearConfiguracion = () => {
  configuracionPuntos.value = { ...configuracionOriginal };
};

const cargarConfiguracionGuardada = async () => {
  try {
    const response = await UserProductivityAPI.getReglasPuntaje(user.value.idProveedorSalud);
    if (response.data) {
      configuracionPuntos.value = response.data;
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    // En caso de error, usar configuración por defecto
    configuracionPuntos.value = { ...configuracionOriginal };
  }
};
</script>

<template>
  <Transition appear mode="out-in" name="slide-up">
    <div class="w-full max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-3">
        <h1 class="text-3xl font-bold text-gray-800 mb-1">
          Monitoreo de Productividad
        </h1>
        <p class="text-gray-600">
          Supervisa el rendimiento y actividad de los usuarios del sistema
        </p>
        <hr class="mt-4 border-gray-200" />
      </div>

      <!-- Filtros y controles -->
      <div class="mb-1 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex gap-2">
          <!-- <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-download mr-2"></i>
            Exportar
          </button> -->
          
          <button 
            @click="abrirModalReglas"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-cog mr-2"></i>
            Reglas de Puntaje
          </button>
        </div>

        <!-- Filtro de periodo -->
        <div class="flex flex-col justify-end text-xs ml-auto">
          <div class="flex items-center gap-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Periodo</label>
            <transition name="fade">
              <button 
                v-if="fechaInicio || fechaFin"
                @click="limpiarFechas"
                class="block text-xs font-medium mb-1 text-red-600 hover:text-red-500"
              >
                &nbsp;
                <i class="fa-solid fa-calendar-xmark"></i>
                &nbsp;Limpiar
              </button>
            </transition>
          </div>

          <div class="flex items-end gap-2">
            <!-- Select de periodos predefinidos -->
            <div class="flex flex-col">
              <label class="text-[11px] text-gray-500 mb-0.5">Periodo rápido</label>
              <select
                v-model="periodoPredefinido"
                @change="manejarCambioPeriodo(periodoPredefinido)"
                class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none px-2 py-1 rounded-md shadow-sm text-xs text-gray-700 bg-white transition duration-150 ease-in-out min-w-[120px]"
              >
                <option value="">Seleccionar periodo</option>
                <option v-for="opcion in opcionesPeriodo" :key="opcion" :value="opcion">{{ opcion }}</option>
              </select>
            </div>

            <!-- Fecha inicio -->
            <div class="flex flex-col">
              <label for="fechaInicio" class="text-[11px] text-gray-500 mb-0.5">Inicio</label>
              <input
                id="fechaInicio"
                type="date"
                v-model="fechaInicio"
                class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none px-2 py-1 rounded-md shadow-sm text-xs text-gray-700 bg-white transition"
              />
            </div>
            <!-- Fecha fin -->
            <div class="flex flex-col">
              <label for="fechaFin" class="text-[11px] text-gray-500 mb-0.5">Final</label>
              <input
                id="fechaFin"
                type="date"
                v-model="fechaFin"
                class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none px-2 py-1 rounded-md shadow-sm text-xs text-gray-700 bg-white transition"
              />
            </div>
          </div>

          <!-- Testigo de filtro -->
          <!-- Este div externo SIEMPRE existe y tiene una altura mínima -->
          <div class="min-h-[1.5rem]">
            <!-- Aquí va el elemento que aparece/desaparece -->
            <transition name="fade">
              <div
                v-if="fechaInicio && fechaFin"
                class="flex items-center gap-1 mt-2"
              >
                <!-- Contenido del testigo -->
                <i
                  :class="[
                    'fas',
                    'text-xs',
                    rangoInvalido ? 'fa-circle-exclamation text-rose-500' : 'fa-filter text-emerald-500'
                  ]"
                ></i>
                <span
                  :class="[
                    'text-xs',
                    rangoInvalido ? 'text-rose-600' : 'text-emerald-600'
                  ]"
                >
                  {{ rangoInvalido
                    ? 'Filtro no aplicado: corrige el orden de las fechas'
                    : `Filtro aplicado: ${new Date(fechaInicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })} - ${new Date(fechaFin).toLocaleDateString('es-MX', { timeZone: 'UTC' })}` }}
                </span>
              </div>
            </transition>
          </div>

        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Cargando datos de productividad...</span>
      </div>

      <!-- Tabla de Ranking -->
      <div v-else-if="rankingUsuarios.length > 0" class="mb-8">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <i class="fas fa-trophy text-yellow-500"></i>
                  Ranking de Productividad
                </h2>
                <span class="ml-2 text-sm text-gray-500">
                  ({{ hayFiltrosAplicados ? 'Período filtrado' : 'Todos los datos' }})
                </span>
              </div>
              <button
                @click="mostrarRankingCompleto = !mostrarRankingCompleto"
                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i class="fas mr-2" :class="mostrarRankingCompleto ? 'fa-eye-slash' : 'fa-eye'"></i>
                {{ mostrarRankingCompleto ? 'Ver solo Top 3' : 'Ver ranking completo' }}
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-xs">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aptitudes
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Historias Clínicas">
                    Historias
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Exploraciones Físicas">
                    Exploraciones
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Exámenes de la Vista">
                    Ex. Vista
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Audiometrías">
                    Audiometrías
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Antidopings">
                    Antidopings
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Notas Médicas">
                    Notas
                  </th>
                  <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Notas Médicas">
                    Externos
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(usuario, index) in (mostrarRankingCompleto ? rankingUsuarios : topPerformers)"
                  :key="usuario._id"
                  class="hover:bg-gray-50 transition-colors"
                  :class="{
                    'bg-yellow-50': index === 0,
                    'bg-gray-50': index === 1,
                    'bg-orange-50': index === 2
                  }"
                >
                  <!-- Posición -->
                  <td class="px-3 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <span
                        class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                        :class="{
                          'bg-yellow-500 text-white': index === 0,
                          'bg-gray-400 text-white': index === 1,
                          'bg-orange-500 text-white': index === 2,
                          'bg-gray-200 text-gray-700': index > 2
                        }"
                      >
                        {{ index + 1 }}
                      </span>
                      <div class="ml-2">
                        <div class="text-xs font-medium text-gray-900">
                          {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '' }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Usuario -->
                  <td class="px-3 py-3 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i class="fas fa-user text-blue-600 text-xs"></i>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900 truncate max-w-[170px]">
                          {{ usuario.username }}
                        </div>
                        <div class="text-xs text-gray-500 truncate max-w-[170px]">
                          {{ usuario.email }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Puntuación -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="text-sm font-bold text-gray-900">
                      {{ usuario.puntuacion }} <span class="text-xs font-normal text-gray-500">pts</span>
                    </div>
                  </td>

                  <!-- Aptitudes -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalAptitudes || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-user-check text-green-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Historias -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalHistoriasClinicas || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-notes-medical text-teal-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Exploraciones -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalExploracionesFisicas || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-heartbeat text-indigo-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Ex. Vista -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalExamenesVista || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-eye text-yellow-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Audiometrías -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalAudiometrias || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-volume-up text-purple-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Antidopings -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalAntidopings || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-flask text-red-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Notas -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalNotasMedicas || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-stethoscope text-orange-500 text-xs"></i>
                      </div>
                    </div>
                  </td>

                  <!-- Externos -->
                  <td class="px-2 py-3 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ usuario.productividad?.totalDocumentosExternos || 0 }}
                      </div>
                      <div class="ml-2">
                        <i class="fas fa-file-upload text-gray-600 text-xs"></i>
                      </div>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tabla de productividad -->
      <div v-if="!loading && usuariosConProductividad.length > 0" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <i class="fas fa-table text-blue-500"></i>
                Detalle de Productividad
              </h2>
              <span class="ml-2 text-sm text-gray-500">
                ({{ hayFiltrosAplicados ? 'Período filtrado' : 'Todos los datos' }})
              </span>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aptitudes
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Historias Clínicas">
                  Historias
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Exploraciones Físicas">
                  Exploraciones
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Exámenes de la Vista">
                  Ex. Vista
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Audiometrías">
                  Audiometrías
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Antidopings">
                  Antidopings
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Notas Médicas">
                  Notas
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Documentos Externos">
                  Externos
                </th>
                <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Total de Documentos">
                  Total
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Informe
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <UserProductivityItem
                v-for="usuario in usuariosConProductividad"
                :key="usuario._id"
                :usuario="usuario"
                :mostrar-estado-actividad="!hayFiltrosAplicados"
                @ver-detalles="obtenerEstadisticasUsuario"
              />
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div v-if="!loading && usuariosConProductividad.length === 0" class="text-center py-12">
        <div class="text-gray-500">
          <i class="fas fa-users text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay usuarios disponibles</h3>
          <p class="text-gray-500">No se encontraron usuarios con datos de productividad.</p>
        </div>
      </div>

      <!-- Resumen estadístico -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="fas fa-users text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p class="text-2xl font-bold text-gray-900">{{ usuariosConProductividad.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="fas fa-file-medical text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Documentos</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ usuariosConProductividad.reduce((sum, u) => sum + u.productividad.totalDocumentos, 0) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i class="fas fa-chart-line text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Promedio por Usuario</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ Math.round(usuariosConProductividad.reduce((sum, u) => sum + u.productividad.totalDocumentos, 0) / usuariosConProductividad.length) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <i class="fas fa-calendar text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Última Actividad</p>
              <p class="text-lg font-bold text-gray-900">{{ ultimaActividadGlobal }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Reglas de Puntaje -->
      <div 
        v-if="mostrarModalReglas" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="cerrarModalReglas"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header del Modal -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i class="fas fa-cog text-green-600"></i>
                Configuración de Reglas de Puntaje
              </h3>
              <button 
                @click="cerrarModalReglas"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Contenido del Modal -->
          <div class="px-6 py-4">
            <p class="text-sm text-gray-600 mb-6">
              Configura cuántos puntos otorga cada tipo de documento en el sistema de ranking.
            </p>

            <!-- Formulario de Configuración -->
            <div class="space-y-4">
              <!-- Aptitudes -->
              <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-user-check text-green-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Aptitudes</div>
                    <div class="text-sm text-gray-500">Documentos de aptitud laboral</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.aptitudes"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-green-500 focus:ring-green-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Historias Clínicas -->
              <div class="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-notes-medical text-teal-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Historias Clínicas</div>
                    <div class="text-sm text-gray-500">Antecedentes médicos y laborales</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.historias"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Exploraciones Físicas -->
              <div class="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-heartbeat text-indigo-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Exploraciones Físicas</div>
                    <div class="text-sm text-gray-500">Somatometría, signos vitales y exploración física</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.exploraciones"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Exámenes de la Vista -->
              <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-eye text-yellow-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Exámenes de la Vista</div>
                    <div class="text-sm text-gray-500">Agudeza visual e ishihara</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.examenesVista"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Audiometrías -->
              <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-volume-up text-purple-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Audiometrías</div>
                    <div class="text-sm text-gray-500">Evaluaciones auditivas</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.audiometrias"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Antidopings -->
              <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-flask text-red-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Antidopings</div>
                    <div class="text-sm text-gray-500">Pruebas de sustancias</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.antidopings"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-red-500 focus:ring-red-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Notas Médicas -->
              <div class="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-stethoscope text-orange-500 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Notas Médicas</div>
                    <div class="text-sm text-gray-500">Consultas médicas</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.notas"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-orange-500 focus:ring-orange-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>

              <!-- Documentos Externos -->
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="fas fa-file-upload text-gray-600 text-lg"></i>
                  <div>
                    <div class="font-medium text-gray-900">Documentos Externos</div>
                    <div class="text-sm text-gray-500">Archivos subidos</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="configuracionPuntos.externos"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:border-gray-500 focus:ring-gray-500 focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">puntos</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del Modal -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <button
                @click="resetearConfiguracion"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <i class="fas fa-undo mr-2"></i>
                Restablecer Valores
              </button>
              <div class="flex gap-3">
                <button
                  @click="cerrarModalReglas"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="guardarConfiguracion"
                  class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <i class="fas fa-save mr-2"></i>
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
