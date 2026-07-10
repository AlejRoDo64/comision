import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type RolUsuario, type UsuarioAutenticado } from '@/services/api';

const ROLES_VALIDOS: RolUsuario[] = ['ADMINISTRADOR', 'PROFESIONAL_COMISIONES'];

// Descarta sesiones guardadas con roles previos a HU-0223 (ADMIN, VENDEDOR, VIEWER)
function leerUsuarioGuardado(): UsuarioAutenticado | null {
  const guardado: UsuarioAutenticado | null = JSON.parse(
    localStorage.getItem('auth_user') ?? 'null',
  );
  if (guardado && !ROLES_VALIDOS.includes(guardado.rol)) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    return null;
  }
  return guardado;
}

export const useAuthStore = defineStore('auth', () => {
  const usuarioInicial = leerUsuarioGuardado();
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<UsuarioAutenticado | null>(usuarioInicial);

  const isAuthenticated = computed(() => !!token.value);
  const esAdministrador = computed(() => user.value?.rol === 'ADMINISTRADOR');
  const esProfesionalComisiones = computed(
    () => user.value?.rol === 'PROFESIONAL_COMISIONES',
  );

  async function login(email: string, password: string) {
    const data = await authApi.login(email, password);
    token.value = data.access_token;
    user.value = data.user;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
  }

  return {
    token,
    user,
    isAuthenticated,
    esAdministrador,
    esProfesionalComisiones,
    login,
    logout,
  };
});
