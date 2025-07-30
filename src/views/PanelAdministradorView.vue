<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import ProveedorItem from '@/components/ProveedorItem.vue';
import { usePagosStore } from '@/stores/pagosStore';
import { useEmpresasStore } from '@/stores/empresas';
import { differenceInDays, parseISO } from 'date-fns';

const userStore = useUserStore();
const router = useRouter();
const proveedorSaludStore = useProveedorSaludStore();
const pagosStore = usePagosStore();
const empresasStore = useEmpresasStore();
const proveedores = ref([]);
const isLoading = ref(true);
const error = ref(null);

const redirigirSiNoEsAdmin = () => {
  const adminEmail = 'edgarcoronel66@gmail.com';
  if (userStore.user?.email !== adminEmail) {
    router.push({ name: 'inicio' });
  }
};

// Función para verificar si el periodo gratuito está activo
const esPeriodoGratuitoActivo = (proveedor) => {
  if (!proveedor.fechaInicioTrial) return false;
  
  const fechaInicio = parseISO(proveedor.fechaInicioTrial);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 15);
  fechaFin.setHours(23, 59, 59);
  
  const hoy = new Date();
  return differenceInDays(fechaFin, hoy) > 0;
};

// Computed properties para agrupar proveedores
const proveedoresAgrupados = computed(() => {
  const activos = proveedores.value.filter(p => p.estadoSuscripcion === 'authorized');
  const cancelados = proveedores.value.filter(p => p.estadoSuscripcion === 'cancelled');
  const sinSuscripcion = proveedores.value.filter(p => !p.estadoSuscripcion);
  
  const periodoGratuitoActivo = sinSuscripcion.filter(p => esPeriodoGratuitoActivo(p));
  const periodoGratuitoFinalizado = sinSuscripcion.filter(p => !esPeriodoGratuitoActivo(p));
  
  return {
    activos,
    cancelados,
    sinSuscripcion: {
      periodoGratuitoActivo,
      periodoGratuitoFinalizado
    }
  };
});

// Estadísticas computadas
const estadisticas = computed(() => {
  const grupos = proveedoresAgrupados.value;
  return {
    total: proveedores.value.length,
    activos: grupos.activos.length,
    cancelados: grupos.cancelados.length,
    sinSuscripcion: grupos.sinSuscripcion.periodoGratuitoActivo.length + grupos.sinSuscripcion.periodoGratuitoFinalizado.length,
    periodoGratuitoActivo: grupos.sinSuscripcion.periodoGratuitoActivo.length,
    periodoGratuitoFinalizado: grupos.sinSuscripcion.periodoGratuitoFinalizado.length
  };
});

const cargarProveedores = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const listaProveedores = await proveedorSaludStore.getAllProveedores();

    // Crear un array de Promesas para cargar todos los proveedores en paralelo
    const proveedoresConInfo = await Promise.all(
      listaProveedores.map(async (p) => {
        // Hacer las consultas en paralelo
        const [suscripcion, historiasClinicasMes, notasMedicasMes, todasLasHistoriasClinicas, todasLasNotasMedicas, empresas, users] = await Promise.all([
          p.suscripcionActiva ? pagosStore.getSubscriptionFromDB(p.suscripcionActiva) : null,
          proveedorSaludStore.getHistoriasClinicasDelMesById(p._id),
          proveedorSaludStore.getNotasMedicasDelMesById(p._id),
          proveedorSaludStore.getCantidadHistoriasClinicasById(p._id),
          proveedorSaludStore.getCantidadNotasMedicasById(p._id),
          empresasStore.fetchEmpresas(p._id),
          userStore.fetchUsersByProveedorId(p._id),
        ]);

        return {
          ...p,
          suscripcion,
          historiasClinicasMes,
          notasMedicasMes,
          todasLasHistoriasClinicas,
          todasLasNotasMedicas,
          empresas,
          users,
        };
      })
    );

    proveedores.value = proveedoresConInfo;
  } catch (err) {
    console.error('Error al cargar proveedores:', err);
    error.value = 'Error al cargar los datos de los proveedores. Por favor, intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};

const reintentarCarga = () => {
  cargarProveedores();
};

redirigirSiNoEsAdmin();

onMounted(cargarProveedores);
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header con título -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Panel de Administrador</h1>
      <p class="text-gray-600">Gestión y monitoreo de proveedores de salud</p>
    </div>

    <!-- Estado de carga -->
    <Transition name="fade" mode="out-in">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <!-- Spinner principal -->
          <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <!-- Spinner secundario -->
          <div class="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin" style="animation-duration: 1.5s;"></div>
        </div>
        <p class="mt-4 text-lg text-gray-600 font-medium">Cargando proveedores...</p>
        <p class="mt-2 text-sm text-gray-500">Esto puede tomar unos momentos</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="reintentarCarga"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>

      <!-- Contenido principal -->
      <div v-else class="space-y-8">
        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-600">Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.total }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-600">Activos</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.activos }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-600">Cancelados</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.cancelados }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center">
              <div class="p-2 bg-emerald-100 rounded-lg">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-600">Gratuito Activo</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.periodoGratuitoActivo }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 shadow-sm border">
            <div class="flex items-center">
              <div class="p-2 bg-gray-100 rounded-lg">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-600">Gratuito Finalizado</p>
                <p class="text-2xl font-bold text-gray-900">{{ estadisticas.periodoGratuitoFinalizado }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Grupos de proveedores -->
        <div class="space-y-8">
          <!-- Proveedores Activos -->
          <div v-if="proveedoresAgrupados.activos.length > 0" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-green-500 rounded-full"></div>
              <h2 class="text-2xl font-bold text-gray-800">Proveedores Activos</h2>
              <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ proveedoresAgrupados.activos.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 gap-6">
              <TransitionGroup name="proveedor" tag="div" class="grid grid-cols-1 lg:grid-cols-2 gap-6" appear>
                <ProveedorItem
                  v-for="(proveedor, index) in proveedoresAgrupados.activos"
                  :key="proveedor._id"
                  v-bind="proveedor"
                  :style="{ animationDelay: `${index * 100}ms` }"
                />
              </TransitionGroup>
            </div>
          </div>

          <!-- Proveedores Cancelados -->
          <div v-if="proveedoresAgrupados.cancelados.length > 0" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-red-500 rounded-full"></div>
              <h2 class="text-2xl font-bold text-gray-800">Proveedores Cancelados</h2>
              <span class="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ proveedoresAgrupados.cancelados.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 gap-6">
              <TransitionGroup name="proveedor" tag="div" class="grid grid-cols-1 lg:grid-cols-2 gap-6" appear>
                <ProveedorItem
                  v-for="(proveedor, index) in proveedoresAgrupados.cancelados"
                  :key="proveedor._id"
                  v-bind="proveedor"
                  :style="{ animationDelay: `${index * 100}ms` }"
                />
              </TransitionGroup>
            </div>
          </div>

          <!-- Proveedores Sin Suscripción -->
          <div v-if="proveedoresAgrupados.sinSuscripcion.periodoGratuitoActivo.length > 0 || proveedoresAgrupados.sinSuscripcion.periodoGratuitoFinalizado.length > 0" class="space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <h2 class="text-2xl font-bold text-gray-800">Proveedores Sin Suscripción</h2>
              <span class="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ estadisticas.sinSuscripcion }}
              </span>
            </div>

            <!-- Periodo Gratuito Activo -->
            <div v-if="proveedoresAgrupados.sinSuscripcion.periodoGratuitoActivo.length > 0" class="space-y-4 ml-6">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <h3 class="text-xl font-semibold text-gray-700">Periodo Gratuito Activo</h3>
                <span class="bg-emerald-100 text-emerald-800 text-sm font-medium px-2 py-1 rounded-full">
                  {{ proveedoresAgrupados.sinSuscripcion.periodoGratuitoActivo.length }}
                </span>
              </div>
              <div class="grid grid-cols-1 gap-6">
                <TransitionGroup name="proveedor" tag="div" class="grid grid-cols-1 lg:grid-cols-2 gap-6" appear>
                  <ProveedorItem
                    v-for="(proveedor, index) in proveedoresAgrupados.sinSuscripcion.periodoGratuitoActivo"
                    :key="proveedor._id"
                    v-bind="proveedor"
                    :style="{ animationDelay: `${index * 100}ms` }"
                  />
                </TransitionGroup>
              </div>
            </div>

            <!-- Periodo Gratuito Finalizado -->
            <div v-if="proveedoresAgrupados.sinSuscripcion.periodoGratuitoFinalizado.length > 0" class="space-y-4 ml-6">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
                <h3 class="text-xl font-semibold text-gray-700">Periodo Gratuito Finalizado</h3>
                <span class="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded-full">
                  {{ proveedoresAgrupados.sinSuscripcion.periodoGratuitoFinalizado.length }}
                </span>
              </div>
              <div class="grid grid-cols-1 gap-6">
                <TransitionGroup name="proveedor" tag="div" class="grid grid-cols-1 lg:grid-cols-2 gap-6" appear>
                  <ProveedorItem
                    v-for="(proveedor, index) in proveedoresAgrupados.sinSuscripcion.periodoGratuitoFinalizado"
                    :key="proveedor._id"
                    v-bind="proveedor"
                    :style="{ animationDelay: `${index * 100}ms` }"
                  />
                </TransitionGroup>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay proveedores -->
        <div v-if="proveedores.length === 0 && !isLoading && !error" class="text-center py-16">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay proveedores registrados</h3>
          <p class="text-gray-600">Aún no se han registrado proveedores en el sistema.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Transiciones para el estado de carga */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Transiciones para los proveedores */
.proveedor-enter-active {
  transition: all 0.5s ease;
}

.proveedor-leave-active {
  transition: all 0.3s ease;
}

.proveedor-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.proveedor-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.proveedor-move {
  transition: transform 0.3s ease;
}

/* Animación de aparición escalonada */
.proveedor-enter-active {
  animation: slideInUp 0.5s ease forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
