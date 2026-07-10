<template>
  <div class="cal-view">

    <div class="page-hd">
      <h2>Calendarios y períodos</h2>
      <div class="btn-group">
        <button class="btn sm ghost" @click="cargar"><i class="ti ti-refresh"></i> Actualizar</button>
        <button class="btn sm ghost" @click="abrirGenerarAnio" :disabled="!calActivo">
          <i class="ti ti-calendar-stats"></i> Generar año
        </button>
        <button class="btn sm ghost" @click="mostrarFormCal = !mostrarFormCal">
          <i class="ti ti-calendar-plus"></i> Nuevo calendario
        </button>
        <button class="btn sm" @click="mostrarFormPer = !mostrarFormPer">
          <i class="ti ti-plus"></i> Nuevo período
        </button>
      </div>
    </div>

    <div v-if="error" class="info-box danger">
      <i class="ti ti-alert-circle"></i> <span>{{ error }}</span>
    </div>

    <div class="info-box">
      <i class="ti ti-info-circle"></i>
      <span>
        Los estados <strong>En Curso</strong>, <strong>Liquidado</strong> y <strong>Cerrado</strong>
        son asignados automáticamente por el motor de liquidación.
        Solo es posible eliminar períodos en estado <strong>Abierto</strong>.
      </span>
    </div>

    <!-- Formulario nuevo calendario -->
    <div v-if="mostrarFormCal" class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-calendar"></i> Registrar nuevo calendario</div>
      <div class="form-row fc2">
        <div class="field">
          <label>Nombre</label>
          <input v-model="formCal.nombre" type="text" placeholder="ej. Comisiones 2027" />
        </div>
        <div class="field">
          <label>Año</label>
          <input v-model.number="formCal.anio" type="number" placeholder="2027" min="2000" max="2100" />
        </div>
      </div>
      <div class="btn-group" style="margin-top:6px">
        <button class="btn sm" :disabled="!formCalValido || guardandoCal" @click="guardarCalendario">
          <i class="ti ti-device-floppy"></i> {{ guardandoCal ? 'Guardando…' : 'Guardar calendario' }}
        </button>
        <button class="btn sm ghost" @click="cancelarFormCal">Cancelar</button>
      </div>
    </div>

    <!-- Formulario nuevo período -->
    <div v-if="mostrarFormPer" class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-calendar-plus"></i> Registrar nuevo período</div>
      <div class="form-row fc2">
        <div class="field">
          <label>Calendario</label>
          <select v-model="formPer.idCalendario">
            <option value="">Seleccionar calendario...</option>
            <option v-for="c in calendarios" :key="c.idCalendario" :value="c.idCalendario">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="field">
          <label>Código (opcional)</label>
          <input v-model="formPer.codigo" type="text" placeholder="se genera automático (ej. ENE-2027)" />
        </div>
      </div>
      <div class="form-row fc2">
        <div class="field">
          <label>Fecha inicio</label>
          <input v-model="formPer.fechaInicio" type="date" />
        </div>
        <div class="field">
          <label>Fecha fin</label>
          <input v-model="formPer.fechaFin" type="date" />
        </div>
      </div>
      <div class="btn-group" style="margin-top:6px">
        <button class="btn sm" :disabled="!formPerValido || guardandoPer" @click="guardarPeriodo">
          <i class="ti ti-device-floppy"></i> {{ guardandoPer ? 'Guardando…' : 'Guardar período' }}
        </button>
        <button class="btn sm ghost" @click="cancelarFormPer">Cancelar</button>
      </div>
    </div>

    <!-- Formulario generar año completo -->
    <div v-if="mostrarFormAnio" class="card" style="margin-bottom:14px">
      <div class="card-title">
        <i class="ti ti-calendar-stats"></i> Generar 12 períodos del año
      </div>
      <div class="info-box" style="margin-bottom:10px">
        <i class="ti ti-info-circle"></i>
        <span>
          Genera los 12 períodos en una sola transacción atómica con el patrón
          <strong>{{ formAnio.patron.diaInicio }} → {{ formAnio.patron.diaFin }}</strong>
          (por defecto día 21 del mes anterior al día 20 del mes actual).
          Solo es válido si el calendario aún no tiene períodos.
        </span>
      </div>
      <div class="form-row fc3">
        <div class="field">
          <label>Calendario</label>
          <input :value="calActivo?.nombre ?? ''" disabled />
        </div>
        <div class="field">
          <label>Año</label>
          <!-- El año lo gobierna el calendario (fuente única); no es editable -->
          <input :value="calActivo?.anio ?? ''" type="number" disabled />
        </div>
        <div class="field">
          <label>Patrón día inicio / fin</label>
          <div style="display:flex; gap:6px">
            <input v-model.number="formAnio.patron.diaInicio" type="number" min="1" max="31" style="width:50%" />
            <input v-model.number="formAnio.patron.diaFin" type="number" min="1" max="31" style="width:50%" />
          </div>
        </div>
      </div>
      <div class="btn-group" style="margin-top:8px">
        <button class="btn sm" :disabled="!formAnioValido || generandoAnio" @click="ejecutarGenerarAnio">
          <i class="ti ti-rocket"></i> {{ generandoAnio ? 'Generando…' : 'Generar 12 períodos' }}
        </button>
        <button class="btn sm ghost" @click="cancelarFormAnio">Cancelar</button>
      </div>
    </div>

    <!-- Selector de calendario -->
    <div v-if="calendarios.length" class="card" style="margin-bottom:14px; padding:12px 16px">
      <div class="cal-tabs">
        <button
          v-for="c in calendarios"
          :key="c.idCalendario"
          :class="['cal-tab', { active: calActivo?.idCalendario === c.idCalendario }]"
          @click="seleccionarCalendario(c)"
        >
          {{ c.nombre }}
          <button
            class="cal-tab-del"
            title="Eliminar calendario"
            @click.stop="eliminarCalendario(c)"
          >×</button>
        </button>
      </div>
    </div>

    <div v-if="cargando" class="info-box">
      <i class="ti ti-loader"></i> <span>Cargando datos...</span>
    </div>

    <!-- Tabla de períodos -->
    <div v-if="calActivo" class="card">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-list-details"></i> Períodos — {{ calActivo.nombre }}</span>
        <span class="tag">{{ periodos.length }} períodos</span>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Estado</th>
              <th style="width:80px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!periodos.length">
              <td colspan="5" style="text-align:center; color:#aaa; padding:18px">Sin períodos registrados</td>
            </tr>
            <tr v-for="p in periodos" :key="p.idPeriodo">
              <td style="font-weight:700">{{ p.codigo }}</td>
              <td>{{ p.fechaInicio }}</td>
              <td>{{ p.fechaFin }}</td>
              <td><span :class="['status', clsEstado(p.estadoOperativo)]">{{ p.estadoOperativo }}</span></td>
              <td>
                <button
                  v-if="p.estadoOperativo === 'Abierto'"
                  class="btn sm danger"
                  title="Eliminar período"
                  style="padding:3px 8px"
                  @click="eliminarPeriodo(p)"
                >
                  <i class="ti ti-trash" style="font-size:0.85rem"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  calendariosApi,
  periodosApi,
  type Calendario,
  type Periodo,
  obtenerMensajeError,
} from '@/services/api';
import { clsEstado } from '@/utils/formato';

const cargando     = ref(false);
const error        = ref('');
const calendarios  = ref<Calendario[]>([]);
const calActivo    = ref<Calendario | null>(null);
const periodos     = ref<Periodo[]>([]);

const mostrarFormCal = ref(false);
const mostrarFormPer = ref(false);
const mostrarFormAnio = ref(false);
const guardandoCal   = ref(false);
const guardandoPer   = ref(false);
const generandoAnio  = ref(false);

const formCal = ref({ nombre: '', anio: new Date().getFullYear() + 1 });
const formPer = ref({ idCalendario: '', codigo: '', fechaInicio: '', fechaFin: '' });
// El año se toma del calendario activo; el formulario solo captura el patrón
const formAnio = ref({
  patron: { diaInicio: 21, diaFin: 20 },
});

const formCalValido = computed(() => formCal.value.nombre.trim() && formCal.value.anio > 1999);
const formPerValido = computed(() =>
  formPer.value.idCalendario &&
  formPer.value.fechaInicio && formPer.value.fechaFin,
);
const formAnioValido = computed(() =>
  calActivo.value !== null &&
  formAnio.value.patron.diaInicio >= 1 && formAnio.value.patron.diaInicio <= 31 &&
  formAnio.value.patron.diaFin    >= 1 && formAnio.value.patron.diaFin    <= 31,
);

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    calendarios.value = await calendariosApi.getAll();
    if (calendarios.value.length && !calActivo.value) {
      await seleccionarCalendario(calendarios.value[0]);
    } else if (calActivo.value) {
      await cargarPeriodos(calActivo.value.idCalendario);
    }
  } catch {
    error.value = 'Error al cargar calendarios. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
}

async function cargarPeriodos(idCalendario: string) {
  try {
    periodos.value = await periodosApi.getByCalendario(idCalendario);
  } catch {
    error.value = 'Error al cargar períodos.';
  }
}

async function seleccionarCalendario(cal: Calendario) {
  calActivo.value = cal;
  formPer.value.idCalendario = cal.idCalendario;
  await cargarPeriodos(cal.idCalendario);
}

async function guardarCalendario() {
  guardandoCal.value = true;
  error.value = '';
  try {
    const nuevo = await calendariosApi.create({
      nombre: formCal.value.nombre.trim(),
      anio: formCal.value.anio,
    });
    calendarios.value.push(nuevo);
    await seleccionarCalendario(nuevo);
    cancelarFormCal();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al crear el calendario.');
  } finally {
    guardandoCal.value = false;
  }
}

async function eliminarCalendario(cal: Calendario) {
  if (!confirm(`¿Eliminar el calendario "${cal.nombre}"? Esta acción no se puede deshacer.`)) return;
  error.value = '';
  try {
    await calendariosApi.remove(cal.idCalendario);
    calendarios.value = calendarios.value.filter(c => c.idCalendario !== cal.idCalendario);
    if (calActivo.value?.idCalendario === cal.idCalendario) {
      calActivo.value = calendarios.value[0] ?? null;
      periodos.value = [];
      if (calActivo.value) await cargarPeriodos(calActivo.value.idCalendario);
    }
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al eliminar el calendario.');
  }
}

async function guardarPeriodo() {
  guardandoPer.value = true;
  error.value = '';
  try {
    const nuevo = await periodosApi.create({
      ...formPer.value,
      codigo: formPer.value.codigo.trim() || undefined,
    });
    if (calActivo.value?.idCalendario === formPer.value.idCalendario) {
      periodos.value.push(nuevo);
    }
    cancelarFormPer();
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al crear el período.');
  } finally {
    guardandoPer.value = false;
  }
}

async function eliminarPeriodo(p: Periodo) {
  if (!confirm(`¿Eliminar el período "${p.codigo}"?`)) return;
  error.value = '';
  try {
    await periodosApi.remove(p.idPeriodo);
    periodos.value = periodos.value.filter(x => x.idPeriodo !== p.idPeriodo);
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al eliminar el período.');
  }
}

function cancelarFormCal() {
  mostrarFormCal.value = false;
  formCal.value = { nombre: '', anio: new Date().getFullYear() + 1 };
}

function cancelarFormPer() {
  mostrarFormPer.value = false;
  formPer.value = { idCalendario: calActivo.value?.idCalendario ?? '', codigo: '', fechaInicio: '', fechaFin: '' };
}

function abrirGenerarAnio() {
  if (!calActivo.value) return;
  mostrarFormAnio.value = true;
  mostrarFormPer.value = false;
  mostrarFormCal.value = false;
  error.value = '';
}

function cancelarFormAnio() {
  mostrarFormAnio.value = false;
}

async function ejecutarGenerarAnio() {
  if (!calActivo.value) return;
  if (!confirm(
    `¿Generar los 12 períodos del año ${calActivo.value.anio} en el calendario "${calActivo.value.nombre}"?\n` +
    `Esto fallará si ya existen períodos en el calendario.`,
  )) return;
  generandoAnio.value = true;
  error.value = '';
  try {
    const creados = await periodosApi.generarAnio(calActivo.value.idCalendario, {
      patron: formAnio.value.patron,
    });
    periodos.value = creados;
    mostrarFormAnio.value = false;
  } catch (e: unknown) {
    error.value = obtenerMensajeError(e, 'Error al generar los períodos.');
  } finally {
    generandoAnio.value = false;
  }
}

onMounted(cargar);
</script>

<style scoped>
.cal-view { display: flex; flex-direction: column; }
.cal-tabs { display: flex; gap: 8px; flex-wrap: wrap; }

.cal-tab {
  display: flex; align-items: center; gap: 6px;
  background: #f5f5f5; border: 1px solid #dcdcdc;
  border-radius: 8px; padding: 6px 12px;
  font-size: 0.8rem; font-weight: 600; color: #666;
  cursor: pointer; font-family: inherit; transition: all 0.12s;
}
.cal-tab:hover { border-color: #999; color: #111; }
.cal-tab.active { background: #111; color: #fff; border-color: #111; }

.cal-tab-del {
  background: none; border: none; color: inherit;
  font-size: 1rem; line-height: 1; cursor: pointer;
  padding: 0 0 0 2px; opacity: 0.5; font-family: inherit;
}
.cal-tab-del:hover { opacity: 1; }
.cal-tab.active .cal-tab-del { color: #fff; }

.info-box.danger { background: #fff0f0; border-color: #f5c6c6; color: #b91c1c; }
</style>
