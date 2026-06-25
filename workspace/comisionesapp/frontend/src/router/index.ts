import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/calendarios',
      name: 'calendarios',
      component: () => import('@/views/CalendariosView.vue'),
    },
    {
      path: '/parametrizacion',
      name: 'parametrizacion',
      component: () => import('@/views/ParametrizacionView.vue'),
    },
    {
      path: '/liquidacion',
      name: 'liquidacion',
      component: () => import('@/views/LiquidacionView.vue'),
    },
    {
      path: '/trazabilidad',
      name: 'trazabilidad',
      component: () => import('@/views/TrazabilidadView.vue'),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const tieneToken = !!localStorage.getItem('access_token');
  const esPublica  = to.meta.public === true;
  if (!esPublica && !tieneToken) return next('/login');
  if (to.path === '/login' && tieneToken) return next('/');
  next();
});

export default router;
