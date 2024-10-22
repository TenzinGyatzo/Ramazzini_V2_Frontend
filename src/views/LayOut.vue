<script lang="ts" setup>
import { RouterView, useRoute } from 'vue-router'

const route = useRoute();
</script>

<template>
  <main class="flex flex-col items-center p-10 w-full overflow-x-auto">
    <Transition appear mode="out-in" name="slide-up">
      <a 
        v-if="route.path === '/'" 
        href="/" 
        class="w-full sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-14"
      >
        <img 
          src="/img/logosRamazzini/RamazziniBrand.png" 
          alt="Ramazzini-Logo" 
          class="w-full"
        />
      </a>
      <a 
        v-else 
        href="/" 
        class="w-full sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-3 mb-5"
      >
        <img 
          src="/img/logosRamazzini/RamazziniLogoNoBg.png" 
          alt="Ramazzini-Logo" 
        />
      </a>
    </Transition>

    <Transition appear mode="out-in" name="slide-up">
      <div 
        v-if="route.path === '/'"
        class="flex flex-col items-center"
      >
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl py-5 text-center  text-slate-700 font-medium">Ramazzini</h1>
        <p class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:w-2/3 py-2 text-center text-gray-600">La aplicación para la creación y gestión de informes de exámenes médicos laborales.</p>
        <div class="flex flex-col items-center sm:flex-row gap-2 md:gap-3 lg:gap-4 p-4 md:p-10" >
          <a href="/empresas" class="flex justify-center">
            <button
              class="sm:text-xl md:text-2xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-lg px-8 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
            >
              COMENZAR
            </button>
          </a>
          <a href="/empresas" class="flex justify-center">
            <button
              class="sm:text-xl md:text-2xl border-2 border-gray-300 hover:bg-red-600 text-gray-800 uppercase rounded-lg px-4 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
            >
              CERRAR SESIÓN
            </button>
          </a>
        </div>
      </div>
      
      <div v-else class="w-full max-w-screen-2xl">
        <RouterView />
      </div>
    </Transition>
  </main>
</template>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .modal-inner,
.fade-leave-to .modal-inner {
  opacity: 0;
  transform: translateY(-32px);
}

.fade-enter-active .modal-inner,
.fade-leave-active .modal-inner{
  transition: all 250ms ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 250ms ease-out;
}

.fade-leave-active {
  transition-delay: 250ms;
}

/* Personalización para navegadores basados en WebKit (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 12px; /* Ancho de la barra de scroll */
  height: 12px; /* Altura de la barra de scroll para scroll horizontal */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Color del track (fondo del scroll) */
  border-radius: 10px; /* Bordes redondeados del track */
}

::-webkit-scrollbar-thumb {
  background-color: #888; /* Color de la "thumb" (barra) */
  border-radius: 10px; /* Bordes redondeados de la thumb */
  border: 3px solid #f1f1f1; /* Añadir un borde alrededor */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* Cambiar el color cuando se hace hover */
}

</style>