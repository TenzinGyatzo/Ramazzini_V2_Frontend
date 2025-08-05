import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

export function useCurrentUser() {
  const userStore = useUserStore();

  // Computed para obtener el usuario actual
  const currentUser = computed(() => userStore.user);

  // Computed para obtener el ID del usuario actual
  const currentUserId = computed(() => userStore.user?._id || null);

  // Computed para verificar si hay un usuario autenticado
  const isAuthenticated = computed(() => !!userStore.user?._id);

  // Función para obtener el ID del usuario, con fallback a localStorage si es necesario
  const getCurrentUserId = () => {
    // Primero intentar obtener del store
    if (userStore.user?._id) {
      return userStore.user._id;
    }

    // Fallback a localStorage
    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user') || 'null');
      return userFromStorage?._id || null;
    } catch (error) {
      console.error('Error al obtener usuario de localStorage:', error);
      return null;
    }
  };

  // Función para cargar el usuario si no está disponible
  const ensureUserLoaded = async () => {
    if (!userStore.user) {
      await userStore.fetchUser();
    }
    return getCurrentUserId();
  };

  return {
    currentUser,
    currentUserId,
    isAuthenticated,
    getCurrentUserId,
    ensureUserLoaded,
    userStore
  };
} 