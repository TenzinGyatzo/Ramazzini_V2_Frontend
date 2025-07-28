<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch, inject, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRiesgoTrabajoStore } from '@/stores/riesgosTrabajo';
import type { RiesgoTrabajo } from '@/interfaces/riesgo-trabajo.interface';
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import type { ComponentPublicInstance } from 'vue';
import { startOfMonth, endOfMonth, subMonths, subDays, startOfYear, endOfYear, subYears } from 'date-fns';
import GreenButton from '@/components/GreenButton.vue';
import { exportarRiesgosTrabajoDesdeFrontend } from '@/helpers/exportarExcel';
import ModalRTs from '@/components/ModalRTs.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';

/* =====================
   Variables y Stores
===================== */
const route = useRoute();
const router = useRouter();
const empresasStore = useEmpresasStore();
const centrosStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();
const riesgosTrabajoStore = useRiesgoTrabajoStore();

const empresaId = String(route.params.idEmpresa);
const datosCargados = ref(false);
const riesgosEmpresa = ref<RiesgoTrabajo[]>([]);
const centrosAbiertos = ref<Record<string, boolean>>({});

const showRTsModal = ref(false);
const showDeleteModal = ref(false);

const toast = inject('toast') as any; // Inyectamos el servicio de toast para notificaciones

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
   Notas: Expandir y Verificar Overflow
===================== */
const notasExpandibles = ref<Record<string, boolean>>({});
const refsNotas = ref<Record<string, HTMLElement | null>>({});
const notasConOverflow = ref<Record<string, boolean>>({});

// Verificar overflow cada vez que cambie la referencia
watch(
  () => refsNotas.value,
  () => {
    verificarOverflowTodas();
  },
  { deep: true, immediate: true }
);

function toggleNota(id: string) {
  notasExpandibles.value[id] = !notasExpandibles.value[id];
  verificarOverflow(id);
}

function asignarRefNota(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    refsNotas.value[id] = el;
  } else {
    refsNotas.value[id] = null;
  }
}

function verificarOverflow(id: string) {
  nextTick(() => {
    const el = refsNotas.value[id];
    if (el) {
      // Verificamos si el contenido se desborda
      const tieneOverflow = el.scrollHeight > el.clientHeight;
      notasConOverflow.value[id] = tieneOverflow;
      
      // Si está expandido, mostramos todo
      if (notasExpandibles.value[id]) {
        el.style.maxHeight = "none";
      } else {
        el.style.maxHeight = tieneOverflow ? "4rem" : "none"; // Limitar altura si tiene overflow
      }
    }
  });
}

// Verificar overflow para todas las notas al cargar o cambiar
function verificarOverflowTodas() {
  nextTick(() => {
    for (const id in refsNotas.value) {
      verificarOverflow(id);
    }
  });
}

// Llamar a la inicialización después del montaje
onMounted(() => {
  verificarOverflowTodas();
});

/* =====================
   Funciones de Utilidad
===================== */
function toggleCentro(centroId: string) {
  centrosAbiertos.value[centroId] = !centrosAbiertos.value[centroId];
}

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

function exportarFiltrados() {
  if (!riesgosAgrupados.value || riesgosAgrupados.value.length === 0) {
    console.warn("No hay riesgos para exportar.");
    return;
  }

  // Extraer todos los riesgos filtrados de los grupos
  const riesgosFiltrados: any[] = riesgosAgrupados.value.flatMap(grupo => grupo.riesgos).map((riesgo) => ({
    NombreTrabajador: riesgo.nombreTrabajador || '-',
    Sexo: riesgo.sexoTrabajador || '-',
    Edad: riesgo.fechaNacimiento ? calcularEdad(riesgo.fechaNacimiento) : '-',
    Puesto: riesgo.puestoTrabajador || '-',
    FechaRiesgo: riesgo.fechaRiesgo ? new Date(riesgo.fechaRiesgo).toLocaleDateString() : '-',
    Naturaleza: riesgo.naturalezaLesion || '-',
    ParteCuerpo: riesgo.parteCuerpoAfectada || '-',
    TipoRiesgo: riesgo.tipoRiesgo || '-',
    Manejo: riesgo.manejo || '-',
    Alta: riesgo.alta || '-',
    DíasIncapacidad: riesgo.diasIncapacidad || '-',
    Recaída: riesgo.recaida || '-',
    Secuelas: riesgo.secuelas || '-',
    PorcentajeIPP: riesgo.porcentajeIPP || '-',
    Notas: riesgo.notas || '-',
  }));

  if (riesgosFiltrados.length === 0) {
    console.warn("No hay riesgos filtrados para exportar.");
    return;
  }

  const nombreArchivo = generarNombreArchivoExcel();
  exportarRiesgosTrabajoDesdeFrontend(riesgosFiltrados, nombreArchivo);
}

function generarNombreArchivoExcel(): string {
  const partes: string[] = ['riesgos-trabajo'];

  if (centroSeleccionado.value !== 'todos') partes.push(`centro-${centroSeleccionado.value}`);
  if (sexoSeleccionado.value !== 'todos') partes.push(`sexo-${sexoSeleccionado.value}`);
  if (puestoSeleccionado.value !== 'todos') partes.push(`puesto-${puestoSeleccionado.value}`);
  if (naturalezaSeleccionada.value !== 'todos') partes.push(`naturaleza-${naturalezaSeleccionada.value}`);
  if (parteCuerpoSeleccionada.value !== 'todos') partes.push(`parte-${parteCuerpoSeleccionada.value}`);
  if (tipoRiesgoSeleccionado.value !== 'todos') partes.push(`tipo-${tipoRiesgoSeleccionado.value}`);
  if (manejoSeleccionado.value !== 'todos') partes.push(`manejo-${manejoSeleccionado.value}`);
  if (recaidaSeleccionada.value !== 'todos') partes.push(`recaida-${recaidaSeleccionada.value}`);
  if (secuelasSeleccionadas.value !== 'todos') partes.push(`secuelas-${secuelasSeleccionadas.value}`);

  const fechaActual = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  partes.push(fechaActual);

  return partes.join('_') + '.xlsx';
}

function ordenarRiesgosPorFecha() {
  riesgosEmpresa.value.sort((a, b) => new Date(b.fechaRiesgo || 0).getTime() - new Date(a.fechaRiesgo || 0).getTime());
  riesgosOriginales.value.sort((a, b) => new Date(b.fechaRiesgo || 0).getTime() - new Date(a.fechaRiesgo || 0).getTime());
}

/* =====================
   Inicialización: Fetch de Datos
===================== */
onMounted(async () => {
  await empresasStore.fetchEmpresaById(empresaId);
  await centrosStore.fetchCentrosTrabajo(empresaId);

  const riesgos = await trabajadoresStore.fetchRiesgosTrabajoPorEmpresa(empresaId);
  riesgosOriginales.value = [...riesgos]; // Guardamos una copia de los riesgos completos
  riesgosEmpresa.value = riesgosOriginales.value; // Mostramos los riesgos
  // console.log('Riesgos de trabajo:', riesgosEmpresa.value);

  ordenarRiesgosPorFecha();
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

/* =====================
   Funciones: Edición y Eliminación de RTs
===================== */
const openRTsModal = async (empresaId: string, centroId: string, trabajadorId: string) => {
  showRTsModal.value = false;
  try {
    await trabajadoresStore.fetchTrabajadorById(empresaId, centroId, trabajadorId);
    showRTsModal.value = true;
  } catch (error) {
    console.error('Error al cargar el trabajador:', error);
  }
};

function agregarRiesgoLocalmente(nuevaRT: RiesgoTrabajo) {
  const trabajador = trabajadoresStore.currentTrabajador;

  // Agregar campos del trabajador si están disponibles
  if (trabajador) {
    nuevaRT.nombreTrabajador = trabajador.nombre;
    nuevaRT.sexoTrabajador = trabajador.sexo;
    nuevaRT.fechaNacimiento = trabajador.fechaNacimiento;
    nuevaRT.fechaIngreso = trabajador.fechaIngreso;
    nuevaRT.puestoTrabajador = trabajador.puesto;
  }

  // Evitar duplicados y forzar reactividad
  if (!riesgosEmpresa.value.some(r => r._id === nuevaRT._id)) {
    riesgosEmpresa.value = [...riesgosEmpresa.value, nuevaRT];
  }

  if (!riesgosOriginales.value.some(r => r._id === nuevaRT._id)) {
    riesgosOriginales.value = [...riesgosOriginales.value, nuevaRT];
  }

  ordenarRiesgosPorFecha();

  nextTick(() => verificarOverflow(nuevaRT._id));
}

function actualizarRiesgoLocalmente(riesgoActualizado: RiesgoTrabajo) {
  const index = riesgosEmpresa.value.findIndex(r => r._id === riesgoActualizado._id);
  if (index !== -1) {
    riesgosEmpresa.value.splice(index, 1, riesgoActualizado);
  }

  const indexOriginal = riesgosOriginales.value.findIndex(r => r._id === riesgoActualizado._id);
  if (indexOriginal !== -1) {
    riesgosOriginales.value.splice(indexOriginal, 1, riesgoActualizado);
  }

  // ✅ Fuerza la reactividad de los computeds
  riesgosEmpresa.value = [...riesgosEmpresa.value];
  riesgosOriginales.value = [...riesgosOriginales.value];

  ordenarRiesgosPorFecha();

  nextTick(() => verificarOverflow(riesgoActualizado._id));
}

const deleteConfig = ref<{
  tipo: string;
  id: string | null;
  descripcion: string;
  onConfirm: ((id: string) => Promise<void>) | null;
}>({
  tipo: '',
  id: null,
  descripcion: '',
  onConfirm: null
});

const solicitarEliminacion = (tipo: string, id: string, descripcion: string, onConfirm: (id: string) => Promise<void>) => {
  deleteConfig.value = { tipo, id, descripcion, onConfirm };
  showDeleteModal.value = true;
};

function eliminarRiesgoLocalmente(id: string) {
  riesgosEmpresa.value = riesgosEmpresa.value.filter(r => r._id !== id);
  riesgosOriginales.value = riesgosOriginales.value.filter(r => r._id !== id);
}

const confirmarEliminacion = async () => {
  try {
    const idEliminado = deleteConfig.value.id;
    if (typeof deleteConfig.value.onConfirm === 'function' && idEliminado) {
      await deleteConfig.value.onConfirm(idEliminado);

      // ✅ Actualiza lista de RTs global
      eliminarRiesgoLocalmente(idEliminado);

      // ✅ Actualiza el trabajador actual manualmente
      if (trabajadoresStore.currentTrabajador?.riesgosTrabajo) {
        trabajadoresStore.currentTrabajador.riesgosTrabajo =
          trabajadoresStore.currentTrabajador.riesgosTrabajo.filter(rt => rt._id !== idEliminado);
      }
    }

  } catch (err) {
    toast.open({ message: `Error al eliminar ${deleteConfig.value.tipo}`, type: 'error' });
  } finally {
    showDeleteModal.value = false;
    deleteConfig.value = { tipo: '', id: null, descripcion: '', onConfirm: null };
  }
};

provide('solicitarEliminacion', solicitarEliminacion);

async function eliminarRTDesdeVista(trabajadorId: string, riesgoTrabajoId: string) {
  try {
    await riesgosTrabajoStore.deleteRiesgoTrabajo(trabajadorId, riesgoTrabajoId); 
    eliminarRiesgoLocalmente(riesgoTrabajoId); // Actualiza riesgosEmpresa y riesgosOriginales
    toast.open({ message: 'Riesgo de Trabajo eliminado', type: 'success' });
  } catch (error) {
    console.error(error);
    toast.open({ message: 'Error al eliminar el Riesgo de Trabajo.', type: 'error' });
  }
}

</script>

<template>
  <Transition appear mode="out-in" name="slide-up">
    <div>
      <Transition appear name="fade">
        <ModalRTs
          v-if="showRTsModal"
          @closeModal="showRTsModal = false"
          @riesgoActualizado="actualizarRiesgoLocalmente"
          @riesgoCreado="agregarRiesgoLocalmente"
        />
      </Transition>

      <Transition appear name="fade">
        <ModalEliminar
          v-if="showDeleteModal"
          :id-registro="deleteConfig.id || ''"
          :identificacion="deleteConfig.descripcion"
          :tipo-registro="deleteConfig.tipo"
          @closeModal="showDeleteModal = false"
          @confirmDelete="confirmarEliminacion"
        />
      </Transition>
      
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

          <div class="ml-auto">
            <GreenButton text="Exportar Trabajadores" @click="exportarFiltrados" />
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

        <!-- =======================
             Lista de Riesgos Agrupados por Centro
        ======================= -->
        <div v-for="grupo in riesgosAgrupados" :key="grupo.centroId" class="mb-4">
          <button
            class="text-lg font-semibold flex items-center justify-between w-full text-left bg-white hover:bg-gray-200 p-4 rounded-lg border border-gray-300 shadow-sm transition"
            @click="toggleCentro(grupo.centroId)"
          >
            <div class="flex items-center gap-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {{ grupo.centroNombre }}&nbsp;&nbsp; 
                </h2>
                <p class="text-sm font-normal text-gray-500">{{ grupo.centroDireccion }}</p>
              </div>
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
            </div>
            <span>
              <i :class="centrosAbiertos[grupo.centroId] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </span>
          </button>
          
          <Transition name="desplegar" mode="out-in">
          <div v-if="centrosAbiertos[grupo.centroId]" class="mt-2 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            <div v-if="grupo.riesgos.length === 0" class="text-sm italic text-gray-400 mb-4">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Este centro no tiene riesgos registrados.
            </div>
            <div
              v-for="riesgo in grupo.riesgos"
              :key="riesgo._id"
              class="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-1 hover:shadow-lg transition-all"
            >
              <!-- Encabezado -->
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">
                  {{ riesgo.nombreTrabajador }} <span class="text-sm" :class="riesgo.sexoTrabajador === 'Masculino' ? 'text-blue-600' : 'text-pink-600'">{{ riesgo.sexoTrabajador === 'Masculino' ? '(M)' : '(F)' }}</span> <span class="italic text-sm text-gray-600"> — {{ riesgo.puestoTrabajador }}</span>
                </h3>
                <span class="text-sm text-gray-500">
                  {{ riesgo.fechaRiesgo ? new Date(riesgo.fechaRiesgo).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : 'Fecha no disponible' }}
                </span>
              </div>

              <!-- Edad, Antigüedad y NSS-->
              <div class="text-sm text-gray-600">
                <span v-if="riesgo.numeroEmpleado && riesgo.numeroEmpleado !== '-'">No. Empleado: </span>
                <span v-if="riesgo.numeroEmpleado && riesgo.numeroEmpleado !== '-'" class="font-semibold">{{ riesgo.numeroEmpleado }}</span>
                <span v-if="riesgo.numeroEmpleado && riesgo.numeroEmpleado !== '-'"> | </span>
                <span>Edad: </span>
                <span class="font-semibold">{{ riesgo.fechaNacimiento ? calcularEdad(riesgo.fechaNacimiento) + ' años' : 'Edad desconocida' }} &nbsp;</span>
                <span>| Antigüedad: </span>
                <span class="font-semibold">{{ riesgo.fechaIngreso ? calcularAntiguedad(riesgo.fechaIngreso) : 'Antigüedad desconocida' }} &nbsp;</span>
                <span v-if="riesgo.NSS">| NSS: </span>
                <span v-if="riesgo.NSS" class="font-semibold">{{ riesgo.NSS }}</span>
              </div>
              
              <!-- Naturaleza y parte afectada -->
              <div class="text-lg font-medium text-emerald-700">
                {{ riesgo.naturalezaLesion || 'Sin descripción de lesión' }}
                <span v-if="riesgo.parteCuerpoAfectada" class="text-sm text-gray-600">- {{ riesgo.parteCuerpoAfectada }}</span>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2 text-sm">
                <!-- Recaída -->
                <span
                  v-if="riesgo.recaida === 'Si'"
                  class="px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300"
                >
                 {{ riesgo.recaida === 'Si' ? 'Recaída' : '' }}
                </span>

                <!-- Tipo de Riesgo -->
                <span
                v-if="riesgo.tipoRiesgo"
                :class="{
                  'bg-red-100 text-red-700 border-red-300': riesgo.tipoRiesgo === 'Accidente de Trabajo',
                  'bg-orange-100 text-orange-700 border-orange-300': riesgo.tipoRiesgo === 'Accidente de Trayecto',
                  'bg-pink-100 text-pink-700 border-pink-300': riesgo.tipoRiesgo === 'Enfermedad de Trabajo'
                }"
                  class="px-2 py-1 rounded-full flex items-center gap-1 border border-gray-300"
                  >
                  <template v-if="riesgo.tipoRiesgo === 'Accidente de Trayecto'">🏍️</template>
                  <template v-if="riesgo.tipoRiesgo === 'Accidente de Trabajo'">🛠️</template>
                  <template v-if="riesgo.tipoRiesgo === 'Enfermedad de Trabajo'">🦠</template>
                  {{ riesgo.tipoRiesgo }}
                </span>

                <!-- Manejo -->
                <span
                  v-if="riesgo.manejo"
                  :class="riesgo.manejo === 'IMSS'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-purple-100 text-purple-700 border border-purple-300'"
                  class="px-2 py-1 rounded-full"
                >
                 {{ riesgo.manejo === 'IMSS' ? 'IMSS' : 'Manejo Interno' }}
                </span>

                <!-- Alta / Días de Incapacidad -->
                <span v-if="riesgo.alta === 'Incapacidad Activa'" class="bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-full">
                  Incapacidad activa
                </span>
                <span
                  v-else-if="riesgo.alta"
                  class="bg-cyan-100 text-cyan-700 border border-cyan-300 px-2 py-1 rounded-full"
                >
                  Alta:
                  <span v-if="riesgo.fechaAlta">{{ new Date(riesgo.fechaAlta).toLocaleDateString() }}</span>
                  <span v-else>Fecha no disponible</span>
                </span>
                <span v-if="riesgo.diasIncapacidad" class="bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-1 rounded-full">
                  {{ riesgo.diasIncapacidad }} días de incapacidad
                </span>
                
                <!-- Estatus ST2 -->
                <span v-if="riesgo.manejo == 'IMSS' && riesgo.alta === 'Alta ST2'" class="bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-full">ST2 Recibida</span>
                <span v-else-if="riesgo.manejo == 'IMSS' && riesgo.alta !== 'Alta ST2'" class="bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-full">ST2 Pendiente</span>
                
                <!-- Secuelas e IPP -->
                <span
                  v-if="riesgo.secuelas === 'Si'"
                  class="bg-pink-100 text-pink-700 border border-pink-300 px-2 py-1 rounded-full"
                >
                  Secuelas: {{ riesgo.porcentajeIPP || 0 }}% IPP
                </span>
              </div>

              <!-- Notas -->
              <div
                v-if="riesgo.notas"
                class="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 relative !mt-2"
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

              <div class="flex justify-end gap-2 mt-1">
                <button @click="openRTsModal(empresaId, riesgo.idCentroTrabajo, riesgo.idTrabajador)" class="text-blue-600 hover:underline text-xs">Editar</button>
              <button
                class="text-red-600 hover:underline text-xs"
                @click="solicitarEliminacion(
                  'Riesgo de Trabajo',
                  riesgo._id,
                  riesgo.naturalezaLesion || 'Sin descripción',
                  () => eliminarRTDesdeVista(riesgo.idTrabajador, riesgo._id)
                )"
              >
                Eliminar
              </button>


              </div>

            </div>
          </div>
          </Transition>

        </div>

          <div class="flex justify-center gap-4 mt-10">
            <button
              type="button"
              @click="router.push({ name: 'dashboard-rt', params: { idEmpresa: empresasStore.currentEmpresaId } })"
              class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition duration-300"
            >
              <i class="fas fa-chart-line"></i>
              Estadísticas de RTs
            </button>
          </div>

        <!-- =======================
             Botón de Regreso
        ======================= -->
        <button @click="$router.back()" class="inline-block text-gray-700 hover:text-emerald-500 font-medium mt-4">
          ← Regresar
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.desplegar-enter-active,
.desplegar-leave-active {
  transition: all 0.4s ease;
  overflow: hidden;
}

.desplegar-enter-from,
.desplegar-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.desplegar-enter-to,
.desplegar-leave-from {
  opacity: 1;
  max-height: 1000px; /* lo suficientemente grande */
  transform: translateY(0);
}

</style>