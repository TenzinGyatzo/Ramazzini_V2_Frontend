<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { usePagosStore } from '@/stores/pagosStore';
import { useUserStore } from '@/stores/user';
import { useEmpresasStore } from '@/stores/empresas';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useRouter } from 'vue-router';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ModalCancelarSuscripcion from '@/components/suscripciones/ModalCancelarSuscripcion.vue';

const pagosStore = usePagosStore();
const userStore = useUserStore();
const empresasStore = useEmpresasStore();
const proveedorSaludStore = useProveedorSaludStore();
const router = useRouter();

const toast = inject('toast');

const suscripcionActual = ref(null);
const usuariosCreados = ref(0);
const empresasCreadas = ref(0);
const showCancelModal = ref(false);
const isCancelling = ref(false); // Estado para manejar la carga

const proveedorSalud = ref(
  JSON.parse(localStorage.getItem('proveedorSalud') || 'null') || {}
);

// Función para obtener toda la información necesaria en una sola llamada
const fetchData = async () => {
  if (proveedorSalud.value?.suscripcionActiva) {
    try {
        // Obtener suscripción
        const response = await pagosStore.getSubscriptionFromAPI(proveedorSalud.value.suscripcionActiva);
        // const response = await pagosStore.getSubscriptionFromDB(proveedorSalud.value.suscripcionActiva);
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

onMounted(async () => {
  // Recargar los datos del proveedor desde el backend
  const proveedorActualizado = await proveedorSaludStore.getProveedorById(proveedorSalud.value._id);
  proveedorSalud.value = proveedorActualizado;

  // Luego, cargar el resto de los datos
  await fetchData();
});

const toggleCancelModal = () => {
  showCancelModal.value = !showCancelModal.value;
};

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
    const fechaInicioTrial = parseISO(proveedorSalud.value.fechaInicioTrial);
    const fechaFinTrial = new Date(fechaInicioTrial);
    fechaFinTrial.setDate(fechaFinTrial.getDate() + 15); // 15 días de trial
    fechaFinTrial.setHours(23, 59, 59); // Asegura que el día final termine a las 23:59:59

    const hoy = new Date();
    const diasRestantes = differenceInDays(fechaFinTrial, hoy);

    if (diasRestantes > 0) {
      return `Hasta el ${formatDate(fechaFinTrial)} (${diasRestantes} días restantes)`; // Suma 1 día
    } else {
      return 'Finalizado';
    }
  }
  return 'No disponible';
});

// Sin mostrar días restantes
/* const periodoGratuito = computed(() => {
  if (proveedorSalud.value?.periodoDePruebaFinalizado) {
    return 'Finalizado';
  } else if (proveedorSalud.value?.fechaInicioTrial) {
    return `Hasta el ${formatDate(proveedorSalud.value.fechaInicioTrial)}`; // Falta sumar los 15 días
  }
  return 'No disponible';
}); */


// Computed para calcular el uso de usuarios y empresas
const calcularPorcentaje = (valorActual, valorTotal) => {
  if (!valorTotal && valorActual > 0) {
    return 100; // Si no hay límite pero hay empresas creadas, mostrar 100%
  }
  if (!valorTotal || !valorActual) {
    return 0; // Si no hay empresas creadas o no hay límite, mostrar 0%
  }
  return Math.min((valorActual / valorTotal) * 100, 100).toFixed(0);
};

const porcentajeUsuarios = computed(() => {
  return calcularPorcentaje(usuariosCreados.value, proveedorSalud.value.maxUsuariosPermitidos);
});

const porcentajeEmpresas = computed(() => {
  return calcularPorcentaje(empresasCreadas.value, proveedorSalud.value.maxEmpresasPermitidas);
});

const cancelSubscription = async () => {
  isCancelling.value = true; // Activar el estado de carga
  try {
    await pagosStore.cancelSubscription(suscripcionActual.value.id);

    // Actualizar proveedorSalud localmente
    proveedorSalud.value.estadoSuscripcion = 'cancelled';
    proveedorSalud.value.finDeSuscripcion = suscripcionActual.value.next_payment_date;
    proveedorSalud.value.suscripcionActiva = ''; // Vaciar suscripción activa
    
    // Estos 3 se reestableceranm auntomaticamente en el onUnmounted de empresasView cuando finalice el ciclo ya pagado
    // proveedorSalud.value.maxUsuariosPermitidos = 1;
    // proveedorSalud.value.maxEmpresasPermitidas = 0;
    // proveedorSalud.value.addOns = [];

    // Limpiar suscripción actual
    suscripcionActual.value = {
      status: 'cancelled'
    };

    // Mostrar notificación
    toast.open({
      type: 'success',
      message: 'Tu suscripción ha sido cancelada exitosamente',
      position: 'bottom',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
  } finally {
    isCancelling.value = false; 
  }
};

const suscripcionCanceladaYActiva = computed(() => {
  if (proveedorSalud.value?.estadoSuscripcion === 'cancelled' && proveedorSalud.value?.finDeSuscripcion) {
    const fechaFinSuscripcion = parseISO(proveedorSalud.value.finDeSuscripcion);
    const hoy = new Date();
    return differenceInDays(fechaFinSuscripcion, hoy) >= 0; // Si la fecha de fin es en el futuro
  }
  return false;
});

</script>

<template>
  <Transition appear name="fade">
    <ModalCancelarSuscripcion v-if="showCancelModal" @closeModal="toggleCancelModal" @confirmCancellation="cancelSubscription" />
  </Transition>

  <Transition appear mode="out-in" name="slide-up">
    <div class="max-w-4xl mx-auto p-6 space-y-6 min-h-screen">
      <h2 class="text-gray-800 text-3xl md:text-4xl mb-4 font-semibold">Detalles de Mi Suscripción</h2>
  
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Sección de Suscripción -->
        <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4">{{ suscripcionActual?.reason || 'Sin plan activo' }}</h3>
          <!-- Mensaje de suscripción cancelada pero activa -->
          <div v-if="suscripcionCanceladaYActiva" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <p class="text-sm">
              Has cancelado tu suscripción, pero tendrás acceso a los beneficios hasta el <strong>{{ formatDate(proveedorSalud.finDeSuscripcion) }}</strong>.
            </p>
          </div>
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
          <p v-else class="text-gray-600"><strong>➕ Adicionales:</strong> Sin adicionales contratados</p>
          <!-- <p class="text-gray-600"><strong>📅 Inicio de suscripción:</strong> {{ suscripcionActual ? formatDate(suscripcionActual.date_created) : 'No disponible' }}</p> -->
          <p class="text-gray-600"><strong>💰 Pago mensual:</strong> {{ suscripcionActual?.auto_recurring?.transaction_amount ? `$${formatCurrency(suscripcionActual.auto_recurring.transaction_amount)} MXN` : 'Sin plan activo' }}</p>
            <p class="text-gray-600"><strong>📅 Próximo cobro:</strong> 
            {{ suscripcionActual?.status === 'cancelled' ? 
               'No se realizarán más cobros' : 
               (suscripcionActual?.next_payment_date ? formatDate(suscripcionActual.next_payment_date) : 'Sin plan activo') 
            }}
            </p>
          <p class="text-gray-600"><strong>📍 Estado: </strong>
            <span :class="{
              'text-green-600 bg-green-100 px-2 py-0.5 rounded-full': proveedorSalud.estadoSuscripcion === 'authorized', 
              'text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full': proveedorSalud.estadoSuscripcion === 'pending',
              'text-red-600 bg-red-100 px-2 py-0.5 rounded-full': proveedorSalud.estadoSuscripcion === 'cancelled',
              'text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full': !proveedorSalud.estadoSuscripcion
            }">
              {{ proveedorSalud.estadoSuscripcion || 'Sin suscripción actual' }}
            </span>
          </p>
          <button 
            @click="router.push('/suscripcion')"
            class="mt-2 w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out active:scale-95">
            {{ suscripcionActual ? 'Mejorar mi Plan ✨' : 'Comenzar con un Plan 🚀' }}
          </button>
        </div>
  
        <!-- Sección de Uso -->
        <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4">Uso de Recursos</h3>
          
          <!-- Uso de Usuarios -->
          <div>
            <p class="text-gray-600"><strong>👥 Usuarios registrados:</strong> {{ usuariosCreados }} de {{ proveedorSalud.maxUsuariosPermitidos }}</p>
            <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
              <div 
                :style="{ width: porcentajeUsuarios + '%' }" 
                class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500" 
                :class="{
                  'bg-gradient-to-r from-cyan-500 to-cyan-400': usuariosCreados < proveedorSalud.maxUsuariosPermitidos,
                  'bg-gradient-to-r from-red-500 to-red-400': usuariosCreados >= proveedorSalud.maxUsuariosPermitidos
                }">
              </div>
                <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeUsuarios <= 55 ? 'text-gray-600' : 'text-white'">
                {{ porcentajeUsuarios }}%
                </span>
            </div>
            <p v-if="porcentajeUsuarios >= 80 && porcentajeUsuarios < 100" class="text-yellow-600 text-sm mt-2">
              ⚠️ Estás cerca del límite de usuarios. Considera actualizar tu plan.
            </p>
            <p v-if="usuariosCreados >= proveedorSalud.maxUsuariosPermitidos" class="text-red-600 text-sm mt-2">⚠️ Has alcanzado el límite de usuarios.
              <a @click="router.push('/suscripcion')" class="text-sky-600 underline cursor-pointer">Mejora tu plan</a>.
            </p>
          </div>
  
          <!-- Uso de Empresas -->
          <div class="mt-4">
            <p class="text-gray-600"><strong>🏢 Empresas registradas:</strong> {{ empresasCreadas }} de {{ proveedorSalud.maxEmpresasPermitidas }}</p>
            <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
              <div 
                :style="{ width: porcentajeEmpresas + '%' }" 
                class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500"
                :class="{
                  'bg-gradient-to-r from-cyan-500 to-cyan-400': empresasCreadas < proveedorSalud.maxEmpresasPermitidas,
                  'bg-gradient-to-r from-red-500 to-red-400': empresasCreadas >= proveedorSalud.maxEmpresasPermitidas
                }"></div>
                <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeEmpresas <= 55 ? 'text-gray-600' : 'text-white'">
                {{ porcentajeEmpresas }}%
                </span>
            </div>
            <p v-if="porcentajeEmpresas >= 80 && porcentajeEmpresas < 100" class="text-yellow-600 text-sm mt-2">⚠️ Estás cerca del límite de empresas. Considera actualizar tu plan.</p>
            <p v-if="empresasCreadas >= proveedorSalud.maxEmpresasPermitidas" class="text-red-600 text-sm mt-2">⚠️ Has alcanzado el límite de empresas.
              <a @click="router.push('/suscripcion')" class="text-sky-600 underline cursor-pointer">Mejora tu plan</a>.
            </p>
          </div>
        </div>
      </div>
      <!-- Información de Cuenta -->
      <div class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">Mi Cuenta</h3>
        <p class="text-gray-600"><strong>👤 Nombre:</strong> {{ proveedorSalud.nombre || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>🆔 RFC:</strong> {{ proveedorSalud.RFC || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>📧 Correo:</strong> {{ proveedorSalud.correoElectronico || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>👥 Usuarios:</strong> {{ `${proveedorSalud.maxUsuariosPermitidos} disponibles` || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>🏢 Empresas:</strong> {{ `${proveedorSalud.maxEmpresasPermitidas} disponibles` || 'No disponible' }}</p>
        <p class="text-gray-600"><strong>⏳ Periodo Gratuito:</strong> {{ periodoGratuito }}</p>
      </div>

      <button 
        v-if="suscripcionActual && suscripcionActual.status === 'authorized'"
        @click="toggleCancelModal"
        :disabled="isCancelling"
        class="mt-2 ml-auto block text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out"
        :class="[
          isCancelling ? 
          'bg-red-400 cursor-not-allowed' : 
          'bg-red-600 hover:bg-red-500 active:scale-95'
        ]"
      >
        {{ isCancelling ? 'Procesando...' : 'Cancelar Suscripción' }}
      </button>
    </div>
  </Transition>
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
