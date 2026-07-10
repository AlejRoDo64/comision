<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="responder(false)">
      <div class="modal-card" role="alertdialog" aria-modal="true">
        <div class="modal-icono"><i class="ti ti-alert-triangle"></i></div>
        <h3 class="modal-titulo">{{ titulo }}</h3>
        <p class="modal-mensaje">{{ mensaje }}</p>
        <p class="modal-advertencia">
          <i class="ti ti-info-circle"></i>
          Esta acción no se puede deshacer. Confirme para continuar.
        </p>
        <div class="btn-group modal-acciones">
          <button class="btn sm outlined" @click="responder(false)">Cancelar</button>
          <button class="btn sm danger" @click="responder(true)">
            <i class="ti ti-trash"></i> Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Modal de reconfirmación para acciones de eliminación (reemplaza a confirm()).
// Uso: const ok = await dialogo.value.abrir({ mensaje: '¿Eliminar X?' });
const visible = ref(false);
const titulo = ref('');
const mensaje = ref('');
let resolver: ((v: boolean) => void) | null = null;

function abrir(opciones: { titulo?: string; mensaje: string }): Promise<boolean> {
  titulo.value = opciones.titulo ?? 'Confirmar eliminación';
  mensaje.value = opciones.mensaje;
  visible.value = true;
  return new Promise((res) => {
    resolver = res;
  });
}

function responder(v: boolean) {
  visible.value = false;
  resolver?.(v);
  resolver = null;
}

defineExpose({ abrir });
</script>
<!-- Estilos: design system global en src/assets/main.css -->
