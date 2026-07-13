<template>
  <!-- Sin autenticación: solo login -->
  <RouterView v-if="!authStore.isAuthenticated" />

  <!-- Autenticado: shell con sidebar -->
  <div v-else class="app-shell">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-mark"><i class="ti ti-percentage"></i></span>
        <div class="logo-text">
          <span class="logo-name">Automatización</span>
          <span class="logo-sub">Comisiones · Permoda</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-sect">Módulos</span>

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
        <!-- Fuentes externas y opciones de sistema: solo Administrador -->
        <RouterLink
          v-if="authStore.esAdministrador"
          to="/datos"
          class="nav-item"
          :class="{ active: route.path.startsWith('/datos') }"
        >
          <i class="ti ti-database-search"></i>
          <span>Datos de origen</span>
        </RouterLink>

        <!-- Sección "Sistema" retirada: sus opciones (Usuarios y roles, Auditoría)
             aún no existen y mostrarlas deshabilitadas confunde al usuario.
             Restaurar aquí cuando esas pantallas se implementen. -->
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
          <!-- Solo se muestra el nombre si NO coincide con el rol (evita verse duplicado) -->
          <span v-if="nombreVisible" class="user-name">{{ nombreVisible }}</span>
          <button class="btn sm outlined" @click="handleLogout">
            <i class="ti ti-logout" style="font-size:0.85rem"></i> Salir
          </button>
        </div>
      </header>

      <main class="app-content">
        <!-- El título del módulo ya lo muestra la barra superior (sin breadcrumb duplicado) -->
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

// Evita mostrar "Profesional de Comisiones" dos veces cuando el nombre del
// usuario semilla coincide con el nombre legible del rol.
const nombreVisible = computed(() => {
  const nombre = authStore.user?.nombre?.trim() ?? '';
  return nombre.toLowerCase() === rolLegible.value.toLowerCase() ? '' : nombre;
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<!-- Estilos: design system global en src/assets/main.css -->
