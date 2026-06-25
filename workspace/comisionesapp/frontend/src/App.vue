<template>
  <!-- Sin autenticación: solo login -->
  <RouterView v-if="!authStore.isAuthenticated" />

  <!-- Autenticado: shell con sidebar -->
  <div v-else class="app-shell">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-mark">C</span>
        <div class="logo-text">
          <span class="logo-name">Automatización</span>
          <span class="logo-sub">Comisiones · Permoda</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-sect">Módulos</span>

        <RouterLink
          to="/"
          class="nav-item"
          :class="{ active: route.path === '/' }"
        >
          <i class="ti ti-layout-dashboard"></i>
          <span>Resumen general</span>
        </RouterLink>
        <RouterLink
          to="/calendarios"
          class="nav-item"
          :class="{ active: route.path.startsWith('/calendarios') }"
        >
          <i class="ti ti-calendar"></i>
          <span>Calendarios y períodos</span>
        </RouterLink>
        <RouterLink
          to="/parametrizacion"
          class="nav-item"
          :class="{ active: route.path.startsWith('/parametrizacion') }"
        >
          <i class="ti ti-settings-2"></i>
          <span>Parametrización</span>
        </RouterLink>
        <RouterLink
          to="/liquidacion"
          class="nav-item"
          :class="{ active: route.path.startsWith('/liquidacion') }"
        >
          <i class="ti ti-calculator"></i>
          <span>Liquidación automática</span>
        </RouterLink>
        <RouterLink
          to="/trazabilidad"
          class="nav-item"
          :class="{ active: route.path.startsWith('/trazabilidad') }"
        >
          <i class="ti ti-file-analytics"></i>
          <span>Trazabilidad y salida</span>
        </RouterLink>

        <span class="nav-sect" style="margin-top:8px">Sistema</span>

        <div class="nav-item nav-disabled">
          <i class="ti ti-users"></i>
          <span>Usuarios y roles</span>
        </div>
        <div class="nav-item nav-disabled">
          <i class="ti ti-shield-check"></i>
          <span>Auditoría</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        v0.1 &nbsp;·&nbsp; Permoda Ltda. &copy; 2026
      </div>
    </aside>

    <!-- Body: topbar + contenido -->
    <div class="app-body">
      <header class="topbar">
        <div class="topbar-title">{{ paginaTitulo }}</div>
        <span class="topbar-periodo">Período activo: JUN-2026</span>
        <div class="topbar-sep"></div>
        <div class="topbar-user">
          <span class="user-rol">{{ authStore.user?.rol }}</span>
          <span class="user-name">{{ authStore.user?.nombre }}</span>
          <button class="btn-logout" @click="handleLogout">
            <i class="ti ti-logout" style="font-size:0.85rem"></i> Salir
          </button>
        </div>
      </header>

      <main class="app-content">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router     = useRouter();
const route      = useRoute();
const authStore  = useAuthStore();

const TITULOS: Record<string, string> = {
  '/':               'Resumen general',
  '/calendarios':    'HU01 — Calendarios y períodos',
  '/parametrizacion':'HU02 — Parametrización de cargos',
  '/liquidacion':    'HU03 — Liquidación automática',
  '/trazabilidad':   'HU04 — Trazabilidad y salida',
};

const paginaTitulo = computed(() => TITULOS[route.path] ?? 'Automatización Comisiones');

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
/* ── Shell ──────────────────────────────────────────────────────── */
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.sidebar {
  width: 222px;
  flex-shrink: 0;
  background: #111;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #1c1c1c;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 14px 13px;
  border-bottom: 1px solid #1f1f1f;
  flex-shrink: 0;
}

.logo-mark {
  width: 30px;
  height: 30px;
  background: #fff;
  color: #111;
  font-size: 0.85rem;
  font-weight: 900;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.logo-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
}

.logo-sub {
  font-size: 0.63rem;
  color: #555;
  font-weight: 400;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 10px 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-sect {
  font-size: 0.59rem;
  font-weight: 700;
  color: #444;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 6px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 9px;
  border-radius: 7px;
  color: #888;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.nav-item i { font-size: 1rem; flex-shrink: 0; }

.nav-item:hover { background: #1a1a1a; color: #ccc; }

.nav-item.active {
  background: #fff;
  color: #111;
  font-weight: 700;
}

.nav-item.active i { color: #111; }

.nav-item.nav-disabled { opacity: 0.4; cursor: default; }
.nav-item.nav-disabled:hover { background: none; color: #888; }

/* Footer */
.sidebar-footer {
  padding: 11px 14px;
  font-size: 0.63rem;
  color: #3a3a3a;
  border-top: 1px solid #1c1c1c;
  flex-shrink: 0;
}

/* ── App body ────────────────────────────────────────────────────── */
.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ── Topbar ──────────────────────────────────────────────────────── */
.topbar {
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  flex-shrink: 0;
}

.topbar-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #111;
  flex-shrink: 0;
}

.topbar-periodo {
  font-size: 0.69rem;
  background: #e4f5ed;
  color: #1a6644;
  padding: 2px 9px;
  border-radius: 8px;
  font-weight: 700;
  flex-shrink: 0;
}

.topbar-sep { flex: 1; }

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.user-rol {
  font-size: 0.66rem;
  border: 1px solid #dcdcdc;
  border-radius: 999px;
  padding: 1px 8px;
  color: #999;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-name { color: #666; }

.btn-logout {
  background: transparent;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.77rem;
  color: #777;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-logout:hover { border-color: #111; color: #111; }

/* ── Content ─────────────────────────────────────────────────────── */
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  background: #f2f2f2;
}
</style>
