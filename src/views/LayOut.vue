<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useMedicoFirmanteStore } from "@/stores/medicoFirmante";
import { useEmpresasStore } from "@/stores/empresas";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

const user = useUserStore();
const proveedorSaludStore = useProveedorSaludStore();
const medicoFirmanteStore = useMedicoFirmanteStore();
const empresas = useEmpresasStore();
const route = useRoute();
const router = useRouter();

const isVisible = ref(false);
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null); // Referencia para el menú desplegable

// Función para cerrar el menú si se hace clic fuera
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted( () => {
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
    }, 400);

    // Agregar detector de eventos de clic en el documento
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  // Eliminar detector de eventos de clic al desmontar el componente
  document.removeEventListener("click", handleClickOutside);
});

const toggleMenu = () => {
  event?.stopPropagation();
    isMenuOpen.value = !isMenuOpen.value;
};

// Cerrar menu cuando se cambia de ruta
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath === "/" && newPath !== "/") {
      isMenuOpen.value = false;
    }
  }
);

</script>

<template>
  <main class="flex flex-col items-center p-4 md:p-10 md:w-full overflow-x-auto">
    <!-- Logo de la empresa -->
    <div v-if="empresas.currentEmpresa?.logotipoEmpresa?.data && 
      ['empresas', 'centros-trabajo', 'trabajadores', 'expediente-medico', 'crear-documento'].includes(route.name as string)"
      class="fixed top-4 right-4 h-16 w-16 md:h-32 md:w-32 rounded z-0 flex items-center justify-center overflow-hidden">
      <img :src="'/uploads/logos/' + empresas.currentEmpresa?.logotipoEmpresa?.data"
      :alt="'Logo de ' + empresas.currentEmpresa?.nombreComercial" class="max-h-full max-w-full object-contain p-2">
    </div>

    <!-- Transición para el logo de Ramazzini -->
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="route.path === '/'" class="w-1/2 sm:w-1/3 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-14 cursor-pointer" @click="router.push({ name: 'inicio' })">
        <img src="/img/logosRamazzini/RamazziniBrand.png" alt="Ramazzini-Logo" class="w-full" />
      </div>
      <div v-else class="w-2/3 sm:w-1/2 md:1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 mt-3 mb-5 cursor-pointer" @click="router.push({ name: 'inicio' })">
        <img src="/img/logosRamazzini/RamazziniLogoNoBg.png" alt="Ramazzini-Logo" />
      </div>
    </Transition>

    <!-- Contenido principal -->
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="route.path === '/' || route.path === '/login'" class="flex flex-col items-center">
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl py-5 text-center text-slate-700 font-medium">
          Ramazzini
        </h1>
        <p class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:w-2/3 py-2 text-center text-gray-600">
          La aplicación para la creación y gestión de informes de exámenes médicos laborales.
        </p>
        <p class="text-gray-600 text-lg my-4">Hola, {{ user.getUsername }}</p>
        
        <!-- Botones de acción -->
        <div class="grid gap-4 mb-5">
          <div class="flex justify-center">
            <button
              @click="router.push({ name: 'empresas' })"
              class="w-full text-xl sm:text-2xl md:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-lg px-28 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200">
              VER MIS CLIENTES
            </button>
          </div>

          <div class="flex justify-center">
            <a href="/login">
              <Transition name="button-transition">
                <button
                  class="text-sm sm:text-base md:text-lg border-2 border-gray-300 hover:bg-red-600 text-gray-800 uppercase rounded-lg px-4 py-1 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg hover:text-gray-200"
                  @click="user.logout">
                  CERRAR SESIÓN
                </button>
              </Transition>
            </a>
          </div>
        </div>
      </div>

      <div v-else class="w-full max-w-screen-2xl">
        <RouterView />
      </div>
    </Transition>

    <!-- Botón del engrane (fuera de la transición principal) -->
    <Transition name="delayed-appear">
      <button 
        v-if="isVisible && ['inicio', 'add-user', 'remove-users', 'perfil-proveedor', 'medico-firmante', 'subscription', 'suscripcion-activa', 'subscription-success'].includes(route.name as string)"
        @click="toggleMenu"
        class="fixed top-4 right-4 p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out shadow-md hover:shadow-xl border border-gray-300 z-50 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
        <svg 
          class="w-6 h-6 text-gray-700 transition-transform duration-300 ease-in-out"
          :class="{ 'rotate-90': isMenuOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </Transition>

    <!-- Menú desplegable (también fuera de la transición principal) -->
    <Transition name="fade">
      <div 
        v-if="isMenuOpen && ['inicio', 'add-user', 'remove-users', 'perfil-proveedor', 'medico-firmante', 'subscription', 'suscripcion-activa', 'subscription-success'].includes(route.name as string)"
        ref="menuRef"
        class="fixed top-16 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-40">
        <div class="space-y-2">
          <!-- Configuración -->
          <div v-if="user.user?.role !== 'Administrador'">
            <p class="text-sm font-medium text-gray-700 mb-2">Configuración</p>
            <a v-if="user.user?.role === 'Principal'" @click="router.push({ name: 'perfil-proveedor' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              Mi Negocio 
            </a>
            <a @click="router.push({ name: 'medico-firmante' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mt-1 transition-all duration-300 ease-in-out cursor-pointer">
              Médico Firmante
            </a>
          </div>

          <!-- Gestión de Usuarios -->
          <div v-if="user.user?.role === 'Principal'">
            <p class="text-sm font-medium text-gray-700 mb-2">Gestión de Usuarios</p>
            <a @click="router.push({ name: 'add-user' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              Agregar Usuario
            </a>
            <a @click="router.push({ name: 'remove-users' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mt-1 transition-all duration-300 ease-in-out cursor-pointer">
              Eliminar Usuarios
            </a>
          </div>

          <!-- Suscripción -->
          <div v-if="user.user?.role === 'Principal'">
            <p class="text-sm font-medium text-gray-700 mb-2">Suscripción</p>
            <a @click="router.push({ name: 'suscripcion-activa' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              Mi Suscripción
            </a>
            <a @click="router.push({ name: 'subscription' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mt-1 transition-all duration-300 ease-in-out cursor-pointer">
              Ver Planes
            </a>
          </div>

          <!-- Administrador -->
          <div v-if="user.user?.role === 'Administrador'">
            <p class="text-sm font-medium text-gray-700 mb-2">Administrador</p>
            <a @click="router.push({ name: 'panel-administrador' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              Panel de Administrador
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style>
/* Transición slide-up mejorada */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* Curva de aceleración suave */
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px); /* Desplazamiento más corto */
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* Desplazamiento más corto */
}

/* Transición fade mejorada */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  /* transform: translateY(-10px); */ /* Desplazamiento ligero hacia arriba */
}

/* Transición delayed-appear mejorada */
.delayed-appear-enter-active {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.delayed-appear-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.delayed-appear-enter-from,
.delayed-appear-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(-180deg);
}

/* Transición para botones interactivos */
.button-transition-enter-active,
.button-transition-leave-active {
  transition: all 0.3s ease;
}

.button-transition-enter-from,
.button-transition-leave-to {
  opacity: 0;
  transform: scale(0.9); /* Efecto de escala al aparecer/desaparecer */
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

.fade-enter-from .modal-inner,
.fade-leave-to .modal-inner {
  opacity: 0;
  transform: translateY(-32px);
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