<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useMedicoFirmanteStore } from "@/stores/medicoFirmante";
import { useEmpresasStore } from "@/stores/empresas";
import { useRoute } from "vue-router";

const user = useUserStore();
const proveedorSaludStore = useProveedorSaludStore();
const medicoFirmanteStore = useMedicoFirmanteStore();
const empresas = useEmpresasStore();
const route = useRoute();

const isVisible = ref(false);

onMounted(() => {
    // Escucha los cambios en el usuario para cargar proveedor de salud
    watch(
        () => user.user,
        (user) => {
            if (user?.idProveedorSalud) {
                proveedorSaludStore.loadProveedorSalud(user.idProveedorSalud);
            }
            if (user?._id){
              medicoFirmanteStore.loadMedicoFirmante(user._id);
            }
        },
        { immediate: true } // Ejecutar inmediatamente si ya hay datos cargados
    );

    setTimeout(() => {
        isVisible.value = true;
    }, 450);
});
</script>


<template>
  <main class="flex flex-col items-center p-4 md:p-10 md:w-full overflow-x-auto">
    <div v-if="empresas.currentEmpresa?.logotipoEmpresa?.data"
      class="fixed top-0 right-0 h-16 w-16 md:h-32 md:w-32 rounded z-0 flex items-center justify-center overflow-hidden">
      <img :src="'/uploads/logos/' + empresas.currentEmpresa?.logotipoEmpresa?.data"
        :alt="'Logo de ' + empresas.currentEmpresa?.nombreComercial" class="max-h-full max-w-full object-contain p-2">
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <a v-if="route.path === '/'" href="/" class="w-1/2 sm:w-1/3 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-14">
        <img src="/img/logosRamazzini/RamazziniBrand.png" alt="Ramazzini-Logo" class="w-full" />
      </a>
      <a v-else href="/" class="w-2/3 sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-3 mb-5">
        <img src="/img/logosRamazzini/RamazziniLogoNoBg.png" alt="Ramazzini-Logo" />
      </a>
    </Transition>

    <Transition appear mode="out-in" name="slide-up">
      <div v-if="route.path === '/' || route.path === '/login'" class="flex flex-col items-center">
        <h1
          class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl py-5 text-center  text-slate-700 font-medium">
          Ramazzini</h1>
        <p class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:w-2/3 py-2 text-center text-gray-600">La
          aplicación para la creación y gestión de informes de exámenes médicos laborales.</p>
        <p class="text-gray-600 text-lg my-4">Hola, {{ user.getUsername }}</p>
        <div class="grid gap-4 mb-5">
          <div class="flex justify-center">
            <a href="/empresas" class="w-full">
              <button
                class="w-full text-xl sm:text-2xl md:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-lg px-28 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200">
                COMENZAR
              </button>
            </a>
          </div>

          <div class="flex justify-center">
            <a href="/login">
              <button
                class=" text-sm sm:text-base md:text-lg border-2 border-gray-300 hover:bg-red-600 text-gray-800 uppercase rounded-lg px-4 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
                @click="user.logout">
                CERRAR SESIÓN
              </button>
            </a>
          </div>
        </div>

        <!-- Sección de Configuración -->
        <Transition name="delayed-appear">
        <div v-if="isVisible" class="xl:absolute top-3 right-3 grid gap-2 bg-gray-100 p-6 xl:p-3 rounded-lg shadow-md">
          <!-- Encabezado -->
          <div class="text-center">
            <p class="text-base sm:text-lg font-medium text-gray-700">Personaliza tus informes</p>
          </div>

          <!-- Botones -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2">
            <a href="/medico-firmante" class="flex justify-center">
              <button
                class="w-full text-sm md:text-base bg-cyan-500 hover:bg-cyan-600 text-white uppercase rounded-lg px-6 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
                MEDICO FIRMANTE
              </button>
            </a>
            <a href="/perfil-proveedor" class="flex justify-center">
              <button
                class="w-full text-sm md:text-base bg-orange-500 hover:bg-orange-600 text-white uppercase rounded-lg px-8 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
                PROVEEDOR
              </button>
            </a>
          </div>
        </div>
        </Transition>

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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-130px);
}

.slide-down-leave-to {
  transform: translateY(-130px);
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
.fade-leave-active .modal-inner {
  transition: all 250ms ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 250ms ease-out;
}

.fade-leave-active {
  transition-delay: 250ms;
}

.delayed-appear-enter-active,
.delayed-appear-leave-active {
  transition: opacity 0.5s ease;
}

.delayed-appear-enter-from,
.delayed-appear-leave-to {
  opacity: 0;
}

/* Personalización para navegadores basados en WebKit (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 12px;
  /* Ancho de la barra de scroll */
  height: 12px;
  /* Altura de la barra de scroll para scroll horizontal */
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* Color del track (fondo del scroll) */
  border-radius: 10px;
  /* Bordes redondeados del track */
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  /* Color de la "thumb" (barra) */
  border-radius: 10px;
  /* Bordes redondeados de la thumb */
  border: 3px solid #f1f1f1;
  /* Añadir un borde alrededor */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555;
  /* Cambiar el color cuando se hace hover */
}
</style>