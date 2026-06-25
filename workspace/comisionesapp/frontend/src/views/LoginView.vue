<template>
  <div class="login-wrapper">
    <div class="login-card">

      <div class="login-brand">
        <span class="brand-mark">C</span>
        <div class="brand-text">
          <span class="brand-name">Automatización Comisiones</span>
          <span class="brand-sub">Comisiones · Permoda Ltda.</span>
        </div>
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
            placeholder="usuario@permoda.com.co"
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
  background: #f2f2f2;
}

/* ── Card ──────────────────────────────────────────────── */
.login-card {
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 14px;
  padding: 2.5rem 2.25rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

/* ── Brand ─────────────────────────────────────────────── */
.login-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.brand-mark {
  width: 40px;
  height: 40px;
  background: #111111;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 900;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-size: 1rem;
  font-weight: 800;
  color: #111111;
}

.brand-sub {
  font-size: 0.72rem;
  color: #888888;
  font-weight: 400;
}

/* ── Titles ────────────────────────────────────────────── */
h1 {
  font-size: 1.45rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.25rem;
}

.login-sub {
  color: #666666;
  font-size: 0.875rem;
  margin-bottom: 1.75rem;
}

/* ── Form ──────────────────────────────────────────────── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333333;
}

input {
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
  color: #111111;
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input::placeholder { color: #aaaaaa; }

input:focus {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

input:disabled { background: #f5f5f5; cursor: not-allowed; color: #999999; }

/* ── Error ─────────────────────────────────────────────── */
.error-msg {
  background: #fff5f5;
  color: #b91c1c;
  border: 1px solid #f5c6c6;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.84rem;
  margin-bottom: 0.75rem;
}

/* ── Submit ────────────────────────────────────────────── */
.btn-login {
  width: 100%;
  background: #111111;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.72rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 0.25rem;
  letter-spacing: 0.01em;
}

.btn-login:hover:not(:disabled) { background: #333333; }
.btn-login:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Hint ──────────────────────────────────────────────── */
.login-hint {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ebebeb;
  font-size: 0.78rem;
  color: #999999;
  line-height: 1.8;
}
</style>
