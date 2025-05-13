import { createRouter, createWebHistory } from "vue-router";
import LayOut from "../views/LayOut.vue";
import AuthAPI from "@/api/AuthAPI";
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { usePostHog } from "@/composables/usePostHog";

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
      path: "/",
      name: "inicio",
      component: LayOut,
      meta: { requiresAuth: true },
      children: [
        {
          path: "/registrar-usuario",
          name: "add-user",
          component: () => import("../views/AddUserView.vue"),
        },
        {
          path: "/eliminar-usuarios",
          name: "remove-users",
          component: () => import("../views/RemoveUsersView.vue"),
        },
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
          path: "dashboard/:idEmpresa",
          name: "dashboard-empresa",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: "riesgos-trabajo/:idEmpresa",
          name: "riesgos-trabajo",
          component: () => import("../views/RiesgosTrabajoView.vue"),
        },
        {
          path: "dashboard-rt/:idEmpresa",
          name: "dashboard-rt",
          component: () => import("../views/DashboardRTsView.vue"),
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
        {
          path: "/suscripcion",
          name: "subscription",
          component: () => import("../views/SubscriptionView.vue"),
        },
        {
          path: "/suscripcion-activa",
          name: "suscripcion-activa",
          component: () => import("../views/SuscripcionActivaView.vue"),
        },
        {
          path: "/suscripcion-exitosa",
          name: "subscription-success",
          component: () => import('@/views/auth/SubscriptionSuccess.vue'),
        },
        {
          path: "/panel-administrador",
          name: "panel-administrador",
          component: () => import("@/views/PanelAdministradorView.vue"),
          meta: { requiresAdmin: true },
        }
      ],
    },
  ],
});

const { posthog } = usePostHog(); // Inicializamos PostHog

router.afterEach((to, from) => {
  posthog.capture('$pageview', {
    path: to.fullPath,
    name: to.name,
  });
});

router.beforeEach((to, from) => {
  if (from.path !== to.path) {
    posthog.capture('$pageleave')
  }
})

// Configuración del guardia global
router.beforeEach(async (to, from, next) => {
  // const requiresAuth = to.matched.some((url) => url.meta.requiresAuth);
  const requiresAuth = to.meta.requiresAuth; // Verifica solo la ruta actual
  const requiresAdmin = to.meta.requiresAdmin; // Verifica solo
  const userStore = useUserStore();

  try {
    if (requiresAuth) {
      await userStore.fetchUser();
      await AuthAPI.auth();
    }
    
    const user = userStore.user;

    // Validar si requiere ser admin y no lo es
    if (requiresAdmin && (!user || user.role !== "Administrador")) {
      console.warn("Acceso denegado: no eres administrador");
      return next({ name: "inicio" });
    }

    next();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('No autorizado');
    } else {
      console.error("Error inesperado:", error);
    }
    next("/login");
  }

/*   if (requiresAuth) {
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
  } */
});

export default router;
