<template>
  <div class="traz-view">

    <div class="page-hd">
      <h2>Trazabilidad y salida</h2>
      <div class="btn-group">
        <button class="btn sm ghost" @click="consultar" :disabled="cargando">
          <i class="ti ti-refresh"></i> Consultar
        </button>
        <button
          v-if="liquidacionDetalle"
          class="btn sm"
          :disabled="cargando"
          @click="exportarCsv"
        >
          <i class="ti ti-download"></i> Exportar CSV
        </button>
      </div>
    </div>

    <div v-if="error" class="info-box danger">
      <i class="ti ti-alert-circle"></i> <span>{{ error }}</span>
    </div>

    <div class="info-box">
      <i class="ti ti-lock"></i>
      <span>Consulta de <strong>solo lectura</strong> de las liquidaciones ya realizadas.</span>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-filter"></i> Filtros</div>
      <div class="form-row fc3">
        <div class="field">
          <label>Calendario</label>
          <select v-model="filtros.idCalendario" :disabled="cargando" @change="onFiltroCalendario">
            <option value="">Todos</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">
              {{ c.nombre }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Período</label>
          <select v-model="filtros.idPeriodo" :disabled="cargando || !filtros.idCalendario">
            <option value="">Todos</option>
            <option v-for="p in periodosFiltro" :key="p.idPeriodo" :value="p.idPeriodo">
              {{ p.codigo }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Tipo liquidación</label>
          <select v-model="filtros.tipoLiquidacion" :disabled="cargando">
            <option value="">Todos</option>
            <option value="Individual">Individual</option>
            <option value="GlobalTienda">Global Tienda</option>
            <option value="GlobalGrupoTiendas">Global Grupo</option>
          </select>
        </div>
      </div>
      <div class="form-row fc3">
        <div class="field">
          <label>Cargo (código)</label>
          <input v-model="filtros.codigoOficio" :disabled="cargando" />
        </div>
        <div class="field">
          <label>Comisión mínima</label>
          <input v-model.number="filtros.comisionMin" type="number" min="0" :disabled="cargando" />
        </div>
        <div class="field">
          <label>Comisión máxima</label>
          <input v-model.number="filtros.comisionMax" type="number" min="0" :disabled="cargando" />
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="card" style="margin-bottom:14px">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-list-details"></i> Resumen de liquidaciones</span>
        <span class="tag">{{ cargando ? 'Consultando…' : resumen.length + ' liquidaciones' }}</span>
      </div>

      <div v-if="!cargando && !resumen.length" class="empty-state">
        <i class="ti ti-database-off" style="font-size:2rem; color:#ccc; display:block; margin-bottom:8px"></i>
        <p>No hay liquidaciones que coincidan con los filtros aplicados.</p>
        <p style="font-size:0.85rem">Las liquidaciones en estado <strong>LIQUIDADO</strong> o <strong>CERRADO</strong> aparecerán aquí.</p>
      </div>

      <div v-else class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Estado</th>
              <th>Colaboradores</th>
              <th>Tiendas</th>
              <th>Comisión total</th>
              <th>Inicio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in resumen" :key="r.idLiquidacion">
              <td style="font-weight:700">{{ r.periodoCodigo }}</td>
              <td><span :class="['status', clsEstado(r.estado)]">{{ r.estado }}</span></td>
              <td>{{ r.totalColaboradores }}</td>
              <td>{{ r.totalTiendas }}</td>
              <td style="font-weight:700">${{ r.totalComision.toLocaleString('es-CO') }}</td>
              <td style="font-size:0.85rem">{{ formatFecha(r.fechaInicio) }}</td>
              <td>
                <button class="btn sm ghost" @click="cargarDetalle(r.idLiquidacion)">
                  <i class="ti ti-eye"></i> Ver colaboradores
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detalle por colaboradores -->
    <div v-if="liquidacionDetalle" class="card" style="margin-bottom:14px">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-building-store"></i> Detalle por colaboradores — {{ liquidacionDetalle.periodoCodigo }}</span>
        <button class="btn sm ghost" @click="liquidacionDetalle = null">
          <i class="ti ti-x"></i> Cerrar
        </button>
      </div>

      <div v-if="!colaboradoresDetalle.length" class="empty-state">
        <p>Esta liquidación no tiene colaboradores asociados.</p>
      </div>

      <div v-else class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Tienda</th>
              <th>Venta bruta</th>
              <th>Sin IVA</th>
              <th>Com. bancaria</th>
              <th>Venta neta</th>
              <th>%</th>
              <th>Comisión</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="c in colaboradoresDetalle" :key="c.idColaborador">
              <tr class="row-tienda" @click="toggleDrillDown(c.idColaborador)">
                <td style="font-weight:700">
                  <i :class="['ti', expandidos.has(c.idColaborador) ? 'ti-chevron-down' : 'ti-chevron-right']" style="margin-right:6px"></i>
                  {{ c.idColaborador }}
                </td>
                <td>{{ c.idCargo }}</td>
                <td>{{ c.codigoTienda ?? c.idTienda ?? '—' }}</td>
                <td>{{ fmt(c.base.ventaBruta) }}</td>
                <td>{{ fmt(c.base.ventaSinIva) }}</td>
                <td>{{ fmt(c.base.comisionBancaria) }}</td>
                <td>{{ fmt(c.base.ventaNeta) }}</td>
                <td>{{ c.base.porcentajeAplicado }}%</td>
                <td style="font-weight:700; color:#1a6644">{{ fmt(c.base.comision) }}</td>
              </tr>
              <tr v-if="expandidos.has(c.idColaborador)" class="row-colaborador">
                <td colspan="9" style="background:var(--surface-2); padding:12px 16px">
                  <div class="g-row g3" style="margin-bottom:8px">
                    <div>
                      <strong>Subperíodo:</strong> {{ c.afectacion.fechaInicioSub }} → {{ c.afectacion.fechaFinSub }}
                      <span class="tag" style="margin-left:6px">{{ c.afectacion.motivo }}</span>
                    </div>
                    <div>
                      <strong>Días laborados:</strong> {{ c.base.diasLaborados ?? '—' }}
                      <strong style="margin-left:12px">Días excluidos:</strong> {{ c.base.diasExcluidos ?? '—' }}
                      <span v-if="c.base.motivoExclusion" class="status s-err" style="margin-left:6px">
                        {{ c.base.motivoExclusion }}
                      </span>
                    </div>
                    <div>
                      <strong>Parametrización:</strong>
                      <span v-if="c.parametrizacion">
                        {{ c.parametrizacion.tipoLiquidacion }} · {{ c.parametrizacion.tipoDistribucion }}
                        — Línea {{ c.parametrizacion.porcLinea }}% / Prom {{ c.parametrizacion.porcPromocion }}%
                        <span v-if="c.parametrizacion.estrategiaTipoDescuento">
                          · Estrategia: {{ c.parametrizacion.estrategiaTipoDescuento }}
                          <span v-if="c.parametrizacion.estrategiaPorcDescuentoCorporativo">
                            (-{{ c.parametrizacion.estrategiaPorcDescuentoCorporativo }}%)
                          </span>
                        </span>
                      </span>
                      <span v-else class="tag">Sin snapshot</span>
                    </div>
                  </div>
                  <table style="font-size:0.78rem">
                    <thead>
                      <tr>
                        <th>Tipo venta</th>
                        <th>Venta bruta</th>
                        <th>Sin IVA</th>
                        <th>Com. bancaria</th>
                        <th>Venta neta</th>
                        <th>%</th>
                        <th>Comisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="d in c.desglose" :key="d.tipoVenta">
                        <td>{{ d.tipoVenta }}</td>
                        <td>{{ fmt(d.ventaBruta) }}</td>
                        <td>{{ fmt(d.ventaSinIva) }}</td>
                        <td>{{ fmt(d.comisionBancaria) }}</td>
                        <td>{{ fmt(d.ventaNeta) }}</td>
                        <td>{{ d.porcentajeAplicado }}%</td>
                        <td>{{ fmt(d.comision) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  calendariosApi,
  periodosApi,
  trazabilidadApi,
  type Calendario,
  type Periodo,
  type ResumenTrazabilidad,
  type DetalleTrazabilidad,
  type FiltrosTrazabilidad,
  obtenerMensajeError,
} from '@/services/api';
import {
  clsEstado,
  formatearFecha as formatFecha,
  formatearMoneda as fmt,
} from '@/utils/formato';

const cargando  = ref(false);
const error     = ref('');

const calendarios    = ref<Calendario[]>([]);
const periodosFiltro = ref<Periodo[]>([]);
const resumen        = ref<ResumenTrazabilidad[]>([]);
const liquidacionDetalle    = ref<ResumenTrazabilidad | null>(null);
const colaboradoresDetalle  = ref<DetalleTrazabilidad[]>([]);
const expandidos           = ref(new Set<string>());

const filtros = ref<FiltrosTrazabilidad>({
  idCalendario: '',
  idPeriodo: '',
  codigoOficio: '',
  tipoLiquidacion: undefined,
  comisionMin: undefined,
  comisionMax: undefined,
});

async function exportarCsv() {
  if (!liquidacionDetalle.value) return;
  try {
    await trazabilidadApi.exportarCsv(liquidacionDetalle.value.idLiquidacion);
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al exportar el CSV.');
  }
}

async function cargarCalendariosYPeriodos() {
  try {
    calendarios.value = await calendariosApi.getAll();
  } catch {
    /* silencioso */
  }
}

async function onFiltroCalendario() {
  filtros.value.idPeriodo = '';
  if (filtros.value.idCalendario) {
    try {
      periodosFiltro.value = await periodosApi.getByCalendario(filtros.value.idCalendario);
    } catch {
      periodosFiltro.value = [];
    }
  } else {
    periodosFiltro.value = [];
  }
}

async function consultar() {
  cargando.value = true;
  error.value = '';
  try {
    const dto: FiltrosTrazabilidad = {};
    for (const [k, v] of Object.entries(filtros.value)) {
      if (v !== '' && v != null) (dto as any)[k] = v;
    }
    resumen.value = await trazabilidadApi.resumen(dto);
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al consultar.');
    resumen.value = [];
  } finally {
    cargando.value = false;
  }
}

async function cargarDetalle(idLiquidacion: string) {
  cargando.value = true;
  error.value = '';
  try {
    const r = resumen.value.find((x) => x.idLiquidacion === idLiquidacion);
    if (!r) return;
    liquidacionDetalle.value = r;
    colaboradoresDetalle.value = [];

    // Los IDs llegan en una llamada batch; el detalle de cada colaborador
    // aún es una petición individual (tolerante a fallos con allSettled).
    const ids = await trazabilidadApi.colaboradores(idLiquidacion);
    if (!ids.length) {
      cargando.value = false;
      return;
    }
    const detalles: DetalleTrazabilidad[] = [];
    // Promise.all con manejo tolerante de fallos individuales
    const results = await Promise.allSettled(
      ids.map((id) => trazabilidadApi.detalle(idLiquidacion, id)),
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) detalles.push(r.value);
    }
    colaboradoresDetalle.value = detalles;
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al cargar detalle.');
  } finally {
    cargando.value = false;
  }
}

function toggleDrillDown(id: string) {
  if (expandidos.value.has(id)) expandidos.value.delete(id);
  else expandidos.value.add(id);
}

onMounted(async () => {
  await cargarCalendariosYPeriodos();
  await consultar();
});
</script>

<!-- Estilos: design system global en src/assets/main.css -->
