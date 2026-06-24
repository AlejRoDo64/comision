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
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/productos',
      name: 'productos',
      component: () => import('@/views/ProductosView.vue'),
    },
  ],
});

// Guard global: redirige a /login si no hay token
router.beforeEach((to, _from, next) => {
  const tieneToken = !!localStorage.getItem('access_token');
  const esRutaPublica = to.meta.public === true;

  if (!esRutaPublica && !tieneToken) return next('/login');
  if (to.path === '/login' && tieneToken) return next('/');
  next();
});

export default router;
