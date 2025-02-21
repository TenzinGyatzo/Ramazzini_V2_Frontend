<script setup>
import { ref, computed, onMounted } from "vue";
import { usePagosStore } from "@/stores/pagosStore";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useUserStore } from "@/stores/user";
import { useEmpresasStore } from "@/stores/empresas";

// Stores
const pagosStore = usePagosStore();
const proveedorSaludStore = useProveedorSaludStore();
const userStore = useUserStore();
const empresasStore = useEmpresasStore();

// Variables de estado
const user = ref(
    JSON.parse(localStorage.getItem('user') || 'null') // Recuperar usuario guardado o establecer null si no existe
);
const proveedorSalud = ref(
    JSON.parse(localStorage.getItem('proveedorSalud') || 'null') // Recuperar proveedor de salud guardado o establecer null si no existe
);
const suscripcionActual = ref({});
const loading = ref(false);

// Planes disponibles
const plans = [
  { id: 1, name: "Básico", price: 399, users: 1, companies: 10, maxUsers: 4, maxCompanies: 40, nextPlanPrice: 1749 },
  { id: 2, name: "Profesional", price: 1749, users: 5, companies: 50, maxUsers: 10, maxCompanies: 100, nextPlanPrice: 4499 },
  { id: 3, name: "Empresarial", price: 4499, users: 15, companies: 150, maxUsers: 9999, maxCompanies: 9999 },
];

// Variables de selección de plan y add-ons
const selectedPlan = ref(plans[0]);
const extraUsers = ref(0);
const extraCompanies = ref(0);

// Obtener usuariosCreados y empresasCreadas
const usuariosCreados = ref(0);
const empresasCreadas = ref(0);

onMounted(async () => {
  const resultado = await userStore.fetchUsersByProveedorId(user.value.idProveedorSalud);
  usuariosCreados.value = resultado.data.length;
  await empresasStore.fetchEmpresas(proveedorSalud.value._id);
  empresasCreadas.value = empresasStore.empresas.length;
});

// Obtener suscripción actual con suscripcionActiva (id de suscripción)
onMounted(async () => {
  if (proveedorSalud.value.suscripcionActiva) {
    try {
      suscripcionActual.value = await pagosStore.getSubscription(proveedorSalud.value.suscripcionActiva);
      console.log('Plan: ', suscripcionActual.value.reason);
      console.log('Mensualidad: ', suscripcionActual.value.auto_recurring.transaction_amount);
      console.log('Usuarios: ', proveedorSalud.value.maxUsuariosPermitidos);
      console.log('Empresas: ', proveedorSalud.value.maxEmpresasPermitidas);
    } catch (error) {
      console.error('Error al obtener suscripción:', error);
    }
  }
});

// Texto dinámico del botón de acción
const subscriptionButtonText = computed(() => {
  return proveedorSalud.value.suscripcionActiva ? "Actualizar Suscripción" : "Solicitar Suscripción";
});

// Función para formatear moneda
const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};

// Cálculo del precio total incluyendo add-ons
const totalPrice = computed(() => {
  if (!selectedPlan.value) return 0;
  const extraUsersCost = extraUsers.value * 120;
  const extraCompaniesCost = extraCompanies.value * 24;
  return selectedPlan.value.price + extraUsersCost + extraCompaniesCost;
});

// Sugerencia de upgrade si el costo total supera el siguiente plan
const suggestion = computed(() => {
  if (!selectedPlan.value) return "";
  const currentPlan = selectedPlan.value;
  const nextPlan = plans.find((plan) => plan.price > currentPlan.price);
  if (nextPlan && totalPrice.value >= nextPlan.price) {
    return `Por la cantidad de usuarios y empresas seleccionados, el plan ${nextPlan.name} ofrece un mejor precio. Considera actualizar.`;
  }
  return "";
});

// Validar que los add-ons no sobrepasen los límites del plan
const validateLimits = () => {
  if (!selectedPlan.value) return;
  const currentPlan = selectedPlan.value;
  if (extraUsers.value > currentPlan.maxUsers) extraUsers.value = currentPlan.maxUsers;
  if (extraCompanies.value > currentPlan.maxCompanies) extraCompanies.value = currentPlan.maxCompanies;
};

// Función para solicitar o actualizar suscripción
const requestSubscription = async () => { 
  if (!selectedPlan.value) return;
  loading.value = true;

  let reason;
  if (selectedPlan.value.name === "Básico") {
    reason = "Ramazzini: Plan Básico";
  } else if (selectedPlan.value.name === "Profesional") {
    reason = "Ramazzini: Plan Profesional";
  } else if (selectedPlan.value.name === "Empresarial") {
    reason = "Ramazzini: Plan Empresarial";
  }

  const subscriptionData = {
    reason: reason,
    external_reference: user.value.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: totalPrice.value,
      currency_id: "MXN",
    },
    payer_id: user.value.email,
    payer_email: user.value.email,
    back_url: `https://ramazzini.app/suscripcion-exitosa`,
  };

  try {
    const response = await pagosStore.createSubscription(subscriptionData);
    console.log('Suscripción creada:', response);

    // Solo guarda la suscripción en proveedorSalud sin actualizar los límites maxUsuariosPermitidos y maxEmpresasPermitidos aún
    const proveedorSaludData = {
      fechaInicioTrial: proveedorSalud.value.fechaInicioTrial,
      periodoDePruebaFinalizado: proveedorSalud.value.periodoDePruebaFinalizado,
      addOns: [
        { tipo: 'usuario_adicional', cantidad: extraUsers.value },
        { tipo: 'empresas_extra', cantidad: extraCompanies.value }
      ],
    };

    await proveedorSaludStore.updateProveedorById(proveedorSalud.value._id, proveedorSaludData); 

    // Redirigir al usuario a la URL de pago
    if (response.init_point) {
      window.location.href = response.init_point;
    }

  } catch (error) {
    console.error('Error actualizando suscripción:', error);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 5000);
  }
};


// Cálculo de diferencias entre la suscripción actual y la nueva
const priceDifference = computed(() => totalPrice.value - (suscripcionActual.value.auto_recurring?.transaction_amount || 0));
const userDifference = computed(() => (selectedPlan.value.users + extraUsers.value) - proveedorSalud.value.maxUsuariosPermitidos);
const companyDifference = computed(() => (selectedPlan.value.companies + extraCompanies.value) - proveedorSalud.value.maxEmpresasPermitidas);

</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6 bg-gray-100 min-h-screen">
    <h1 class="text-gray-800 text-3xl md:text-4xl mb-4">Suscripciones</h1>

    <!-- Lista de Planes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
        :class="{
          'border-sky-500 bg-sky-50': selectedPlan?.id === plan.id,
          'border-green-500 bg-green-50': suscripcionActual?.reason?.includes(plan.name)
        }"
        @click="selectedPlan = plan; extraUsers = 0; extraCompanies = 0"
      >
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ plan.name }}</h2>
        <p class="text-3xl mb-4 font-light text-sky-600">${{ formatCurrency(plan.price) }}/mes</p>
        <ul class="text-gray-600 divide-y divide-gray-200 text-base">
          <li class="py-1">{{ plan.users }} usuarios</li>
          <li class="py-1">{{ plan.companies }} empresas</li>
        </ul>
        <p v-if="suscripcionActual?.reason?.includes(plan.name)" class="text-green-600 font-medium mt-2">✓ Plan actual</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Comparación entre Plan Actual y Nuevo -->
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Comparación de Planes</h2>
        <table class="w-full text-gray-700 border-collapse">
          <thead>
            <tr class="bg-gray-200 text-gray-800">
              <th class="text-sm md:text-base p-2 text-left">Características</th>
              <th class="text-sm md:text-base p-2 text-center">Actual</th>
              <th class="text-sm md:text-base p-2 text-center">Nuevo</th>
              <th class="text-sm md:text-base p-2 text-center">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Precio Mensual</td>
              <td class="text-sm md:text-base p-2 text-center">${{ formatCurrency(suscripcionActual?.auto_recurring?.transaction_amount || 0) }}</td>
              <td class="text-sm md:text-base p-2 text-center">${{ formatCurrency(totalPrice) }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="priceDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ priceDifference >= 0 ? '+' : '-' }}${{ formatCurrency(Math.abs(priceDifference)) }}
                </span>
              </td>
            </tr>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Usuarios</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxUsuariosPermitidos }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.users + extraUsers }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="userDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ userDifference >= 0 ? '+' : '-' }}{{ Math.abs(userDifference) }}
                </span>
              </td>
            </tr>
            <tr class="border-t">
              <td class="text-sm md:text-base p-2">Empresas</td>
              <td class="text-sm md:text-base p-2 text-center">{{ proveedorSalud?.maxEmpresasPermitidas }}</td>
              <td class="text-sm md:text-base p-2 text-center">{{ selectedPlan?.companies + extraCompanies }}</td>
              <td class="text-sm md:text-base p-2 text-center">
                <span :class="companyDifference >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ companyDifference >= 0 ? '+' : '-' }}{{ Math.abs(companyDifference) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Visualización de uso actual -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Uso Actual</h2>

        <!-- Uso de Usuarios -->
        <div>
          <p class="text-gray-700 mb-2">Usuarios registrados: {{ usuariosCreados }} / {{ selectedPlan?.users + extraUsers }}</p>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="h-3 rounded-full"
              :class="{
                'bg-sky-500': usuariosCreados <= (selectedPlan?.users + extraUsers),
                'bg-red-500': usuariosCreados > (selectedPlan?.users + extraUsers)
              }"
              :style="{ width: `${Math.min((usuariosCreados / (selectedPlan?.users + extraUsers)) * 100, 100)}%` }"
            ></div>
          </div>
          <p v-if="usuariosCreados > (selectedPlan?.users + extraUsers)" class="text-red-600 text-sm mt-2">
            ⚠️ Excedes el límite de usuarios permitidos en este plan.
          </p>
        </div>

        <!-- Uso de Empresas -->
        <div class="mt-4">
          <p class="text-gray-700 mb-2">Empresas registradas: {{ empresasCreadas }} / {{ selectedPlan?.companies + extraCompanies }}</p>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="h-3 rounded-full"
              :class="{
                'bg-sky-500': empresasCreadas <= (selectedPlan?.companies + extraCompanies),
                'bg-red-500': empresasCreadas > (selectedPlan?.companies + extraCompanies)
              }"
              :style="{ width: `${Math.min((empresasCreadas / (selectedPlan?.companies + extraCompanies)) * 100, 100)}%` }"
            ></div>
          </div>
          <p v-if="empresasCreadas > (selectedPlan?.companies + extraCompanies)" class="text-red-600 text-sm mt-2">
            ⚠️ Excedes el límite de empresas permitidas en este plan.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sección de Add-ons -->
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Adicionales</h2>
        <div class="flex flex-col gap-6 text-base">
          <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Usuarios ($120 por usuario extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraUsers > 0 ? extraUsers-- : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraUsers" @input="validateLimits" min="0" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraUsers < selectedPlan?.maxUsers ? extraUsers++ : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
          <div>
            <label class="text-sm md:text-base block mb-2 text-gray-600">Empresas ($120 por cada 5 empresas extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraCompanies > 0 ? (extraCompanies -= 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraCompanies" @input="validateLimits" min="0" step="5" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraCompanies < selectedPlan?.maxCompanies ? (extraCompanies += 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen y botón de acción -->
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Resumen</h2>
        <div v-if="selectedPlan" class="mb-4 space-y-2 text-base text-gray-700">
          <p>Plan seleccionado: <span class="font-medium">{{ selectedPlan.name }}</span></p>
          <p>Usuarios: {{ selectedPlan.users }} + {{ extraUsers }} extra</p>
          <p>Empresas: {{ selectedPlan.companies }} + {{ extraCompanies }} extra</p>
          <p class="text-xl font-semibold mt-4 text-sky-600">Total: ${{ formatCurrency(totalPrice) }}/mes</p>
          <p v-if="suggestion" class="text-yellow-600 mt-2">{{ suggestion }}</p>
        </div>
        <button 
          @click="requestSubscription" 
          :disabled="loading" 
          class="bg-gradient-to-r from-sky-500 to-sky-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ease-in-out">
          {{ loading ? 'Procesando...' : subscriptionButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>


