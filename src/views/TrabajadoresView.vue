<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, inject, watch, computed } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRoute, useRouter } from 'vue-router';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import GreenButton from '@/components/GreenButton.vue';
import DataTableDT from '@/components/DataTableDT.vue';
import ModalTrabajadores from '@/components/ModalTrabajadores.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import ModalCargaMasiva from '@/components/ModalCargaMasiva.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import type { CentroTrabajo } from '@/interfaces/centro-trabajo.interface';
import type { Trabajador } from '../interfaces/trabajador.interface';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import ModalRiesgos from '@/components/ModalRiesgos.vue';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const route = useRoute();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const showImportModal = ref(false);
const showSubscriptionModal = ref(false);
const showRisksModal = ref(false);
const selectedTrabajadorId = ref<string | null>(null);
const selectedTrabajadorNombre = ref<string | null>(null);

const selectPuestoRef = ref<HTMLSelectElement | null>(null);

const filtrosAplicados = reactive(new Set<string>());

const mostrarFiltros = ref(false);

function actualizarEstadoFiltro(id: string, valor: string) {
  if (
    (id === 'estadoLaboral' && valor === 'Activo') ||
    (id !== 'estadoLaboral' && valor === '')
  ) {
    filtrosAplicados.delete(id);
  } else {
    filtrosAplicados.add(id);
  }
}

const filtros = reactive<Record<string, string>>({
  sexo: '',
  puesto: '',
  alergico: '',
  diabetico: '',
  hipertensivo: '',
  accidente: '',
  imc: '',
  aptitud: '',
  estadoLaboral: 'Activo',
  exposicion: '',
});

watch(
  [() => selectPuestoRef.value, () => trabajadores.trabajadores.length],
  async ([select]) => {
    if (!select || trabajadores.trabajadores.length === 0) return;

    // Limpiar opciones anteriores (excepto "Todos")
    while (select.options.length > 1) {
      select.remove(1);
    }

    const puestos = trabajadores.trabajadores.map(t => t.puesto);
    const puestosUnicos = [...new Set(puestos.filter(Boolean))].sort();

    puestosUnicos.forEach(puesto => {
      const option = document.createElement('option');
      option.value = puesto;
      option.textContent = puesto;
      select.appendChild(option);
    });
  },
  { immediate: true }
);

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

const closeModal = () => {
  showModal.value = false;
};

const toggleDeleteModal = (idTrabajador: string | null = null, nombreTrabajador: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedTrabajadorId.value = idTrabajador;
  selectedTrabajadorNombre.value = nombreTrabajador;
};

const deleteTrabajadorById = async (empresaId: string, centroTrabajoId: string, trabajadorId: string) => {
  try {
    // Esperamos a que el trabjador sea eliminado
    await trabajadores.deleteTrabajadorById(empresaId, centroTrabajoId, trabajadorId);

    toast.open({ message: 'Trabajador eliminado con éxito' });

    // Una vez eliminado, volvemos a hacer fetch para actualizar la lista
    await trabajadores.fetchTrabajadoresConHistoria(empresaId, centroTrabajoId);

    trabajadores.resetCurrentTrabajador();
    
  } catch (error) {
    console.log('Error al eliminar al trabajador', error);
    toast.open({ message:  'No se pudo eliminar el trabajador. Por favor, elimine primero sus documentos y vuelva a intentarlo', type: 'error' });
  }
};

const toggleImportModal = () => {
  showImportModal.value = !showImportModal.value;
};

onMounted(async () => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);

  // ✅ Obtener trabajadores
  await trabajadores.fetchTrabajadoresConHistoria(empresaId, centroTrabajoId);
  console.log('Trabajadores:', trabajadores.trabajadores);

  // 🔁 Esperar hasta que Vue haya renderizado el DOM incluyendo el <select>
  await nextTick();
  await nextTick(); // En ocasiones, un solo tick no basta si los datos llegan tarde

  // Setear IDs y cargar empresa y centro
  empresas.currentEmpresaId = empresaId;
  empresas.fetchEmpresaById(empresaId);
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);

  const ids = [
    'sexo',
    'puesto',
    'alergico',
    'diabetico',
    'hipertensivo',
    'accidente',
    'imc',
    'aptitud',
    'estadoLaboral',
    'exposicion'
  ];

  ids.forEach(id => {
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

const exportTrabajadores = async () => {
  try {
    const empresaId = String(route.params.idEmpresa);
    const centroTrabajoId = String(route.params.idCentroTrabajo);
    await trabajadores.exportTrabajadores(empresaId, centroTrabajoId);
  } catch (error) {
    console.error('Error al exportar los trabajadores', error);
  }
};

const puestosUnicos = computed(() => {
  const puestos = trabajadores.trabajadores.map(t => t.puesto).filter(Boolean);
  return [...new Set(puestos)].sort();
});

const toggleEstadoLaboral = async (trabajador: { _id: string; estadoLaboral: string; }) => {
  try {
    const { currentEmpresaId } = empresas;
    const { currentCentroTrabajoId } = centrosTrabajo;

    if (!currentEmpresaId) {
      throw new Error('Missing empresa ID');
    }
    if (!currentCentroTrabajoId) {
      throw new Error('Missing centro de trabajo ID');
    }
    if (!trabajador?._id) {
      throw new Error('Missing trabajador ID');
    }

    if (!trabajador.estadoLaboral) {
      throw new Error('Estado laboral no encontrado');
    }

    const nuevoEstado = trabajador.estadoLaboral === 'Activo' ? 'Inactivo' : 'Activo';
    const payload = { estadoLaboral: nuevoEstado };

    await trabajadores.updateTrabajador(
      currentEmpresaId, 
      currentCentroTrabajoId, 
      trabajador._id, 
      payload
    );

    await trabajadores.fetchTrabajadoresConHistoria(currentEmpresaId, currentCentroTrabajoId);

    const mensaje = nuevoEstado === 'Activo' 
      ? 'Trabajador reincorporado exitosamente'
      : 'Baja de trabajador registrada';
      
    toast.open({ message: mensaje });
  } catch (error) {
    console.error('Error al actualizar el estado laboral', error);
    toast.open({ message: 'Error al actualizar el estado laboral', type: 'error' });
  }
};

function resetearFiltros() {
  const ids = Object.keys(filtros);

  ids.forEach(id => {
    filtros[id] = id === 'estadoLaboral' ? 'Activo' : '';
    localStorage.removeItem(`filtro-${id}`);
    actualizarEstadoFiltro(id, filtros[id]);
  });
}

const openRisksModal = async (empresa: Empresa | null = null, centroTrabajo: CentroTrabajo | null = null, trabajador: Trabajador | null = null) => {
  showRisksModal.value = false;
  trabajadores.loadingModal;

  if (empresa && centroTrabajo && trabajador) {
    try {
      await trabajadores.fetchTrabajadorById(empresa._id, centroTrabajo._id, trabajador._id);
    } catch (error) {
      console.error('Error al cargar el trabajador:', error);
    }
  }

  trabajadores.loadingModal = false;
  showRisksModal.value = true;
};

const closeRisksModal = () => {
  showRisksModal.value = false;
};

function actualizarFiltroYGuardar(id: string) {
  actualizarEstadoFiltro(id, filtros[id]);
  localStorage.setItem(`filtro-${id}`, filtros[id]);
}

const hayFiltrosActivos = computed(() => filtrosAplicados.size > 0);

</script>

<template>
  <Transition appear name="fade">
    <ModalTrabajadores v-if="showModal" @closeModal="closeModal" @openSubscriptionModal="showSubscriptionModal = true" />
  </Transition>

  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" 
      @closeModal="showSubscriptionModal = false"/>
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedTrabajadorId && selectedTrabajadorNombre"
      :idRegistro="selectedTrabajadorId" :identificacion="selectedTrabajadorNombre" tipoRegistro="Trabajador"
      @closeModal="toggleDeleteModal" @confirmDelete="deleteTrabajadorById" />
  </Transition>

  <Transition appear name="fade">
    <ModalCargaMasiva v-if="showImportModal" @openSubscriptionModal="showSubscriptionModal = true" @closeModal="toggleImportModal" />
  </Transition>

  <Transition appear name="fade">
    <ModalRiesgos v-if="showRisksModal" @closeModal="closeRisksModal" />
  </Transition>

  <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-8">
    <GreenButton text="Nuevo Trabajador +" @click="openModal(null)" />
    <GreenButton text="Carga Masiva" @click="toggleImportModal" />
    <GreenButton text="Exportar a Excel" @click="exportTrabajadores" />
  </div>
  
  <div>
    <div class="flex justify-center items-center gap-3 my-4">
      <button
        @click="mostrarFiltros = !mostrarFiltros"
        class="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition duration-200 flex items-center gap-2"
      >
        <i :class="mostrarFiltros ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
        {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </button>

      <div
        v-if="hayFiltrosActivos"
        class="flex items-center gap-1 text-xs text-emerald-600 font-medium"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Filtros activos
      </div>
    </div>

    <Transition name="desplegar-filtros" mode="out-in">
    <div v-if="mostrarFiltros" class="flex flex-wrap gap-4 my-6 justify-center">
      <div>
        <label class="block text-sm font-medium text-gray-700">Sexo</label>
        <select
          id="filtro-sexo"
          v-model="filtros.sexo"
          @change="actualizarFiltroYGuardar('sexo')"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('sexo') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
        <div
          v-if="filtrosAplicados.has('sexo')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Puesto</label>
        <select 
          id="filtro-puesto" 
          v-model="filtros.puesto"
          @change="actualizarFiltroYGuardar('puesto')"
          :class="[
              'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
              filtrosAplicados.has('puesto') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            ]"
        >
          <option value="">-Todos-</option>
          <option v-for="puesto in puestosUnicos" :key="puesto" :value="puesto">{{ puesto }}</option>
        </select>
        <div
          v-if="filtrosAplicados.has('puesto')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Exposición a riesgos</label>
        <select 
          id="filtro-exposicion" 
          v-model="filtros.exposicion"
          @change="actualizarFiltroYGuardar('exposicion')"
          :class="[ 
              'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
              filtrosAplicados.has('exposicion') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            ]"
        >
          <option value="">-Todos-</option>
          <option value="Ergonómicos">Ergonómicos</option>
          <option value="Ruido">Ruido</option>
          <option value="Polvos">Polvos</option>
          <option value="Químicos">Químicos</option>
          <option value="Psicosociales">Psicosociales</option>
          <option value="Temperaturas elevadas">Temperaturas elevadas</option>
          <option value="Temperaturas abatidas">Temperaturas abatidas</option>
          <option value="Vibraciones">Vibraciones</option>
          <option value="Biológicos Infecciosos">Biológicos Infecciosos</option>
          <option value="-">Sin exposición</option>
        </select>
        <div
          v-if="filtrosAplicados.has('exposicion')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <!-- <div>
        <label class="block text-sm font-medium text-gray-700">Alérgico</label>
        <select id="filtro-alergico" class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out">
          <option value="">Todos</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="-">Sin datos</option>
        </select>
      </div> -->

      <div>
        <label class="block text-sm font-medium text-gray-700">Diabético</label>
        <select
          id="filtro-diabetico"
          v-model="filtros.diabetico"
          @change="actualizarFiltroYGuardar('diabetico')"
          :class="[ 
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('diabetico') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="-">Sin datos</option>
        </select>
        <div
          v-if="filtrosAplicados.has('diabetico')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Hipertensivo</label>
        <select
          id="filtro-hipertensivo"
          v-model="filtros.hipertensivo"
          @change="actualizarFiltroYGuardar('hipertensivo')"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('hipertensivo') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="-">Sin datos</option>
        </select>
        <div
          v-if="filtrosAplicados.has('hipertensivo')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Accidente laboral</label>
        <select
          id="filtro-accidente"
          v-model="filtros.accidente"
          @change="actualizarFiltroYGuardar('accidente')"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('accidente') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
          <option value="-">Sin datos</option>
        </select>
        <div
          v-if="filtrosAplicados.has('accidente')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Categoria IMC</label>
        <select
          id="filtro-imc"
          v-model="filtros.imc"
          @change="actualizarFiltroYGuardar('imc')"
          :class="[
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('imc') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Bajo peso">Bajo peso</option>
          <option value="Normal">Normal</option>
          <option value="Sobrepeso">Sobrepeso</option>
          <option value="Obesidad clase I">Obesidad clase I</option>
          <option value="Obesidad clase II">Obesidad clase II</option>
          <option value="Obesidad clase III">Obesidad clase III</option>
          <option value="-">Sin datos</option>
        </select>
        <div
          v-if="filtrosAplicados.has('imc')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Aptitud</label>
        <select
          id="filtro-aptitud"
          v-model="filtros.aptitud"
          @change="actualizarFiltroYGuardar('aptitud')"
          :class="[ 
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('aptitud') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">-Todos-</option>
          <option value="Apto Sin Restricciones">Apto Sin Restricciones</option>
          <option value="Apto Con Precaución">Apto Con Precaución</option>
          <option value="Apto Con Restricciones">Apto Con Restricciones</option>
          <option value="No Apto">No Apto</option>
          <option value="Evaluación No Completada">Evaluación No Completada</option>
          <option value="-">Sin datos</option>
        </select>
        <div
          v-if="filtrosAplicados.has('aptitud')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Estado Laboral</label>
        <select
          id="filtro-estadoLaboral"
          v-model="filtros.estadoLaboral"
          @change="actualizarFiltroYGuardar('estadoLaboral')"
          :class="[ 
            'border px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 bg-white transition duration-150 ease-in-out',
            filtrosAplicados.has('estadoLaboral') ? 'border-1 border-emerald-500 bg-emerald-50 font-semibold shadow-emerald-100' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
          ]"
        >
          <option value="">Todos</option>
          <option value="Activo" selected>-Activo-</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <div
          v-if="filtrosAplicados.has('estadoLaboral')" 
          class="flex items-center gap-1 mt-1"
        >
          <i class="fas fa-filter text-xs text-emerald-500"></i>
          <span class="text-emerald-600 text-xs">
          Filtro aplicado
          </span>
        </div>
      </div>

      <div class="block text-xs">
        <label class="block text-xs font-medium text-gray-100 mb-0.5">Filtros</label>
        <button
          @click="resetearFiltros"
          class=" bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg 
          border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out
          flex items-center justify-center mx-auto gap-2"
        >
          <i class="fa-solid fa-filter-circle-xmark"></i>
          Quitar Filtros
        </button>
      </div>

    </div>
    </Transition>

    <!-- Usar el componente DataTableDT -->
    <Transition appear mode="out-in" name="slide-up">
    <div v-if="trabajadores.loading">
      <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">
        Cargando...
      </h1>
    </div>
    <div v-else>
      <DataTableDT v-if="trabajadores.trabajadores.length > 0" class="table-auto z-1">
        <tr v-for="(trabajador, index) in trabajadores.trabajadores" :key="trabajador._id"
          class="hover:bg-gray-200 cursor-pointer">
          <td>{{ index + 1 }}</td>
          <td>{{ trabajador.nombre }}</td>
          <td>{{ convertirFechaISOaDDMMYYYY(trabajador.createdAt) }}</td>
          <td>{{ calcularEdad(trabajador.fechaNacimiento) }} años</td>
          <td>{{ trabajador.sexo }}</td>
          <td>{{ trabajador.escolaridad }}</td>
          <td>{{ trabajador.puesto }}</td>
          <td>{{ calcularAntiguedad(trabajador.fechaIngreso) }}</td>
          <td>{{ trabajador.telefono ? trabajador.telefono : '-' }}</td>
          <td>{{ trabajador.estadoCivil }}</td>
          <td>{{ trabajador.hijos }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.alergicos === 'Si' ? 'Si' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.diabeticosPP === 'Si' ? 'Si' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.hipertensivosPP === 'Si' ? 'Si' : 'No') : '-' }}</td>
          <td>{{ trabajador.historiaClinicaResumen ? (trabajador.historiaClinicaResumen.accidenteLaboral === 'Si' ? 'Si' : 'No') : '-' }}</td>
          <td>{{ trabajador.exploracionFisicaResumen?.categoriaIMC || '-' }}</td>
          <td>{{ trabajador.aptitudResumen?.aptitudPuesto || '-' }}</td>
          <td>{{ trabajador.estadoLaboral || '-' }}</td>
          <td>
            <template v-if="trabajador.agentesRiesgoActuales && trabajador.agentesRiesgoActuales.length">
              {{ trabajador.agentesRiesgoActuales.join(', ') }}
            </template>
            <template v-else>
              -
            </template>
          </td>
          <td>
            <button type="button"
              class="bg-emerald-600 text-white rounded-full px-2 py-1 transition-transform duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600"
              @click="router.push({ name: 'expediente-medico', params: { idEmpresa: empresas.currentEmpresaId, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })">
              Expediente
            </button>
          </td>
          <td>
            <div class="relative h-[32px]">
              
              <!-- Riesgos -->
              <button type="button"
                class="group absolute left-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-gray-300 hover:bg-amber-400 text-gray-700 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg  hover:text-gray-700 hover:border-amber-500 border-2 border-gray-300 whitespace-nowrap flex items-center overflow-hidden"
                @click="openRisksModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, trabajador)">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap text-sm">
                  Riesgos
                </span>
              </button>

              <!-- Editar -->
              <button type="button"
                class="group absolute left-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:border-sky-300 border-2 border-sky-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="openModal(empresas.currentEmpresa, centrosTrabajo.currentCentroTrabajo, trabajador)">
                <i class="fa-regular fa-pen-to-square"></i>
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap text-sm">
                  Editar
                </span>
              </button>

              <!-- Alta -->
              <button v-if="trabajador.estadoLaboral === 'Inactivo'" type="button"
                class="group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:border-green-300 border-2 border-green-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleEstadoLaboral(trabajador)">
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 whitespace-nowrap text-sm">
                  Alta
                </span>
                <i class="fa-solid fa-person-arrow-up-from-line"></i>
              </button>

              <!-- Baja -->
              <button v-else type="button"
                class="group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:border-orange-300 border-2 border-orange-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleEstadoLaboral(trabajador)">
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 whitespace-nowrap text-sm">
                  Baja
                </span>
                <i class="fa-solid fa-person-arrow-down-to-line"></i>
              </button>

              <!-- Eliminar -->
                <button type="button"
                class="group absolute right-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:border-red-300 border-2 border-red-100 whitespace-nowrap flex items-center overflow-hidden"
                @click="toggleDeleteModal(trabajador._id, trabajador.nombre)">
                <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 whitespace-nowrap text-sm order-1">
                  Eliminar
                </span>
                <i class="fa-solid fa-trash-can order-2"></i>
                </button>

            </div>
          </td>

        </tr>
      </DataTableDT>
      
      <h1 v-else
        class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700 mt-10">
        Este centro de trabajo aún no tiene trabajadores registrados
      </h1>

      <button type="button" @click="router.push({ name: 'dashboard-empresa', params: { idEmpresa: empresas.currentEmpresaId } })"
            class="block mx-auto text-sm w-1/8 mt-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 p-2 transition duration-300">
          <i class="fas fa-chart-line mr-2"></i> Ver estadísticas de la empresa
      </button>
    </div>
    </Transition>
  </div>
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