<script setup lang="ts">
// 1. Imports
import { ref, reactive, nextTick, onMounted, inject, watch, computed } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import { exportarTrabajadoresDesdeFrontend } from '@/helpers/exportarExcel';
import $ from 'jquery';

import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';
import ModalTrabajadores from '@/components/ModalTrabajadores.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import ModalCargaMasiva from '@/components/ModalCargaMasiva.vue';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import ModalRiesgos from '@/components/ModalRiesgos.vue';

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
const showImportModal = ref(false);
const showSubscriptionModal = ref(false);
const showRisksModal = ref(false);
const selectedTrabajadorId = ref<string | null>(null);
const selectedTrabajadorNombre = ref<string | null>(null);
const dataTableRef = ref();
const mostrarFiltros = ref(false);
const filtrosAplicados = reactive(new Set<string>());
const mostrarTabla = ref(false);

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
    'Últimos 3 meses', 'Este año', 'Año anterior'
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
  console.log('Trabajadores:', trabajadores.trabajadores);

  const query = route.query;

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

const toggleDeleteModal = (id: string | null = null, nombre: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedTrabajadorId.value = id;
  selectedTrabajadorNombre.value = nombre;
};

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

const determinarVistaCorregida = (
  requiereLentesUsoGeneral?: string | null,
  ojoIzquierdoLejanaConCorreccion?: number | null,
  ojoDerechoLejanaConCorreccion?: number | null
): string => {
  if (requiereLentesUsoGeneral === 'No') {
    return 'No requiere';
  } else if (requiereLentesUsoGeneral === 'Si') {
    // Si al menos un ojo tiene corrección
    return ((ojoIzquierdoLejanaConCorreccion ?? 0) > 0 || (ojoDerechoLejanaConCorreccion ?? 0) > 0) 
      ? 'Corregida' 
      : 'Sin corregir';
  } else {
    return '-';
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
  const data = table.rows().nodes().filter((tr: HTMLElement) => $(tr).is(':visible'));
  const rowData = Array.from(data).map(row => table.row(row).data());

  const trabajadoresFiltrados: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    trabajadoresFiltrados.push({
      nombre: row[1],
      edad: row[3],
      sexo: row[4],
      escolaridad: row[5],
      puesto: row[6],
      antiguedad: row[7],
      telefono: row[8],
      estadoCivil: row[9],
      hijos: row[10],
      imc: row[11],
      cintura: row[12],
      aptitud: row[13],
      requiereLentes: row[14],
      correccionVisual: row[15],
      agudeza: row[16],
      daltonismo: row[17],
      diabetico: row[18],
      hipertensivo: row[19],
      cardiopatico: row[20],
      epilepsia: row[21],
      alergia: row[22],
      lumbalgia: row[23],
      accidente: row[24],
      quirurgico: row[25],
      traumatico: row[26],
      agentesRiesgo: row[27],
      consultas: row[28],
      estadoLaboral: row[29],
    });
  }

  const nombreArchivo = generarNombreArchivoExcel();
  exportarTrabajadoresDesdeFrontend(trabajadoresFiltrados, nombreArchivo);

};

const filtrosValidos = {
  imc: ['Bajo peso', 'Normal', 'Sobrepeso', 'Obesidad clase I', 'Obesidad clase II', 'Obesidad clase III'],
  aptitud: ['Apto Sin Restricciones', 'Apto Con Precaución', 'Apto Con Restricciones', 'No Apto', 'Evaluación No Completada'],
  lentes: ['Requiere lentes', 'No requiere'],
  correccionVisual: ['Corregida', 'Sin corregir', 'No requiere'],
  daltonismo: ['Daltonismo', 'Normal'],
  agudeza: [
    'Visión excepcional', 'Visión normal', 'Visión ligeramente reducida', 'Visión moderadamente reducida', 
    'Visión significativamente reducida', 'Visión muy reducida'
  ],
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
  cintura: ['Bajo Riesgo', 'Riesgo Aumentado', 'Alto Riesgo', '-']
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
      v-if="showDeleteModal && selectedTrabajadorId && selectedTrabajadorNombre"
      :idRegistro="selectedTrabajadorId"
      :identificacion="selectedTrabajadorNombre"
      tipoRegistro="Trabajador"
      @closeModal="toggleDeleteModal"
      @confirmDelete="deleteTrabajadorById"
    />
  </Transition>

  <Transition appear name="fade">
    <ModalCargaMasiva v-if="showImportModal" @openSubscriptionModal="showSubscriptionModal = true" @closeModal="toggleImportModal" />
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
      <DataTableDT ref="dataTableRef" v-if="mostrarTabla" class="table-auto z-1">
        <tr
          v-for="(trabajador, index) in trabajadores.trabajadores"
          :key="trabajador._id"
          class="hover:bg-gray-200 cursor-pointer"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ trabajador.nombre }}</td>
          <td>{{ convertirFechaISOaDDMMYYYY(trabajador.updatedAt) }}</td>
          <td>{{ calcularEdad(trabajador.fechaNacimiento) }} años</td>
          <td>{{ trabajador.sexo }}</td>
          <td>{{ trabajador.escolaridad }}</td>
          <td>{{ trabajador.puesto }}</td>
          <td>{{ calcularAntiguedad(trabajador.fechaIngreso) }}</td>
          <td>{{ trabajador.telefono || '-' }}</td>
          <td>{{ trabajador.estadoCivil }}</td>
          <td>{{ trabajador.hijos }}</td>
          <td>{{ trabajador.exploracionFisicaResumen?.categoriaIMC || '-' }}</td>
          <td>{{ trabajador.exploracionFisicaResumen?.categoriaCircunferenciaCintura || '-' }}</td>
          <td>{{ trabajador.aptitudResumen?.aptitudPuesto || '-' }}</td>
          <td>{{ trabajador.examenVistaResumen?.requiereLentesUsoGeneral === 'Si' ? 'Requiere lentes' : 'No requiere' }}</td>
          <td>{{ determinarVistaCorregida(trabajador.examenVistaResumen?.requiereLentesUsoGeneral, Number(trabajador.examenVistaResumen?.ojoIzquierdoLejanaConCorreccion), Number(trabajador.examenVistaResumen?.ojoDerechoLejanaConCorreccion)) }}</td>
          <td>{{ trabajador.examenVistaResumen?.sinCorreccionLejanaInterpretacion || '-' }}</td>
          <td>{{ trabajador.examenVistaResumen?.interpretacionIshihara || '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.diabeticosPP === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.hipertensivosPP === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.cardiopaticosPP === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.epilepticosPP === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.alergicos === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.lumbalgias === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.accidentes === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.quirurgicos === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.historiaClinicaResumen?.traumaticos === 'Si' ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.agentesRiesgoActuales?.join(', ') || '-' }}</td>
          <td>{{ trabajador.consultaResumen?.fechaNotaMedica ? 'Si' : 'No' }}</td>
          <td>{{ trabajador.estadoLaboral || '-' }}</td>
          <td>
            <button
              type="button"
              class="bg-emerald-600 text-white rounded-full px-2 py-1 transition-transform duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600"
              @click="router.push({ name: 'expediente-medico', params: { idEmpresa: empresas.currentEmpresaId, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })"
            >
              Expediente
            </button>
          </td>
          <td>
            <!-- Acciones: Riesgos, Editar, Alta/Baja, Eliminar -->
            <div class="relative h-[32px]">
              <!-- Riesgos -->
              <button
                type="button"
                class="group absolute left-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-gray-300 hover:bg-amber-400 text-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-amber-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="openRisksModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo || null, trabajador)"
              >
                <i class="fa-solid fa-exclamation-triangle"></i>
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm">
                  Riesgos
                </span>
              </button>

              <!-- Editar -->
              <button
                type="button"
                class="group absolute left-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-sky-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="openModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, trabajador)"
              >
                <i class="fa-regular fa-pen-to-square"></i>
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm">
                  Editar
                </span>
              </button>

              <!-- Alta -->
              <button
                v-if="trabajador.estadoLaboral === 'Inactivo'"
                type="button"
                class="group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-green-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleEstadoLaboral(trabajador)"
              >
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm">
                  Alta
                </span>
                <i class="fa-solid fa-person-arrow-up-from-line"></i>
              </button>

              <!-- Baja -->
              <button
                v-else
                type="button"
                class="group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-orange-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleEstadoLaboral(trabajador)"
              >
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm">
                  Baja
                </span>
                <i class="fa-solid fa-person-arrow-down-to-line"></i>
              </button>

              <!-- Eliminar -->
              <button
                type="button"
                class="group absolute right-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-red-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleDeleteModal(trabajador._id, trabajador.nombre)"
              >
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm order-1">
                  Eliminar
                </span>
                <i class="fa-solid fa-trash-can order-2"></i>
              </button>
            </div>
          </td>
        </tr>
      </DataTableDT>

      <h1 v-else class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700 mt-10">
        Este centro de trabajo aún no tiene trabajadores registrados
      </h1>

      <button
        type="button"
        @click="router.push({ name: 'dashboard-empresa', params: { idEmpresa: empresas.currentEmpresaId } })"
        class="block mx-auto text-sm w-1/8 mt-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 p-2 transition duration-300"
      >
        <i class="fas fa-chart-line mr-2"></i> Ver estadísticas de la empresa
      </button>
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