import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type UsuarioAutenticado } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<UsuarioAutenticado | null>(
    JSON.parse(localStorage.getItem('auth_user') ?? 'null'),
  );

  const isAuthenticated = computed(() => !!token.value);
  const esAdmin = computed(() => user.value?.rol === 'ADMIN');

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

  return { token, user, isAuthenticated, esAdmin, login, logout };
});
