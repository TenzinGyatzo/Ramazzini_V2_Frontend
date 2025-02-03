import { ref, onMounted, computed } from "vue";
import { defineStore } from "pinia";
import AuthAPI from "@/api/AuthAPI";
import { useRouter } from "vue-router";

// Define el tipo para el objeto usuario
interface User {
    _id: string;
    username: string;
    role: string;
    idProveedorSalud?: string;
}

// Define el store
export const useUserStore = defineStore("user", () => {

    const router = useRouter();
    const user = ref<User | null>(null);

    // Carga el usuario cuando el componente se monta
/*     onMounted(async () => {
        try {
            const { data } = await AuthAPI.auth();
            user.value = data; // Asegúrate de que `data` coincide con el tipo User
            console.log('Usuario', user.value);

            // Guardar el usuario en localStorage
            localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
            console.error(error);
        }
    }); */

      // Función para cargar el usuario cuando sea necesario
    async function fetchUser() {
        if (!user.value) {
        try {
            const { data } = await AuthAPI.auth();
            user.value = data;
            console.log('Usuario cargado:', user.value);
            localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
            console.error("Error al cargar el usuario:", error);
        }
        }
    }

    // Computed para obtener el nombre de usuario
    const getUsername = computed(() => {
        if (!user.value?.username) return '';
        return user.value.username
            .split(' ') // Dividir en palabras
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar cada palabra
            .join(' '); // Unirlas de nuevo
    });
    
    
    function logout() {
        user.value = null;
        localStorage.removeItem("AUTH_TOKEN");
        router.push("/login");
    }

    async function registerUser(userData: User) {
        try {
            const resultado = await AuthAPI.registerUser(userData);
            return { success: true, data: resultado }; // Indicador de éxito y datos
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            return { success: false, error }; // Indicador de fallo y error
        }
    }
    
    return {
        user,
        fetchUser,
        logout,
        registerUser,
        getUsername,
    };
});
