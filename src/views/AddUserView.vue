<script setup>
import { ref, reactive, inject } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const toast = inject("toast");
const registroExitoso = ref(false);

const user = ref(
  JSON.parse(localStorage.getItem("user")) || null // Recuperar usuario guardado o establecer null si no existe
);

const formDataUser = reactive({
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "Secundario",
  idProveedorSalud: user.value.idProveedorSalud,
});

const handleSubmit = async () => {
  try {
    const resultado = await userStore.registerUser(formDataUser);

    // Verificar si el registro fue exitoso
    if (!resultado.success) {
      throw resultado.error; // Lanzar el error para manejarlo en el catch
    }

    registroExitoso.value = true;

    // Mostrar mensaje de éxito
    toast.open({
      type: "success",
      message: "Registro completado con éxito",
      position: "top-right",
    });
  } catch (error) {
    toast.open({
      type: "error",
      message: `Error: ${error.response.data.message}`,
      position: "bottom-right",
    });
  }
};

const volver = () => {
  router.push({ name: "inicio" });
};
</script>

<template>
  <!-- Formulario Paso 1 -->
  <div
    v-if="registroExitoso == false"
    class="relative bg-white text-gray-800 w-full max-w-lg p-10 rounded-lg max-h-[82vh] shadow-lg overflow-y-auto mx-auto"
  >
    <h1 class="text-3xl text-gray-800">Agregar usuario adicional</h1>
    <hr class="mt-2 mb-3" />

    <FormKit
      type="form"
      :actions="false"
      incomplete-message="Por favor, valide que los datos sean correctos*"
      @submit="handleSubmit"
    >
      <FormKit
        type="text"
        label="Nombre"
        name="username"
        placeholder="Ej. Jorge González"
        validation="required"
        :validation-messages="{
          required: 'Este campo es obligatorio',
        }"
        v-model="formDataUser.username"
      />

      <FormKit
        type="email"
        label="Correo de usuario"
        name="email"
        placeholder="usuario@empresa.com"
        validation="required|emailValidation"
        :validation-messages="{
          required: 'Este campo es obligatorio',
          emailValidation: 'Por favor ingresa un correo válido',
        }"
        v-model="formDataUser.email"
      />

      <FormKit
        type="text"
        label="Teléfono de usuario"
        name="phone"
        placeholder="Teléfono"
        validation="required|phoneValidation"
        :validation-messages="{
          required: 'Este campo es obligatorio',
          phoneValidation: 'El número de teléfono debe tener 10 dígitos.',
        }"
        v-model="formDataUser.phone"
      />

      <FormKit
        type="password"
        label="Establece una contraseña"
        name="password"
        placeholder="Contraseña de usuario"
        validation="required|passwordValidation"
        :validation-messages="{
          required: 'Este campo es obligatorio',
          passwordValidation: 'Mín. 8 dígitos, 1 mayúscula y 1 número.',
        }"
        v-model="formDataUser.password"
      />

      <hr class="my-3" />
      <div class="flex flex-col sm:flex-row justify-between items-center gap-2">
        <!-- Botón de Volver -->
        <button
          type="button"
          class="text-lg w-full sm:w-1/2 rounded-lg bg-white font-medium text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg mb-1"
          @click="volver"
        >
          Volver
        </button>
        <!-- Botón de Actualizar -->
        <div class="w-full sm:w-1/2 pr-2">
          <FormKit type="submit">Registrar </FormKit>
        </div>
      </div>
    </FormKit>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto"
  >
    <!-- Mensaje de éxito -->
    <div class="text-center mb-2">
      <h2 class="text-2xl font-bold text-emerald-600 mb-4">
        Registro de usuario exitoso
      </h2>
      <p class="text-gray-600 mb-3">
        Has registrado el usuario correctamente.
        <strong
          >Es necesario activar la cuenta para poder iniciar sesión.</strong
        >
        Se ha enviado un correo de confirmación al usuario.
      </p>
    </div>

    <!-- Botón de redirección al inicio -->
    <div class="mt-2">
      <button
        @click="router.push({ name: 'inicio' })"
        class="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition duration-300"
      >
        Regresar al inicio
      </button>
    </div>
  </div>
</template>
