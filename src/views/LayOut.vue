<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useMedicoFirmanteStore } from "@/stores/medicoFirmante";
import { useEmpresasStore } from "@/stores/empresas";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import TooltipInfo from "@/components/TooltipInfo.vue";

const user = useUserStore();
const proveedorSaludStore = useProveedorSaludStore();
const medicoFirmanteStore = useMedicoFirmanteStore();
const empresas = useEmpresasStore();
const route = useRoute();
const router = useRouter();
const datosCargados = ref(false);
const empresasCargadas = ref(false); 

const isVisible = ref(false);
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null); // Referencia para el menú desplegable
const isGuideMenuOpen = ref(false);
const guideMenuRef = ref<HTMLElement | null>(null);

const guiaConfiguracionInicialURL = "https://scribehow.com/shared/Configuracion_de_Informes__qSuHpPxtSnKc8JTaObgY7Q?referrer=workspace"
const guiaRegistrarClientesURL = "https://scribehow.com/shared/Agregar_Clientes_y_Centros_de_Trabajo__32Haet8BQy6oFUDacWcbWg?referrer=documents"

// Función para cerrar el menú si se hace clic fuera
const handleClickOutside = (event: MouseEvent) => {
  // Cerrar menú principal si se hace clic fuera
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }

  // Cerrar menú de guías si se hace clic fuera
  if (guideMenuRef.value && !guideMenuRef.value.contains(event.target as Node)) {
    isGuideMenuOpen.value = false;
  }
};

onMounted( () => {
    // Escucha los cambios en el usuario para cargar proveedor de salud
    // Verificar y cargar Proveedor de Salud y Médico Firmante
    watch(
      () => user.user,
      async (user) => {
        datosCargados.value = false; // Comienza como false hasta que se cargue todo

        if (user?.idProveedorSalud) {
          await proveedorSaludStore.loadProveedorSalud(user.idProveedorSalud);
        }

        if (user?._id) {
          await medicoFirmanteStore.loadMedicoFirmante(user._id);
        }

        datosCargados.value = true; // Solo se marca como cargado cuando ambas promesas terminan
      },
      { immediate: true }
    );

    setTimeout(() => {
        isVisible.value = true;
    }, 400);

    // Agregar detector de eventos de clic en el documento
    document.addEventListener("click", handleClickOutside);

});

watch(
  () => empresas.empresas.length,
  () => {
    empresasCargadas.value = true;
  }
);

// Cargar empresas al montar el componente
onMounted(() => {
  if (user.user?.idProveedorSalud) {
    empresas.fetchEmpresas(user.user.idProveedorSalud).then(() => {
      empresasCargadas.value = true;
    });
  }
});

onUnmounted(() => {
  // Eliminar detector de eventos de clic al desmontar el componente
  document.removeEventListener("click", handleClickOutside);
});

const toggleMenu = () => {
  event?.stopPropagation();
    isMenuOpen.value = !isMenuOpen.value;
};

const toggleGuideMenu = (event: MouseEvent) => {
  event.stopPropagation();
  isGuideMenuOpen.value = !isGuideMenuOpen.value;
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

// Verificar si falta el logotipo de la empresa
const logotipoPendiente = computed(() => {
  const proveedor = proveedorSaludStore.proveedorSalud;
  return !proveedor?.logotipoEmpresa?.data;
});

// Computed para verificar los campos pendientes en Proveedor de Salud
const camposPendientesProveedor = computed(() => {
  const proveedor = proveedorSaludStore.proveedorSalud;
  const pendientes: string[] = [];

  if (!proveedor?.nombre) pendientes.push("Razón Social");
  if (!proveedor?.estado) pendientes.push("Estado");
  if (!proveedor?.municipio) pendientes.push("Municipio");
  if (!proveedor?.direccion) pendientes.push("Dirección");
  if (!proveedor?.telefono) pendientes.push("Teléfono");

  return pendientes;
});

// Computed para verificar los campos pendientes en Médico Firmante
const camposPendientesMedico = computed(() => {
  const medico = medicoFirmanteStore.medicoFirmante;
  const pendientes: string[] = [];

  if (!medico?.nombre) pendientes.push("Nombre");
  if (!medico?.tituloProfesional) pendientes.push("Título Profesional");
  if (!medico?.numeroCedulaProfesional) pendientes.push("Número de Cédula Profesional");

  return pendientes;
});

// Computed para determinar si mostrar el ícono del tooltip
const mostrarTooltipProveedor = computed(() => camposPendientesProveedor.value.length > 0);
const mostrarTooltipMedico = computed(() => camposPendientesMedico.value.length > 0);

// Controlar la aparición de las notificaciones con delay
const mostrarNotificacionLogotipo = ref(false);
const mostrarNotificacionCampos = ref(false);

// Verificar y actualizar las notificaciones
watch(
  () => logotipoPendiente.value,
  (newVal) => {
    mostrarNotificacionLogotipo.value = newVal;
  }
);

watch(
  () => camposPendientesProveedor.value.length > 0 || camposPendientesMedico.value.length > 0,
  (newVal) => {
    mostrarNotificacionCampos.value = newVal;
  }
);

onMounted(() => {
  setTimeout(() => {
    if (logotipoPendiente.value) {
      mostrarNotificacionLogotipo.value = true;
    }
    if (camposPendientesProveedor.value.length > 0 || camposPendientesMedico.value.length > 0) {
      mostrarNotificacionCampos.value = true;
    }
  }, 1200); // Ajusta el delay en milisegundos (800ms en este caso)
});

// Control de animación
const animacionNotificacion = ref("notificacion-animada");

let intervaloAnimacion: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Alternar entre las animaciones cada 3 segundos
  intervaloAnimacion = setInterval(() => {
    animacionNotificacion.value = 
      animacionNotificacion.value === "notificacion-pulso" 
      ? "notificacion-vibracion" 
      : "notificacion-pulso";
  }, 3000);
});

onBeforeUnmount(() => {
  // Limpiar el intervalo para evitar fugas de memoria
  if (intervaloAnimacion !== null) {
    clearInterval(intervaloAnimacion);
  }
});

// Verificar si se debe mostrar el mensaje de configuración pendiente
const mostrarMensajePendiente = computed(() => {
  return logotipoPendiente.value || 
    camposPendientesProveedor.value.length > 0 || 
    camposPendientesMedico.value.length > 0;
});

// Definir el mensaje adecuado según el estado
const mensajeConfiguracion = computed(() => {
  if (logotipoPendiente.value && (camposPendientesProveedor.value.length > 0 || camposPendientesMedico.value.length > 0)) {
    return "Tus informes aún no están configurados correctamente.";
  } else if (logotipoPendiente.value) {
    return "Aún no has subido el logotipo.";
  } else if (camposPendientesProveedor.value.length > 0 && camposPendientesMedico.value.length > 0) {
    return "Algunos campos están incompletos en tu configuración.";
  } else if (camposPendientesProveedor.value.length > 0) {
    return 'Hay campos pendientes en "Mi Negocio".';
  } else if (camposPendientesMedico.value.length > 0) {
    return 'Hay campos pendientes en "Médico Firmante".';
  } else {
    return "Algunos campos están incompletos en tu configuración.";
  }
});

// Definir el texto del enlace dependiendo de la situación
const textoEnlace = computed(() => {
  if (logotipoPendiente.value && !(camposPendientesProveedor.value.length > 0 || camposPendientesMedico.value.length > 0)) {
    return "Sigue esta guía para hacerlo";
  } else {
    return "Sigue esta guía para configurarlos";
  }
});

</script>

<template>
  <main class="flex flex-col items-center p-4 md:p-10 md:w-full overflow-x-auto">
    <!-- Logo de la empresa -->
    <div v-if="empresas.currentEmpresa?.logotipoEmpresa?.data && 
      ['crear-documento'].includes(route.name as string)"
      class="fixed top-0 right-0 h-16 w-16 md:h-32 md:w-32 rounded z-50 flex flex-col items-center justify-center overflow-hidden">
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

    <!-- Mensaje de configuración pendiente -->
    <Transition name="slide-up">
      <div v-if="datosCargados && mostrarMensajePendiente" 
          class="fixed bottom-4 right-4 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-lg p-3 flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 z-20">
        <i class="fa-regular fa-lightbulb text-yellow-500 text-xl mr-1"></i>
        <div>
          <p class="text-sm font-medium">
            {{ mensajeConfiguracion }} <br>
            <a :href="guiaConfiguracionInicialURL" target="_blank" rel="noopener noreferrer" class="underline text-blue-600">{{ textoEnlace }}</a>.
          </p>
        </div>
      </div>
      <div v-else>
        <div v-if="datosCargados && empresasCargadas && empresas.empresas.length === 0 && ['inicio', 'empresas'].includes(route.name as string)" 
            class="fixed bottom-4 right-4 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-lg p-3 flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105">
          <i class="fa-regular fa-lightbulb text-yellow-500 text-xl mr-1"></i>
          <div>
            <p class="text-sm font-medium">
              Aún no tienes clientes registrados <br>
              <a :href="guiaRegistrarClientesURL" target="_blank" rel="noopener noreferrer" class="underline text-blue-600">Guía para registrar a tu primer cliente</a>.
            </p>
          </div>
        </div>
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
        
        <!-- Notificación de Campos Pendientes -->
        <div v-if="mostrarNotificacionCampos" :class="['absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full border border-white', animacionNotificacion]"></div>
        
        <!-- Notificación de Logotipo -->
        <div v-if="mostrarNotificacionLogotipo" :class="['absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border border-white', animacionNotificacion]"></div>
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
            <p class="text-sm font-medium text-gray-700">Configuración</p>

            <!-- Proveedor de Salud -->
            <a v-if="user.user?.role === 'Principal'" @click="router.push({ name: 'perfil-proveedor' })" 
              class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              <div class="flex items-center gap-2">
                <TooltipInfo 
                  v-if="logotipoPendiente"
                  title="Se requiere un logotipo para el encabezado del informe"
                  icon="fa-solid fa-triangle-exclamation text-red-500"
                />
                <TooltipInfo 
                  v-if="mostrarTooltipProveedor"
                  title="Para un mejor pie de página, se recomienda guardar:"
                  :items="camposPendientesProveedor" 
                />
                <span>Mi Negocio</span>
              </div>
            </a>

            <!-- Médico Firmante -->
            <a @click="router.push({ name: 'medico-firmante' })" 
              class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mt-1 transition-all duration-300 ease-in-out cursor-pointer">
              <div class="flex items-center gap-2">
                <TooltipInfo 
                  v-if="mostrarTooltipMedico"
                  title="Para un mejor pie de página, se recomienda guardar:"
                  :items="camposPendientesMedico" 
                />
                <span>Médico Firmante</span>
              </div>
            </a>

          </div>

          <!-- Gestión de Usuarios -->
          <div v-if="user.user?.role === 'Principal'">
            <p class="text-sm font-medium text-gray-700 mt-3">Gestión de Usuarios</p>
            <a @click="router.push({ name: 'add-user' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
              Agregar Usuario
            </a>
            <a @click="router.push({ name: 'remove-users' })" class="block py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg mt-1 transition-all duration-300 ease-in-out cursor-pointer">
              Eliminar Usuarios
            </a>
          </div>

          <!-- Suscripción -->
          <div v-if="user.user?.role === 'Principal'">
            <p class="text-sm font-medium text-gray-700 mt-3">Suscripción</p>
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

    <!-- Icono de guía de uso (Desplegable) -->
    <Transition name="delayed-appear">
      <button 
        v-if="isVisible && ['inicio', 'add-user', 'remove-users', 'perfil-proveedor', 'medico-firmante', 'subscription', 'suscripcion-activa', 'subscription-success'].includes(route.name as string)"
        @click="toggleGuideMenu($event)"
        class="fixed top-20 right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 z-30 flex items-center justify-center">
        <i class="fa-solid fa-book text-lg"></i>
      </button>
    </Transition>

    <!-- Menú desplegable de guías de uso -->
    <Transition name="fade">
      <div 
        v-if="isGuideMenuOpen"
        ref="guideMenuRef"
        class="fixed top-32 right-4 bg-white rounded-xl shadow-xl p-4 w-80 z-20 border border-gray-200 transition-all duration-300 ease-in-out">
        <h3 class="text-lg font-medium text-gray-700 mb-1">Guías de Uso</h3>
        <ul class="space-y-0">
          <li>
            <a href="https://scribehow.com/shared/Configuracion_de_Informes__qSuHpPxtSnKc8JTaObgY7Q?referrer=workspace" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">1. Configuración de Informes</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Agregar_Clientes_y_Centros_de_Trabajo__32Haet8BQy6oFUDacWcbWg?referrer=documents" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">2. Agregar Clientes y Centros de Trabajo</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Registrar_Trabajadores__C2clnmBvTT2xGW7QE-YHQQ?referrer=documents" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">3. Registrar Trabajadores</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Gestion_de_Trabajadores__bGNGxMbuRXiKD6G8JiDGIQ?referrer=documents" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">4. Gestión de Trabajadores</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Creacion_de_Informes_Medicos__BffBrtm4Qze068R96fLL9w?referrer=documents" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">5. Creación de Informes Médicos</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Subir_Documentos_Externos__p2VINQjBSYq8RKntzNZHSQ?referrer=workspace" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">6. Subir Documentos Externos</a>
          </li>
          <li>
            <a href="https://scribehow.com/shared/Resumen_de_Aptitud_al_Puesto__RZbuEGIpTTOiY1wSuxbqKQ?referrer=workspace" target="_blank" class="font-light text-blue-700 hover:text-blue-500 hover:font-normal">7. Resumen de Aptitud al Puesto</a>
          </li>
          <li>
            <a href="" target="_blank" class="font-light text-gray-400">8. Estadísticas de Salud</a>
          </li>
          <li>
            <a href="" target="_blank" class="font-light text-gray-400">9. Gestión de RTs</a>
          </li>
        </ul>
      </div>
    </Transition>

  </main>

  <!-- Herramienta de Debug - Media Query -->
  <!-- <div class="fixed top-4 left-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-mono">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 bg-red-500 rounded-full sm:hidden"></span>
      <span class="w-2 h-2 bg-orange-500 rounded-full hidden sm:block md:hidden"></span>
      <span class="w-2 h-2 bg-yellow-500 rounded-full hidden md:block lg:hidden"></span>
      <span class="w-2 h-2 bg-green-500 rounded-full hidden lg:block xl:hidden"></span>
      <span class="w-2 h-2 bg-blue-500 rounded-full hidden xl:block 2xl:hidden"></span>
      <span class="w-2 h-2 bg-purple-500 rounded-full hidden 2xl:block"></span>
      <span class="text-xs">
        <span class="sm:hidden">xs</span>
        <span class="hidden sm:block md:hidden">sm</span>
        <span class="hidden md:block lg:hidden">md</span>
        <span class="hidden lg:block xl:hidden">lg</span>
        <span class="hidden xl:block 2xl:hidden">xl</span>
        <span class="hidden 2xl:block">2xl</span>
      </span>
    </div>
  </div> -->

</template>

<style>
@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-2px);
  }
  40%, 80% {
    transform: translateX(2px);
  }
}

.notificacion-animada {
  animation: bounceIn 0.5s ease-out;
}

.notificacion-pulso {
  animation: pulse 1s infinite;
}

.notificacion-vibracion {
  animation: shake 0.5s infinite;
}

/* Transición slide-up mejorada */
.slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Reduced to 0.3s for faster exit */
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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