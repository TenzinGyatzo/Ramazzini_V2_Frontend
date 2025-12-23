<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import AuthAPI from "@/api/AuthAPI";
import axios from "axios";

const emit = defineEmits<{
  (e: 'unlock'): void;
}>();

const userStore = useUserStore();
const password = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const isSubmitting = ref(false);

// Controlar el overflow del body cuando el componente está visible
onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const handleUnlock = async () => {
  if (!userStore.user?.email) {
    errorMessage.value = "Error: No se pudo identificar al usuario.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const response = await AuthAPI.login(userStore.user.email, password.value);
    if (response.status === 200 || response.status === 201) {
      // Si la contraseña es correcta, desbloqueamos
      password.value = "";
      emit('unlock');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.data.message === 'Contraseña incorrecta') {
        errorMessage.value = "Contraseña incorrecta. Inténtalo de nuevo.";
      } else {
        errorMessage.value = "Error al validar la contraseña.";
      }
    } else {
      errorMessage.value = "Ocurrió un error inesperado.";
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 max-w-md border border-gray-200">
      <div class="flex flex-col items-center mb-6">
        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <i class="fas fa-lock text-emerald-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">Sesión Bloqueada</h2>
        <p class="text-gray-500 text-center mt-2">
          Hola, <span class="font-semibold text-gray-700">{{ userStore.getUsername }}</span>. Por seguridad, ingresa tu contraseña para continuar.
        </p>
      </div>

      <form @submit.prevent="handleUnlock" class="space-y-4">
        <div>
          <label for="password-lock" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div class="relative">
            <input
              v-model="password"
              id="password-lock"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Tu contraseña"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p class="text-red-600 text-sm text-center font-medium">{{ errorMessage }}</p>
        </div>

        <button
          type="submit"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center space-x-2"
          :disabled="isSubmitting"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
          <span>{{ isSubmitting ? 'Verificando...' : 'Desbloquear' }}</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button 
          @click="userStore.logout()" 
          class="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center mx-auto space-x-1"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar sesión e ir al login</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* El overflow del body se controla desde el script */
</style>

