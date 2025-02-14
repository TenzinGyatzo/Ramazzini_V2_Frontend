<script setup>
import { calcularAntiguedad } from '@/helpers/dates'
import { ref, computed } from 'vue'

const plans = [
  { id: 1, name: 'Básico', price: 399, users: 1, companies: 10 },
  { id: 2, name: 'Profesional', price: 1749, users: 5, companies: 50 },
  { id: 3, name: 'Empresarial', price: 4499, users: 15, companies: 150 }
]

const selectedPlan = ref(null)
const extraUsers = ref(0)
const extraCompanies = ref(0)

const totalPrice = computed(() => {
  if (!selectedPlan.value) return 0
  const extraUsersCost = extraUsers.value * 120 
  const extraCompaniesCost = extraCompanies.value * 24 
  return selectedPlan.value.price + extraUsersCost + extraCompaniesCost
})

const requestSubscription = () => {calcularAntiguedad
  // Aquí iría la lógica para procesar la suscripción
  console.log('Solicitud de suscripción:', {
    plan: selectedPlan.value,
    extraUsers: extraUsers.value,
    extraCompanies: extraCompanies.value,
    total: totalPrice.value
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-gray-800 text-4xl mb-8">Suscripciones</h1>

    <!-- Planes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-for="plan in plans" :key="plan.id"
        class="border p-6 rounded-lg cursor-pointer"
        :class="{ 'border-blue-500 bg-blue-50': selectedPlan?.id === plan.id }"
        @click="selectedPlan = plan">
        <h2 class="text-2xl font-bold mb-4">{{ plan.name }}</h2>
        <p class="text-3xl mb-4">${{ plan.price }}/mes</p>
        <ul class="text-gray-600">
          <li>{{ plan.users }} usuarios</li>
          <li>{{ plan.companies }} empresas</li>
        </ul>
      </div>
    </div>

    <!-- Add-ons -->
    <div class="bg-gray-50 p-6 rounded-lg mb-8">
      <h2 class="text-2xl mb-4">Adicionales</h2>
      <div class="flex gap-6">
        <div>
          <label class="block mb-2">Usuarios extra ($120/usuario)</label>
          <input type="number" v-model="extraUsers" min="0" class="border rounded p-2">
        </div>
        <div>
            <label class="block mb-2">Empresas extra ($120 por cada 5 empresas)</label>
          <input type="number" v-model="extraCompanies" min="0" step="5" class="border rounded p-2">
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <h2 class="text-2xl mb-4">Resumen</h2>
      <div v-if="selectedPlan" class="mb-4">
        <p>Plan seleccionado: {{ selectedPlan.name }}</p>
        <p>Usuarios extra: {{ extraUsers }}</p>
        <p>Empresas extra: {{ extraCompanies }}</p>
        <p class="text-xl font-bold mt-4">Total: ${{ totalPrice.toFixed(2) }}/mes</p>
      </div>
      <button 
        @click="requestSubscription"
        :disabled="!selectedPlan"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
        Solicitar Suscripción
      </button>
    </div>
  </div>
</template>