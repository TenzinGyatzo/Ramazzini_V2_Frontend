import { createRouter, createWebHistory } from "vue-router";
import LayOut from "../views/LayOut.vue";

const isAuthenticated = () => !!localStorage.getItem('auth');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: "/",
      name: "inicio",
      component: LayOut,
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          next();
        } else {
          next('/login');
        }
      },
      children: [
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
router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !isAuthenticated()) {
    next('/login'); // Redirige al login si no está autenticado
  } else {
    next(); // Permite continuar si está autenticado
  }
});

export default router;
