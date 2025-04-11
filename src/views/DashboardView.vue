<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { clasificarPorEdadYSexo, ordenarPorGrupoEtario, contarPorCategoriaIMC, etiquetasEnfermedades, contarEnfermedadesCronicas, etiquetasAntecedentesReferidos, contarAntecedentesReferidos } from '@/helpers/dashboardDataProcessor';
import GraficaBarras from '@/components/graficas/GraficaBarras.vue';

const route = useRoute();
const empresasStore = useEmpresasStore();
const centrosTrabajoStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();

const centrosTrabajo = ref([]);
const centroSeleccionado = ref('Todos')
const tablaGruposEtarios = ref([]);
const dashboardData = ref({});

const vistaGruposEtarios = ref('grafico');
const vistaGruposEtariosKey = computed(() => `vista-${vistaGruposEtarios.value}`);
const vistaIMC = ref('grafico');
const vistaIMCKey = computed(() => `vista-${vistaIMC.value}`);
const vistaEnfermedades = ref('grafico');
const vistaEnfermedadesKey = computed(() => `vista-${vistaEnfermedades.value}`);
const vistaAntecedentes = ref('grafico');
const vistaAntecedentesKey = computed(() => `vista-${vistaAntecedentes.value}`);

const cargarDatos = async (empresaId) => {
  if (!empresaId) return;

  // 1. Empresa
  await empresasStore.fetchEmpresaById(empresaId);

  // 2. Centros
  centrosTrabajo.value = await centrosTrabajoStore.fetchCentrosTrabajo(empresaId);

  // 3. Info para el dashboard
  dashboardData.value = await Promise.all(
    centrosTrabajo.value.map((centro) =>
      trabajadoresStore.fetchDashboardData(empresaId, centro._id)
    )
  );

  // Logs
  console.log('Empresa data fetched:', empresasStore.currentEmpresa);
  console.log('Centros de trabajo data fetched:', centrosTrabajo.value);
  console.log('Dashboard data fetched:', dashboardData.value);
};

// Llama la función al montar y si cambia el ID
watch(() => route.params.idEmpresa, cargarDatos, { immediate: true });

const centrosTrabajoOptions = computed(() => [
  'Todos',
  ...centrosTrabajo.value.map((centro) => centro.nombreCentro),
]);

// Computed para tabla y grafica de grupos etarios
const tablaGruposEtariosFiltrada = computed(() => {
  if (!dashboardData.value.length) return [];

  // Si se selecciona "Todos", usar toda la data
  if (centroSeleccionado.value === 'Todos') {
    const conjunto = dashboardData.value.flatMap((d) => d.grupoEtario);
    return ordenarPorGrupoEtario(clasificarPorEdadYSexo(conjunto));
  }

  // Si se selecciona un centro específico
  const index = centrosTrabajo.value.findIndex(
    (centro) => centro.nombreCentro === centroSeleccionado.value
  );

  if (index === -1) return [];

  const grupo = dashboardData.value[index].grupoEtario || [];
  return ordenarPorGrupoEtario(clasificarPorEdadYSexo(grupo));
});

const graficaGruposEtariosData = computed(() => {
  const etiquetas = tablaGruposEtariosFiltrada.value.map(([grupo]) => grupo)
  const hombres = tablaGruposEtariosFiltrada.value.map(([, datos]) => datos.Masculino)
  const mujeres = tablaGruposEtariosFiltrada.value.map(([, datos]) => datos.Femenino)

  return {
    labels: etiquetas,
    datasets: [
      {
        label: 'Hombres',
        data: hombres,
        backgroundColor: '#4B5563', // Gris oscuro
        stack: 'Stack 0'
      },
      {
        label: 'Mujeres',
        data: mujeres,
        backgroundColor: '#9CA3AF', // Gris medio
        stack: 'Stack 0'
      }
    ]
  }
})

const graficaGruposEtariosOptions = {
  indexAxis: 'y', // HORIZONTAL
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      color: '#FFFFFF', // blanco
      anchor: 'center', // puede ser 'center', 'start', 'end'
      align: 'center', // 'top', 'bottom', 'left', 'right', 'center'
      formatter: (value) => value > 0 ? value : '',
      font: {
        weight: 'bold',
        size: 12
      },
      clamp: true
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false }
    },
    y: {
      stacked: true,
      grid: { display: false }
    }
  }
}

// Computed para tabla y grafica de categorías de IMC
const graficaIMCData = computed(() => {
  if (!dashboardData.value.length) return { labels: [], datasets: [] };

  // Obtener el array combinado de IMC según el centro seleccionado
  const categorias = centroSeleccionado.value === 'Todos'
    ? dashboardData.value.flatMap((d) => d.imc[0] || [])
    : dashboardData.value[
        centrosTrabajo.value.findIndex(c => c.nombreCentro === centroSeleccionado.value)
      ]?.imc[0] || [];

  const conteo = contarPorCategoriaIMC(categorias);

  return {
    labels: conteo.map(([categoria]) => categoria),
    datasets: [
      {
        label: 'Trabajadores',
        data: conteo.map(([, cantidad]) => cantidad),
        backgroundColor: '#4B5563' // Gris Oscuro
      }
    ]
  };
});

const graficaIMCOptions = {
  indexAxis: 'y', // HORIZONTAL
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      color: '#FFFFFF',
      // color: '#4B5563', // Gris oscuro
      anchor: 'end', // puede ser 'center', 'start', 'end'
      align: 'left', // 'top', 'bottom', 'left', 'right', 'center'
      clip: true,
      formatter: value => value > 0 ? value : '',
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
        color: '#374151',
        font: { size: 12 }
      }
    },
    y: {
      grid: { display: false },
      ticks: {
        callback: (value) => {
          const label = graficaIMCData.value.labels?.[value];
          return label?.replace('Obesidad clase ', 'Obesidad ');
        },
        color: '#374151',
        font: { size: 12 }
      }
    }
  }
};

const tablaIMC = computed(() => {
  if (!dashboardData.value.length) return [];

  const categorias = centroSeleccionado.value === 'Todos'
    ? dashboardData.value.flatMap((d) => d.imc[0] || [])
    : dashboardData.value[
        centrosTrabajo.value.findIndex(c => c.nombreCentro === centroSeleccionado.value)
      ]?.imc[0] || [];

  return contarPorCategoriaIMC(categorias);
});

// Computed para tabla y grafica de enfermedades cronicas
const tablaEnfermedades = computed(() => {
  if (!dashboardData.value.length) return [];

  const data = centroSeleccionado.value === 'Todos'
    ? dashboardData.value.flatMap((d) => d.enfermedadesCronicas[0] || [])
    : dashboardData.value[
        centrosTrabajo.value.findIndex(c => c.nombreCentro === centroSeleccionado.value)
      ]?.enfermedadesCronicas[0] || [];

  return contarEnfermedadesCronicas(data);
});

const graficaEnfermedadesData = computed(() => {
  const conteo = tablaEnfermedades.value;

  return {
    labels: conteo.map(([campo]) => etiquetasEnfermedades[campo] || campo),
    datasets: [
      {
        label: 'Casos referidos',
        data: conteo.map(([, cantidad]) => cantidad),
        backgroundColor: '#4B5563'
      }
    ]
  };
});

const graficaEnfermedadesOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      color: '#4B5563', // Gris oscuro
      anchor: 'end', // puede ser 'center', 'start', 'end'
      align: 'top', // 'top', 'bottom', 'left', 'right', 'center'
      formatter: value => value > 0 ? value : '',
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
        callback: (value) => {
          const label = graficaEnfermedadesData.value.labels?.[value];
          if (!label) return '';
          
          const replacements = {
            'diabeticosPP': 'Diabéticos',
            'hipertensivosPP': 'Hipertensivos', 
            'cardiopaticosPP': 'Cardiopáticos',
            'epilepticosPP': 'Epilépticos',
            'alergicos': 'Alérgicos'
          };

          return replacements[label] || label;
        },
        color: '#374151',
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: { display: false }
    }
  }
};

// Computed para tabla y grafica de antecedentes referidos
const tablaAntecedentes = computed(() => {
  if (!dashboardData.value.length) return [];

  const data = centroSeleccionado.value === 'Todos'
    ? dashboardData.value.flatMap((d) => d.antecedentes[0] || [])
    : dashboardData.value[
        centrosTrabajo.value.findIndex(c => c.nombreCentro === centroSeleccionado.value)
      ]?.antecedentes[0] || [];

  return contarAntecedentesReferidos(data);
});

const graficaAntecedentesData = computed(() => {
  const conteo = tablaAntecedentes.value;

  return {
    labels: conteo.map(([campo]) => etiquetasAntecedentesReferidos[campo] || campo),
    datasets: [
      {
        label: 'Casos referidos',
        data: conteo.map(([, cantidad]) => cantidad),
        backgroundColor: '#4B5563'
      }
    ]
  };
});

const graficaAntecedentesOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      color: '#4B5563', // Gris oscuro
      anchor: 'end', // puede ser 'center', 'start', 'end'
      align: 'top', // 'top', 'bottom', 'left', 'right', 'center'
      formatter: value => value > 0 ? value : '',
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
        callback: (value) => {
          const label = graficaAntecedentesData.value.labels?.[value];
          return etiquetasAntecedentesReferidos[label] || label;
        },
        color: '#374151',
        font: { size: 12 }
      }
    },
    y: {
      grid: { display: false }
    }
  }
};
</script>


<template>
  <div class="px-6 py-8 mx-auto">
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

        <div>
          <h1 class="text-3xl font-bold text-gray-800">{{ empresasStore.currentEmpresa.nombreComercial }}</h1>
          <h2 class="text-xl text-gray-600 mt-1">{{ empresasStore.currentEmpresa.razonSocial }}</h2>
        </div>

        <div class="mb-4 ml-auto">
          <label class="block text-sm font-medium text-gray-700">Centro de trabajo</label>
          <select
            v-model="centroSeleccionado"
            class="border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 px-2 py-1 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white transition duration-150 ease-in-out mt-1"
          >
            <option v-for="nombre in centrosTrabajoOptions" :key="nombre" :value="nombre">{{ nombre }}</option>
          </select>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8 auto-rows-[450px]">

        <!-- IMC: 2 columnas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Distribución por categoría de IMC</h3>
            <div class="flex gap-2">
              <button
                @click="vistaIMC = 'grafico'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaIMC === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaIMC = 'tabla'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaIMC === 'tabla'
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
              <template v-if="vistaIMC === 'grafico'">
                <GraficaBarras :key="vistaIMCKey" :data="graficaIMCData" :options="graficaIMCOptions" />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg lg:text-xl">Categoría IMC</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="[categoria, cantidad] in tablaIMC"
                      :key="categoria"
                      class="border-t hover:bg-gray-50 transition"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg lg:text-xl">{{ categoria }}</td>
                      <td class="py-1 px-4 text-center text-emerald-700 text-lg lg:text-xl">{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>
          </div>
        </div>

        <!-- Aptitud al Puesto: 1x2 -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col row-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Aptitud al Puesto</h3>
          </div>
        </div>

        <!-- Crónicas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Antecedentes relacionados con enfermedades crónicas</h3>
          </div>
        </div>

        <!-- Agudeza Visual: 1x2 -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col row-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Agudeza Visual</h3>
          </div>
        </div>

        <!-- Vista corregida -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Vista Corregida</h3>
          </div>
        </div>

        <!-- Localizados -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Antecedentes de problemas localizados</h3>
          </div>
        </div>

        <!-- Daltonismo -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Daltonismo</h3>
          </div>
        </div>

        <!-- Riesgos: 2 columnas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Exposición a factores de riesgo</h3>
          </div>
        </div>

        <!-- Grupos Etarios: 2 columnas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col col-span-2">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Distribución por Grupos Etarios</h3>
          </div>
        </div>

        <!-- Consultas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Consultas</h3>
          </div>
        </div>

        </div>

      <!-- Grid de detalles -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <!-- Distribución por categoría de IMC -->
        <div class="col-span-2 bg-gray-50 p-6 rounded-lg shadow h-[350px] lg:h-[450px] xl:h-[540px] flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Índice de Masa Corporal</h3>
            <div class="flex gap-2">
              <button
                @click="vistaIMC = 'grafico'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaIMC === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaIMC = 'tabla'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaIMC === 'tabla'
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
              <template v-if="vistaIMC === 'grafico'">
                <GraficaBarras :key="vistaIMCKey" :data="graficaIMCData" :options="graficaIMCOptions" />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg lg:text-xl">Categoría IMC</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="[categoria, cantidad] in tablaIMC"
                      :key="categoria"
                      class="border-t hover:bg-gray-50 transition"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg lg:text-xl">{{ categoria }}</td>
                      <td class="py-1 px-4 text-center text-emerald-700 text-lg lg:text-xl">{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>
          </div>
        </div>

        <!-- Grupos Etarios -->
        <div class="bg-gray-50 p-6 rounded-lg shadow h-[350px] lg:h-[450px] xl:h-[540px] flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Grupos Etarios</h3>
            <div class="flex gap-2">
              <button
                @click="vistaGruposEtarios = 'grafico'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaGruposEtarios === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaGruposEtarios = 'tabla'"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  vistaGruposEtarios === 'tabla'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Tabla
              </button>
            </div>
          </div>

          <!-- Contenido dinámico -->
          <div class="flex-1 overflow-x-auto">
            <Transition name="fade" mode="out-in">
              <template v-if="vistaGruposEtarios === 'grafico'">
                <GraficaBarras :key="vistaGruposEtariosKey" :data="graficaGruposEtariosData" :options="graficaGruposEtariosOptions" />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg lg:text-xl">Grupo Etario</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Hombres</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Mujeres</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="[grupo, datos] in tablaGruposEtariosFiltrada"
                      :key="grupo"
                      class="border-t hover:bg-gray-50 transition"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg lg:text-xl">{{ grupo }}</td>
                      <td class="py-1 px-4 text-center text-blue-700 text-lg lg:text-xl">{{ datos.Masculino }}</td>
                      <td class="py-1 px-4 text-center text-pink-700 text-lg lg:text-xl">{{ datos.Femenino }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>

          </div>
        </div>

        <!-- Enfermedades Crónicas -->
        <div class="bg-gray-50 p-6 rounded-lg shadow h-[350px] lg:h-[450px] xl:h-[540px] flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Antecedentes personales (crónicos)</h3>
            <div class="flex gap-2">
              <button
                @click="vistaEnfermedades = 'grafico'"
                :class="[ 'px-3 py-1 rounded text-sm font-medium',
                  vistaEnfermedades === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaEnfermedades = 'tabla'"
                :class="[ 'px-3 py-1 rounded text-sm font-medium',
                  vistaEnfermedades === 'tabla'
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
              <template v-if="vistaEnfermedades === 'grafico'">
                <GraficaBarras :key="vistaEnfermedadesKey" :data="graficaEnfermedadesData" :options="graficaEnfermedadesOptions" />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg lg:text-xl">Antecedentes</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="[condicion, cantidad] in tablaEnfermedades"
                      :key="condicion"
                      class="border-t hover:bg-gray-50 transition"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg lg:text-xl">
                        {{ etiquetasEnfermedades[condicion] || condicion }}
                      </td>
                      <td class="py-1 px-4 text-center text-emerald-700 text-lg lg:text-xl">{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>
          </div>
        </div>

        <!-- Antecedentes Personales Localizados -->
        <div class="bg-gray-50 p-6 rounded-lg shadow h-[350px] lg:h-[450px] xl:h-[540px] flex flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 class="text-xl font-semibold text-gray-800 flex items-center gap-2">Antecedentes personales (localizados)</h3>

            <div class="flex gap-2">
              <button
                @click="vistaAntecedentes = 'grafico'"
                :class="[ 'px-3 py-1 rounded text-sm font-medium',
                  vistaAntecedentes === 'grafico'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                ]"
              >
                Gráfico
              </button>
              <button
                @click="vistaAntecedentes = 'tabla'"
                :class="[ 'px-3 py-1 rounded text-sm font-medium',
                  vistaAntecedentes === 'tabla'
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
              <template v-if="vistaAntecedentes === 'grafico'">
                <GraficaBarras
                  :key="vistaAntecedentesKey"
                  :data="graficaAntecedentesData"
                  :options="graficaAntecedentesOptions"
                />
              </template>

              <template v-else>
                <table class="min-w-full text-sm border border-gray-300 rounded h-full">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="py-2 px-4 text-left text-lg lg:text-xl">Antecedentes</th>
                      <th class="py-2 px-4 text-center text-lg lg:text-xl">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="[condicion, cantidad] in tablaAntecedentes"
                      :key="condicion"
                      class="border-t hover:bg-gray-50 transition"
                    >
                      <td class="py-1 px-4 font-medium text-gray-700 text-lg lg:text-xl">
                        {{ etiquetasAntecedentesReferidos[condicion] || condicion }}
                      </td>
                      <td class="py-1 px-4 text-center text-emerald-700 text-lg lg:text-xl">{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </Transition>
          </div>
        </div>

      </div>




      <router-link
        :to="`/empresas`"
        class="inline-block text-gray-700 hover:text-green-500 font-medium"
      >
        ← Ver todas las empresas
      </router-link>
    </div>
  </div>
</template>
