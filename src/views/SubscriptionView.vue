<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { usePagosStore } from "@/stores/pagosStore";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { sub } from "date-fns";

const pagosStore = usePagosStore();
const proveedorSaludStore = useProveedorSaludStore();

const user = ref(
    JSON.parse(localStorage.getItem('user') || 'null') // Recuperar usuario guardado o establecer null si no existe
);

const proveedorSalud = ref(
    JSON.parse(localStorage.getItem('proveedorSalud') || 'null') // Recuperar usuario guardado o establecer null si no existe
);

const suscripcionActual = ref({});

// Obtener suscripcion actual con suscripcionActiva(id de suscripcion)
onMounted(async () => {
  if (proveedorSalud.value.suscripcionActiva) {
    try {
      suscripcionActual.value = await pagosStore.getSubscription(proveedorSalud.value.suscripcionActiva);
      // console.log('Suscripcion actual:', suscripcionActual.value);
      // Utilizar los siguientes para mostrar el plan actual en la vista
      console.log('Plan: ', suscripcionActual.value.reason);
      console.log('Mensualidad: ', suscripcionActual.value.auto_recurring.transaction_amount);
      console.log('Usuarios: ', proveedorSalud.value.maxUsuariosPermitidos);
      console.log('Empresas: ', proveedorSalud.value.maxEmpresasPermitidas);
    } catch (error) {
      console.error('Error al obtener suscripcion:', error);
    }
  }
});

const loading = ref(false);

const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};

const plans = [
  { id: 1, name: "Básico", price: 399, users: 1, companies: 10, maxUsers: 4, maxCompanies: 40, nextPlanPrice: 1749 },
  { id: 2, name: "Profesional", price: 1749, users: 5, companies: 50, maxUsers: 10, maxCompanies: 100, nextPlanPrice: 4499 },
  { id: 3, name: "Empresarial", price: 4499, users: 15, companies: 150, maxUsers: 9999, maxCompanies: 9999 },
];

const selectedPlan = ref(plans[0]);
const extraUsers = ref(0);
const extraCompanies = ref(0);

const totalPrice = computed(() => {
  if (!selectedPlan.value) return 0;
  const extraUsersCost = extraUsers.value * 120;
  const extraCompaniesCost = extraCompanies.value * 24;
  return selectedPlan.value.price + extraUsersCost + extraCompaniesCost;
});

const suggestion = computed(() => {
  if (!selectedPlan.value) return "";
  const currentPlan = selectedPlan.value;
  const nextPlan = plans.find((plan) => plan.price > currentPlan.price);
  if (nextPlan && totalPrice.value >= nextPlan.price) {
    return `Por la cantidad de usuarios y empresas seleccionados, el plan ${nextPlan.name} ofrece un mejor precio. Considera actualizar.`;
  }
  return "";
});

const validateLimits = () => {
  if (!selectedPlan.value) return;
  const currentPlan = selectedPlan.value;
  if (extraUsers.value > currentPlan.maxUsers) extraUsers.value = currentPlan.maxUsers;
  if (extraCompanies.value > currentPlan.maxCompanies) extraCompanies.value = currentPlan.maxCompanies;
};

const requestSubscription = async () => { // Actualizar suscripcion y proveedorSalud
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
    //back_url: `${import.meta.env.VITE_API_URL}/suscripcion-exitosa`,
    back_url: `https://ramazzini.app/suscripcion-exitosa`,
  };
  // console.log('subscriptionData', subscriptionData);

  try {
    const response = await pagosStore.createSubscription(subscriptionData);
    console.log('Suscripcion creada:', response);
        
    const proveedorSaludData = {
      fechaInicioTrial: proveedorSalud.value.fechaInicioTrial,
      periodoDePruebaFinalizado: proveedorSalud.value.periodoDePruebaFinalizado,
      maxUsuariosPermitidos: selectedPlan.value.users + extraUsers.value,
      maxEmpresasPermitidas: selectedPlan.value.companies + extraCompanies.value,
      addOns: [
        {
          tipo: 'usuario_adicional',
          cantidad: extraUsers.value
        },
        {
          tipo: 'empresas_extra',
          cantidad: extraCompanies.value
        }
      ],
    };
    // console.log('proveedorSaludData', proveedorSaludData);

    await proveedorSaludStore.updateProveedorById(proveedorSalud.value._id, proveedorSaludData); 
    
    // Redirect to payment URL
    if (response.init_point) {
      window.location.href = response.init_point;
    }

    // Open payment URL in a new window/tab
    // if (response.init_point) {
    //   window.open(response.init_point, '_blank');
    // }
  } catch (error) {
    console.error('Error updating subscription:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<!-- <template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 bg-gray-100 min-h-screen">
    <h1 class="text-gray-800 text-4xl mb-8">Suscripciones</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-for="plan in plans" :key="plan.id" class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105" :class="{ 'border-sky-500 bg-sky-50': selectedPlan?.id === plan.id }" @click="selectedPlan = plan; extraUsers = 0; extraCompanies = 0">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ plan.name }}</h2>
        <p class="text-3xl mb-4 font-light text-sky-600">${{ formatCurrency(plan.price) }}/mes</p>
        <ul class="text-gray-600 divide-y divide-gray-200 text-base">
          <li class="py-1">{{ plan.users }} usuarios</li>
          <li class="py-1">{{ plan.companies }} empresas</li>
        </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Adicionales</h2>
        <div class="flex flex-col gap-6 text-base">
          <div>
            <label class="block mb-2 text-gray-600">Usuarios ($120 por usuario extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraUsers > 0 ? extraUsers-- : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraUsers" @input="validateLimits" min="0" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraUsers < selectedPlan?.maxUsers ? extraUsers++ : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
          <div>
            <label class="block mb-2 text-gray-600">Empresas ($120 por cada 5 empresas extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraCompanies > 0 ? (extraCompanies -= 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraCompanies" @input="validateLimits" min="0" step="5" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraCompanies < selectedPlan?.maxCompanies ? (extraCompanies += 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
        </div>
      </div>

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
          :disabled="!selectedPlan || loading" 
          class="bg-gradient-to-r from-sky-500 to-sky-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ease-in-out">
          {{ loading ? 'Procesando...' : 'Solicitar Suscripción' }}
        </button>
      </div>
    </div>
  </div>
  
</template> -->

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 bg-gray-100 min-h-screen">
    <h1 class="text-gray-800 text-4xl mb-8">Suscripciones</h1>

    <!-- Lista de Planes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
        :class="{
          'border-sky-500 bg-sky-50': selectedPlan?.id === plan.id,
          'border-green-500 bg-green-50': suscripcionActual?.reason?.includes(plan.name) // Resalta el plan actual
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Adicionales</h2>
        <div class="flex flex-col gap-6 text-base">
          <div>
            <label class="block mb-2 text-gray-600">Usuarios ($120 por usuario extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraUsers > 0 ? extraUsers-- : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraUsers" @input="validateLimits" min="0" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraUsers < selectedPlan?.maxUsers ? extraUsers++ : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
          <div>
            <label class="block mb-2 text-gray-600">Empresas ($120 por cada 5 empresas extra)</label>
            <div class="flex items-center gap-2">
              <button @click="extraCompanies > 0 ? (extraCompanies -= 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">-</button>
              <input type="number" v-model="extraCompanies" @input="validateLimits" min="0" step="5" class="border rounded p-2 w-20 text-center focus:ring-2 focus:ring-sky-500">
              <button @click="extraCompanies < selectedPlan?.maxCompanies ? (extraCompanies += 5) : null" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded transition-all duration-200">+</button>
            </div>
          </div>
        </div>
      </div>

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
          :disabled="!selectedPlan || loading" 
          class="bg-gradient-to-r from-sky-500 to-sky-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-300 ease-in-out">
          {{ loading ? 'Procesando...' : 'Solicitar Suscripción' }}
        </button>
      </div>

      <!-- Sección de Suscripción Actual -->
      <div 
        v-if="suscripcionActual?.reason" 
        class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out border-l-4 border-sky-500"
      >
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Tu Suscripción Actual</h2>
        <p class="text-lg text-gray-700">
          <span class="font-medium">{{ suscripcionActual.reason }}</span>
        </p>
        <p class="text-lg text-gray-700">
          Mensualidad: <span class="font-medium">${{ formatCurrency(suscripcionActual.auto_recurring.transaction_amount) }}</span>
        </p>
        <p class="text-lg text-gray-700">
          Usuarios Permitidos: <span class="font-medium">{{ proveedorSalud?.maxUsuariosPermitidos }}</span>
        </p>
        <p class="text-lg text-gray-700">
          Empresas Permitidas: <span class="font-medium">{{ proveedorSalud?.maxEmpresasPermitidas }}</span>
        </p>
      </div>
    </div>



  </div>
</template>
