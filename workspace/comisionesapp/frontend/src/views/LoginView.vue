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

<!-- Estilos: design system global en src/assets/main.css -->
