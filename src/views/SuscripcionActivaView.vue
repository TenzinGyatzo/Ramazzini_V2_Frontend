<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePagosStore } from '@/stores/pagosStore';
import { useUserStore } from '@/stores/user';
import { useEmpresasStore } from '@/stores/empresas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const pagosStore = usePagosStore();
const userStore = useUserStore();
const empresasStore = useEmpresasStore();

const suscripcionActual = ref(null);
const usuariosCreados = ref(0);
const empresasCreadas = ref(0);

const proveedorSalud = ref(
  JSON.parse(localStorage.getItem('proveedorSalud') || 'null') || {}
);

// Función para obtener toda la información necesaria en una sola llamada
const fetchData = async () => {
  if (proveedorSalud.value?.suscripcionActiva) {
    try {
        // Obtener suscripción
        // const response = await pagosStore.getSubscriptionFromAPI(proveedorSalud.value.suscripcionActiva);
        const response = await pagosStore.getSubscriptionFromDB(proveedorSalud.value.suscripcionActiva);
      if (response) {
        suscripcionActual.value = response;
        // console.log('Detalles de la suscripción:', suscripcionActual.value);
      }

    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  }

  // Obtener usuarios creados
  const resultadoUsuarios = await userStore.fetchUsersByProveedorId(proveedorSalud.value._id);
  usuariosCreados.value = resultadoUsuarios.data.length;
   
  // Obtener empresas creadas
  await empresasStore.fetchEmpresas(proveedorSalud.value._id);
  empresasCreadas.value = empresasStore.empresas.length;

};

onMounted(fetchData);

const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'No disponible';
};

const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};

// Computed para obtener los add-ons
const totalUsuariosAdicionales = computed(() => {
  return proveedorSalud.value?.addOns?.reduce((total, addon) => {
    return addon.tipo === 'usuario_adicional' ? total + addon.cantidad : total;
  }, 0) || 0;
});

const totalEmpresasAdicionales = computed(() => {
  return proveedorSalud.value?.addOns?.reduce((total, addon) => {
    return addon.tipo === 'empresas_extra' ? total + addon.cantidad : total;
  }, 0) || 0;
});

// Computed para mostrar el estado del periodo gratuito
const periodoGratuito = computed(() => {
  if (proveedorSalud.value?.periodoDePruebaFinalizado) {
    return 'Finalizado';
  } else if (proveedorSalud.value?.fechaInicioTrial) {
    return `Hasta el ${formatDate(proveedorSalud.value.fechaInicioTrial)}`;
  }
  return 'No disponible';
});

// Computed para calcular el uso de usuarios y empresas
const porcentajeUsuarios = computed(() => {
  return Math.min((usuariosCreados.value / (proveedorSalud.value.maxUsuariosPermitidos || 1)) * 100, 100);
});

const porcentajeEmpresas = computed(() => {
  return Math.min((empresasCreadas.value / (proveedorSalud.value.maxEmpresasPermitidas || 1)) * 100, 100);
});
</script>

<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6 min-h-screen">
      <h2 class="text-gray-800 text-3xl md:text-4xl mb-4">Detalles de tu Suscripción</h2>
  
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Sección de Suscripción -->
        <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <h3 class="text-2xl font-semibold text-gray-700 mb-4">{{ suscripcionActual?.reason || 'Sin plan' }}</h3>
          <p v-if="totalUsuariosAdicionales || totalEmpresasAdicionales" class="text-gray-600">
            <strong>➕ Adicionales: </strong> 
            <span v-if="totalUsuariosAdicionales">
                {{ totalUsuariosAdicionales }} {{ totalUsuariosAdicionales === 1 ? 'Usuario' : 'Usuarios' }}
            </span>
            <span v-if="totalUsuariosAdicionales && totalEmpresasAdicionales"> · </span>
            <span v-if="totalEmpresasAdicionales">
                {{ totalEmpresasAdicionales }} Empresas
            </span>
          </p>
          <p v-else class="text-gray-600"><strong>➕ Adicionales:</strong> Ninguno</p>
          <!-- <p class="text-gray-600"><strong>📅 Inicio de suscripción:</strong> {{ suscripcionActual ? formatDate(suscripcionActual.date_created) : 'No disponible' }}</p> -->
          <p class="text-gray-600"><strong>💰 Pago mensual:</strong> {{ suscripcionActual?.auto_recurring?.transaction_amount ? `$${formatCurrency(suscripcionActual.auto_recurring.transaction_amount)} MXN` : 'No disponible' }}</p>
          <p class="text-gray-600"><strong>📅 Próximo cobro:</strong> {{ suscripcionActual ? formatDate(suscripcionActual.next_payment_date) : 'No disponible' }}</p>
          <p class="text-gray-600"><strong>📍 Estado: </strong>
            <span :class="{
              'text-green-600 bg-green-100 px-1 py-0 rounded-full': suscripcionActual?.status === 'authorized', 
              'text-red-600 bg-red-100 px-1 py-0 rounded-full': suscripcionActual?.status && suscripcionActual.status !== 'authorized',
              'text-gray-600 bg-gray-200 px-1 py-0 rounded-full': !suscripcionActual
            }">
              {{ suscripcionActual?.status || 'Sin suscripción actual' }}
            </span>
          </p>
        </div>
  
        <!-- Sección de Uso -->
        <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <h3 class="text-2xl font-semibold text-gray-700 mb-4">Uso Actual</h3>
          
          <!-- Uso de Usuarios -->
          <div>
            <p class="text-gray-600"><strong>👥 Usuarios creados:</strong> {{ usuariosCreados }} / {{ proveedorSalud.maxUsuariosPermitidos }}</p>
            <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div :style="{ width: porcentajeUsuarios + '%' }" class="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"></div>
            </div>
            <p v-if="usuariosCreados >= proveedorSalud.maxUsuariosPermitidos" class="text-red-600 text-sm mt-2">⚠️ Has alcanzado el límite de usuarios.</p>
          </div>
  
          <!-- Uso de Empresas -->
          <div class="mt-4">
            <p class="text-gray-600"><strong>🏢 Empresas creadas:</strong> {{ empresasCreadas }} / {{ proveedorSalud.maxEmpresasPermitidas }}</p>
            <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div :style="{ width: porcentajeEmpresas + '%' }" class="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"></div>
            </div>
            <p v-if="empresasCreadas >= proveedorSalud.maxEmpresasPermitidas" class="text-red-600 text-sm mt-2">⚠️ Has alcanzado el límite de empresas.</p>
          </div>
        </div>
      </div>
      <!-- Información de Cuenta -->
      <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
        <h3 class="text-2xl font-semibold text-gray-700 mb-4">Información de tu Cuenta</h3>
        <p class="text-gray-600"><strong>👤 Nombre:</strong> {{ proveedorSalud.nombre || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>🆔 RFC:</strong> {{ proveedorSalud.RFC || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>📧 Correo:</strong> {{ proveedorSalud.correoElectronico || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>👥 Usuarios:</strong> {{ `${proveedorSalud.maxUsuariosPermitidos} disponibles` || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>🏢 Empresas:</strong> {{ `${proveedorSalud.maxEmpresasPermitidas} disponibles` || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>⏳ Periodo Gratuito:</strong> {{ periodoGratuito }}</p>
      </div>
  
    </div>
  </template>

<style scoped>
.bg-gray-100 {
  background-color: #f7fafc;
}
.text-green-600 {
  color: #38a169;
}
.text-red-600 {
  color: #e53e3e;
}
.progress-bar {
  height: 10px;
  width: 100%;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 4px;
}
.progress-fill {
  height: 100%;
  transition: width 0.5s ease-in-out;
}
.bg-blue-500 {
  background-color: #3b82f6;
}
.bg-green-500 {
  background-color: #10b981;
}
</style>
