<template>
  <div class="liq-view">
    <div class="breadcrumb">Automatización Comisiones / <strong>Liquidación automática</strong></div>

    <div class="page-hd">
      <h2>Liquidación automática</h2>
      <div class="btn-group">
        <span class="tag" style="font-size:0.75rem; padding:4px 10px">Período: JUN-2026</span>
        <button class="btn sm ghost"><i class="ti ti-refresh"></i> Recargar fuentes</button>
        <button
          class="btn sm"
          :disabled="pasoActual > 0"
          @click="iniciarLiquidacion"
        >
          <i class="ti ti-player-play"></i> Iniciar liquidación
        </button>
      </div>
    </div>

    <!-- Barra de pasos -->
    <div class="step-bar">
      <div v-for="(s, i) in pasos" :key="s.titulo" :class="['step', pasoClase(i)]">
        <span class="step-num">{{ i + 1 }}</span>
        {{ s.titulo }}
      </div>
    </div>

    <!-- Fila principal -->
    <div class="g-row g2">

      <!-- Fuentes de datos -->
      <div style="display:flex; flex-direction:column; gap:14px">
        <div class="card">
          <div class="card-title"><i class="ti ti-database"></i> Fuentes de datos</div>

          <div class="src-item" v-for="f in fuentes" :key="f.nombre">
            <div class="src-hd">
              <div>
                <div class="src-name">{{ f.nombre }}</div>
                <div class="src-sub">{{ f.desc }}</div>
              </div>
              <span :class="['status', f.cls]">{{ f.estado }}</span>
            </div>
            <div class="src-stats">
              <span><strong>{{ f.registros }}</strong> registros</span>
              <span>{{ f.fecha }}</span>
            </div>
          </div>
        </div>

        <!-- Normalización IVA -->
        <div class="card">
          <div class="card-title"><i class="ti ti-percentage"></i> Normalización de IVA</div>
          <p style="font-size:0.76rem; color:#888; margin-bottom:12px">
            Ventas con IVA se dividen entre 1.19. Se aplica antes de calcular comisiones.
          </p>
          <div v-for="n in normalizacion" :key="n.lbl" class="progress-wrap">
            <div class="progress-lbl">
              <span>{{ n.lbl }}</span>
              <span>{{ n.pct }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill g" :style="{ width: n.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle de liquidación -->
      <div style="display:flex; flex-direction:column; gap:14px">

        <!-- Comisión bancaria -->
        <div class="card">
          <div class="card-title"><i class="ti ti-building-bank"></i> Comisión bancaria</div>
          <p style="font-size:0.76rem; color:#888; margin-bottom:12px">
            Solo se descuenta del tipo de venta de mayor valor por colaborador por período.
          </p>
          <div class="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo de venta</th>
                  <th>Tasa</th>
                  <th>Aplica</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tiposVenta" :key="t.tipo">
                  <td>{{ t.tipo }}</td>
                  <td>{{ t.tasa }}</td>
                  <td>
                    <span :class="['status', t.aplica ? 's-active' : 's-closed']">
                      {{ t.aplica ? 'Sí' : 'No' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Log del proceso -->
        <div class="card">
          <div class="card-title"><i class="ti ti-terminal-2"></i> Log de proceso</div>
          <div v-if="logItems.length === 0" class="log-empty">
            <i class="ti ti-player-play" style="font-size:1.5rem; color:#dcdcdc"></i>
            <p>Inicia la liquidación para ver el log en tiempo real.</p>
          </div>
          <div v-else>
            <div v-for="l in logItems" :key="l.msg" class="audit-item">
              <div :class="['audit-dot', l.dot]"></div>
              <div class="audit-content">
                <div class="audit-text">{{ l.msg }}</div>
                <div class="audit-meta">{{ l.hora }}</div>
              </div>
            </div>
          </div>

          <!-- Acciones finales (solo al terminar) -->
          <div v-if="pasoActual >= pasos.length" class="fin-actions">
            <p class="fin-msg"><i class="ti ti-circle-check" style="color:#1a6644"></i> Liquidación completada</p>
            <div class="btn-group" style="margin-top:10px">
              <RouterLink to="/trazabilidad" class="btn sm"><i class="ti ti-file-analytics"></i> Ver resultados</RouterLink>
              <button class="btn sm ghost"><i class="ti ti-download"></i> Exportar Midasoft</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const pasos = ref([
  { titulo: 'Validar fuentes' },
  { titulo: 'Normalizar IVA' },
  { titulo: 'Calcular comisiones' },
  { titulo: 'Cerrar período' },
]);

const pasoActual = ref(0);
const logItems   = ref<{ msg: string; hora: string; dot: string }[]>([]);

function pasoClase(i: number) {
  if (i < pasoActual.value) return 'done';
  if (i === pasoActual.value && pasoActual.value > 0) return 'current';
  return '';
}

function agregarLog(msg: string, dot = 'info') {
  logItems.value.push({ msg, hora: new Date().toLocaleTimeString('es-CO'), dot });
}

function iniciarLiquidacion() {
  pasoActual.value = 1;
  logItems.value = [];
  agregarLog('Iniciando validación de fuentes ICG y Midasoft…', 'info');

  setTimeout(() => {
    agregarLog('✓ ICG: 17 ventas validadas — 0 errores', 'ok');
    agregarLog('✓ Midasoft: 20 colaboradores verificados', 'ok');
    pasoActual.value = 2;
    agregarLog('Aplicando normalización IVA (÷ 1.19) a ventas con IVA…', 'info');

    setTimeout(() => {
      agregarLog('✓ 12 ventas normalizadas sin IVA correctamente', 'ok');
      agregarLog('✓ 5 ventas exentas — sin modificación', 'ok');
      pasoActual.value = 3;
      agregarLog('Calculando comisiones por colaborador…', 'info');

      setTimeout(() => {
        agregarLog('✓ Comisiones calculadas para 20 colaboradores', 'ok');
        agregarLog('✓ Comisión bancaria descontada a tipo de mayor valor', 'ok');
        pasoActual.value = 4;
        agregarLog('Cerrando período JUN-2026 y generando archivo…', 'info');

        setTimeout(() => {
          agregarLog('✓ Período JUN-2026 marcado como Liquidado', 'ok');
          agregarLog('✓ Archivo Midasoft generado — listo para exportar', 'ok');
          pasoActual.value = pasos.value.length + 1;
        }, 1200);
      }, 1200);
    }, 1000);
  }, 900);
}

const fuentes = ref([
  {
    nombre:    'ICG — Sistema de ventas',
    desc:      'Ventas del período JUN-2026',
    estado:    'Disponible',
    cls:       's-active',
    registros: 17,
    fecha:     'Última sync: 25 jun 2026 08:00',
  },
  {
    nombre:    'Midasoft — Nómina',
    desc:      'Colaboradores y novedades',
    estado:    'Disponible',
    cls:       's-active',
    registros: 20,
    fecha:     'Última sync: 25 jun 2026 08:05',
  },
]);

const normalizacion = ref([
  { lbl: 'Ventas con IVA procesadas',    pct: 71 },
  { lbl: 'Ventas sin IVA (exentas)',     pct: 29 },
  { lbl: 'Com. bancaria aplicada',       pct: 100 },
]);

const tiposVenta = ref([
  { tipo: 'LÍNEA',             tasa: '0.8%',  aplica: false },
  { tipo: 'LÍNEA ESTRATEGIA',  tasa: '0.8%',  aplica: true  },
  { tipo: 'PROMOCIÓN',         tasa: '0.8%',  aplica: false },
]);
</script>

<style scoped>
.liq-view { display: flex; flex-direction: column; }

.src-item { padding: 10px 0; border-bottom: 1px solid #f4f4f4; }
.src-item:last-child { border-bottom: none; }
.src-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 5px; }
.src-name { font-size: 0.82rem; font-weight: 700; color: #111; }
.src-sub { font-size: 0.7rem; color: #aaa; }
.src-stats { display: flex; gap: 14px; font-size: 0.72rem; color: #888; }

.log-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 0; color: #ccc; font-size: 0.78rem; }
.fin-actions { margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f0f0; }
.fin-msg { font-size: 0.82rem; font-weight: 700; color: #1a6644; display: flex; align-items: center; gap: 6px; }
</style>
