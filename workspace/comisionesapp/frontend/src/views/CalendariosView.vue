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
import { ref, computed } from 'vue';

const mostrarForm = ref(false);
const calActivo   = ref('Comisiones 2026');

const form = ref({ calendario: '', codigo: '', inicio: '', fin: '' });

const formValido = computed(() =>
  form.value.calendario && form.value.codigo && form.value.inicio && form.value.fin
);

function guardarPeriodo() {
  // TODO: llamar API POST /periodos
  mostrarForm.value = false;
  form.value = { calendario: '', codigo: '', inicio: '', fin: '' };
}

function cancelarForm() {
  mostrarForm.value = false;
  form.value = { calendario: '', codigo: '', inicio: '', fin: '' };
}

const calendarios = ref(['Comisiones 2026', 'Comisiones 2025']);

const todos = ref([
  { cal: 'Comisiones 2026', codigo: 'ENE-2026', inicio: '21/12/2025', fin: '20/01/2026', dias: 31, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2026', codigo: 'FEB-2026', inicio: '21/01/2026', fin: '20/02/2026', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2026', codigo: 'MAR-2026', inicio: '21/02/2026', fin: '20/03/2026', dias: 28, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2026', codigo: 'ABR-2026', inicio: '21/03/2026', fin: '20/04/2026', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2026', codigo: 'MAY-2026', inicio: '21/04/2026', fin: '20/05/2026', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2026', codigo: 'JUN-2026', inicio: '21/05/2026', fin: '20/06/2026', dias: 30, estado: 'En curso', cls: 's-active' },
  { cal: 'Comisiones 2026', codigo: 'JUL-2026', inicio: '21/06/2026', fin: '20/07/2026', dias: 30, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2026', codigo: 'AGO-2026', inicio: '21/07/2026', fin: '20/08/2026', dias: 31, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2026', codigo: 'SEP-2026', inicio: '21/08/2026', fin: '20/09/2026', dias: 31, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2026', codigo: 'OCT-2026', inicio: '21/09/2026', fin: '20/10/2026', dias: 30, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2026', codigo: 'NOV-2026', inicio: '21/10/2026', fin: '20/11/2026', dias: 31, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2026', codigo: 'DIC-2026', inicio: '21/11/2026', fin: '20/12/2026', dias: 30, estado: 'Abierto',  cls: 's-open'   },
  { cal: 'Comisiones 2025', codigo: 'ENE-2025', inicio: '21/12/2024', fin: '20/01/2025', dias: 31, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'FEB-2025', inicio: '21/01/2025', fin: '20/02/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'MAR-2025', inicio: '21/02/2025', fin: '20/03/2025', dias: 28, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'ABR-2025', inicio: '21/03/2025', fin: '20/04/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'MAY-2025', inicio: '21/04/2025', fin: '20/05/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'JUN-2025', inicio: '21/05/2025', fin: '20/06/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'JUL-2025', inicio: '21/06/2025', fin: '20/07/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'AGO-2025', inicio: '21/07/2025', fin: '20/08/2025', dias: 31, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'SEP-2025', inicio: '21/08/2025', fin: '20/09/2025', dias: 31, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'OCT-2025', inicio: '21/09/2025', fin: '20/10/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'NOV-2025', inicio: '21/10/2025', fin: '20/11/2025', dias: 31, estado: 'Cerrado',  cls: 's-closed' },
  { cal: 'Comisiones 2025', codigo: 'DIC-2025', inicio: '21/11/2025', fin: '20/12/2025', dias: 30, estado: 'Cerrado',  cls: 's-closed' },
]);

const periodosActivos = computed(() => todos.value.filter(p => p.cal === calActivo.value));
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
