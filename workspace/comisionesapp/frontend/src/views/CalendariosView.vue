<template>
  <div class="cal-view">
    <div class="breadcrumb">Automatización Comisiones / <strong>Calendarios y períodos</strong></div>

    <div class="page-hd">
      <h2>Calendarios y períodos</h2>
      <div class="btn-group">
        <button class="btn sm ghost"><i class="ti ti-refresh"></i> Actualizar</button>
        <button class="btn sm" @click="mostrarForm = !mostrarForm">
          <i class="ti ti-plus"></i> Nuevo período
        </button>
      </div>
    </div>

    <div class="info-box">
      <i class="ti ti-info-circle"></i>
      <span>
        Los estados <strong>En Curso</strong>, <strong>Liquidado</strong> y <strong>Cerrado</strong>
        son asignados automáticamente por el motor de liquidación (HU-03).
        Solo es posible eliminar períodos en estado <strong>Abierto</strong> que no tengan ventas registradas.
      </span>
    </div>

    <!-- Formulario nuevo período -->
    <div v-if="mostrarForm" class="card" style="margin-bottom:14px">
      <div class="card-title"><i class="ti ti-calendar-plus"></i> Registrar nuevo período</div>
      <div class="form-row fc2">
        <div class="field">
          <label>Calendario</label>
          <select v-model="form.calendario">
            <option value="">Seleccionar calendario...</option>
            <option v-for="c in calendarios" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="field">
          <label>Código</label>
          <input v-model="form.codigo" type="text" placeholder="ej. ENE-2027" />
        </div>
      </div>
      <div class="form-row fc2">
        <div class="field">
          <label>Fecha inicio</label>
          <input v-model="form.inicio" type="date" />
        </div>
        <div class="field">
          <label>Fecha fin</label>
          <input v-model="form.fin" type="date" />
        </div>
      </div>
      <div class="btn-group" style="margin-top:6px">
        <button class="btn sm" :disabled="!formValido" @click="guardarPeriodo">
          <i class="ti ti-device-floppy"></i> Guardar período
        </button>
        <button class="btn sm ghost" @click="cancelarForm">Cancelar</button>
      </div>
    </div>

    <!-- Selector de calendario -->
    <div class="card" style="margin-bottom:14px; padding:12px 16px">
      <div class="cal-tabs">
        <button
          v-for="c in calendarios"
          :key="c"
          :class="['cal-tab', { active: calActivo === c }]"
          @click="calActivo = c"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <!-- Tabla de períodos -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-list-details"></i> Períodos — {{ calActivo }}</span>
        <span class="tag">{{ periodosActivos.length }} períodos</span>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Días</th>
              <th>Estado</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in periodosActivos" :key="p.codigo">
              <td style="font-weight:700">{{ p.codigo }}</td>
              <td>{{ p.inicio }}</td>
              <td>{{ p.fin }}</td>
              <td>{{ p.dias }}</td>
              <td><span :class="['status', p.cls]">{{ p.estado }}</span></td>
              <td>
                <button
                  v-if="p.estado === 'Abierto'"
                  class="btn sm danger"
                  title="Eliminar período"
                  style="padding:3px 8px"
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
import { computed, onMounted, ref } from 'vue';
import { calendariosApi, type Calendario, type Periodo } from '@/services/api';

const mostrarForm = ref(false);
const calActivo = ref('');
const data = ref<Calendario[]>([]);

const form = ref({ calendario: '', codigo: '', inicio: '', fin: '' });

const formValido = computed(() =>
  form.value.calendario && form.value.codigo && form.value.inicio && form.value.fin
);

const calendarios = computed(() => data.value.map((c) => c.nombre));

const calendarioActivo = computed(() =>
  data.value.find((c) => c.nombre === calActivo.value)
);

const periodosActivos = computed(() =>
  calendarioActivo.value?.periodos.map(mapPeriodo) ?? []
);

onMounted(cargarCalendarios);

async function cargarCalendarios() {
  data.value = await calendariosApi.getAll();
  if (!calActivo.value && data.value.length > 0) {
    calActivo.value = data.value[0].nombre;
  }
}

async function guardarPeriodo() {
  const calendario = data.value.find((c) => c.nombre === form.value.calendario);
  if (!calendario) return;

  await calendariosApi.createPeriodo(calendario.idCalendario, {
    codigo: form.value.codigo,
    fechaInicio: form.value.inicio,
    fechaFin: form.value.fin,
  });

  mostrarForm.value = false;
  form.value = { calendario: '', codigo: '', inicio: '', fin: '' };
  await cargarCalendarios();
}

function cancelarForm() {
  mostrarForm.value = false;
  form.value = { calendario: '', codigo: '', inicio: '', fin: '' };
}

function mapPeriodo(periodo: Periodo) {
  return {
    codigo: periodo.codigo,
    inicio: formatDate(periodo.fechaInicio),
    fin: formatDate(periodo.fechaFin),
    dias: daysBetween(periodo.fechaInicio, periodo.fechaFin),
    estado: estadoLabel(periodo.estadoOperativo),
    cls: estadoClass(periodo.estadoOperativo),
  };
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
}

function estadoLabel(value: string) {
  const labels: Record<string, string> = {
    Abierto: 'Abierto',
    EnCurso: 'En curso',
    Liquidado: 'Liquidado',
    Cerrado: 'Cerrado',
  };
  return labels[value] ?? value;
}

function estadoClass(value: string) {
  const classes: Record<string, string> = {
    Abierto: 's-open',
    EnCurso: 's-active',
    Liquidado: 's-closed',
    Cerrado: 's-closed',
  };
  return classes[value] ?? 's-open';
}
</script>

<style scoped>
.cal-view { display: flex; flex-direction: column; }
.cal-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.cal-tab {
  background: #f5f5f5; border: 1px solid #dcdcdc;
  border-radius: 8px; padding: 6px 16px;
  font-size: 0.8rem; font-weight: 600; color: #666;
  cursor: pointer; font-family: inherit; transition: all 0.12s;
}
.cal-tab:hover { border-color: #999; color: #111; }
.cal-tab.active { background: #111; color: #fff; border-color: #111; }
</style>
