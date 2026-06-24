<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-dot"></span>
        <span>PERMODA</span>
      </div>

      <h1>Iniciar sesión</h1>
      <p class="login-sub">Ingresa tus credenciales para continuar</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="usuario@permoda.com"
            autocomplete="email"
            :disabled="cargando"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="cargando"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-login" :disabled="cargando">
          <span v-if="cargando">Verificando...</span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <div class="login-hint">
        <p><strong>Demo:</strong> admin@permoda.com / Admin123!</p>
        <p>vendedor@permoda.com / Vendedor123!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ email: '', password: '' });
const cargando = ref(false);
const errorMsg = ref('');

async function handleLogin() {
  errorMsg.value = '';
  if (!form.value.email || !form.value.password) {
    errorMsg.value = 'Completa todos los campos';
    return;
  }
  cargando.value = true;
  try {
    await authStore.login(form.value.email, form.value.password);
    router.push('/');
  } catch {
    errorMsg.value = 'Credenciales incorrectas. Verifica tu email y contraseña.';
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.login-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px #0000000d;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 1.75rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  background: #7c3aed;
  border-radius: 50%;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.login-sub {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px #7c3aed22;
}

input:disabled { background: #f9fafb; cursor: not-allowed; }

.error-msg {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.btn-login {
  width: 100%;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.25rem;
}

.btn-login:hover:not(:disabled) { background: #6d28d9; }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.login-hint {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.7;
}
</style>
