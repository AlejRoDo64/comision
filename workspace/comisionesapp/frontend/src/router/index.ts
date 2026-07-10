import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, title: 'Iniciar sesión' },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Resumen general' },
    },
    {
      path: '/calendarios',
      name: 'calendarios',
      component: () => import('@/views/CalendariosView.vue'),
      meta: { title: 'Calendarios y períodos' },
    },
    {
      path: '/parametrizacion',
      name: 'parametrizacion',
      component: () => import('@/views/ParametrizacionView.vue'),
      meta: { title: 'Parametrización de cargos' },
    },
    {
      path: '/liquidacion',
      name: 'liquidacion',
      component: () => import('@/views/LiquidacionView.vue'),
      meta: { title: 'Liquidación automática' },
    },
    {
      path: '/trazabilidad',
      name: 'trazabilidad',
      component: () => import('@/views/TrazabilidadView.vue'),
      meta: { title: 'Trazabilidad y salida' },
    },
    {
      path: '/datos',
      name: 'datos',
      component: () => import('@/views/DatosView.vue'),
      meta: { title: 'Datos de origen' },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  // El store aplica la purga de sesiones con roles previos a HU-0223;
  // leerlo (y no localStorage directo) mantiene una sola fuente de verdad.
  const { useAuthStore } = await import('@/stores/auth');
  const auth = useAuthStore();
  const esPublica = to.meta.public === true;
  if (!esPublica && !auth.isAuthenticated) return next('/login');
  if (to.path === '/login' && auth.isAuthenticated) return next('/');
  next();
});

export default router;
