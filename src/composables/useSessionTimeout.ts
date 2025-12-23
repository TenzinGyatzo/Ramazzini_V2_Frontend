import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

export function useSessionTimeout() {
  const route = useRoute();
  const userStore = useUserStore();
  
  // Estado de bloqueo
  const isLocked = ref(false);
  
  // Configuración del timeout: 30 segundos para pruebas (30000ms)
  // Cambiar a 15 minutos (900000ms) para producción
  const TIMEOUT_MS = 900000; 
  
  let timeoutId: number | null = null;

  // Rutas que no deben disparar el bloqueo ni el timer
  const publicRoutes = ['login', 'auth', 'onboarding', 'confirm-account', 'forgot-password', 'new-password'];

  const resetTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // No iniciar el timer si está bloqueado o si estamos en una ruta pública o si no hay usuario
    if (isLocked.value || publicRoutes.includes(route.name as string) || !userStore.user) {
      return;
    }

    timeoutId = window.setTimeout(() => {
      lockSession();
    }, TIMEOUT_MS);
  };

  const lockSession = () => {
    if (!publicRoutes.includes(route.name as string) && userStore.user) {
      isLocked.value = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };

  const unlockSession = () => {
    isLocked.value = false;
    resetTimer();
  };

  // Eventos que resetean el timer
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  const handleUserActivity = () => {
    resetTimer();
  };

  onMounted(() => {
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Iniciar timer si ya hay un usuario y no estamos en ruta pública
    resetTimer();
  });

  onUnmounted(() => {
    events.forEach(event => {
      window.removeEventListener(event, handleUserActivity);
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  // Vigilar cambios de ruta para resetear el timer o detenerlo
  watch(() => route.path, () => {
    resetTimer();
  });

  // Vigilar cuando el usuario inicia sesión para empezar el timer
  watch(() => userStore.user, (newUser) => {
    if (newUser) {
      resetTimer();
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      isLocked.value = false;
    }
  });

  return {
    isLocked,
    unlockSession,
    lockSession
  };
}

