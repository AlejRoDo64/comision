<template>
  <div class="traz-view">
    <div class="breadcrumb">Automatización Comisiones / <strong>Trazabilidad y salida</strong></div>

    <div class="page-hd">
      <h2>Trazabilidad y salida</h2>
      <div class="btn-group">
        <button class="btn sm ghost"><i class="ti ti-printer"></i> Imprimir</button>
        <button class="btn sm ghost"><i class="ti ti-download"></i> Exportar CSV</button>
        <button class="btn sm"><i class="ti ti-file-export"></i> Generar Midasoft</button>
      </div>
    </div>

    <div class="info-box">
      <i class="ti ti-lock"></i>
      <span>
        Esta vista es de <strong>solo lectura</strong>. Los registros de liquidaciones cerradas
        son inmutables. Para corregir un período use el proceso de reliquidación desde HU-03.
      </span>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:14px; padding:12px 16px">
      <div class="filtros-row">
        <div class="field" style="min-width:160px">
          <label>Calendario</label>
          <select v-model="filtro.calendario">
            <option value="">Todos</option>
            <option>Comisiones 2026</option>
            <option>Comisiones 2025</option>
          </select>
        </div>
        <div class="field" style="min-width:140px">
          <label>Período</label>
          <select v-model="filtro.periodo">
            <option value="">Todos</option>
            <option v-for="p in periodos" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="field" style="min-width:160px">
          <label>Grupo de tiendas</label>
          <select v-model="filtro.grupo">
            <option value="">Todos los grupos</option>
            <option>Grupo Norte</option>
            <option>Grupo Centro</option>
            <option>Grupo Sur</option>
          </select>
        </div>
        <div class="field" style="min-width:140px">
          <label>Tienda</label>
          <select v-model="filtro.tienda">
            <option value="">Todas</option>
            <option>T01 — Centro</option>
            <option>T02 — Norte</option>
            <option>T03 — Sur</option>
          </select>
        </div>
        <button class="btn sm" style="align-self:flex-end"><i class="ti ti-search"></i> Consultar</button>
      </div>
    </div>

    <!-- Tabla de resumen por tienda con drill-down -->
    <div class="card" style="margin-bottom:14px">
      <div class="card-title" style="justify-content:space-between">
        <span><i class="ti ti-building-store"></i> Resumen por tienda — MAY-2026</span>
        <span class="tag">{{ tiendas.length }} tiendas</span>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:28px"></th>
              <th>Tienda</th>
              <th>Colaboradores</th>
              <th>Venta bruta</th>
              <th>Venta normalizada</th>
              <th>Com. total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="t in tiendas" :key="t.codigo">
              <!-- Fila de tienda -->
              <tr class="row-tienda" @click="toggleDrillDown(t.codigo)">
                <td style="text-align:center; color:#aaa">
                  <i :class="['ti', expandidos.has(t.codigo) ? 'ti-chevron-down' : 'ti-chevron-right']"></i>
                </td>
                <td style="font-weight:700">{{ t.codigo }} — {{ t.nombre }}</td>
                <td>{{ t.colaboradores }}</td>
                <td>{{ fmt(t.ventaBruta) }}</td>
                <td>{{ fmt(t.ventaNorm) }}</td>
                <td style="font-weight:700; color:#1a6644">{{ fmt(t.comision) }}</td>
                <td><span :class="['status', t.cls]">{{ t.estado }}</span></td>
              </tr>
              <!-- Filas de detalle por colaborador -->
              <template v-if="expandidos.has(t.codigo)">
                <tr
                  v-for="col in t.colaboradores_data"
                  :key="col.id"
                  class="row-colaborador"
                >
                  <td></td>
                  <td style="padding-left:28px; color:#555">
                    <i class="ti ti-user" style="font-size:0.75rem; margin-right:4px; color:#bbb"></i>
                    {{ col.nombre }}
                  </td>
                  <td style="color:#888">{{ col.cargo }}</td>
                  <td style="color:#888">{{ fmt(col.ventaBruta) }}</td>
                  <td style="color:#888">{{ fmt(col.ventaNorm) }}</td>
                  <td style="font-weight:600; color:#1a6644">{{ fmt(col.comision) }}</td>
                  <td></td>
                </tr>
              </template>
            </template>
          </tbody>
          <tfoot>
            <tr class="row-total">
              <td></td>
              <td style="font-weight:700">TOTAL</td>
              <td>20</td>
              <td style="font-weight:700">{{ fmt(totalBruta) }}</td>
              <td style="font-weight:700">{{ fmt(totalNorm) }}</td>
              <td style="font-weight:700; color:#1a6644">{{ fmt(totalCom) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Log de auditoría -->
    <div class="card">
      <div class="card-title"><i class="ti ti-shield-check"></i> Log de auditoría — MAY-2026</div>
      <div>
        <div v-for="a in auditLog" :key="a.msg" class="audit-item">
          <div :class="['audit-dot', a.dot]"></div>
          <div class="audit-content">
            <div class="audit-text">{{ a.msg }}</div>
            <div class="audit-meta">{{ a.meta }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const filtro = ref({ calendario: 'Comisiones 2026', periodo: 'MAY-2026', grupo: '', tienda: '' });

const periodos = ['ENE-2026','FEB-2026','MAR-2026','ABR-2026','MAY-2026','JUN-2026'];

const expandidos = ref(new Set<string>());

function toggleDrillDown(codigo: string) {
  if (expandidos.value.has(codigo)) expandidos.value.delete(codigo);
  else expandidos.value.add(codigo);
}

function fmt(n: number) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

const tiendas = ref([
  {
    codigo: 'T01', nombre: 'Tienda Centro', colaboradores: 8,
    ventaBruta: 42_500_000, ventaNorm: 35_714_286, comision: 714_286,
    estado: 'Liquidado', cls: 's-liq',
    colaboradores_data: [
      { id:'EMP001', nombre:'Juan García',     cargo:'Vendedor', ventaBruta:8_500_000, ventaNorm:7_142_857, comision:142_857 },
      { id:'EMP002', nombre:'María López',     cargo:'Vendedor', ventaBruta:7_200_000, ventaNorm:6_050_420, comision:121_008 },
      { id:'EMP003', nombre:'Carlos Rueda',    cargo:'Asesor',   ventaBruta:9_100_000, ventaNorm:7_647_059, comision:152_941 },
      { id:'EMP004', nombre:'Ana Martínez',    cargo:'Vendedor', ventaBruta:6_300_000, ventaNorm:5_294_118, comision:105_882 },
      { id:'EMP005', nombre:'Luis Herrera',    cargo:'Vendedor', ventaBruta:4_200_000, ventaNorm:3_529_412, comision:70_588  },
      { id:'EMP006', nombre:'Paula Jiménez',   cargo:'Asesor',   ventaBruta:3_100_000, ventaNorm:2_605_042, comision:52_101  },
      { id:'EMP007', nombre:'Diego Cárdenas',  cargo:'Vendedor', ventaBruta:2_800_000, ventaNorm:2_352_941, comision:47_059  },
      { id:'EMP008', nombre:'Sofía Moreno',    cargo:'Vendedor', ventaBruta:1_300_000, ventaNorm:1_092_437, comision:21_849  },
    ],
  },
  {
    codigo: 'T02', nombre: 'Tienda Norte', colaboradores: 6,
    ventaBruta: 28_700_000, ventaNorm: 24_117_647, comision: 482_353,
    estado: 'Liquidado', cls: 's-liq',
    colaboradores_data: [
      { id:'EMP009', nombre:'Camila Vargas',  cargo:'Vendedor', ventaBruta:7_400_000, ventaNorm:6_218_487, comision:124_370 },
      { id:'EMP010', nombre:'Andrés Torres',  cargo:'Asesor',   ventaBruta:6_800_000, ventaNorm:5_714_286, comision:114_286 },
      { id:'EMP011', nombre:'Natalia Ríos',   cargo:'Vendedor', ventaBruta:5_600_000, ventaNorm:4_705_882, comision:94_118  },
      { id:'EMP012', nombre:'Julián Cano',    cargo:'Vendedor', ventaBruta:4_300_000, ventaNorm:3_613_445, comision:72_269  },
      { id:'EMP013', nombre:'Isabella Díaz',  cargo:'Vendedor', ventaBruta:3_100_000, ventaNorm:2_605_042, comision:52_101  },
      { id:'EMP014', nombre:'Felipe Ospina',  cargo:'Vendedor', ventaBruta:1_500_000, ventaNorm:1_260_504, comision:25_210  },
    ],
  },
  {
    codigo: 'T03', nombre: 'Tienda Sur', colaboradores: 6,
    ventaBruta: 19_200_000, ventaNorm: 16_134_454, comision: 322_689,
    estado: 'Liquidado', cls: 's-liq',
    colaboradores_data: [
      { id:'EMP015', nombre:'Valentina Cruz',  cargo:'Vendedor', ventaBruta:5_100_000, ventaNorm:4_285_714, comision:85_714  },
      { id:'EMP016', nombre:'Sebastián Leal',  cargo:'Asesor',   ventaBruta:4_200_000, ventaNorm:3_529_412, comision:70_588  },
      { id:'EMP017', nombre:'Daniela Pardo',   cargo:'Vendedor', ventaBruta:3_700_000, ventaNorm:3_109_244, comision:62_185  },
      { id:'EMP018', nombre:'Mateo Salcedo',   cargo:'Vendedor', ventaBruta:3_200_000, ventaNorm:2_689_076, comision:53_782  },
      { id:'EMP019', nombre:'Laura Guzmán',    cargo:'Vendedor', ventaBruta:2_100_000, ventaNorm:1_764_706, comision:35_294  },
      { id:'EMP020', nombre:'David Mejía',     cargo:'Vendedor', ventaBruta:  900_000, ventaNorm:  756_303, comision:15_126  },
    ],
  },
]);

const totalBruta = computed(() => tiendas.value.reduce((s, t) => s + t.ventaBruta, 0));
const totalNorm  = computed(() => tiendas.value.reduce((s, t) => s + t.ventaNorm, 0));
const totalCom   = computed(() => tiendas.value.reduce((s, t) => s + t.comision,  0));

const auditLog = ref([
  { msg: 'Período MAY-2026 marcado como Liquidado',                              meta: '25 may 2026 · 10:42 · sistema',            dot: 'ok'   },
  { msg: 'Archivo Midasoft generado — 20 colaboradores, $1.519.328 en comisiones', meta: '25 may 2026 · 10:41 · admin@permoda.com', dot: 'ok'   },
  { msg: 'Comisión bancaria descontada — tipo LÍNEA ESTRATEGIA (mayor valor)',    meta: '25 may 2026 · 10:40 · sistema',            dot: 'info' },
  { msg: 'Normalización IVA aplicada — 12 ventas divididas por 1.19',            meta: '25 may 2026 · 10:39 · sistema',            dot: 'info' },
  { msg: 'Fuentes ICG y Midasoft validadas sin errores',                          meta: '25 may 2026 · 10:38 · sistema',            dot: 'ok'   },
  { msg: 'Liquidación MAY-2026 iniciada por admin@permoda.com',                   meta: '25 may 2026 · 10:37 · admin@permoda.com', dot: 'info' },
]);
</script>

<style scoped>
.traz-view { display: flex; flex-direction: column; }

.filtros-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }

.row-tienda { cursor: pointer; }
.row-tienda:hover td { background: #f4f4f4; }

.row-colaborador td { background: #fafafa; }
.row-colaborador:hover td { background: #f5f5f5; }

.row-total td {
  border-top: 2px solid #dcdcdc;
  background: #f7f7f7;
  font-size: 0.82rem;
  padding: 10px;
}
</style>
