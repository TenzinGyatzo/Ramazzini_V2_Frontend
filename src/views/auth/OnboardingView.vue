<script setup>
import { ref, reactive, inject } from 'vue';
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router"

const toast = inject('toast');

const currentStep = ref(1);
const showStep2 = ref(false);
const transitioning = ref(false);
const formDataUser = reactive({
  username: '',
  email: '',
  phone: '',
  password: ''
});
const formDataProveedorSalud = reactive({
  nombre: '',
  RFC: '',
  perfilProveedorSalud: ''
});

// Acceso a los stores
const proveedorSaludStore = useProveedorSaludStore();
const userStore = useUserStore();
const router = useRouter();

const handleSubmitStep1 = async (data) => {
  formDataUser.value = data;  // Guardar datos del usuario temporalmente
  transitioning.value = true;
  currentStep.value = 2;  // Avanzar al paso 2
};

const handleSubmitStep2 = async (data) => {
  formDataProveedorSalud.value = data; // Guardar datos del Proveedor de Salud
  let idProveedorSalud = null; // Variable para almacenar el ID del proveedor de salud

  try {
    // 1. Crear Proveedor Salud y obtener idProveedorSalud
    const { data: proveedorSalud } = await proveedorSaludStore.createProveedor(formDataProveedorSalud.value);
    idProveedorSalud = proveedorSalud._id;

    if (!idProveedorSalud) {
      throw new Error("No se pudo obtener el ID del proveedor de salud.");
    }

    // 2. Agregar idProveedorSalud a los datos del usuario
    const userPayload = {
      ...formDataUser.value,
      role: "Principal",
      idProveedorSalud,
    };

    // 3. Crear el usuario con la referencia al proveedor de salud
    const resultado = await userStore.registerUser(userPayload);

    // Verificar si el registro fue exitoso
    if (!resultado.success) {
      throw resultado.error; // Lanzar el error para manejarlo en el catch
    }

    // Mostrar mensaje de éxito en el toast (solo si todo fue exitoso)
    toast.open({
      message: 'Registro completado con éxito',
      position: 'bottom-left'
    });

    currentStep.value = 3;

  } catch (error) {
    // console.error('Error al registrar:', error);
    // Mostrar mensaje de error en el toast
    toast.open({
      type: 'error',
      message: `Error: ${error.response.data.message}`,
      position: 'bottom-left'
    });

    // Si hay un error y el proveedor de salud ya fue creado, eliminarlo
    if (idProveedorSalud) {
      try {
        await proveedorSaludStore.removeProveedorById(idProveedorSalud);
        // console.log("Proveedor de salud eliminado debido a un error en el registro del usuario.");
      } catch (deleteError) {
        console.error("Error al eliminar el proveedor de salud:", deleteError);
      }
    }
  }
};

const goBackToStep1 = () => {
  transitioning.value = true;
  currentStep.value = 1;
  showStep2.value = false;
};

const resetTransitionState = () => {
  transitioning.value = false;
};

const perfiles = [
  "Médico único de empresa",
  "Médico independiente que brinda servicios a empresas",
  "Empresa de salud ocupacional",
  "Equipo Médico Interno de la Empresa",
  "Otro",
];
</script>

<template>
  <img src="../../../img/logosRamazzini/RamazziniLogo.PNG" alt="Ramazzini Logo"
    class="max-w-[250px] max-h-[250px] object-contain p-2 mx-auto">

  <div v-if="currentStep === 3" class="flex flex-col items-center justify-center p-6 w-full mx-auto">
    <!-- Mensaje de éxito -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-emerald-600 mb-4">¡Registro exitoso!</h2>
      <p class="text-gray-600 mb-3">
        Te has registrado correctamente en nuestra plataforma. <strong>Para activar tu cuenta,
        por favor revisa tu correo electrónico</strong> y haz clic en el enlace de verificación
        que te hemos enviado.
      </p>
      <p class="text-sm text-gray-600">
        Si no encuentras el correo, revisa tu carpeta de spam o solicita un nuevo
        enlace de verificación.
      </p>
    </div>

    <!-- Botón de redirección al login -->
    <div class="mt-6">
      <button @click="router.push({ name: 'login' })"
        class="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition duration-300">
        Ir al inicio de sesión
      </button>
    </div>
  </div>

  <div v-else>
    <!-- Indicador de pasos -->
    <div class="flex justify-center items-center gap-3 my-3">
      <div class="flex flex-col items-center ">
        <div
          :class="['w-8 h-8 flex items-center justify-center rounded-full', currentStep === 1 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-black']">
          1
        </div>
      </div>

      <div class="w-32 h-0.5 bg-gray-300" :class="currentStep === 1 ? 'bg-gray-300' : 'bg-emerald-300'"></div>

      <div class="flex flex-col items-center ">
        <div
          :class="['w-8 h-8 flex items-center justify-center rounded-full', currentStep === 2 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-black']">
          2
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center gap-0 mb-6">
      <div class="flex flex-col items-center ">
        <span :class="[currentStep === 1 ? 'text-emerald-500' : 'text-gray-400']" class="text-sm mt-1">&nbsp;&nbsp;Crear
          una cuenta</span>
      </div>

      <div class="w-16 h-0.1 bg-gray-300"></div>

      <div class="flex flex-col items-center ">
        <span :class="[currentStep === 2 ? 'text-emerald-500' : 'text-gray-400']" class="text-sm mt-1">&nbsp;Registra tu
          empresa</span>
      </div>
    </div>

    <!-- validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }" -->

    <!-- Formulario Paso 1 -->
    <!--   <Transition name="fade-slide" mode="out-in">
    <FormKit v-if="currentStep === 1" type="form" :actions="false"
      incomplete-message="Por favor, valide que los datos sean correctos*" @submit="handleSubmitStep1">
      <FormKit type="text" label="¿Cuál es tu nombre?" name="username" placeholder="Ej. Jorge González"
        validation="required" :validation-messages="{
          required: 'Este campo es obligatorio'
        }" />

      <FormKit type="email" label="¿Qué correo deseas registrar?" name="email" placeholder="usuario@tuempresa.com"
        validation="required|emailValidation" :validation-messages="{
          required: 'Este campo es obligatorio',
          emailValidation: 'Por favor ingresa un correo válido'
        }" />

      <FormKit type="text" label="¿Cuál es tu teléfono?" name="phone" placeholder="Teléfono"
        validation="required|phoneValidation" :validation-messages="{
          required: 'Este campo es obligatorio',
          phoneValidation: 'El número de teléfono debe tener 10 dígitos.'
        }" />

      <FormKit type="password" label="¿Qué contraseña deseas usar?" name="password" placeholder="Contraseña de usuario"
        validation="required|passwordValidation" :validation-messages="{
          required: 'Este campo es obligatorio',
          passwordValidation: 'Mín. 8 dígitos, 1 mayúscula y 1 número.'
        }" />

      <div class="w-full pr-2 mt-4">
        <FormKit type="submit">
          <span class="mr-2">Siguiente</span>
          <i class="fa-solid fa-arrow-right-long"></i>
        </FormKit>
      </div>
    </FormKit>
  </Transition> -->
    <Transition name="fade-slide-left" mode="out-in" @after-leave="showStep2 = true">
      <FormKit v-if="currentStep === 1 && !transitioning" type="form" :actions="false"
        incomplete-message="Por favor, valide que los datos sean correctos*" @submit="handleSubmitStep1">
        <FormKit type="text" label="¿Cuál es tu nombre?" name="username" placeholder="Ej. Jorge González"
          v-model="formDataUser.username" />

        <FormKit type="email" label="¿Qué correo deseas registrar?" name="email" placeholder="usuario@tuempresa.com"
          v-model="formDataUser.email" />

        <FormKit type="text" label="¿Cuál es tu teléfono?" name="phone" placeholder="Teléfono"
          v-model="formDataUser.phone" />

        <FormKit type="password" label="¿Qué contraseña deseas usar?" name="password" placeholder="Contraseña"
          v-model="formDataUser.password" />

        <div class="w-full mt-6">
          <FormKit type="submit">
            <span class="mr-2">Siguiente</span>
            <i class="fa-solid fa-arrow-right-long"></i>
          </FormKit>
        </div>
      </FormKit>
    </Transition>

    <!-- Formulario Paso 2 -->
    <Transition name="fade-slide-right" mode="out-in" @after-leave="resetTransitionState">
      <FormKit v-if="currentStep === 2 && showStep2" type="form" :actions="false"
        incomplete-message="Por favor, valide los datos*" @submit="handleSubmitStep2">
        <FormKit type="text" label="¿Cuál es tu nombre o razón social?" name="nombre" placeholder="Ej. Ramazzini S.A."
          validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }"
          v-model="formDataProveedorSalud.nombre" />
        <FormKit type="text" label="¿Cuál es tu RFC?" name="RFC" placeholder="RFC de tu empresa o el propio"
          validation="required|rfcValidation" :validation-messages="{
            required: 'Este campo es obligatorio',
            rfcValidation: 'El RFC ingresado no es válido.',
          }" v-model="formDataProveedorSalud.RFC" />
        <FormKit type="select" label="¿Cuál describe mejor al proveedor de salud ocupacional que registras?"
          name="perfilProveedorSalud" placeholder="Selecciona:" :options="perfiles" validation="required"
          :validation-messages="{ required: 'Este campo es obligatorio' }"
          v-model="formDataProveedorSalud.perfilProveedorSalud" />

        <div class="w-full mt-6">
          <FormKit type="submit">
            <span class="mr-2">Finalizar</span>
            <i class="fa-solid fa-check"></i>
          </FormKit>
        </div>
      </FormKit>
    </Transition>
    <nav v-if="currentStep === 1" class="text-sm block mx-auto text-center font-light mt-5 text-sky-500">
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'login' }"><strong class="hover:underline">Inicia sesión</strong></RouterLink>
    </nav>
    <p v-else @click="goBackToStep1"
      class="text-sm block mx-auto text-center font-light mt-5 text-sky-500 cursor-pointer hover:underline">Regresar</p>
  </div>
</template>

<style scoped>
.fade-slide-left-enter-active,
.fade-slide-left-leave-active,
.fade-slide-right-enter-active,
.fade-slide-right-leave-active {
  transition: all 0.3s ease, filter 0.3s ease;
}

.fade-slide-left-enter-from,
.fade-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20%);
  filter: blur(10px);
}

.fade-slide-left-enter-to,
.fade-slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.fade-slide-right-enter-from,
.fade-slide-right-leave-to {
  opacity: 0;
  transform: translateX(20%);
  filter: blur(10px);
}

.fade-slide-right-enter-to,
.fade-slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}
</style>
