<template>
  <div class="datos-view">

    <div class="page-hd">
      <h2>Datos de origen (solo consulta)</h2>
      <div class="btn-group">
        <button class="btn sm" :disabled="cargando" @click="consultar">
          <i class="ti ti-database-search"></i> {{ cargando ? 'Consultando…' : 'Consultar' }}
        </button>
      </div>
    </div>

    <div class="info-box blue">
      <i class="ti ti-info-circle"></i>
      <span>
        Consulta directa a las fuentes externas en modo <strong>solo lectura</strong>:
        ventas/comisiones POS desde <strong>INDICADORES (ICG)</strong> y base de empleados
        desde <strong>Midasoft</strong>. Son los mismos datos que consumirá el motor de liquidación.
      </span>
    </div>

    <div v-if="error" class="info-box danger">
      <i class="ti ti-alert-circle"></i> <span>{{ error }}</span>
    </div>

    <!-- Selector de fuente y parámetros -->
    <div class="card" style="margin-bottom:14px">
      <div class="cal-tabs" style="margin-bottom:12px">
        <button
          v-for="f in fuentes"
          :key="f.id"
          :class="['cal-tab', { active: fuente === f.id }]"
          @click="cambiarFuente(f.id)"
        >
          <i :class="'ti ' + f.icono"></i> {{ f.nombre }}
        </button>
      </div>

      <div v-if="usaFechas" class="form-row fc3" style="margin-bottom:0">
        <div class="field">
          <label>Fecha inicial</label>
          <input v-model="fechaInicial" type="date" />
        </div>
        <div class="field">
          <label>Fecha final</label>
          <input v-model="fechaFinal" type="date" />
        </div>
        <div class="field">
          <label>Buscar en resultados</label>
          <input v-model="busqueda" type="text" placeholder="Filtrar filas..." />
        </div>
      </div>
      <div v-else class="form-row fc3" style="margin-bottom:0">
        <div class="field">
          <label>Buscar en resultados</label>
          <input v-model="busqueda" type="text" placeholder="Filtrar filas..." />
        </div>
      </div>
    </div>

    <!-- Tabla de resultados -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-table"></i> {{ fuenteActual?.nombre }}</span>
        <span class="tag">
          {{ cargando ? 'Consultando…' : filasFiltradas.length + ' filas' + (filas.length > LIMITE ? ' (mostrando ' + LIMITE + ')' : '') }}
        </span>
      </div>

      <div v-if="!consultado && !cargando" style="text-align:center; color:#aaa; padding:26px; font-size:0.82rem">
        <i class="ti ti-database" style="font-size:1.6rem; display:block; margin-bottom:6px"></i>
        Selecciona la fuente{{ usaFechas ? ' y el rango de fechas' : '' }} y presiona <strong>Consultar</strong>.
      </div>

      <div v-else class="tbl-wrap" style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th v-for="c in columnas" :key="c">{{ c }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filasFiltradas.length && !cargando">
              <td :colspan="columnas.length || 1" style="text-align:center; color:#aaa; padding:18px">
                Sin resultados para los criterios seleccionados
              </td>
            </tr>
            <tr v-for="(fila, i) in filasVisibles" :key="i">
              <td v-for="c in columnas" :key="c">{{ formatear(fila[c]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { integracionesApi, obtenerMensajeError, type FilaDatos } from '@/services/api';

type FuenteId = 'resumen' | 'detalle' | 'empleados';

const fuentes: Array<{ id: FuenteId; nombre: string; icono: string }> = [
  { id: 'resumen',   nombre: 'Comisiones resumen (ICG)', icono: 'ti-report-analytics' },
  { id: 'detalle',   nombre: 'Comisiones detalle (ICG)', icono: 'ti-list-details' },
  { id: 'empleados', nombre: 'Empleados (Midasoft)',     icono: 'ti-users' },
];

const LIMITE = 300;

const fuente       = ref<FuenteId>('resumen');
const fechaInicial = ref('');
const fechaFinal   = ref('');
const busqueda     = ref('');
const cargando     = ref(false);
const consultado   = ref(false);
const error        = ref('');
const filas        = ref<FilaDatos[]>([]);

const fuenteActual = computed(() => fuentes.find(f => f.id === fuente.value));
const usaFechas    = computed(() => fuente.value !== 'empleados');

const columnas = computed(() => {
  const cols = new Set<string>();
  for (const f of filas.value.slice(0, 50)) Object.keys(f).forEach(k => cols.add(k));
  return [...cols];
});

const filasFiltradas = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return filas.value;
  return filas.value.filter(f =>
    Object.values(f).some(v => String(v ?? '').toLowerCase().includes(q)),
  );
});

const filasVisibles = computed(() => filasFiltradas.value.slice(0, LIMITE));

function cambiarFuente(id: FuenteId) {
  fuente.value = id;
  filas.value = [];
  consultado.value = false;
  error.value = '';
}

async function consultar() {
  error.value = '';
  if (usaFechas.value && (!fechaInicial.value || !fechaFinal.value)) {
    error.value = 'Selecciona fecha inicial y fecha final.';
    return;
  }
  cargando.value = true;
  filas.value = [];
  try {
    if (fuente.value === 'detalle') {
      filas.value = await integracionesApi.comisionesDetalle(fechaInicial.value, fechaFinal.value);
    } else if (fuente.value === 'resumen') {
      filas.value = await integracionesApi.comisionesResumen(fechaInicial.value, fechaFinal.value);
    } else {
      const data = await integracionesApi.empleados();
      // El API puede devolver arreglo directo o envuelto en una propiedad
      filas.value = Array.isArray(data) ? data : (data.data ?? data.empleados ?? []);
    }
    consultado.value = true;
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error consultando la fuente de datos.');
  } finally {
    cargando.value = false;
  }
}

function formatear(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') return v.toLocaleString('es-CO');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
</script>

<style scoped>
.datos-view { display: flex; flex-direction: column; }
.cal-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.cal-tab {
  display: flex; align-items: center; gap: 6px;
  background: #f5f5f5; border: 1px solid #dcdcdc;
  border-radius: 8px; padding: 6px 14px;
  font-size: 0.8rem; font-weight: 600; color: #666;
  cursor: pointer; font-family: inherit; transition: all 0.12s;
}
.cal-tab:hover { border-color: #999; color: #111; }
.cal-tab.active { background: #111; color: #fff; border-color: #111; }
.info-box.danger { background: #fff0f0; border-color: #f5c6c6; color: #b91c1c; }
</style>
