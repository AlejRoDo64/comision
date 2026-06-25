<template>
  <div class="home">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-badge">Sistema de Liquidación</div>
      <h1>Automatización <span>Comisiones</span></h1>
      <p>Plataforma de automatización para la liquidación y trazabilidad de comisiones de ventas — Permoda Ltda.</p>
    </div>

    <!-- Módulos -->
    <div class="section-label">Módulos del sistema</div>
    <div class="cards">
      <div class="card">
        <div class="card-num">01</div>
        <h3>Calendarios y Períodos</h3>
        <ul>
          <li>Creación de calendarios anuales</li>
          <li>Configuración masiva de períodos</li>
          <li>Validación de no solapamiento</li>
          <li>Estados automáticos por liquidación</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-num">02</div>
        <h3>Parametrización</h3>
        <ul>
          <li>Cargos y esquemas de comisión</li>
          <li>Tipos de liquidación y distribución</li>
          <li>Tablas de presupuesto y crecimiento</li>
          <li>Versionamiento por período</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-num">03</div>
        <h3>Motor de Liquidación</h3>
        <ul>
          <li>Integración ICG y Midasoft</li>
          <li>Normalización financiera con IVA</li>
          <li>Distribución individual y global</li>
          <li>Generación de archivo Midasoft</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-num">04</div>
        <h3>Trazabilidad</h3>
        <ul>
          <li>Consulta histórica inmutable</li>
          <li>Drill-down hasta detalle</li>
          <li>Exportación de resultados</li>
          <li>Log de auditoría completo</li>
        </ul>
      </div>
    </div>

    <!-- Acciones -->
    <div class="links">
      <RouterLink to="/productos" class="btn-primary">Ir a Productos</RouterLink>
      <a href="http://localhost:3000/api/docs" target="_blank" class="btn-outline">Swagger Docs</a>
    </div>

  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 1.75rem; }

/* ── Hero ──────────────────────────────────────────────── */
.hero {
  background: #111111;
  color: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 12px;
}

.hero-badge {
  display: inline-block;
  border: 1px solid #333333;
  color: #888888;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.hero h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  line-height: 1.2;
}

.hero h1 span { color: #cccccc; }

.hero p {
  color: #888888;
  font-size: 0.95rem;
  max-width: 520px;
  line-height: 1.6;
}

/* ── Section label ─────────────────────────────────────── */
.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888888;
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 0.5rem;
}

/* ── Cards ─────────────────────────────────────────────── */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.card {
  background: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  padding: 1.5rem;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #b8b8b8;
}

.card-num {
  font-size: 0.72rem;
  font-weight: 800;
  color: #bbbbbb;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.85rem;
}

.card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card li {
  font-size: 0.85rem;
  color: #555555;
  padding-left: 1rem;
  position: relative;
  line-height: 1.4;
}

.card li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: #aaaaaa;
  font-size: 0.75rem;
}

/* ── Buttons ───────────────────────────────────────────── */
.links { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn-primary {
  background: #111111;
  color: #ffffff;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.btn-primary:hover { background: #333333; }

.btn-outline {
  background: transparent;
  color: #111111;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1.5px solid #111111;
  transition: all 0.15s;
}

.btn-outline:hover { background: #111111; color: #ffffff; }
</style>
