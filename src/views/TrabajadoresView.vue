<script setup lang="ts">
// 1. Imports
import { ref, reactive, nextTick, onMounted, inject, watch, computed, provide } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad, determinarVistaCorregida } from '@/helpers/dates';
import { exportarTrabajadoresDesdeFrontend } from '@/helpers/exportarExcel';
import $ from 'jquery';

import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';
import ModalTrabajadores from '@/components/ModalTrabajadores.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import ModalCargaMasiva from '@/components/ModalCargaMasiva.vue';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import ModalRiesgos from '@/components/ModalRiesgos.vue';
import ModalRTs from '@/components/ModalRTs.vue';

import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';
import type { Trabajador } from '../interfaces/trabajador.interface';

// 2. Stores, rutas y helpers
const toast: any = inject('toast');
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const route = useRoute();
const router = useRouter();

// 3. Refs y estado reactivo
const showModal = ref(false);
const showDeleteModal = ref(false);
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
const showImportModal = ref(false);
const showSubscriptionModal = ref(false);
const showRTsModal = ref(false);
const showRisksModal = ref(false);
const selectedTrabajadorId = ref<string | null>(null);
const selectedTrabajadorNombre = ref<string | null>(null);
const dataTableRef = ref();
const mostrarFiltros = ref(false);
const filtrosAplicados = reactive(new Set<string>());
const mostrarTabla = ref(false);
const mostrarColumnasOcultas = ref(false);
const actualizandoTabla = ref(false);

// 4. Filtros
const filtrosConfig = [
  { id: 'sexo', label: 'Sexo', opciones: ['Masculino', 'Femenino'] },
  { id: 'puesto', label: 'Puesto', opciones: () => puestosUnicos.value },
  { id: 'imc', label: 'Categoria IMC', opciones: [
    'Bajo peso', 'Normal', 'Sobrepeso',
    'Obesidad clase I', 'Obesidad clase II', 'Obesidad clase III', '-'
  ]},
  { id: 'cintura', label: 'Cintura', opciones: [
    'Bajo Riesgo', 'Riesgo Aumentado', 'Alto Riesgo', '-'
  ]},
  { id: 'aptitud', label: 'Aptitud', opciones: [
    'Apto Sin Restricciones', 'Apto Con Precaución', 'Apto Con Restricciones',
    'No Apto', 'Evaluación No Completada', '-'
  ]},
  { id: 'lentes', label: 'Requiere Lentes', opciones: ['Requiere lentes', 'No requiere', '-'] },
  { id: 'correccionVisual', label: 'Vista corregida', opciones: ['Corregida', 'Sin corregir', 'No requiere', '-'] },
  { id: 'agudeza', label: 'Agudeza Visual', opciones: [
    'Visión excepcional',
    'Visión normal',
    'Visión ligeramente reducida',
    'Visión moderadamente reducida',
    'Visión significativamente reducida',
    'Visión muy reducida'
  ]},
  { id: 'daltonismo', label: 'Visión de color', opciones: ['Normal', 'Daltonismo']},
  { id: 'diabetico', label: 'Diabético', opciones: ['Si', 'No', '-'] },
  { id: 'hipertensivo', label: 'Hipertensivo', opciones: ['Si', 'No', '-'] },
  { id: 'cardiopatico', label: 'Cardiopatías', opciones: ['Si', 'No', '-'] },
  { id: 'epilepsia', label: 'Epilepsias', opciones: ['Si', 'No', '-'] },
  { id: 'alergia', label: 'Alergias', opciones: ['Si', 'No', '-'] },
  { id: 'lumbalgia', label: 'Lumbalgia', opciones: ['Si', 'No', '-'] },
  { id: 'accidente', label: 'Accidentes', opciones: ['Si', 'No', '-'] },
  { id: 'quirurgico', label: 'Cirugias', opciones: ['Si', 'No', '-'] },
  { id: 'traumatico', label: 'Traumatismos', opciones: ['Si', 'No', '-'] },
  { id: 'exposicion', label: 'Exposición a riesgos', opciones: [
    'Ergonómicos', 'Ruido', 'Polvos', 'Químicos', 'Psicosociales',
    'Temperaturas elevadas', 'Temperaturas abatidas', 'Vibraciones', 'Biológicos Infecciosos', '-'
  ]},
  { id: 'consultas', label: 'Consultas', opciones: ['Si', 'No']},
  { id: 'periodo', label: 'Periodo', opciones: [
    'Hoy', 'Esta semana', 'Este mes', 'Mes anterior', 
    'Últimos 3 meses', 'Últimos 6 meses', 'Este año', 'Año anterior'
  ]},
  { id: 'estadoLaboral', label: 'Estado Laboral', opciones: ['Activo', 'Inactivo'] }
];

const filtros = reactive<Record<string, string>>({
  sexo: '',
  puesto: '',
  imc: '',
  cintura: '',
  aptitud: '',
  lentes: '',
  correccionVisual: '',
  agudeza: '',
  daltonismo: '',
  diabetico: '',
  hipertensivo: '',
  cardiopatico: '',
  epilepsia: '',
  alergia: '',
  lumbalgia: '',
  accidente: '',
  quirurgico: '',
  traumatico: '',
  exposicion: '',
  consultas: '',
  periodo: '',
  estadoLaboral: 'Activo',
});

function actualizarEstadoFiltro(id: string, valor: string) {
  if ((id === 'estadoLaboral' && valor === 'Activo') || (id !== 'estadoLaboral' && valor === '')) {
    filtrosAplicados.delete(id);
  } else {
    filtrosAplicados.add(id);
  }
}

function actualizarFiltroYGuardar(id: string) {
  actualizarEstadoFiltro(id, filtros[id]);
  localStorage.setItem(`filtro-${id}`, filtros[id]);
  dataTableRef.value?.aplicarTodosLosFiltrosDesdeLocalStorage();
}

function resetearFiltros() {
  Object.keys(filtros).forEach(id => {
    filtros[id] = id === 'estadoLaboral' ? 'Activo' : '';
    if (id === 'estadoLaboral') {
      localStorage.setItem(`filtro-${id}`, 'Activo');
    } else {
      localStorage.removeItem(`filtro-${id}`);
    }
    actualizarEstadoFiltro(id, filtros[id]);
  });
  dataTableRef.value?.aplicarTodosLosFiltrosDesdeLocalStorage();
}

const hayFiltrosActivos = computed(() => filtrosAplicados.size > 0);

// 5. Ciclo de vida
onMounted(async () => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  const guardado = localStorage.getItem('mostrarFiltros');

  // const t0 = performance.now();
  await trabajadores.fetchTrabajadoresConHistoria(empresaId, centroTrabajoId);
  await nextTick();
  mostrarTabla.value = true;

  // const t1 = performance.now();
  // console.log('Tiempo en cargar y renderizar trabajadores:', t1 - t0, 'ms');

  // requestIdleCallback(() => {
  //   const renderEnd = performance.now();
  //   console.log('Tiempo desde nextTick hasta render:', renderEnd - t1, 'ms');
  // });

  //console.log('Trabajadores:', trabajadores.trabajadores);

  aplicarFiltrosDesdeQuery(route.query);
  router.replace({ query: {} });
  await nextTick();
  dataTableRef.value?.aplicarTodosLosFiltrosDesdeLocalStorage();
  
  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
  mostrarFiltros.value = guardado === 'true';

  filtrosConfig.forEach(({ id }) => {
    const select = document.getElementById(`filtro-${id}`) as HTMLSelectElement;
    const valorGuardado = localStorage.getItem(`filtro-${id}`) ?? '';
    filtros[id] = valorGuardado;
    actualizarEstadoFiltro(id, filtros[id]);

    if (select) {
      select.addEventListener('change', () => {
        actualizarEstadoFiltro(id, filtros[id]);
      });
    }
  });
});

watch(mostrarFiltros, (nuevoValor) => {
  localStorage.setItem('mostrarFiltros', String(nuevoValor));
});


// 6. Funciones de modales
const toggleImportModal = () => {
  showImportModal.value = !showImportModal.value;
};

const openModal = async (empresa: Empresa | null = null, centroTrabajo: CentroTrabajo | null = null, trabajador: Trabajador | null = null) => {
  showModal.value = false;
  trabajadores.loadingModal;

  if (empresa && centroTrabajo && trabajador) {
    try {
      await trabajadores.fetchTrabajadorById(empresa._id, centroTrabajo._id, trabajador._id);
    } catch (error) {
      console.error('Error al cargar el trabajador:', error);
    }
  } else {
    trabajadores.resetCurrentTrabajador();
  }

  trabajadores.loadingModal = false;
  showModal.value = true;
};

const closeModal = () => showModal.value = false;

const solicitarEliminacion = (tipo, id, descripcion, onConfirm) => {
  deleteConfig.value = { tipo, id, descripcion, onConfirm };
  showDeleteModal.value = true;
};
provide('solicitarEliminacion', solicitarEliminacion);

const confirmarEliminacion = async () => {
  try {
    if (typeof deleteConfig.value.onConfirm === 'function'&& deleteConfig.value.id) {
      await deleteConfig.value.onConfirm(deleteConfig.value.id);
    }
  } catch (err) {
    toast.open({ message: `Error al eliminar ${deleteConfig.value.tipo}`, type: 'error' });
  } finally {
    showDeleteModal.value = false;
    deleteConfig.value = { tipo: '', id: null, descripcion: '', onConfirm: null };
  }
};

const toggleDeleteModal = (id: string | null = null, nombre: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedTrabajadorId.value = id;
  selectedTrabajadorNombre.value = nombre;
};

const openRTsModal = async (empresa: Empresa | null, centro: CentroTrabajo | null, trabajador: Trabajador | null) => {
  showRTsModal.value = false;
  trabajadores.loadingModal;
  if (empresa && centro && trabajador) {
    try {
      await trabajadores.fetchTrabajadorById(empresa._id, centro._id, trabajador._id);
    } catch (error) {
      console.error('Error al cargar el trabajador:', error);
    }
  }
  trabajadores.loadingModal = false;
  showRTsModal.value = true;
};

const closeRTsModal = () => showRTsModal.value = false;

const openRisksModal = async (empresa: Empresa | null, centro: CentroTrabajo | null, trabajador: Trabajador | null) => {
  showRisksModal.value = false;
  trabajadores.loadingModal;
  if (empresa && centro && trabajador) {
    try {
      await trabajadores.fetchTrabajadorById(empresa._id, centro._id, trabajador._id);
    } catch (error) {
      console.error('Error al cargar el trabajador:', error);
    }
  }
  trabajadores.loadingModal = false;
  showRisksModal.value = true;
};

const closeRisksModal = () => showRisksModal.value = false;

// 7. Funciones de negocio
const exportTrabajadores = async () => {
  try {
    const empresaId = String(route.params.idEmpresa);
    const centroTrabajoId = String(route.params.idCentroTrabajo);
    await trabajadores.exportTrabajadores(empresaId, centroTrabajoId);
  } catch (error) {
    console.error('Error al exportar los trabajadores', error);
  }
};

const deleteTrabajadorById = async (empresaId: string, centroTrabajoId: string, trabajadorId: string) => {
  try {
    await trabajadores.deleteTrabajadorById(empresaId, centroTrabajoId, trabajadorId);
    toast.open({ message: 'Trabajador eliminado con éxito' });
    await trabajadores.fetchTrabajadoresConHistoria(empresaId, centroTrabajoId);
    trabajadores.resetCurrentTrabajador();
  } catch (error) {
    console.log('Error al eliminar al trabajador', error);
    toast.open({ message:  'No se pudo eliminar el trabajador. Por favor, elimine primero sus documentos y vuelva a intentarlo', type: 'error' });
  }
};

const eliminarTrabajador = async (trabajadorId: string) => {
  try {
    const empresaId = empresas.currentEmpresaId;
    const centroTrabajoId = centrosTrabajo.currentCentroTrabajoId;

    if (!empresaId || !centroTrabajoId) throw new Error('Faltan datos');

    await deleteTrabajadorById(empresaId, centroTrabajoId, trabajadorId);
  } catch (err) {
    toast.open({ message: 'Error al eliminar trabajador', type: 'error' });
  }
};

const toggleEstadoLaboral = async (trabajador: { _id: string; estadoLaboral: string; }) => {
  try {
    const { currentEmpresaId } = empresas;
    const { currentCentroTrabajoId } = centrosTrabajo;
    if (!currentEmpresaId || !currentCentroTrabajoId || !trabajador?._id || !trabajador.estadoLaboral) {
      throw new Error('Faltan datos');
    }

    const nuevoEstado = trabajador.estadoLaboral === 'Activo' ? 'Inactivo' : 'Activo';
    await trabajadores.updateTrabajador(
      currentEmpresaId, currentCentroTrabajoId, trabajador._id, { estadoLaboral: nuevoEstado }
    );

    await trabajadores.fetchTrabajadoresConHistoria(currentEmpresaId, currentCentroTrabajoId);
    toast.open({ message: nuevoEstado === 'Activo' ? 'Trabajador reincorporado exitosamente' : 'Baja de trabajador registrada' });
  } catch (error) {
    console.error('Error al actualizar el estado laboral', error);
    toast.open({ message: 'Error al actualizar el estado laboral', type: 'error' });
  }
};

function generarNombreArchivoExcel(): string {
  const partes: string[] = ['trabajadores'];

  filtrosAplicados.forEach((filtroId) => {
    const valor = filtros[filtroId];
    if (valor) {
      // Normaliza: sin espacios y en minúsculas
      const valorNormalizado = valor.toLowerCase().replace(/\s+/g, '-');
      partes.push(`${filtroId}-${valorNormalizado}`);
    }
  });

  const fechaActual = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  partes.push(fechaActual);

  return partes.join('_') + '.xlsx';
}

const exportarFiltrados = () => {
  if (!dataTableRef.value) return;

  const table = $('#customTable').DataTable();
  const rowData = table.rows({ search: 'applied' }).data().toArray(); // ✅ todas las filas filtradas

  const trabajadoresFiltrados: any[] = rowData.map((row: any) => ({
    numeroEmpleado: row.numeroEmpleado,
    nombre: row.nombre,
    edad: calcularEdad(row.fechaNacimiento),
    sexo: row.sexo,
    escolaridad: row.escolaridad,
    puesto: row.puesto,
    antiguedad: calcularAntiguedad(row.fechaIngreso),
    telefono: row.telefono,
    estadoCivil: row.estadoCivil,
    imc: row.exploracionFisicaResumen?.categoriaIMC || '-',
    cintura: row.exploracionFisicaResumen?.categoriaCircunferenciaCintura || '-',
    categoriaTensionArterial: row.exploracionFisicaResumen?.categoriaTensionArterial || '-',
    aptitud: row.aptitudResumen?.aptitudPuesto || '-',
    requiereLentes: row.examenVistaResumen?.requiereLentesUsoGeneral || '-',
    correccionVisual: determinarVistaCorregida(
      row.examenVistaResumen?.requiereLentesUsoGeneral,
      Number(row.examenVistaResumen?.ojoIzquierdoLejanaConCorreccion),
      Number(row.examenVistaResumen?.ojoDerechoLejanaConCorreccion)
    ),
    agudeza: row.examenVistaResumen?.sinCorreccionLejanaInterpretacion || '-',
    daltonismo: row.examenVistaResumen?.interpretacionIshihara || '-',
    diabetico: row.historiaClinicaResumen?.diabeticosPP || '-',
    hipertensivo: row.historiaClinicaResumen?.hipertensivosPP || '-',
    cardiopatico: row.historiaClinicaResumen?.cardiopaticosPP || '-',
    epilepsia: row.historiaClinicaResumen?.epilepticosPP || '-',
    alergia: row.historiaClinicaResumen?.alergicos || '-',
    lumbalgia: row.historiaClinicaResumen?.lumbalgias || '-',
    accidente: row.historiaClinicaResumen?.accidentes || '-',
    quirurgico: row.historiaClinicaResumen?.quirurgicos || '-',
    traumatico: row.historiaClinicaResumen?.traumaticos || '-',
    respiratorios: row.historiaClinicaResumen?.respiratorios || '-',
    alcoholismo: row.historiaClinicaResumen?.alcoholismo || '',
    tabaquismo: row.historiaClinicaResumen?.tabaquismo || '',
    agentesRiesgo: Array.isArray(row.agentesRiesgoActuales) && row.agentesRiesgoActuales.length
      ? row.agentesRiesgoActuales.join(', ')
      : '-',
    consultas: row.consultaResumen?.fechaNotaMedica ? 'Si' : 'No',
    estadoLaboral: row.estadoLaboral || '-'
  }));

  const nombreArchivo = generarNombreArchivoExcel();
  exportarTrabajadoresDesdeFrontend(trabajadoresFiltrados, nombreArchivo);
};

const filtrosValidos = {
  imc: ['Bajo peso', 'Normal', 'Sobrepeso', 'Obesidad clase I', 'Obesidad clase II', 'Obesidad clase III'],
  cintura: ['Bajo Riesgo', 'Riesgo Aumentado', 'Alto Riesgo', '-'],
  aptitud: ['Apto Sin Restricciones', 'Apto Con Precaución', 'Apto Con Restricciones', 'No Apto', 'Evaluación No Completada'],
  lentes: ['Requiere lentes', 'No requiere'],
  correccionVisual: ['Corregida', 'Sin corregir', 'No requiere'],
  agudeza: [
    'Visión excepcional', 'Visión normal', 'Visión ligeramente reducida', 'Visión moderadamente reducida', 
    'Visión significativamente reducida', 'Visión muy reducida'
  ],
  daltonismo: ['Daltonismo', 'Normal'],
  diabetico: ['Si', 'No', '-'],
  hipertensivo: ['Si', 'No', '-'],
  cardiopatico: ['Si', 'No', '-'],
  epilepsia: ['Si', 'No', '-'],
  alergia: ['Si', 'No', '-'],
  lumbalgia: ['Si', 'No', '-'],
  accidente: ['Si', 'No', '-'],
  quirurgico: ['Si', 'No', '-'],
  traumatico: ['Si', 'No', '-'],
  exposicion: [
    'Ergonómicos', 'Ruido', 'Polvos', 'Químicos', 'Psicosociales', 'Temperaturas elevadas', 'Temperaturas abatidas', 
    'Vibraciones', 'Biológicos Infecciosos', '-'
  ],
  consultas: ['Si', 'No'],
};

function aplicarFiltrosDesdeQuery(query: RouteLocationNormalizedLoaded['query']) {
  const filtrosEnQuery = Object.entries(filtrosValidos).filter(([filtroId, valores]) => {
    const valor = query[filtroId];
    return typeof valor === 'string' && valores.includes(valor);
  });

  if (filtrosEnQuery.length > 0) {
    resetearFiltros(); // 🔁 Limpia localStorage y estado reactivo
  }

  filtrosEnQuery.forEach(([filtroId, _valores]) => {
    const valor = query[filtroId] as string;
    filtros[filtroId] = valor;
    localStorage.setItem(`filtro-${filtroId}`, valor);
    actualizarEstadoFiltro(filtroId, valor);
  });
}

// 8. Computadas
const puestosUnicos = computed(() => {
  const puestos = trabajadores.trabajadores.map(t => t.puesto).filter(Boolean);
  return [...new Set(puestos)].sort();
});

const toggleColumnasOcultas = () => {
  // Activar estado de actualización inmediatamente
  actualizandoTabla.value = true;
  
  // Cambiar el valor después de un pequeño delay para que la UI se actualice
  setTimeout(() => {
    mostrarColumnasOcultas.value = !mostrarColumnasOcultas.value;
  }, 10);
};

</script>

<template>
  <!-- Modales -->
  <Transition appear name="fade">
    <ModalTrabajadores v-if="showModal" @closeModal="closeModal" @openSubscriptionModal="showSubscriptionModal = true" />
  </Transition>

  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" @closeModal="showSubscriptionModal = false" />
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar
      v-if="showDeleteModal"
      :idRegistro="deleteConfig.id ?? ''"
      :identificacion="deleteConfig.descripcion"
      :tipoRegistro="deleteConfig.tipo"
      @closeModal="showDeleteModal = false"
      @confirmDelete="confirmarEliminacion"
    />
  </Transition>

  <Transition appear name="fade">
    <ModalCargaMasiva v-if="showImportModal" @openSubscriptionModal="showSubscriptionModal = true" @closeModal="toggleImportModal" />
  </Transition>

  <Transition appear name="fade">
    <ModalRTs v-if="showRTsModal" @closeModal="closeRTsModal" @solicitarEliminacion="solicitarEliminacion" />
  </Transition>

  <Transition appear name="fade">
    <ModalRiesgos v-if="showRisksModal" @closeModal="closeRisksModal" />
  </Transition>

  <!-- Encabezado de acciones -->
  <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-8 my-6">
    <GreenButton text="Nuevo Trabajador +" @click="openModal(null)" />
    <GreenButton text="Carga Masiva" @click="toggleImportModal" />
    <!-- <GreenButton text="Exportar Todos" @click="exportTrabajadores" /> -->
    <GreenButton text="Exportar Trabajadores" @click="exportarFiltrados" />
  </div>

  <!-- Toggle filtros + indicador -->
  <div class="flex justify-center items-center gap-3 my-4">
    <button
      @click="mostrarFiltros = !mostrarFiltros"
      class="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition duration-200 flex items-center gap-2"
    >
      <i :class="mostrarFiltros ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
      {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
    </button>

    <button
      @click="toggleColumnasOcultas"
      :disabled="actualizandoTabla"
      :class="[
        'text-sm px-3 py-1.5 rounded-md transition duration-200 flex items-center gap-2',
        actualizandoTabla 
          ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
          : 'text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-300'
      ]"
    >
      <i v-if="actualizandoTabla" class="fa-solid fa-spinner fa-spin"></i>
      <i v-else :class="mostrarColumnasOcultas ? 'fa-solid fa-table-columns' : 'fa-solid fa-table'"></i>
      {{ actualizandoTabla ? 'Actualizando tabla...' : (mostrarColumnasOcultas ? 'Ocultar columnas' : 'Mostrar todas las columnas') }}
    </button>

    <div v-if="hayFiltrosActivos" class="flex items-center gap-1 text-xs text-emerald-600 font-medium">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      Filtros activos
    </div>
  </div>

  <!-- Sección de filtros -->
  <Transition name="desplegar-filtros" mode="out-in">
    <div v-if="mostrarFiltros" class="flex flex-wrap gap-4 my-6 justify-center">
      <div v-for="filtro in filtrosConfig" :key="filtro.id">
        <label class="block text-sm font-medium text-gray-700">{{ filtro.label }}</label>
        <select
          :id="`filtro-${filtro.id}`"
          v-model="filtros[filtro.id]"
          @change="actualizarFiltroYGuardar(filtro.id)"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has(filtro.id) ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option
            v-for="opcion in typeof filtro.opciones === 'function' ? filtro.opciones() : filtro.opciones"
            :key="opcion"
            :value="opcion"
          >
            {{ opcion }}
          </option>
        </select>
        <div v-if="filtrosAplicados.has(filtro.id)" class="flex items-center gap-1 mt-1">
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">Filtro aplicado</span>
        </div>
      </div>

      <div class="block text-xs">
        <label class="block text-xs font-medium text-gray-100 mb-0.5">Filtros</label>
        <button
          @click="resetearFiltros"
          class="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex items-center justify-center mx-auto gap-2"
        >
          <i class="fa-solid fa-filter-circle-xmark"></i>
          Quitar Filtros
        </button>
      </div>
    </div>
  </Transition>

  <!-- Tabla o mensaje de carga -->
  <Transition appear mode="out-in" name="slide-up">
    <div v-if="trabajadores.loading">
      <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
    </div>
    <div v-else>
      <DataTableDT
        ref="dataTableRef"
        :rows="trabajadores.trabajadores || []"
        :mostrarColumnasOcultas="mostrarColumnasOcultas"
        v-if="mostrarTabla"
        class="table-auto z-1"
        @riesgo-trabajo="openRTsModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo || null, $event)"
        @riesgos="openRisksModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo || null, $event)"
        @editar="openModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, $event)"
        @toggle-estado-laboral="toggleEstadoLaboral($event)"
        @eliminar="solicitarEliminacion('Trabajador', $event.id, $event.nombre, eliminarTrabajador)"
        @actualizando-tabla="actualizandoTabla = $event"
      />

      <h1 v-else class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700 mt-10">
        Este centro de trabajo aún no tiene trabajadores registrados
      </h1>

      <!-- Botones de acciones -->
      <div class="flex justify-center gap-4 mt-10">
        <button
          type="button"
          @click="router.push({ name: 'dashboard-empresa', params: { idEmpresa: empresas.currentEmpresaId } })"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition duration-300"
        >
          <i class="fas fa-chart-line"></i>
          Estadísticas de salud
        </button>
        <button
          type="button"
          @click="router.push({ name: 'riesgos-trabajo', params: { idEmpresa: empresas.currentEmpresaId } })"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition duration-300"
        >
          <i class="fas fa-hard-hat"></i>
          Riesgos de Trabajo
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.desplegar-filtros-enter-active,
.desplegar-filtros-leave-active {
  transition: all 0.4s ease;
  overflow: hidden;
}

.desplegar-filtros-enter-from,
.desplegar-filtros-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.desplegar-filtros-enter-to,
.desplegar-filtros-leave-from {
  opacity: 1;
  max-height: 1000px; /* lo suficientemente grande */
  transform: translateY(0);
}

</style>