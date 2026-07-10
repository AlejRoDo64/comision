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

    <div class="info-box blue">
      <i class="ti ti-info-circle"></i>
      <span>
        Cada configuración se define por <strong>cargo</strong> (catálogo oficial Midasoft) y
        <strong>período de calendario</strong>. Todo cambio exige un motivo y queda registrado
        con usuario y fecha para auditoría.
      </span>
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

      <div class="form-row fc3">
        <div class="field">
          <label>Cargo (Midasoft) *</label>
          <select v-model="form.codigoOficio" @change="onCargoSeleccionado">
            <option value="">Seleccionar...</option>
            <option v-for="c in cargos" :key="c.codigo" :value="c.codigo">{{ c.codigo }} — {{ c.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label>Calendario *</label>
          <select v-model="formCalendario" @change="onFormCalendario">
            <option value="">Seleccionar...</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label>Período de vigencia *</label>
          <select v-model="form.idPeriodo">
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
      <div v-if="editandoId" class="card" style="background:#fafafa; margin-top:14px">
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
                <td>{{ r.hastaPorc ?? '∞' }}</td>
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
                <td>{{ r.hastaPorcCrec ?? '∞' }}</td>
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
            <tr><th>Desde (%)</th><th>Hasta (% — vacío = ∞)</th><th>Comisión (%)</th><th style="width:50px"></th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in form.rangos" :key="i">
              <td><input v-model.number="r.desdePorc" type="number" min="0" step="0.01" class="inp-sm" /></td>
              <td><input v-model="r.hastaRaw" type="number" min="0" step="0.01" placeholder="∞" class="inp-sm" /></td>
              <td><input v-model.number="r.comisionPorc" type="number" min="0" step="0.0001" class="inp-sm" /></td>
              <td>
                <button class="btn sm danger" style="padding:2px 7px" @click="form.rangos.splice(i, 1)">
                  <i class="ti ti-trash" style="font-size:0.8rem"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn sm ghost" style="margin-top:6px" @click="agregarRango">
        <i class="ti ti-plus"></i> Agregar rango
      </button>

      <div class="field" style="margin-top:12px">
        <label>Motivo del cambio (requerido para auditoría) *</label>
        <textarea v-model="form.motivo" rows="2" class="textarea-field"
          placeholder="Describe el motivo de esta configuración..."></textarea>
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
                <span class="tag" :title="resumenRangos(p)">{{ p.rangos?.length ?? 0 }} rangos</span>
              </td>
              <td>
                <span :class="['status', p.estadoActivo ? 's-active' : 's-closed']">
                  {{ p.estadoActivo ? 'Vigente' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button class="btn sm ghost" style="padding:2px 7px" title="Editar" @click="abrirEdicion(p)">
                    <i class="ti ti-pencil" style="font-size:0.8rem"></i>
                  </button>
                  <button v-if="p.estadoActivo" class="btn sm ghost" style="padding:2px 7px" title="Desactivar" @click="desactivar(p)">
                    <i class="ti ti-toggle-left" style="font-size:0.8rem"></i>
                  </button>
                  <button class="btn sm danger" style="padding:2px 7px" title="Eliminar" @click="eliminar(p)">
                    <i class="ti ti-trash" style="font-size:0.8rem"></i>
                  </button>
                </div>
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
  parametrizacionApi,
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

const cargando  = ref(false);
const guardando = ref(false);
const error     = ref('');

const cargos            = ref<CargoOficial[]>([]);
const calendarios       = ref<Calendario[]>([]);
const periodosFiltro    = ref<Periodo[]>([]);
const periodosForm      = ref<Periodo[]>([]);
const parametrizaciones = ref<ParametrizacionCargo[]>([]);

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
  vigenciaDesde: '',
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
    [cargos.value, calendarios.value] = await Promise.all([
      parametrizacionApi.catalogoCargos(),
      calendariosApi.getAll(),
    ]);
    await cargarParametrizaciones();
  } catch {
    error.value = 'Error al cargar datos. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
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
  mostrarForm.value = true;
}

function onCargoSeleccionado() {
  // Sugerir la afectación oficial del catálogo (HU-02)
  const c = cargos.value.find(x => x.codigo === form.value.codigoOficio);
  if (c) form.value.tipoAfectacion = c.afectacion;
}

async function abrirEdicion(p: ParametrizacionCargo) {
  editandoId.value = p.idParametrizacion;
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
  if (!confirm(`¿Eliminar definitivamente la parametrización de ${p.nombreCargo} — ${p.periodo?.codigo}? Solo para configuraciones creadas por error.`)) return;
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
    .map(r => `${r.desdePorc}–${r.hastaPorc ?? '∞'}% → ${r.comisionPorc}%`)
    .join(' | ');
}

function resumenVigencia(p: ParametrizacionCargo) {
  if (!p.vigenciaDesde && !p.vigenciaHasta) return '—';
  return `${p.vigenciaDesde ?? '∞'} → ${p.vigenciaHasta ?? '∞'}`;
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

<style scoped>
.param-view { display: flex; flex-direction: column; }
.inp-sm {
  width: 90px; border: 1px solid #ccc; border-radius: 5px;
  padding: 3px 6px; font-size: 0.8rem; font-family: inherit;
}
.sub { display: block; font-size: 0.68rem; color: #999; }
.textarea-field {
  border: 1px solid #d8d8d8; border-radius: 7px;
  padding: 8px 10px; font-size: 0.81rem; color: #111;
  background: #fff; font-family: inherit; outline: none;
  resize: vertical; width: 100%;
  transition: border-color 0.13s, box-shadow 0.13s;
}
.textarea-field:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,.05); }
.info-box.danger { background: #fff0f0; border-color: #f5c6c6; color: #b91c1c; }
</style>
