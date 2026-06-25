<template>
  <div class="param-view">
    <div class="breadcrumb">Automatización Comisiones / <strong>Parametrización de cargos</strong></div>

    <div class="page-hd">
      <h2>Parametrización de cargos</h2>
      <div class="btn-group">
        <button class="btn sm ghost"><i class="ti ti-history"></i> Ver historial</button>
        <button class="btn sm" @click="guardar"><i class="ti ti-device-floppy"></i> Guardar configuración</button>
      </div>
    </div>

    <div class="info-box blue">
      <i class="ti ti-info-circle"></i>
      <span>
        Los cambios de parametrización crean una nueva versión vinculada al período activo.
        Las versiones anteriores se conservan para efectos de auditoría y reliquidación.
      </span>
    </div>

    <div class="g-row g2">

      <!-- Columna izquierda: configuración -->
      <div style="display:flex; flex-direction:column; gap:14px">

        <!-- Selección de cargo -->
        <div class="card">
          <div class="card-title"><i class="ti ti-id-badge"></i> Cargo a parametrizar</div>
          <div class="form-row fc2">
            <div class="field">
              <label>Cargo</label>
              <select v-model="config.cargo">
                <option value="">Seleccionar...</option>
                <option v-for="c in cargos" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="field">
              <label>Período de vigencia</label>
              <select v-model="config.periodo">
                <option value="">Seleccionar período...</option>
                <option>JUN-2026</option>
                <option>JUL-2026</option>
                <option>AGO-2026</option>
              </select>
            </div>
          </div>
          <div class="form-row fc2" style="margin-bottom:0">
            <div class="field">
              <label>Tipo de liquidación</label>
              <select v-model="config.tipoLiq">
                <option value="individual">Individual por colaborador</option>
                <option value="global">Global por tienda</option>
                <option value="mixto">Mixto (individual + global)</option>
              </select>
            </div>
            <div class="field">
              <label>Distribución global</label>
              <select v-model="config.distrib">
                <option value="proporcional">Proporcional a ventas</option>
                <option value="igualitaria">Igualitaria</option>
                <option value="horas">Por horas trabajadas</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Toggles de base de cálculo -->
        <div class="card">
          <div class="card-title"><i class="ti ti-toggle-left"></i> Base de cálculo</div>
          <p class="sect-hint">Selecciona qué base se utiliza para el cálculo de la comisión. Horas trabajadas y novedades son excluyentes entre sí.</p>

          <div class="toggle-row">
            <div :class="['tog', { on: config.usaHoras }]" @click="toggleHoras"></div>
            <span class="tog-lbl">Usar <strong>horas trabajadas</strong> como base</span>
          </div>
          <div class="toggle-row">
            <div :class="['tog', { on: config.usaNovedades }]" @click="toggleNovedades"></div>
            <span class="tog-lbl">Usar <strong>novedades de nómina</strong> como ajuste</span>
          </div>
          <div class="toggle-row">
            <div :class="['tog', { on: config.aplicaIva }]" @click="config.aplicaIva = !config.aplicaIva"></div>
            <span class="tog-lbl">Normalizar ventas <strong>descontando IVA</strong> (÷ 1.19)</span>
          </div>
          <div class="toggle-row">
            <div :class="['tog', { on: config.descuentaBancaria }]" @click="config.descuentaBancaria = !config.descuentaBancaria"></div>
            <span class="tog-lbl">Descontar <strong>comisión bancaria</strong> al tipo de mayor valor</span>
          </div>
        </div>

        <!-- Motivo del cambio -->
        <div class="card">
          <div class="card-title"><i class="ti ti-message-2"></i> Motivo del cambio</div>
          <div class="field">
            <label>Justificación (requerido para auditoría)</label>
            <textarea
              v-model="config.motivo"
              rows="3"
              placeholder="Describe el motivo del cambio de parametrización..."
              class="textarea-field"
            ></textarea>
          </div>
        </div>

      </div>

      <!-- Columna derecha: tablas de comisión -->
      <div style="display:flex; flex-direction:column; gap:14px">

        <!-- Tabla rangos de comisión -->
        <div class="card">
          <div class="card-title" style="justify-content:space-between">
            <span><i class="ti ti-table"></i> Rangos de comisión</span>
            <button class="btn sm ghost"><i class="ti ti-plus"></i> Agregar rango</button>
          </div>
          <div class="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Desde (%)</th>
                  <th>Hasta (%)</th>
                  <th>Comisión (%)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in rangos" :key="i">
                  <td>{{ r.desde }}</td>
                  <td>{{ r.hasta }}</td>
                  <td style="font-weight:700">{{ r.comision }}%</td>
                  <td>
                    <button class="btn sm ghost" style="padding:2px 6px; color:#999">
                      <i class="ti ti-pencil" style="font-size:0.8rem"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Historial de versiones -->
        <div class="card">
          <div class="card-title"><i class="ti ti-versions"></i> Versiones recientes</div>
          <div>
            <div v-for="v in versiones" :key="v.fecha" class="audit-item">
              <div class="audit-dot info"></div>
              <div class="audit-content">
                <div class="audit-text">{{ v.cargo }} — {{ v.periodo }}</div>
                <div class="audit-meta">{{ v.fecha }} · {{ v.usuario }}</div>
              </div>
              <span :class="['status', v.vigente ? 's-active' : 's-closed']" style="flex-shrink:0">
                {{ v.vigente ? 'Vigente' : 'Histórico' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const cargos = ref(['Vendedor', 'Asesor comercial', 'Supervisor de tienda', 'Jefe de zona']);

const config = ref({
  cargo:            'Vendedor',
  periodo:          'JUN-2026',
  tipoLiq:          'individual',
  distrib:          'proporcional',
  usaHoras:         false,
  usaNovedades:     false,
  aplicaIva:        true,
  descuentaBancaria:true,
  motivo:           '',
});

function toggleHoras() {
  config.value.usaHoras = !config.value.usaHoras;
  if (config.value.usaHoras) config.value.usaNovedades = false;
}

function toggleNovedades() {
  config.value.usaNovedades = !config.value.usaNovedades;
  if (config.value.usaNovedades) config.value.usaHoras = false;
}

function guardar() {
  // TODO: llamar API PATCH /parametrizacion
}

const rangos = ref([
  { desde: '0%',    hasta: '80%',  comision: 0   },
  { desde: '80%',   hasta: '90%',  comision: 0.5 },
  { desde: '90%',   hasta: '100%', comision: 1.0 },
  { desde: '100%',  hasta: '110%', comision: 2.0 },
  { desde: '110%',  hasta: '∞',    comision: 3.0 },
]);

const versiones = ref([
  { cargo: 'Vendedor',          periodo: 'JUN-2026', fecha: '25 jun 2026 · 10:00', usuario: 'admin@permoda.com', vigente: true  },
  { cargo: 'Vendedor',          periodo: 'MAY-2026', fecha: '20 abr 2026 · 09:30', usuario: 'admin@permoda.com', vigente: false },
  { cargo: 'Asesor comercial',  periodo: 'JUN-2026', fecha: '25 jun 2026 · 10:05', usuario: 'admin@permoda.com', vigente: true  },
]);
</script>

<style scoped>
.param-view { display: flex; flex-direction: column; }
.sect-hint { font-size: 0.76rem; color: #888; margin-bottom: 10px; line-height: 1.5; }
.textarea-field {
  border: 1px solid #d8d8d8; border-radius: 7px;
  padding: 8px 10px; font-size: 0.81rem; color: #111;
  background: #fff; font-family: inherit; outline: none;
  resize: vertical; width: 100%;
  transition: border-color 0.13s, box-shadow 0.13s;
}
.textarea-field:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,.05); }
</style>
