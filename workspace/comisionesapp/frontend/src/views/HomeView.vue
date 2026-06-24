<template>
  <div class="home">
    <div class="hero">
      <h1>Stack Oficial <span>PERMODA</span></h1>
      <p>Entorno de aprendizaje con NestJS + Vue 3.4</p>
      <div class="badges">
        <span class="badge blue">Node.js 22 LTS</span>
        <span class="badge purple">NestJS 10</span>
        <span class="badge green">Vue 3.4</span>
        <span class="badge orange">Pinia</span>
        <span class="badge gray">pnpm</span>
      </div>
    </div>

    <div class="cards">
      <div class="card">
        <h3>Backend</h3>
        <ul>
          <li>NestJS con TypeScript</li>
          <li>CRUD con ValidationPipe</li>
          <li>Swagger en <code>/api/docs</code></li>
          <li>CORS configurado para :5173</li>
        </ul>
      </div>
      <div class="card">
        <h3>Frontend</h3>
        <ul>
          <li>Vue 3.4 con Composition API</li>
          <li>Pinia para estado global</li>
          <li>Vue Router con lazy loading</li>
          <li>Axios con proxy Vite</li>
        </ul>
      </div>
      <div class="card">
        <h3>Demo</h3>
        <ul>
          <li>Módulo Productos (CRUD)</li>
          <li>Store reactivo con Pinia</li>
          <li>Formulario de creación</li>
          <li>Eliminar y actualizar</li>
        </ul>
      </div>
    </div>

    <div class="links">
      <RouterLink to="/productos" class="btn-primary">Ver Productos</RouterLink>
      <a href="http://localhost:3000/api/docs" target="_blank" class="btn-outline">Swagger Docs</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 2rem; }

.hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
}

.hero h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.hero h1 span { color: #a78bfa; }
.hero p { color: #94a3b8; margin-bottom: 1.5rem; }

.badges { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.badge.blue { background: #1e40af22; color: #60a5fa; border: 1px solid #1e40af; }
.badge.purple { background: #6d28d922; color: #a78bfa; border: 1px solid #6d28d9; }
.badge.green { background: #16653122; color: #4ade80; border: 1px solid #166534; }
.badge.orange { background: #92400e22; color: #fb923c; border: 1px solid #92400e; }
.badge.gray { background: #37415122; color: #94a3b8; border: 1px solid #374151; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
}

.card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: #1a1a2e; }

.card ul { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
.card li { font-size: 0.875rem; color: #475569; padding-left: 1rem; position: relative; }
.card li::before { content: '→'; position: absolute; left: 0; color: #a78bfa; }

code { background: #f1f5f9; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.8em; }

.links { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn-primary {
  background: #7c3aed;
  color: #fff;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.btn-primary:hover { background: #6d28d9; }

.btn-outline {
  background: transparent;
  color: #7c3aed;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid #7c3aed;
  transition: all 0.2s;
}
.btn-outline:hover { background: #7c3aed; color: #fff; }
</style>
