<template>
  <div class="dash">

    <!-- Stat cards -->
    <div class="g-row g4" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-calendar-event"></i> Períodos abiertos</div>
        <div class="stat-val">7</div>
        <div class="stat-sub">1 en curso · 6 pendientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-users"></i> Colaboradores activos</div>
        <div class="stat-val">20</div>
        <div class="stat-sub">Registrados en sistema</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-check-circle"></i> Períodos liquidados</div>
        <div class="stat-val">5</div>
        <div class="stat-sub">ENE – MAY 2026</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-currency-dollar"></i> Comisiones brutas</div>
        <div class="stat-val">$—</div>
        <div class="stat-sub">Período en curso sin liquidar</div>
      </div>
    </div>

    <!-- Main row: tabla + actividad -->
    <div class="g-row g-14-10">

      <div class="card">
        <div class="card-title">
          <i class="ti ti-calendar-stats"></i> Períodos — Comisiones 2026
        </div>
        <div class="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in periodos" :key="p.codigo">
                <td style="font-weight:700">{{ p.codigo }}</td>
                <td style="color:#777">{{ p.fechas }}</td>
                <td><span :class="['status', p.cls]">{{ p.estado }}</span></td>
                <td>
                  <RouterLink
                    v-if="p.estado !== 'Abierto'"
                    to="/trazabilidad"
                    class="btn sm ghost"
                  >Ver</RouterLink>
                  <span v-else style="color:#ccc;font-size:0.76rem">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <i class="ti ti-activity"></i> Actividad reciente
        </div>
        <div>
          <div v-for="a in actividad" :key="a.msg" class="audit-item">
            <div :class="['audit-dot', a.dot]"></div>
            <div class="audit-content">
              <div class="audit-text">{{ a.msg }}</div>
              <div class="audit-meta">{{ a.meta }}</div>
            </div>
          </div>
        </div>

        <!-- Accesos rápidos -->
        <div class="quick-links">
          <RouterLink to="/calendarios" class="btn sm ghost"><i class="ti ti-calendar-plus"></i> Nuevo período</RouterLink>
          <RouterLink to="/liquidacion" class="btn sm"><i class="ti ti-calculator"></i> Liquidar</RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const periodos = ref([
  { codigo: 'ENE-2026', fechas: '21 dic – 20 ene', estado: 'Cerrado',  cls: 's-closed' },
  { codigo: 'FEB-2026', fechas: '21 ene – 20 feb', estado: 'Cerrado',  cls: 's-closed' },
  { codigo: 'MAR-2026', fechas: '21 feb – 20 mar', estado: 'Cerrado',  cls: 's-closed' },
  { codigo: 'ABR-2026', fechas: '21 mar – 20 abr', estado: 'Cerrado',  cls: 's-closed' },
  { codigo: 'MAY-2026', fechas: '21 abr – 20 may', estado: 'Cerrado',  cls: 's-closed' },
  { codigo: 'JUN-2026', fechas: '21 may – 20 jun', estado: 'En curso', cls: 's-active' },
  { codigo: 'JUL-2026', fechas: '21 jun – 20 jul', estado: 'Abierto',  cls: 's-open'   },
  { codigo: 'AGO-2026', fechas: '21 jul – 20 ago', estado: 'Abierto',  cls: 's-open'   },
  { codigo: 'SEP-2026', fechas: '21 ago – 20 sep', estado: 'Abierto',  cls: 's-open'   },
  { codigo: 'OCT-2026', fechas: '21 sep – 20 oct', estado: 'Abierto',  cls: 's-open'   },
  { codigo: 'NOV-2026', fechas: '21 oct – 20 nov', estado: 'Abierto',  cls: 's-open'   },
  { codigo: 'DIC-2026', fechas: '21 nov – 20 dic', estado: 'Abierto',  cls: 's-open'   },
]);

const actividad = ref([
  { msg: 'Período MAY-2026 cerrado y liquidado correctamente',             meta: '25 jun 2026 · 09:14 · admin@permoda.com',  dot: 'ok'   },
  { msg: 'Seed ejecutado — 20 colaboradores, 17 ventas de prueba',         meta: '25 jun 2026 · 08:50 · sistema',             dot: 'info' },
  { msg: 'JUN-2026 marcado como En Curso automáticamente',                 meta: '21 may 2026 · 00:01 · sistema',             dot: 'ok'   },
  { msg: 'Parametrización actualizada — cargo Vendedor, comisión 2%',      meta: '15 may 2026 · 11:22 · admin@permoda.com',  dot: 'info' },
  { msg: 'Calendario "Comisiones 2026" creado con 12 períodos',            meta: '2 ene 2026 · 10:00 · admin@permoda.com',   dot: 'ok'   },
]);
</script>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 0; }
.quick-links { display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0f0f0; }
</style>
