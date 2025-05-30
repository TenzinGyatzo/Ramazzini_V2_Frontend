<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { usePagosStore } from "@/stores/pagosStore";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
// import { useUserStore } from "@/stores/user";
// import { useEmpresasStore } from "@/stores/empresas";
import { useRouter } from "vue-router";

const toast = inject('toast');

// Stores
const pagosStore = usePagosStore();
const proveedorSaludStore = useProveedorSaludStore();
// const userStore = useUserStore();
// const empresasStore = useEmpresasStore();

// Variables de estado
const user = ref(
    JSON.parse(localStorage.getItem('user') || 'null') // Recuperar usuario guardado o establecer null si no existe
);
const proveedorSalud = ref(
    JSON.parse(localStorage.getItem('proveedorSalud') || 'null') // Recuperar proveedor de salud guardado o establecer null si no existe
);
const suscripcionActual = ref({});
const loading = ref(false);
const router = useRouter();
const mostrarModalPago = ref(false);

// Planes disponibles
const plans = [
  { id: 1, name: "Básico", price: 699, histories: 50, maxHistories: 100, nextPlanPrice: 1399 },
  { id: 2, name: "Profesional", price: 1399, histories: 150, maxHistories: 150, nextPlanPrice: 2499 },
  { id: 3, name: "Empresarial", price: 2499, histories: 300, maxHistories: 5000 },
];
// const plans = [
//   { id: 1, name: "Básico", price: 399, users: 1, companies: 10, workers: 100, maxUsers: 4, maxCompanies: 40, maxWorkers: 400, nextPlanPrice: 1749 },
//   { id: 2, name: "Profesional", price: 1749, users: 5, companies: 50, workers: 500, maxUsers: 10, maxCompanies: 100, maxWorkers: 1000, nextPlanPrice: 4499 },
//   { id: 3, name: "Empresarial", price: 4499, users: 15, companies: 150, workers: 1500, maxUsers: 9999, maxCompanies: 9999, maxWorkers: 9999 },
// ];

// Variables de selección de plan y add-ons
const selectedPlan = ref(plans[0]);
const extraHistories = ref(0);
// const extraUsers = ref(0);
// const extraCompanies = ref(0);
// const extraWorkers = ref(0);

// Setear extraUsers, extraCompanies y extraWorkers si existen en proveedorSalud
onMounted(() => {
  if (proveedorSalud.value.addOns) {
    const extraHistoriesAddon = proveedorSalud.value.addOns.find((addon) => addon.tipo === 'historias_extra');
    // const extraUsersAddon = proveedorSalud.value.addOns.find((addon) => addon.tipo === 'usuario_adicional');
    // const extraCompaniesAddon = proveedorSalud.value.addOns.find((addon) => addon.tipo === 'empresas_extra');
    // const extraWorkersAddon = proveedorSalud.value.addOns.find((addon) => addon.tipo === 'trabajadores_extra');
    extraHistories.value = extraHistoriesAddon?.cantidad || 0;
    // extraUsers.value = extraUsersAddon?.cantidad || 0;
    // extraCompanies.value = extraCompaniesAddon?.cantidad || 0;
    // extraWorkers.value = extraWorkersAddon?.cantidad || 0;
  }
});

// Obtener historiasDelMes
const historiasDelMes = ref(0);
// const usuariosCreados = ref(0);
// const empresasCreadas = ref(0);
// const empresaConMasTrabajadores = ref(""); // Nombre de la empresa con más trabajadores
// const trabajadoresCreados = ref(0); // De la empresa con más trabajadores

onMounted(async () => {
  // Recargar los datos del proveedor desde el backend
  const proveedorActualizado = await proveedorSaludStore.getProveedorById(proveedorSalud.value._id);
  proveedorSalud.value = proveedorActualizado;

  // Obtener historias clínicas del mes
  historiasDelMes.value = await proveedorSaludStore.getHistoriasClinicasDelMes();

  // // Cantidad de usuarios
  // const resultado = await userStore.fetchUsersByProveedorId(user.value.idProveedorSalud);
  // usuariosCreados.value = resultado.data.length;
  // // Cantidad de empresas
  // await empresasStore.fetchEmpresas(proveedorSalud.value._id);
  // empresasCreadas.value = empresasStore.empresas.length;
  // // Top 3 empresas con más trabajadores
  // const top3Empresas = await proveedorSaludStore.getTopEmpresasByWorkers();
  // if (top3Empresas?.length > 0) {
  //   empresaConMasTrabajadores.value = top3Empresas[0].nombreComercial;
  //   trabajadoresCreados.value = top3Empresas[0].totalTrabajadores;
  // } else {
  //   console.log("No se encontraron empresas con trabajadores registrados.");
  // }
});


// Obtener suscripción actual con suscripcionActiva (id de suscripción)
onMounted(async () => {
  if (proveedorSalud.value.suscripcionActiva) {
    try {
      suscripcionActual.value = await pagosStore.getSubscriptionFromDB(proveedorSalud.value.suscripcionActiva);
      selectedPlan.value = plans.find((plan) => suscripcionActual.value.reason.includes(plan.name));
    } catch (error) {
      console.error('Error al obtener suscripción:', error);
    }
  }
});

// Texto dinámico del botón de acción
const subscriptionButtonText = computed(() => {
  return proveedorSalud.value.suscripcionActiva ? "Actualizar Plan" : "Contratar Plan";
});

// Función para formatear moneda
const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};

// Cálculo del precio total incluyendo add-ons
const totalPrice = computed(() => {
  if (!selectedPlan.value) return 0;
  const extraHistoriesCost = extraHistories.value * 8;
  return selectedPlan.value.price + extraHistoriesCost;
});
// const totalPrice = computed(() => {
//   if (!selectedPlan.value) return 0;
//   const extraUsersCost = extraUsers.value * 120;
//   const extraCompaniesCost = extraCompanies.value * 24;
//   const extraWorkersCost = extraWorkers.value * 2.4;
//   return selectedPlan.value.price + extraUsersCost + extraCompaniesCost + extraWorkersCost;
// });

// Sugerencia de upgrade si el costo total supera el siguiente plan
const suggestion = computed(() => {
  if (!selectedPlan.value) return "";
  const currentPlan = selectedPlan.value;
  const nextPlan = plans.find((plan) => plan.price > currentPlan.price);
  if (nextPlan && totalPrice.value >= nextPlan.price) {
    return `Por la cantidad de historias clínicas mensuales seleccionadas, el plan ${nextPlan.name} ofrece un mejor precio. Considera actualizar.`;
  }
  return "";
});

// Validar que los add-ons no sobrepasen los límites del plan
const validateLimits = () => {
  if (!selectedPlan.value) return;
  const currentPlan = selectedPlan.value;
  if (extraHistories.value > currentPlan.maxHistories) extraHistories.value = currentPlan.maxHistories;
  // if (extraUsers.value > currentPlan.maxUsers) extraUsers.value = currentPlan.maxUsers;
  // if (extraCompanies.value > currentPlan.maxCompanies) extraCompanies.value = currentPlan.maxCompanies;
  // if (extraWorkers.value > currentPlan.maxWorkers) extraWorkers.value = currentPlan.maxWorkers;
};

// Constants
const PLAN_REASONS = {
  Básico: "Ramazzini: Plan Básico",
  Profesional: "Ramazzini: Plan Profesional",
  Empresarial: "Ramazzini: Plan Empresarial"
};

// Helper functions
const getPlanReason = (planName) => PLAN_REASONS[planName] || "";

const createSubscriptionData = (reason, amount) => ({
  reason,
  external_reference: user.value.email,
  auto_recurring: {
    frequency: 1,
    frequency_type: "months",
    transaction_amount: amount,
    currency_id: "MXN",
  },
  payer_id: user.value.email,
  payer_email: user.value.email,
  back_url: `https://ramazzini.app/suscripcion-activa`,
});

const getProveedorSaludData = () => ({
  addOns: [
    { tipo: 'historias_extra', cantidad: extraHistories.value },
    // { tipo: 'usuario_adicional', cantidad: extraUsers.value },
    // { tipo: 'empresas_extra', cantidad: extraCompanies.value },
    // { tipo: 'trabajadores_extra', cantidad: extraWorkers.value }
  ],
});

// Main functions
const createSubscription = async () => {
  if (!selectedPlan.value) return;
  loading.value = true;

  try {
    const reason = getPlanReason(selectedPlan.value.name);
    const subscriptionData = createSubscriptionData(reason, totalPrice.value);
    const response = await pagosStore.createSubscription(subscriptionData);
    
    await proveedorSaludStore.updateProveedorById(
      proveedorSalud.value._id, 
      getProveedorSaludData()
    );

    if (response.init_point) window.location.href = response.init_point;
  } catch (error) {
    console.error('Error creating subscription:', error);
  } finally {
    setTimeout(() => loading.value = false, 5000);
  }
};

const updateSubscription = async () => {
  if (!selectedPlan.value) return;
  loading.value = true;

  try {
    const reason = getPlanReason(selectedPlan.value.name);
    await pagosStore.getSubscriptionFromAPI(proveedorSalud.value.suscripcionActiva);

    // Se envía la actualización a la API (actualiza el monto, por ejemplo)
    const response = await pagosStore.updateSubscription(
      proveedorSalud.value.suscripcionActiva, 
      {
        reason,
        auto_recurring: { transaction_amount: totalPrice.value },
      }
    );

    // Actualiza la información del proveedor en la base de datos
    await proveedorSaludStore.updateProveedorById(
      proveedorSalud.value._id, 
      getProveedorSaludData()
    );

    // Recupera la suscripción actualizada y asigna el resultado a suscripcionActual
    suscripcionActual.value = await pagosStore.getSubscriptionFromAPI(proveedorSalud.value.suscripcionActiva);
    selectedPlan.value = plans.find((plan) => suscripcionActual.value.reason.includes(plan.name));

    // Recarga los datos del proveedor desde el backend
    await proveedorSaludStore.loadProveedorSalud(proveedorSalud.value._id);

    // Actualiza manualmente los campos en el frontend
    proveedorSalud.value.maxHistoriasPermitidasAlMes = selectedPlan.value.histories + extraHistories.value;
    // proveedorSalud.value.maxUsuariosPermitidos = selectedPlan.value.users + extraUsers.value;
    // proveedorSalud.value.maxEmpresasPermitidas = selectedPlan.value.companies + extraCompanies.value;
    // proveedorSalud.value.maxTrabajadoresPermitidos = selectedPlan.value.workers + extraWorkers.value;

    toast.open({
      message: 'Suscripción actualizada exitosamente.',
      type: 'success',
      position: 'bottom',
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
  } finally {
    loading.value = false;
  }
};

const requestSubscription = () => 
  proveedorSalud.value.suscripcionActiva ? updateSubscription() : createSubscription();


// Cálculo de diferencias entre la suscripción actual y la nueva
const priceDifference = computed(() => totalPrice.value - (suscripcionActual.value.auto_recurring?.transaction_amount || 0));
const historiasDifference = computed(() => (selectedPlan.value.histories + extraHistories.value) - proveedorSalud.value.maxHistoriasPermitidasAlMes);
// const userDifference = computed(() => (selectedPlan.value.users + extraUsers.value) - proveedorSalud.value.maxUsuariosPermitidos);
// const companyDifference = computed(() => (selectedPlan.value.companies + extraCompanies.value) - proveedorSalud.value.maxEmpresasPermitidas);
// const workerDifference = computed(() => (selectedPlan.value.workers + extraWorkers.value) - proveedorSalud.value.maxTrabajadoresPermitidos);

const calcularPorcentaje = (valorActual, valorTotal) => {
  if (!valorTotal || !valorActual) {
    return 0;
  }
  return Math.min((valorActual / valorTotal) * 100, 100).toFixed(0);
};

const porcentajeHistorias = computed(() => {
  return calcularPorcentaje(historiasDelMes.value, selectedPlan.value?.histories + extraHistories.value);
});

// const porcentajeUsuarios = computed(() => {
//   return calcularPorcentaje(usuariosCreados.value, selectedPlan.value?.users + extraUsers.value);
// });

// const porcentajeEmpresas = computed(() => {
//   return calcularPorcentaje(empresasCreadas.value, selectedPlan.value?.companies + extraCompanies.value);
// });

// const porcentajeTrabajadores = computed(() => {
//   return calcularPorcentaje(trabajadoresCreados.value, selectedPlan.value?.workers + extraWorkers.value);
// });

</script>

<template>
  <Transition appear mode="out-in" name="slide-up">
  <div class="max-w-6xl mx-auto p-6 space-y-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between items-center">
      <h1 class="text-gray-800 text-3xl md:text-4xl font-semibold">Elige tu Plan</h1>
      <button 
        @click="router.push('/suscripcion-activa')"
        class="mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out active:scale-95 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Ver Mi Plan Actual
      </button>
    </div>

    <!-- Lista de Planes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white border-2 p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
        :class="{
          'border-sky-500 bg-sky-50': selectedPlan?.id === plan.id,
          'border-green-500 bg-green-50': suscripcionActual?.reason?.includes(plan.name)
        }"
        @click="selectedPlan = plan; extraHistories = 0;">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ plan.name }}</h2>
        <p class="text-3xl mb-4 font-light text-sky-600">${{ formatCurrency(plan.price) }}/mes</p>
        <ul class="text-gray-600 divide-y divide-gray-200 text-base">
          <li class="py-1">{{ plan.histories }} Historias Clínicas</li>
          <!-- <li class="py-1">{{ plan.users }} usuarios</li>
          <li class="py-1">{{ plan.companies }} empresas</li>
          <li class="py-1">{{ plan.workers }} trabajadores x empresa</li> -->
        </ul>
        <p v-if="suscripcionActual?.reason?.includes(plan.name)" class="text-green-600 font-medium mt-2">✓ Plan actual</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Comparación entre Plan Actual y Nuevo -->
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Compara Planes</h2>
        <table class="w-full text-gray-700 border-collapse">
          <thead>
            <tr class="bg-gray-200 text-gray-800">
                <th class="text-sm md:text-base p-2 text-left">Características</th>
                <th class="text-sm md:text-base p-2 text-center">
                  <span class="hidden xl:inline">Tu Plan Actual</span>
                  <span class="hidden lg:inline xl:hidden">Actual</span>
                  <span class="hidden md:inline lg:hidden">Plan Actual</span>
                  <span class="md:hidden">Actual</span>
                </th>
              <th class="text-sm md:text-base p-2 text-center">
                <span class="hidden sm:inline">Seleccionado</span>
                <span class="sm:hidden">Selec.</span>
              </th>
              <th class="text-sm md:text-base p-2 text-center">&nbsp;Cambio&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Precio Mensual</td>
              <td class="text-sm md:text-base p-2 text-center">${{ formatCurrency(suscripcionActual?.auto_recurring?.transaction_amount || 0) }}</td>
              <td class="text-sm md:text-base p-2 text-center">${{ formatCurrency(totalPrice) }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="priceDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ priceDifference >= 0 ? '↑' : '↓' }} ${{ formatCurrency(Math.abs(priceDifference)) }}
                </span>
              </td>
            </tr>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Historias Clínicas</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxHistoriasPermitidasAlMes }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.histories + extraHistories }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="historiasDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ historiasDifference >= 0 ? '↑' : '↓' }} {{ Math.abs(historiasDifference) }}
                </span>
              </td>
            </tr>
            <!-- <tr class="border-t">
              <td class="text-sm md:text-base p-2">Usuarios</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxUsuariosPermitidos }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.users + extraUsers }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="userDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ userDifference >= 0 ? '↑' : '↓' }} {{ Math.abs(userDifference) }}
                </span>
              </td>
            </tr>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Empresas</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxEmpresasPermitidas }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.companies + extraCompanies }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="companyDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ companyDifference >= 0 ? '↑' : '↓' }} {{ Math.abs(companyDifference) }}
                </span>
              </td>
            </tr>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Máximo de trabajadores por empresa</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxTrabajadoresPermitidos }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.workers + extraWorkers }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="workerDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ workerDifference >= 0 ? '↑' : '↓' }} {{ Math.abs(workerDifference) }}
                </span>
              </td>
            </tr> -->
          </tbody>
        </table>
      </div>
      <!-- Visualización de uso actual -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Uso de Recursos</h2>

        <!-- Uso de Historias Clínicas -->
        <div>
          <p class="text-gray-700 mb-2">
            <strong>Historias clínicas registradas:</strong> {{ historiasDelMes }} 
            <span class="text-gray-600">(límite: <strong>{{ selectedPlan?.histories + extraHistories }}</strong>)</span>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
            <div 
              class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500" 
              :class="{
                'bg-gradient-to-r from-cyan-500 to-cyan-400': historiasDelMes <= (selectedPlan?.histories + extraHistories),
                'bg-gradient-to-r from-red-500 to-red-400': historiasDelMes > (selectedPlan?.histories + extraHistories)
              }"
              :style="{ width: `${porcentajeHistorias}%` }"
            ></div>
            <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeHistorias <= 55 ? 'text-gray-600' : 'text-white'">
              {{ porcentajeHistorias }}%
            </span>
          </div>
          <p v-if="porcentajeHistorias >= 80 && porcentajeHistorias < 100" class="text-yellow-600 text-sm mt-2">
            ⚠️ Estás cerca del límite de historias clínicas. Considera actualizar tu plan.
          </p>
          <p v-if="historiasDelMes > (selectedPlan?.histories + extraHistories)" class="text-red-600 text-sm mt-2">
            ⚠️ Excede el límite de historias clínicas permitidas en este plan.
          </p>
        </div>

        <!-- Uso de Usuarios -->
        <!-- <div>
          <p class="text-gray-700 mb-2">
            <strong>Usuarios registrados:</strong> {{ usuariosCreados }} 
            <span class="text-gray-600">(límite: <strong>{{ selectedPlan?.users + extraUsers }}</strong>)</span>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
            <div 
              class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500" 
              :class="{
                'bg-gradient-to-r from-cyan-500 to-cyan-400': usuariosCreados <= (selectedPlan?.users + extraUsers),
                'bg-gradient-to-r from-red-500 to-red-400': usuariosCreados > (selectedPlan?.users + extraUsers)
              }"
              :style="{ width: `${porcentajeUsuarios}%` }"
            ></div>
            <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeUsuarios <= 55 ? 'text-gray-600' : 'text-white'">
              {{ porcentajeUsuarios }}%
            </span>
          </div>
          <p v-if="porcentajeUsuarios >= 80 && porcentajeUsuarios < 100" class="text-yellow-600 text-sm mt-2">
            ⚠️ Estás cerca del límite de usuarios. Considera actualizar tu plan.
          </p>
          <p v-if="usuariosCreados > (selectedPlan?.users + extraUsers)" class="text-red-600 text-sm mt-2">
            ⚠️ Excede el límite de usuarios permitidos en este plan.
          </p>
        </div> -->

        <!-- Uso de Empresas -->
        <!-- <div class="mt-4">
          <p class="text-gray-700 mb-2">
            <strong>Empresas registradas:</strong> {{ empresasCreadas }} 
            <span class="text-gray-600">(límite: <strong>{{ selectedPlan?.companies + extraCompanies }}</strong>)</span>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
            <div 
              class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500"
              :class="{
                'bg-gradient-to-r from-cyan-500 to-cyan-400': empresasCreadas <= (selectedPlan?.companies + extraCompanies),
                'bg-gradient-to-r from-red-500 to-red-400': empresasCreadas > (selectedPlan?.companies + extraCompanies)
              }"
              :style="{ width: `${porcentajeEmpresas}%` }"
            ></div>
            <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeEmpresas <= 55 ? 'text-gray-600' : 'text-white'">
              {{ porcentajeEmpresas }}%
            </span>
          </div>
          <p v-if="porcentajeEmpresas >= 80 && porcentajeEmpresas < 100" class="text-yellow-600 text-sm mt-2">⚠️ Estás cerca del límite de empresas. Considera actualizar tu plan.</p>
          <p v-if="empresasCreadas > (selectedPlan?.companies + extraCompanies)" class="text-red-600 text-sm mt-2">
            ⚠️ Excede el límite de empresas permitidas en este plan.
          </p>
        </div> -->

        <!-- Uso de Trabajadores -->
        <!-- <div class="mt-4">
          <p class="text-gray-700 mb-2">
            <strong>Empresa con más trabajadores:</strong> {{ empresaConMasTrabajadores }} →
            <strong>{{ trabajadoresCreados }}</strong> 
            <span class="text-gray-600"> (límite: <strong>{{ selectedPlan?.workers + extraWorkers }}</strong>)</span>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-4 mt-2 relative">
            <div 
              class="h-4 rounded-full absolute top-0 left-0 transition-all duration-500"
              :class="{
                'bg-gradient-to-r from-cyan-500 to-cyan-400': trabajadoresCreados <= (selectedPlan?.workers + extraWorkers),
                'bg-gradient-to-r from-red-500 to-red-400': trabajadoresCreados > (selectedPlan?.workers + extraWorkers)
              }"
              :style="{ width: `${porcentajeTrabajadores}%` }"
            ></div>
            <span class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-semibold" :class="porcentajeTrabajadores <= 55 ? 'text-gray-600' : 'text-white'">
              {{ porcentajeTrabajadores }}%
            </span>
          </div>
          <p v-if="porcentajeTrabajadores >= 80 && porcentajeTrabajadores < 100" class="text-yellow-600 text-sm mt-2">⚠️ Estás cerca del límite de trabajadores. Considera actualizar tu plan.</p>
          <p v-if="trabajadoresCreados > (selectedPlan?.workers + extraWorkers)" class="text-red-600 text-sm mt-2">
            ⚠️ Excede el límite de trabajadores permitidos en este plan.
          </p>
        </div> -->
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sección de Add-ons -->
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Extras para tu Plan</h2>
        <div class="flex flex-col gap-6 text-base">
          <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Aumenta tus recursos ($200 por cada 25 historias clínicas)</label>
            <div class="flex items-center gap-2">
              <button @click="extraHistories > 0 ? extraHistories -= 25 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input type="number" v-model="extraHistories" @input="validateLimits" min="0" class="border rounded p-2 w-24 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraHistories < selectedPlan?.maxHistories ? extraHistories += 25 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <!-- <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Agregar más usuarios ($120 por usuario)</label>
            <div class="flex items-center gap-2">
              <button @click="extraUsers > 0 ? extraUsers-- : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input type="number" v-model="extraUsers" @input="validateLimits" min="0" class="border rounded p-2 w-24 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraUsers < selectedPlan?.maxUsers ? extraUsers++ : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div> -->
          <!-- <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Agregar más empresas ($120 por cada 5 empresas)</label>
            <div class="flex items-center gap-2">
              <button @click="extraCompanies > 0 ? extraCompanies -= 5 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input type="number" v-model="extraCompanies" @input="validateLimits" min="0" step="5" class="border rounded p-2 w-24 text-center focus:ring-2 focus:ring-sky-500">
                <button @click="extraCompanies < selectedPlan?.maxCompanies ? extraCompanies += 5 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                </button>
            </div>
          </div> -->
          <!-- <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Aumentar el límite de trabajadores por empresa (+50 por $120)</label>
            <div class="flex items-center gap-2">
              <button @click="extraWorkers > 0 ? extraWorkers -= 50 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input type="number" v-model="extraWorkers" @input="validateLimits" min="0" step="5" class="border rounded p-2 w-24 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraWorkers < selectedPlan?.maxWorkers ? extraWorkers += 50 : null" class="w-10 h-10 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                </button>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Resumen y botón de acción -->
      <div class="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-400 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Resumen del Plan</h2>
        <div v-if="selectedPlan" class="mb-4 space-y-2 text-base text-gray-700">
          <p class="flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Plan elegido: <span class="font-semibold">{{ selectedPlan.name }}</span>
          </p>
          <p>Límite de Historias Clínicas al mes: <span class="font-semibold">{{ selectedPlan.histories + extraHistories }}</span> 
            <span class="text-gray-500"> (Base: {{ selectedPlan.histories }} + Extras: {{ extraHistories }})</span>
          </p>
          <!-- <p>Usuarios permitidos: <span class="font-semibold">{{ selectedPlan.users + extraUsers }}</span> 
            <span class="text-gray-500"> (Base: {{ selectedPlan.users }} + Extras: {{ extraUsers }})</span>
          </p>
          <p>Empresas permitidas: <span class="font-semibold">{{ selectedPlan.companies + extraCompanies }}</span> 
            <span class="text-gray-500"> (Base: {{ selectedPlan.companies }} + Extras: {{ extraCompanies }})</span>
          </p>
          <p>Límite de trabajadores por empresa: <span class="font-semibold">{{ selectedPlan.workers + extraWorkers }}</span> 
            <span class="text-gray-500"> (Base: {{ selectedPlan.workers }} + Extras: {{ extraWorkers }})</span>
          </p> -->
          <p class="text-xl font-semibold mt-4 text-sky-600">Total mensual: ${{ formatCurrency(totalPrice) }}</p>
          <p v-if="suggestion" class="text-yellow-600 mt-2">{{ suggestion }}</p>
        </div>
        <button 
          @click="proveedorSalud?.suscripcionActiva ? requestSubscription() : mostrarModalPago = true"
          :disabled="loading" 
          class="bg-gradient-to-r from-sky-500 to-sky-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ease-in-out active:scale-95">
          {{ loading ? 'Procesando...' : subscriptionButtonText }}
        </button>
      </div>
    </div>
  </div>
  </Transition>

  <!-- Modal de recomendaciones -->
  <Teleport to="body">
    <transition name="fade">
      <div v-if="mostrarModalPago" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out" @click.self="mostrarModalPago = false">
        <div class="bg-white rounded-xl shadow-2xl max-w-lg lg:max-w-xl w-full m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fadeInScale">
          <div class="absolute top-4 right-4">
            <button @click="mostrarModalPago = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="p-6 sm:p-8 space-y-5">
            <div class="text-center">
              <span class="text-4xl lg:text-5xl mb-2">💳</span> <h2 class="text-2xl lg:text-3xl font-bold text-gray-800">¡Prepara tu Pago Exitoso!</h2>
            </div>

            <p class="text-gray-600 text-sm lg:text-base text-center">
              Para asegurar que tu suscripción se active sin problemas, sigue estos simples consejos:
            </p>

            <div class="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-3">
              <p class="text-sm lg:text-base text-sky-700">
                <strong class="font-semibold">🔒 Tu seguridad es clave.</strong> Mercado Pago utiliza sistemas avanzados para prevenir fraudes. Esto es excelente para proteger tus datos, aunque en ocasiones puede rechazar pagos legítimos si detecta algo inusual.
              </p>
              <p class="font-semibold text-gray-700 text-base lg:text-lg">✅ Para facilitar la aprobación:</p>
              <ul class="list-none space-y-2 text-gray-600 text-sm lg:text-base">
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <span>Usa una tarjeta <strong class="font-medium">que uses con frecuencia</strong> para compras online.</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <span>Paga desde tu <strong class="font-medium">dispositivo y red habitual</strong> (Wi-Fi o datos).</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <span>Verifica que todos <strong class="font-medium">tus datos sean correctos</strong> al ingresarlos.</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  <span>Si tienes cuenta de Mercado Pago, <strong class="font-medium">inicia sesión y paga desde allí</strong> para mayor seguridad.</span>
                </li>
              </ul>
            </div>

            <p class="text-xs lg:text-sm text-gray-500 text-center">
                Si tu pago es rechazado, ¡no te preocupes! Intenta con otro método o <a href="https://wa.link/yzc8p1" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline font-medium">contáctanos</a>. Estamos para ayudarte.
            </p>

            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-3">
              <button 
                @click="!loading && (mostrarModalPago = false)"
                :disabled="loading"
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-all text-sm lg:text-base font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cerrar
              </button>
              <button
                @click="() => { loading = true; requestSubscription(); }"
                :disabled="loading"
                class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 transition-all text-sm lg:text-base font-semibold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Procesando...' : 'Entendido, ir al Pago' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>

</template>

<style>
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-fadeInScale {
    animation: fadeInScale 0.3s ease-out forwards;
  }
</style>