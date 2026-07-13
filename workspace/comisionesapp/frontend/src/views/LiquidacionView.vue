<template>
  <div class="liq-view">

    <div class="page-hd">
      <h2>Liquidación automática</h2>
      <div class="btn-group">
        <button class="btn sm ghost" @click="cargarLiquidaciones" :disabled="cargando">
          <i class="ti ti-refresh"></i> Actualizar
        </button>
        <button
          class="btn sm"
          :disabled="!puedeIniciar || ejecutando"
          @click="iniciarLiquidacion"
        >
          <i class="ti ti-player-play"></i>
          {{ ejecutando ? 'Ejecutando…' : 'Iniciar liquidación' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="info-box danger">
      <i class="ti ti-alert-circle"></i> <span>{{ error }}</span>
    </div>

    <!-- Configuración de ejecución -->
    <div class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-settings"></i> Selección de período</div>
      <div class="form-row fc2">
        <div class="field">
          <label>Calendario</label>
          <select v-model="idCalendario" :disabled="cargando || ejecutando" @change="onCambioCalendario">
            <option value="">Seleccionar...</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">
              {{ c.nombre }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Período (estado Abierto)</label>
          <select v-model="idPeriodo" :disabled="cargando || ejecutando || !idCalendario">
            <option value="">Seleccionar...</option>
            <option v-for="p in periodosAbiertos" :key="p.idPeriodo" :value="p.idPeriodo">
              {{ p.codigo }} ({{ p.fechaInicio }} → {{ p.fechaFin }})
            </option>
          </select>
        </div>
      </div>

      <!-- Panel de validación previa -->
      <div v-if="elegibilidad" class="info-box" :class="elegibilidad.elegible ? 'blue' : 'danger'" style="margin-top:10px">
        <i :class="elegibilidad.elegible ? 'ti ti-info-circle' : 'ti ti-alert-circle'"></i>
        <span v-if="elegibilidad.elegible">
          Elegible para liquidación: período anterior cerrado ✓ · parametrización vigente ✓
        </span>
        <!-- Checklist real cuando NO es elegible: cada condición con su estado -->
        <span v-else>
          {{ elegibilidad.motivo }}
          <br />
          Período anterior cerrado: {{ elegibilidad.periodoAnteriorCerrado ? '✓' : '✗' }} ·
          Parametrización vigente: {{ elegibilidad.parametrizacionVigente ? '✓' : '✗' }}
        </span>
      </div>
    </div>

    <!-- Resultado de la última ejecución -->
    <div v-if="liquidacionActual" class="card" style="margin-bottom:14px">
      <div class="card-title">
        <i class="ti ti-check-circle"></i> Liquidación — {{ liquidacionActual.periodo?.codigo }}
        <span :class="['status', clsEstado(liquidacionActual.estado)]" style="margin-left:auto">
          {{ liquidacionActual.estado }}
        </span>
      </div>
      <div class="g-row g4">
        <div class="stat-card">
          <div class="stat-lbl">Colaboradores</div>
          <div class="stat-val">{{ liquidacionActual.totalColaboradores ?? '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Tiendas</div>
          <div class="stat-val">{{ liquidacionActual.totalTiendas ?? '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Comisión total</div>
          <div class="stat-val">{{ liquidacionActual.totalComision != null
            ? '$' + liquidacionActual.totalComision.toLocaleString('es-CO') : '—' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-lbl">Ejecutada por</div>
          <div class="stat-val" style="font-size:0.95rem">{{ liquidacionActual.usuarioEjecuta }}</div>
        </div>
      </div>
      <div class="btn-group" style="margin-top:10px">
        <button v-if="liquidacionActual.estado === 'LIQUIDADO'"
                class="btn sm"
                @click="cerrarLiquidacion">
          <i class="ti ti-lock"></i> Cerrar período
        </button>
        <span v-if="liquidacionActual.estado === 'CERRADO'" class="status s-ok">
          <i class="ti ti-lock"></i> Período cerrado
        </span>
      </div>
    </div>

    <!-- Historial de liquidaciones -->
    <div v-if="historial.length" class="card" style="margin-top:14px">
      <div class="card-title"><i class="ti ti-history"></i> Historial de liquidaciones</div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Estado</th>
              <th>Colaboradores</th>
              <th>Comisión</th>
              <th>Ejecutada por</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Archivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in historial" :key="l.idLiquidacion">
              <td style="font-weight:700">{{ l.periodo?.codigo }}</td>
              <td><span :class="['status', clsEstado(l.estado)]">{{ l.estado }}</span></td>
              <td>{{ l.totalColaboradores ?? '—' }}</td>
              <td>{{ l.totalComision != null ? '$' + l.totalComision.toLocaleString('es-CO') : '—' }}</td>
              <td>{{ l.usuarioEjecuta }}</td>
              <td style="font-size:0.85rem">{{ formatFecha(l.fechaInicio) }}</td>
              <td style="font-size:0.85rem">{{ l.fechaFin ? formatFecha(l.fechaFin) : '—' }}</td>
              <td>
                <button v-if="l.estado === 'LIQUIDADO' || l.estado === 'CERRADO'"
                        class="btn sm ghost"
                        title="Descargar archivo plano de nómina"
                        @click="descargarPlano(l)">
                  <i class="ti ti-download"></i> Plano
                </button>
                <span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  calendariosApi,
  periodosApi,
  liquidacionApi,
  type Calendario,
  type Periodo,
  type Liquidacion,
  type Elegibilidad,
  obtenerMensajeError,
} from '@/services/api';
import { clsEstado, formatearFecha as formatFecha } from '@/utils/formato';

const cargando     = ref(false);
const ejecutando   = ref(false);
const error        = ref('');

const calendarios   = ref<Calendario[]>([]);
const periodos     = ref<Periodo[]>([]);
const idCalendario = ref('');
const idPeriodo    = ref('');
const elegibilidad = ref<Elegibilidad | null>(null);

const historial = ref<Liquidacion[]>([]);
const liquidacionActual = ref<Liquidacion | null>(null);

const periodosAbiertos = computed(() =>
  periodos.value.filter((p) => p.estadoOperativo === 'Abierto'),
);

const puedeIniciar = computed(() =>
  !!idPeriodo.value && elegibilidad.value?.elegible === true && !ejecutando.value,
);

async function cargarCalendariosYPeriodos() {
  cargando.value = true;
  error.value = '';
  try {
    calendarios.value = await calendariosApi.getAll();
    if (calendarios.value.length && !idCalendario.value) {
      idCalendario.value = calendarios.value[0].idCalendario;
    }
    if (idCalendario.value) {
      await cargarPeriodos();
    }
  } catch {
    error.value = 'Error al cargar calendarios. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
}

async function cargarPeriodos() {
  if (!idCalendario.value) return;
  try {
    periodos.value = await periodosApi.getByCalendario(idCalendario.value);
    idPeriodo.value = '';
    elegibilidad.value = null;
  } catch {
    error.value = 'Error al cargar períodos.';
  }
}

async function onCambioCalendario() {
  await cargarPeriodos();
}

async function verificarElegibilidad() {
  if (!idPeriodo.value) {
    elegibilidad.value = null;
    return;
  }
  try {
    elegibilidad.value = await liquidacionApi.elegibilidad(idPeriodo.value);
  } catch (e: unknown) {
    elegibilidad.value = {
      elegible: false,
      motivo: obtenerMensajeError(e, 'Error al verificar elegibilidad.'),
      periodoAnteriorCerrado: false,
      parametrizacionVigente: false,
    };
  }
}

watch(idPeriodo, verificarElegibilidad);

async function iniciarLiquidacion() {
  if (!puedeIniciar.value) return;
  if (!confirm(
    `¿Iniciar la liquidación del período seleccionado?\n` +
    'Esta operación consume las fuentes externas y no se puede deshacer hasta que se ejecute de nuevo.',
  )) return;
  ejecutando.value = true;
  error.value = '';
  try {
    const resultado = await liquidacionApi.ejecutar(idPeriodo.value);
    liquidacionActual.value = resultado;
    await cargarLiquidaciones();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al ejecutar la liquidación.');
  } finally {
    ejecutando.value = false;
  }
}

async function cerrarLiquidacion() {
  if (!liquidacionActual.value) return;
  if (!confirm('¿Cerrar el período? Esta acción es irreversible.')) return;
  try {
    const liq = await liquidacionApi.cerrar(liquidacionActual.value.idLiquidacion);
    liquidacionActual.value = liq;
    await cargarCalendariosYPeriodos();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al cerrar.');
  }
}

async function cargarLiquidaciones() {
  try {
    historial.value = await liquidacionApi.getAll();
  } catch {
    /* no fatal */
  }
}

/** Descarga el archivo plano de nómina de la liquidación (HU-03). */
async function descargarPlano(l: Liquidacion) {
  error.value = '';
  try {
    const respuesta = await liquidacionApi.descargarArchivo(l.idLiquidacion);
    const url = URL.createObjectURL(new Blob([respuesta.data], { type: 'text/plain' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `plano_${l.periodo?.codigo ?? l.idLiquidacion}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'No fue posible descargar el archivo plano.');
  }
}

onMounted(async () => {
  await cargarCalendariosYPeriodos();
  await cargarLiquidaciones();
});
</script>

<!-- Estilos: design system global en src/assets/main.css -->
