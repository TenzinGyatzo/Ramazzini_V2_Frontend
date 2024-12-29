<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthAPI from "@/api/AuthAPI";
import axios from "axios";

const router = useRouter();
const username = ref("edgar");
const password = ref("Ramazzini702850");
const errorMessage = ref("");

const handleLogin = async () => {
  try {
    const response = await AuthAPI.login(username.value, password.value);
    const token = response.data.token;
    if (response.status === 200 || response.status === 201) {
      // Manejar autenticación y redirección
      localStorage.setItem("AUTH_TOKEN", token);
      router.push("/");
    }
  } catch (error) {
    // Verificar que error es un objeto con la propiedad `response`
    if (axios.isAxiosError(error) && error.response) {
      console.log(error.response.data.message);
      errorMessage.value = "Credenciales incorrectas";
    } else {
      console.error("Error inesperado:", error);
      errorMessage.value = "Ocurrió un error inesperado";
    }
  }
};

</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <form
      @submit.prevent="handleLogin"
      class="bg-white p-8 rounded shadow-md w-1/3"
    >
      <h1 class="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700"
          >Usuario</label
        >
        <input
          v-model="username"
          id="username"
          type="text"
          class="w-full mt-1 p-2 border rounded"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Contraseña</label
        >
        <input
          v-model="password"
          id="password"
          type="password"
          class="w-full mt-1 p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
      >
        Entrar
      </button>
      <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
    </form>
  </div>
</template>
