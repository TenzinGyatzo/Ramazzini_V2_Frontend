<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const emit = defineEmits(['closeModal']);

const closeModal = () => {
  emit('closeModal');
};
</script>

<template>
  <div class="modal fixed top-0 left-0 z-20 p-8 h-screen w-full grid place-items-center">
    <!-- Fondo oscuro suavizado -->
    <div class="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 backdrop-blur-sm" @click="closeModal"></div>

    <Transition appear name="fade">
      <!-- Modal con mejoras de estilo -->
      <div class="modal-inner relative bg-white text-gray-900 w-full sm:w-4/5 md:w-3/5 xl:w-2/5 2xl:w-1/3 p-8 rounded-xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
        <!-- Botón para cerrar el modal con menor tamaño -->
        <div class="modal-close absolute h-10 w-10 flex justify-center items-center top-3 right-3 text-2xl text-gray-500 hover:text-gray-700 transition-all duration-300 cursor-pointer" @click="closeModal">
          &times;
        </div>

        <!-- Encabezado mejorado -->
        <div class="mb-5">
          <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">
            <span class="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
              Tu prueba gratuita ha finalizado
            </span>
          </h1>
          <hr class="mt-3 mb-5 border-t border-gray-300">
        </div>

        <!-- Mensaje de motivación y valor -->
        <h3 class="text-2xl font-semibold text-gray-800">
          No te detengas aquí, sigue optimizando tu práctica
        </h3>

        <p class="text-lg text-gray-700 font-medium mt-4">
          A partir de <span class="font-bold text-emerald-600">$399/mes</span>, desbloquea el potencial completo de nuestro software y obtén acceso a todas las herramientas que necesitas.
        </p>

        <!-- Beneficios clave -->
        <ul class="list-disc list-inside space-y-2 text-gray-700 text-base mt-4">
          <li>Registra y gestiona a tus clientes y sus trabajadores.</li>
          <li>Genera informes y documentos personalizados de forma automática.</li>
          <li>Mejora la precisión y confianza en tu trabajo.</li>
        </ul>

        <!-- Botón de suscripción con mejoras visuales -->
        <div class="flex justify-center mt-6">
            <button 
            @click="router.push({ name: 'subscription' })" 
            class="w-full sm:w-3/4 py-3 px-6 text-2xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
            Suscríbete ahora
            </button>
        </div>

        <!-- Mensaje de tranquilidad -->
        <p class="text-sm text-gray-500 mt-2 text-center">
          Cancela en cualquier momento. Sin compromisos.
        </p>

        <!-- Botón de cierre más refinado -->
        <div class="flex justify-center mt-4">
          <button class="w-full sm:w-3/4 py-3 px-6 text-base font-light text-gray-800 bg-white rounded-lg ring-1 ring-gray-300 shadow-sm hover:bg-gray-100 hover:scale-105 transition-transform duration-300" @click="closeModal">
            Seguir explorando
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>


<style scoped>
.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}

.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: all 500ms ease-out;
}

.fade-slow-leave-active {
  transition-delay: 250ms;
}
</style>
