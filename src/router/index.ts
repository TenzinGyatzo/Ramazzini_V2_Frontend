import { createRouter, createWebHistory } from "vue-router";
import LayOut from "../views/LayOut.vue";
import AuthAPI from "@/api/AuthAPI";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthView.vue"),
      meta: { hideSidebar: true },
      children: [
        {
          path: 'onboarding',
          name: 'onboarding',
          component: () => import('@/views/auth/OnboardingView.vue')
        },
        {
          path: 'confirmar-cuenta/:token',
          name: 'confirm-account',
          component: () => import('@/views/auth/ConfirmAccountView.vue')
        },
        {
          path: 'olvide-password',
          name: 'forgot-password',
          component: () => import('../views/auth/ForgotPasswordView.vue')
        },
        {
          path: 'olvide-password/:token',
          name: 'new-password',
          component: () => import('../views/auth/NewPasswordView.vue')
        },
      ]
    },    
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/registrar-usuario-adicional",
      name: "additional-user",
      component: () => import("../views/AdditionalUserView.vue"),
    },
    {
      path: "/",
      name: "inicio",
      component: LayOut,
      meta: { requiresAuth: true },
      children: [
        {
          path: "perfil-proveedor",
          name: "perfil-proveedor",
          component: () => import("../views/PerfilProveedorView.vue"),
        },
        {
          path: "medico-firmante",
          name: "medico-firmante",
          component: () => import("../views/MedicoFirmanteView.vue"),
        },
        {
          path: "empresas",
          name: "empresas",
          component: () => import("../views/EmpresasView.vue"),
        },
        {
          path: "/empresas/:idEmpresa/centros-trabajo",
          name: "centros-trabajo",
          component: () => import("../views/CentrosTrabajoView.vue"),
        },
        {
          path: "/empresas/:idEmpresa/centros-trabajo/:idCentroTrabajo/trabajadores",
          name: "trabajadores",
          component: () => import("../views/TrabajadoresView.vue"),
        },
        {
          path: "/empresas/:idEmpresa/centros-trabajo/:idCentroTrabajo/expediente-medico/:idTrabajador",
          name: "expediente-medico",
          component: () => import("../views/ExpedienteMedicoView.vue"),
        },
        {
          path: "/crear-documento/:idEmpresa/:idCentroTrabajo/:idTrabajador/:tipoDocumento/:idDocumento?",
          name: "crear-documento",
          component: () => import("../views/CrearDocumentoView.vue"),
        },
        {
          path: "/documento/:idDocumento",
          name: "documento",
          component: () => import("../views/InformeView.vue"),
        },
      ],
    },
  ],
});

// Configuración del guardia global
router.beforeEach(async (to, from, next) => {
  // const requiresAuth = to.matched.some((url) => url.meta.requiresAuth);
  const requiresAuth = to.meta.requiresAuth; // Verifica solo la ruta actual
  const userStore = useUserStore();

  if (requiresAuth) {
    try {
      await userStore.fetchUser();
      await AuthAPI.auth();
      next();
    } catch (error) {
      // Verificar que error es un objeto con la propiedad `response`
      if (axios.isAxiosError(error) && error.response) {
        console.log('No autorizado');
      } else {
        console.error("Error inesperado:", error);
      }
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
