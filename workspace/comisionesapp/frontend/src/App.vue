<template>
  <div class="app-layout">
    <header v-if="authStore.isAuthenticated" class="app-header">
      <div class="header-inner">
        <span class="logo">PERMODA Dev</span>
        <nav>
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink to="/productos">Productos</RouterLink>
        </nav>
        <div class="header-user">
          <span class="user-info">
            <span class="user-rol">{{ authStore.user?.rol }}</span>
            {{ authStore.user?.nombre }}
          </span>
          <button class="btn-logout" @click="handleLogout">Salir</button>
        </div>
      </div>
    </header>

    <main :class="['app-main', { 'no-header': !authStore.isAuthenticated }]">
      <RouterView />
    </main>

    <footer v-if="authStore.isAuthenticated" class="app-footer">
      <span>Stack: NestJS 10 · Vue 3.4 · Node 22 LTS · JWT</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #222;
}

.app-layout { display: flex; flex-direction: column; min-height: 100vh; }

.app-header {
  background: #1a1a2e;
  color: #fff;
  padding: 0 2rem;
  height: 56px;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

.logo {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #a78bfa;
  flex-shrink: 0;
}

nav { display: flex; gap: 1.5rem; flex: 1; }

nav a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

nav a:hover, nav a.router-link-active { color: #a78bfa; }

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  font-size: 0.82rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.user-rol {
  background: #7c3aed33;
  color: #a78bfa;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-logout {
  background: transparent;
  color: #64748b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover { border-color: #ef4444; color: #ef4444; }

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.app-main.no-header { max-width: 100%; padding: 0; }

.app-footer {
  background: #1a1a2e;
  color: #64748b;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.8rem;
}
</style>
