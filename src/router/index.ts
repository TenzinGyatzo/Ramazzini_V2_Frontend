import { createRouter, createWebHistory } from 'vue-router'
import LayOut from '../views/LayOut.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: LayOut,
      children: [
        {
          path: 'empresas',
          name: 'empresas',
          component: () => import('../views/EmpresasView.vue')
        },
        {
          path: ':idEmpresa/centros-trabajo',
          name: 'centros-trabajo',
          component: () => import('../views/CentrosTrabajoView.vue')
        },
        {
          path: ':idEmpresa/:idCentroTrabajo/trabajadores',
          name: 'trabajadores',
          component: () => import('../views/TrabajadoresView.vue')
        },
        {
          path: '/expediente-medico',
          name: 'expediente-medico',
          component: () => import('../views/ExpedienteMedicoView.vue')
        },
        {
          path: '/historia-clinica',
          name: 'historia-clinica',
          component: () => import('../views/InformeView.vue')
        },

      ]
    },
  ]
})

export default router
