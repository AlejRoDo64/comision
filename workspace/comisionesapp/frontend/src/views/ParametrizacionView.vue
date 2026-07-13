<template>
  <div class="param-view">

    <div class="page-hd">
      <h2>Parametrización de cargos</h2>
      <div class="btn-group">
        <button class="btn sm ghost" @click="cargarTodo"><i class="ti ti-refresh"></i> Actualizar</button>
        <button class="btn sm" @click="abrirNueva">
          <i class="ti ti-plus"></i> Nueva parametrización
        </button>
      </div>
    </div>

    <div v-if="error" class="info-box danger">
      <i class="ti ti-alert-circle"></i> <span>{{ error }}</span>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-filter"></i> Filtros</div>
      <div class="form-row fc3">
        <div class="field">
          <label>Calendario</label>
          <select v-model="filtroCalendario" @change="onFiltroCalendario">
            <option value="">Todos</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label>Período</label>
          <select v-model="filtroPeriodo" @change="cargarParametrizaciones">
            <option value="">Todos</option>
            <option v-for="p in periodosFiltro" :key="p.idPeriodo" :value="p.idPeriodo">{{ p.codigo }}</option>
          </select>
        </div>
        <div class="field">
          <label>Cargo</label>
          <select v-model="filtroCargo" @change="cargarParametrizaciones">
            <option value="">Todos</option>
            <option v-for="c in cargos" :key="c.codigo" :value="c.codigo">{{ c.codigo }} — {{ c.nombre }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Formulario crear / editar -->
    <div v-if="mostrarForm" class="card" style="margin-bottom:14px">
      <div class="card-title">
        <i class="ti ti-settings-2"></i>
        {{ editandoId ? 'Editar parametrización' : 'Nueva parametrización' }}
      </div>
      <p class="field-ayuda" style="margin:0 0 12px">Los campos marcados con * son obligatorios.</p>

      <!-- HU-02 (ajuste): primero la tienda; el cargo se vincula por su
           centro de costo, recuperado del API de empleados Midasoft -->
      <div class="form-row fc2">
        <div class="field">
          <label>Tienda *</label>
          <select v-model="formTienda" @change="onTiendaSeleccionada">
            <option value="">Seleccionar tienda...</option>
            <option v-for="t in tiendasCcosto" :key="t.ccosto" :value="t.ccosto">
              {{ t.ccosto }} — {{ t.nombre }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Cargo *</label>
          <select
            v-model="form.codigoOficio"
            :disabled="!formTienda && !editandoId"
            @change="onCargoSeleccionado"
          >
            <option value="">
              {{ formTienda || editandoId ? 'Seleccionar...' : 'Seleccione primero la tienda' }}
            </option>
            <option v-for="c in cargosDisponibles" :key="c.codigo" :value="c.codigo">
              {{ c.codigo }} — {{ c.nombre }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-row fc2">
        <div class="field">
          <label>Calendario *</label>
          <select v-model="formCalendario" @change="onFormCalendario">
            <option value="">Seleccionar...</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label>Período de vigencia *</label>
          <select v-model="form.idPeriodo" @change="onPeriodoSeleccionado">
            <option value="">Seleccionar...</option>
            <option v-for="p in periodosForm" :key="p.idPeriodo" :value="p.idPeriodo">{{ p.codigo }}</option>
          </select>
        </div>
      </div>

      <div class="form-row fc3">
        <div class="field">
          <label>Tipo de liquidación *</label>
          <select v-model="form.tipoLiquidacion">
            <option value="Individual">Individual por colaborador</option>
            <option value="GlobalTienda">Global por tienda</option>
            <option value="GlobalGrupoTiendas">Global por grupo de tiendas</option>
          </select>
        </div>
        <div class="field">
          <label>Tipo de distribución *</label>
          <select v-model="form.tipoDistribucion">
            <option value="Individual">Individual</option>
            <option value="Proporcional" :disabled="form.tipoLiquidacion === 'Individual'">
              Proporcional entre colaboradores del cargo
            </option>
          </select>
        </div>
        <div class="field">
          <label>Afectación (excluyente) *</label>
          <select v-model="form.tipoAfectacion">
            <option value="NovedadesDiarias">Novedades diarias</option>
            <option value="HorasLaboradas">Horas laboradas</option>
          </select>
        </div>
      </div>

      <div class="form-row fc3">
        <div class="field">
          <label>% Línea *</label>
          <input v-model.number="form.porcLinea" type="number" min="0" step="0.0001" />
        </div>
        <div class="field">
          <label>% Promoción *</label>
          <input v-model.number="form.porcPromocion" type="number" min="0" step="0.0001" />
        </div>
        <div class="field">
          <label>% Línea Estrategia *</label>
          <input v-model.number="form.porcEstrategia" type="number" min="0" step="0.0001" />
        </div>
      </div>

      <!-- Estrategia: tipo de descuento (HU-02) -->
      <div class="card-title" style="margin-top:14px"><i class="ti ti-percentage"></i> Descuento Línea Estrategia</div>
      <div class="form-row fc3">
        <div class="field">
          <label>Origen del descuento</label>
          <select v-model="form.estrategiaTipoDescuento">
            <option value="">— Sin descuento —</option>
            <option value="CORPORATIVO">Corporativo (% fijo de la compañía)</option>
            <option value="REAL">Real (% del descuento aplicado en la venta)</option>
          </select>
        </div>
        <div class="field">
          <label>% Descuento corporativo</label>
          <input
            v-model.number="form.estrategiaPorcDescuentoCorporativo"
            type="number"
            min="0"
            step="0.0001"
            :disabled="form.estrategiaTipoDescuento !== 'CORPORATIVO'"
          />
        </div>
        <div class="field">
          <label>% Estrategia efectivo</label>
          <input
            :value="porcEstrategiaEfectivo"
            type="text"
            disabled
            :title="form.estrategiaTipoDescuento === 'CORPORATIVO' ? 'Línea - descuento corporativo' : 'Valor capturado'"
          />
        </div>
      </div>

      <!-- Vigencia desde-hasta (HU-02) -->
      <div class="card-title" style="margin-top:14px"><i class="ti ti-calendar"></i> Vigencia de la parametrización</div>
      <div class="form-row fc2">
        <div class="field">
          <label>Desde</label>
          <input v-model="form.vigenciaDesde" type="date" />
        </div>
        <div class="field">
          <label>Hasta (opcional)</label>
          <input v-model="form.vigenciaHasta" type="date" />
        </div>
      </div>

      <!-- Tablas auxiliares: presupuesto y crecimiento (solo lectura al editar) -->
      <div v-if="editandoId" class="card" style="background:var(--surface-2); margin-top:14px">
        <div class="card-title"><i class="ti ti-table"></i> Tablas de presupuesto y crecimiento (referencia)</div>

        <div class="card-title" style="font-size:0.78rem; margin-top:6px">
          <i class="ti ti-currency-dollar"></i> Presupuestos ({{ presupuestoMostrado.length }})
        </div>
        <div v-if="presupuestoMostrado.length" class="tbl-wrap" style="max-height:180px; overflow:auto">
          <table>
            <thead>
              <tr><th>Tienda</th><th>Tipo</th><th>Valor (COP)</th></tr>
            </thead>
            <tbody>
              <tr v-for="x in presupuestoMostrado" :key="x.idPresupuesto">
                <td>{{ x.tienda?.codigo ?? 'Global' }}</td>
                <td>{{ x.tipo }}</td>
                <td style="text-align:right">{{ formatearMoneda(x.valor) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else style="font-size:0.76rem; color:#888; margin:6px 0 0">
          Sin presupuestos registrados para este (cargo, período).
        </p>

        <div class="card-title" style="font-size:0.78rem; margin-top:12px">
          <i class="ti ti-percentage"></i> Rangos por cumplimiento de presupuesto ({{ presupuestoRangosMostrados.length }})
        </div>
        <div v-if="presupuestoRangosMostrados.length" class="tbl-wrap" style="max-height:160px; overflow:auto">
          <table>
            <thead>
              <tr><th>Desde (%)</th><th>Hasta (%)</th><th>% Línea</th><th>% Prom.</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in presupuestoRangosMostrados" :key="r.idRango">
                <td>{{ r.desdePorc }}</td>
                <td>{{ r.hastaPorc ?? 'Sin límite' }}</td>
                <td>{{ r.porcLinea }}</td>
                <td>{{ r.porcPromocion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else style="font-size:0.76rem; color:#888; margin:6px 0 0">
          Sin rangos de presupuesto registrados. Solicite su carga al equipo de Comisiones.
        </p>

        <div class="card-title" style="font-size:0.78rem; margin-top:12px">
          <i class="ti ti-trending-up"></i> Rangos por crecimiento ({{ crecimientoMostrado.length }})
        </div>
        <div v-if="crecimientoMostrado.length" class="tbl-wrap" style="max-height:160px; overflow:auto">
          <table>
            <thead>
              <tr><th>Desde (%)</th><th>Hasta (%)</th><th>% Línea</th><th>% Prom.</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in crecimientoMostrado" :key="r.idRango">
                <td>{{ r.desdePorcCrec }}</td>
                <td>{{ r.hastaPorcCrec ?? 'Sin límite' }}</td>
                <td>{{ r.porcLinea }}</td>
                <td>{{ r.porcPromocion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else style="font-size:0.76rem; color:#888; margin:6px 0 0">
          Sin rangos de crecimiento registrados. Solicite su carga al equipo de Comisiones.
        </p>
      </div>

      <div class="toggle-row">
        <div :class="['tog', { on: form.validarPresupuesto }]" @click="form.validarPresupuesto = !form.validarPresupuesto"></div>
        <span class="tog-lbl">Validar <strong>cumplimiento de presupuesto</strong></span>
      </div>
      <div class="toggle-row">
        <div :class="['tog', { on: form.validarCrecimiento }]" @click="form.validarCrecimiento = !form.validarCrecimiento"></div>
        <span class="tog-lbl">Validar <strong>crecimiento de ventas</strong></span>
      </div>

      <!-- Rangos -->
      <div class="card-title" style="margin-top:14px"><i class="ti ti-table"></i> Rangos de comisión por cumplimiento</div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr><th>Desde (%)</th><th>Hasta (%)</th><th>Comisión (%)</th><th style="width:50px"></th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in form.rangos" :key="i">
              <td><input v-model.number="r.desdePorc" type="number" min="0" step="0.01" class="inp-sm" /></td>
              <td><input v-model="r.hastaRaw" type="number" min="0" step="0.01" class="inp-sm" /></td>
              <td><input v-model.number="r.comisionPorc" type="number" min="0" step="0.0001" class="inp-sm" /></td>
              <td>
                <button class="btn sm danger icon" @click="form.rangos.splice(i, 1)">
                  <i class="ti ti-trash" style="font-size:0.8rem"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="field-ayuda" style="margin:6px 0 0">
        Deje "Hasta" vacío en el último rango para indicar que aplica de ese porcentaje en adelante, sin límite.
      </p>
      <button class="btn sm ghost" style="margin-top:6px" @click="agregarRango">
        <i class="ti ti-plus"></i> Agregar rango
      </button>

      <div class="field" style="margin-top:12px">
        <label>Motivo del cambio (requerido para auditoría) *</label>
        <textarea v-model="form.motivo" rows="2" class="textarea-field"
></textarea>
      </div>

      <div class="btn-group" style="margin-top:10px">
        <button class="btn sm" :disabled="!formValido || guardando" @click="guardar">
          <i class="ti ti-device-floppy"></i> {{ guardando ? 'Guardando…' : 'Guardar parametrización' }}
        </button>
        <button class="btn sm ghost" @click="cerrarForm">Cancelar</button>
      </div>
    </div>

    <!-- Listado -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-list-details"></i> Parametrizaciones configuradas</span>
        <span class="tag">{{ cargando ? 'Cargando…' : parametrizaciones.length + ' configuraciones' }}</span>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Cargo</th>
              <th>Período</th>
              <th>Liquidación</th>
              <th>Distribución</th>
              <th>% L / P / E</th>
              <th>Afectación</th>
              <th>Vigencia</th>
              <th>Estrategia</th>
              <th>Rangos</th>
              <th>Estado</th>
              <th style="width:110px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!parametrizaciones.length && !cargando">
              <td colspan="11" style="text-align:center; color:#aaa; padding:18px">Sin parametrizaciones registradas</td>
            </tr>
            <tr v-for="p in parametrizaciones" :key="p.idParametrizacion">
              <td style="font-weight:700">{{ p.codigoOficio }} — {{ p.nombreCargo }}</td>
              <td>{{ p.periodo?.codigo }} <span class="sub">{{ p.periodo?.calendario?.nombre }}</span></td>
              <td>{{ etiquetaLiq(p.tipoLiquidacion) }}</td>
              <td>{{ p.tipoDistribucion }}</td>
              <td>{{ p.porcLinea }} / {{ p.porcPromocion }} / {{ p.porcEstrategia }}</td>
              <td>{{ p.tipoAfectacion === 'HorasLaboradas' ? 'Horas' : 'Novedades' }}</td>
              <td style="font-size:0.74rem">{{ resumenVigencia(p) }}</td>
              <td style="font-size:0.74rem">{{ etiquetaEstrategia(p) }}</td>
              <td>
                <span class="tag" :title="resumenRangos(p)">
                  {{ (p.rangos?.length ?? 0) === 1 ? '1 rango' : (p.rangos?.length ?? 0) + ' rangos' }}
                </span>
              </td>
              <td>
                <span :class="['status', p.estadoActivo ? 's-active' : 's-closed']">
                  {{ p.estadoActivo ? 'Vigente' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button class="btn sm ghost icon" title="Editar" @click="abrirEdicion(p)">
                    <i class="ti ti-pencil" style="font-size:0.8rem"></i>
                  </button>
                  <button v-if="p.estadoActivo" class="btn sm ghost icon" title="Desactivar" @click="desactivar(p)">
                    <i class="ti ti-toggle-left" style="font-size:0.8rem"></i>
                  </button>
                  <button class="btn sm danger icon" title="Eliminar" @click="eliminar(p)">
                    <i class="ti ti-trash" style="font-size:0.8rem"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pop-up de reconfirmación para eliminaciones -->
    <ConfirmarEliminacion ref="dialogoEliminar" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ConfirmarEliminacion from '@/components/ConfirmarEliminacion.vue';
import {
  calendariosApi,
  periodosApi,
  parametrizacionApi,
  catalogosApi,
  type TiendaCcosto,
  type CargoTienda,
  presupuestosApi,
  presupuestoRangosApi,
  crecimientoRangosApi,
  type Calendario,
  type Periodo,
  type CargoOficial,
  type ParametrizacionCargo,
  type TipoLiquidacion,
  type EstrategiaTipoDescuento,
  type RangoTabla,
  type RangoCrecimiento,
  type Presupuesto,
  type CrearParametrizacionDto,
  obtenerMensajeError,
} from '@/services/api';
import { formatearMoneda } from '@/utils/formato';
import { hoyIso } from '@/utils/fechas';

const dialogoEliminar = ref<InstanceType<typeof ConfirmarEliminacion> | null>(null);
const cargando  = ref(false);
const guardando = ref(false);
const error     = ref('');

const cargos            = ref<CargoOficial[]>([]);
const calendarios       = ref<Calendario[]>([]);
const periodosFiltro    = ref<Periodo[]>([]);
const periodosForm      = ref<Periodo[]>([]);
const parametrizaciones = ref<ParametrizacionCargo[]>([]);

// Flujo tienda → cargo (HU-02): tiendas por centro de costo desde el API
const tiendasCcosto = ref<TiendaCcosto[]>([]);
const cargosTienda  = ref<CargoTienda[]>([]);
const formTienda    = ref('');

const filtroCalendario = ref('');
const filtroPeriodo    = ref('');
const filtroCargo      = ref('');

const mostrarForm   = ref(false);
const editandoId    = ref<string | null>(null);
const formCalendario = ref('');

interface RangoForm { desdePorc: number; hastaRaw: string | number; comisionPorc: number }

const formVacio = () => ({
  codigoOficio: '',
  idPeriodo: '',
  tipoLiquidacion: 'Individual' as TipoLiquidacion,
  tipoDistribucion: 'Individual' as 'Individual' | 'Proporcional',
  porcLinea: 0,
  porcPromocion: 0,
  porcEstrategia: 0,
  validarPresupuesto: false,
  validarCrecimiento: false,
  tipoAfectacion: 'NovedadesDiarias' as 'HorasLaboradas' | 'NovedadesDiarias',
  vigenciaDesde: hoyIso(),   // vigencia desde hoy por defecto
  vigenciaHasta: '',
  estrategiaTipoDescuento: '' as '' | EstrategiaTipoDescuento,
  estrategiaPorcDescuentoCorporativo: 0,
  rangos: [{ desdePorc: 0, hastaRaw: 100, comisionPorc: 0 }] as RangoForm[],
  motivo: '',
});

const form = ref(formVacio());

const formValido = computed(() =>
  form.value.codigoOficio && form.value.idPeriodo && form.value.motivo.trim() &&
  form.value.rangos.length > 0,
);

/** % Estrategia efectivo para mostrar al usuario (Línea - descuento corporativo). */
const porcEstrategiaEfectivo = computed(() => {
  if (form.value.estrategiaTipoDescuento === 'CORPORATIVO'
      && form.value.estrategiaPorcDescuentoCorporativo > 0) {
    return Math.max(0,
      form.value.porcLinea - form.value.estrategiaPorcDescuentoCorporativo,
    ).toFixed(4);
  }
  return Number(form.value.porcEstrategia).toFixed(4);
});

/** Regla cruzada HU-02: Individual solo admite Individual. */
const distribucionPermitida = computed(() =>
  form.value.tipoLiquidacion !== 'Individual' || form.value.tipoDistribucion === 'Individual',
);

function hastaToNumber(raw: string | number): number | null {
  const v = Number(raw);
  return raw === '' || raw == null || isNaN(v) ? null : v;
}

// ── Carga de datos ────────────────────────────────────────────────────

async function cargarTodo() {
  cargando.value = true;
  error.value = '';
  try {
    [cargos.value, calendarios.value, tiendasCcosto.value] = await Promise.all([
      parametrizacionApi.catalogoCargos(),
      calendariosApi.getAll(),
      catalogosApi.tiendas().catch(() => []),   // si Midasoft no responde, el filtro general sigue operando
    ]);
    await cargarParametrizaciones();
  } catch {
    error.value = 'Error al cargar datos. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
}

/** Cargos mostrados en el formulario: los del CCosto de la tienda elegida
 *  (API Midasoft); al editar sin tienda seleccionada, el catálogo completo
 *  para que el valor guardado se visualice. */
const cargosDisponibles = computed<CargoTienda[]>(() =>
  formTienda.value ? cargosTienda.value : (editandoId.value ? cargos.value : []),
);

async function onTiendaSeleccionada() {
  form.value.codigoOficio = '';
  cargosTienda.value = [];
  if (!formTienda.value) return;
  try {
    cargosTienda.value = await catalogosApi.cargosPorTienda(formTienda.value);
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'No fue posible obtener los cargos de la tienda.');
  }
}

async function cargarParametrizaciones() {
  try {
    parametrizaciones.value = await parametrizacionApi.getAll({
      idPeriodo: filtroPeriodo.value || undefined,
      codigoOficio: filtroCargo.value || undefined,
    });
  } catch {
    error.value = 'Error al cargar parametrizaciones.';
  }
}

async function onFiltroCalendario() {
  filtroPeriodo.value = '';
  periodosFiltro.value = filtroCalendario.value
    ? await periodosApi.getByCalendario(filtroCalendario.value)
    : [];
  await cargarParametrizaciones();
}

async function onFormCalendario() {
  form.value.idPeriodo = '';
  periodosForm.value = formCalendario.value
    ? await periodosApi.getByCalendario(formCalendario.value)
    : [];
}

watch(() => form.value.tipoLiquidacion, (nuevo) => {
  if (nuevo === 'Individual' && form.value.tipoDistribucion !== 'Individual') {
    form.value.tipoDistribucion = 'Individual';
  }
});

// ── Formulario ────────────────────────────────────────────────────────

function abrirNueva() {
  editandoId.value = null;
  form.value = formVacio();
  formCalendario.value = '';
  periodosForm.value = [];
  formTienda.value = '';
  cargosTienda.value = [];
  mostrarForm.value = true;
}

function onCargoSeleccionado() {
  // Sugerir la afectación oficial del catálogo (HU-02)
  const c = cargos.value.find(x => x.codigo === form.value.codigoOficio);
  if (c) form.value.tipoAfectacion = c.afectacion;
}

/**
 * La vigencia se alinea automáticamente al inicio del período elegido:
 * el motor evalúa la vigencia en esa fecha, así que un "desde" posterior
 * dejaría la parametrización sin efecto para el período.
 */
function onPeriodoSeleccionado() {
  if (editandoId.value) return;   // al editar se respeta la vigencia guardada
  const p = periodosForm.value.find(x => x.idPeriodo === form.value.idPeriodo);
  if (p) form.value.vigenciaDesde = p.fechaInicio;
}

async function abrirEdicion(p: ParametrizacionCargo) {
  editandoId.value = p.idParametrizacion;
  // Al editar no se exige tienda: el cargo guardado se muestra desde el catálogo
  formTienda.value = '';
  cargosTienda.value = [];
  formCalendario.value = p.periodo?.calendario?.idCalendario ?? '';
  if (formCalendario.value) {
    periodosForm.value = await periodosApi.getByCalendario(formCalendario.value);
  }
  form.value = {
    codigoOficio: p.codigoOficio,
    idPeriodo: p.periodo?.idPeriodo ?? '',
    tipoLiquidacion: p.tipoLiquidacion,
    tipoDistribucion: p.tipoDistribucion,
    porcLinea: Number(p.porcLinea),
    porcPromocion: Number(p.porcPromocion),
    porcEstrategia: Number(p.porcEstrategia),
    validarPresupuesto: p.validarPresupuesto,
    validarCrecimiento: p.validarCrecimiento,
    tipoAfectacion: p.tipoAfectacion,
    vigenciaDesde: p.vigenciaDesde ?? '',
    vigenciaHasta: p.vigenciaHasta ?? '',
    estrategiaTipoDescuento: p.estrategiaTipoDescuento ?? '',
    estrategiaPorcDescuentoCorporativo: Number(p.estrategiaPorcDescuentoCorporativo ?? 0),
    rangos: (p.rangos ?? []).map(r => ({
      desdePorc: Number(r.desdePorc),
      hastaRaw: r.hastaPorc != null ? Number(r.hastaPorc) : '',
      comisionPorc: Number(r.comisionPorc),
    })),
    motivo: '',
  };
  mostrarForm.value = true;
  await cargarTablasAuxiliares(p);
}

function agregarRango() {
  const ultimo = form.value.rangos[form.value.rangos.length - 1];
  const desde = ultimo ? Number(ultimo.hastaRaw) || 0 : 0;
  form.value.rangos.push({ desdePorc: desde, hastaRaw: '', comisionPorc: 0 });
}

function cerrarForm() {
  mostrarForm.value = false;
  editandoId.value = null;
  presupuestoMostrado.value = [];
  presupuestoRangosMostrados.value = [];
  crecimientoMostrado.value = [];
}

async function guardar() {
  if (!distribucionPermitida.value) {
    error.value = 'Liquidación Individual solo admite Distribución Individual.';
    return;
  }
  guardando.value = true;
  error.value = '';
  const dto: CrearParametrizacionDto = {
    codigoOficio: form.value.codigoOficio,
    idPeriodo: form.value.idPeriodo,
    tipoLiquidacion: form.value.tipoLiquidacion,
    tipoDistribucion: form.value.tipoDistribucion,
    porcLinea: form.value.porcLinea,
    porcPromocion: form.value.porcPromocion,
    porcEstrategia: form.value.porcEstrategia,
    validarPresupuesto: form.value.validarPresupuesto,
    validarCrecimiento: form.value.validarCrecimiento,
    tipoAfectacion: form.value.tipoAfectacion,
    rangos: form.value.rangos.map(r => ({
      desdePorc: r.desdePorc,
      hastaPorc: hastaToNumber(r.hastaRaw),
      comisionPorc: r.comisionPorc,
    })),
    motivo: form.value.motivo.trim(),
  };
  if (form.value.vigenciaDesde) dto.vigenciaDesde = form.value.vigenciaDesde;
  if (form.value.vigenciaHasta) dto.vigenciaHasta = form.value.vigenciaHasta;
  if (form.value.estrategiaTipoDescuento) {
    dto.estrategiaTipoDescuento = form.value.estrategiaTipoDescuento;
    if (form.value.estrategiaTipoDescuento === 'CORPORATIVO') {
      dto.estrategiaPorcDescuentoCorporativo = form.value.estrategiaPorcDescuentoCorporativo;
    }
  }
  try {
    if (editandoId.value) {
      await parametrizacionApi.update(editandoId.value, dto);
    } else {
      await parametrizacionApi.create(dto);
    }
    cerrarForm();
    await cargarParametrizaciones();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al guardar la parametrización.');
  } finally {
    guardando.value = false;
  }
}

async function desactivar(p: ParametrizacionCargo) {
  if (!confirm(`¿Desactivar la parametrización de ${p.nombreCargo} — ${p.periodo?.codigo}? Se conserva el histórico.`)) return;
  try {
    await parametrizacionApi.desactivar(p.idParametrizacion);
    await cargarParametrizaciones();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al desactivar.');
  }
}

async function eliminar(p: ParametrizacionCargo) {
  const confirmado = await dialogoEliminar.value?.abrir({
    titulo: 'Eliminar parametrización',
    mensaje: `Se eliminará definitivamente la parametrización de ${p.nombreCargo} — ${p.periodo?.codigo}. Solo para configuraciones creadas por error; si ya se usó, desactívela en su lugar.`,
  });
  if (!confirmado) return;
  try {
    await parametrizacionApi.remove(p.idParametrizacion);
    await cargarParametrizaciones();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al eliminar.');
  }
}

// ── Tablas auxiliares (presupuesto y crecimiento) ───────────────────
const presupuestoMostrado          = ref<Presupuesto[]>([]);
const presupuestoRangosMostrados   = ref<RangoTabla[]>([]);
const crecimientoMostrado          = ref<RangoCrecimiento[]>([]);

async function cargarTablasAuxiliares(p: ParametrizacionCargo) {
  const idPeriodo = p.periodo?.idPeriodo;
  if (!idPeriodo) return;
  try {
    [presupuestoMostrado.value, presupuestoRangosMostrados.value, crecimientoMostrado.value] = await Promise.all([
      presupuestosApi.getAll({ idPeriodo, codigoOficio: p.codigoOficio }),
      presupuestoRangosApi.getAll({ idPeriodo, codigoOficio: p.codigoOficio }),
      crecimientoRangosApi.getAll({ idPeriodo, codigoOficio: p.codigoOficio }),
    ]);
  } catch {
    /* ignorar — solo son vistas de soporte */
  }
}

// ── Presentación ──────────────────────────────────────────────────────

function etiquetaLiq(t: string) {
  const map: Record<string, string> = {
    Individual: 'Individual',
    GlobalTienda: 'Global tienda',
    GlobalGrupoTiendas: 'Global grupo',
  };
  return map[t] ?? t;
}

function resumenRangos(p: ParametrizacionCargo) {
  return (p.rangos ?? [])
    .map(r => (r.hastaPorc != null
      ? `${r.desdePorc}% a ${r.hastaPorc}%: comisión ${r.comisionPorc}%`
      : `${r.desdePorc}% en adelante: comisión ${r.comisionPorc}%`))
    .join(' | ');
}

function resumenVigencia(p: ParametrizacionCargo) {
  if (!p.vigenciaDesde && !p.vigenciaHasta) return '—';
  if (p.vigenciaDesde && !p.vigenciaHasta) return `Desde ${p.vigenciaDesde}`;
  if (!p.vigenciaDesde && p.vigenciaHasta) return `Hasta ${p.vigenciaHasta}`;
  return `${p.vigenciaDesde} a ${p.vigenciaHasta}`;
}

function etiquetaEstrategia(p: ParametrizacionCargo) {
  if (!p.estrategiaTipoDescuento) return '—';
  if (p.estrategiaTipoDescuento === 'CORPORATIVO') {
    return `Corp. -${p.estrategiaPorcDescuentoCorporativo ?? 0}%`;
  }
  return 'Real (por venta)';
}

onMounted(cargarTodo);
</script>

<!-- Estilos: design system global en src/assets/main.css -->
