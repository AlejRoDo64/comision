<template>
  <div class="dash">

    <!-- Stat cards (datos reales desde el backend) -->
    <div class="g-row g4" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-calendar-event"></i> Períodos abiertos</div>
        <div class="stat-val">{{ stats.periodosAbiertos }}</div>
        <div class="stat-sub">En calendarios activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-users"></i> Colaboradores activos</div>
        <div class="stat-val">{{ stats.colaboradoresActivos }}</div>
        <div class="stat-sub">Registrados en sistema</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-check-circle"></i> Períodos liquidados</div>
        <div class="stat-val">{{ stats.periodosLiquidados }}</div>
        <div class="stat-sub">Estados LIQUIDADO + CERRADO</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl"><i class="ti ti-currency-dollar"></i> Comisiones (último)</div>
        <div class="stat-val">{{ cargando ? '…' : stats.comisionUltima }}</div>
        <div class="stat-sub">{{ stats.ultimaLiquidacion }}</div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="card">
      <div class="card-title">
        <i class="ti ti-link"></i> Accesos rápidos
      </div>
      <div class="quick-links">
        <RouterLink to="/calendarios" class="btn sm ghost">
          <i class="ti ti-calendar-plus"></i> Configurar calendarios
        </RouterLink>
        <RouterLink to="/parametrizacion" class="btn sm ghost">
          <i class="ti ti-settings-2"></i> Parametrizar cargos
        </RouterLink>
        <RouterLink to="/liquidacion" class="btn sm">
          <i class="ti ti-calculator"></i> Liquidar
        </RouterLink>
        <RouterLink to="/trazabilidad" class="btn sm ghost">
          <i class="ti ti-file-analytics"></i> Ver resultados
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  calendariosApi,
  periodosApi,
  liquidacionApi,
  colaboradoresApi,
  type Calendario,
  type Liquidacion,
} from '@/services/api';
import { formatearMoneda } from '@/utils/formato';

const stats = ref({
  periodosAbiertos: 0,
  colaboradoresActivos: 0,
  periodosLiquidados: 0,
  comisionUltima: '—',
  ultimaLiquidacion: '—',
});

const cargando = ref(false);

onMounted(async () => {
  cargando.value = true;
  try {
    const [calendarios, liquidaciones] = await Promise.all([
      calendariosApi.getAll().catch(() => [] as Calendario[]),
      liquidacionApi.getAll().catch(() => [] as Liquidacion[]),
    ]);

    // Cargas independientes en paralelo (evita la espera en serie por calendario)
    const [periodosPorCalendario, colaboradores] = await Promise.all([
      Promise.all(
        calendarios.map((cal) =>
          periodosApi.getByCalendario(cal.idCalendario).catch(() => []),
        ),
      ),
      colaboradoresApi.getAll().catch(() => []),
    ]);
    const abiertos = periodosPorCalendario
      .flat()
      .filter((p) => p.estadoOperativo === 'Abierto').length;
    const colaboradoresTotales = colaboradores.filter((c) => c.activo).length;

    const liquidados = liquidaciones.filter(
      (l) => l.estado === 'LIQUIDADO' || l.estado === 'CERRADO',
    ).length;
    const ultima = liquidaciones
      .filter((l) => l.totalComision != null)
      .sort((a, b) => (b.fechaInicio ?? '').localeCompare(a.fechaInicio ?? ''))[0];

    stats.value = {
      periodosAbiertos: abiertos,
      colaboradoresActivos: colaboradoresTotales,
      periodosLiquidados: liquidados,
      comisionUltima:
        ultima && ultima.totalComision != null
          ? formatearMoneda(ultima.totalComision)
          : '—',
      ultimaLiquidacion: ultima?.periodo?.codigo ?? '—',
    };
  } finally {
    cargando.value = false;
  }
});
</script>

<!-- Estilos: design system global en src/assets/main.css -->
