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
        <RouterLink
          to="/datos"
          class="nav-item"
          :class="{ active: route.path.startsWith('/datos') }"
        >
          <i class="ti ti-database-search"></i>
          <span>Datos de origen</span>
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
        <div class="topbar-sep"></div>
        <div class="topbar-user">
          <span class="user-rol">{{ rolLegible }}</span>
          <span class="user-name">{{ authStore.user?.nombre }}</span>
          <button class="btn-logout" @click="handleLogout">
            <i class="ti ti-logout" style="font-size:0.85rem"></i> Salir
          </button>
        </div>
      </header>

      <main class="app-content">
        <!-- Breadcrumb único del shell — antes copiado en cada vista -->
        <div v-if="route.meta.title" class="breadcrumb">
          Automatización Comisiones / <strong>{{ route.meta.title }}</strong>
        </div>
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

// El título vive en meta.title de cada ruta (router/index.ts) — única fuente
const paginaTitulo = computed(
  () => (route.meta.title as string | undefined) ?? 'Automatización Comisiones',
);

const ROLES_LEGIBLES: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  PROFESIONAL_COMISIONES: 'Profesional de Comisiones',
};

const rolLegible = computed(() =>
  authStore.user ? ROLES_LEGIBLES[authStore.user.rol] ?? authStore.user.rol : '',
);

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
  background: var(--neutral);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #1e293b;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 14px 13px;
  border-bottom: 1px solid #1e293b;
  flex-shrink: 0;
}

.logo-mark {
  width: 30px;
  height: 30px;
  background: #fff;
  color: var(--neutral);
  font-size: 0.85rem;
  font-weight: 900;
  border-radius: 8px;
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
  color: #64748b;
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
  color: #475569;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 6px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 9px;
  border-radius: 8px;
  color: #94a3b8;
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

.nav-item:hover { background: #1e293b; color: #e2e8f0; }

.nav-item.active {
  background: #fff;
  color: var(--neutral);
  font-weight: 700;
}

.nav-item.active i { color: var(--neutral); }

.nav-item.nav-disabled { opacity: 0.4; cursor: default; }
.nav-item.nav-disabled:hover { background: none; color: #94a3b8; }

/* Footer */
.sidebar-footer {
  padding: 11px 14px;
  font-size: 0.63rem;
  color: #475569;
  border-top: 1px solid #1e293b;
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
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  flex-shrink: 0;
}

.topbar-title {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--text);
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
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  padding: 1px 8px;
  color: var(--tertiary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-name { color: var(--text-muted); }

.btn-logout {
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.77rem;
  color: var(--tertiary);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-logout:hover { border-color: var(--neutral); color: var(--neutral); }

/* ── Content ─────────────────────────────────────────────────────── */
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  background: var(--bg);
}
</style>
