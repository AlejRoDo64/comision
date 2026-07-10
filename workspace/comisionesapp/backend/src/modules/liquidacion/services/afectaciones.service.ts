import { Injectable, Logger } from '@nestjs/common';

export interface Novedad {
  idColaborador: string;
  fechaInicio: string;        // YYYY-MM-DD
  fechaFin: string;           // YYYY-MM-DD
  tipo: string;               // 'Vacaciones' | 'Incapacidad' | 'LicenciaLuto' | 'DiaFamilia' | 'Compensatorio' | 'Ausentismo' | ...
  horasPorDia?: number;       // si la novedad consume parte del día
}

export interface Marcacion {
  idColaborador: string;
  fecha: string;
  horasLaboradas: number;
}

export interface ResultadoAfectacion {
  diasLaborados: number;
  horasValidas: number;
  diasExcluidos: number;
  motivoExclusion: string | null;
  /** % de participación para distribución proporcional por horas (0..1). */
  participacion: number;
}

/**
 * Novedades que NO excluyen comisión (HU-03 — excepciones):
 * se consideran laboradas a efectos de comisión.
 */
const NOVEDADES_NO_EXCLUYEN = new Set([
  'LicenciaLuto',
  'DiaFamilia',
  'Compensatorio',
  'LicenciaLutoLegal',
  'DiaFamiliaLegal',
  'CompensatorioLegal',
]);

@Injectable()
export class AfectacionesService {
  private readonly logger = new Logger(AfectacionesService.name);

  /**
   * Calcula días laborados, horas válidas y exclusiones por novedades (HU-03).
   *
   * Reglas:
   * - Novedades que SÍ excluyen (Vacaciones, Incapacidad, Ausentismo) restan días.
   * - Novedades que NO excluyen (Luto, Día Familia, Compensatorio Legal) cuentan como laboradas.
   * - Las horas del día excluido se ponen en 0.
   * - En distribución por horas, las horas válidas se usan para el % de participación.
   */
  calcular(
    fechaInicio: string,
    fechaFin: string,
    novedades: Novedad[],
    marcaciones: Marcacion[],
    jornadaHorasDiarias: number = 8,
  ): ResultadoAfectacion {
    const totalDias = this.diasEntre(fechaInicio, fechaFin) + 1;   // inclusivo (1-Jun a 30-Jun = 30)

    const novedadesEnRango = novedades.filter((n) => {
      const ini = n.fechaInicio;
      const fin = n.fechaFin;
      return !(fin < fechaInicio || ini > fechaFin);
    });

    let diasExcluidos = 0;
    const motivos: string[] = [];

    for (const n of novedadesEnRango) {
      if (NOVEDADES_NO_EXCLUYEN.has(n.tipo)) continue;
      const ini = n.fechaInicio < fechaInicio ? fechaInicio : n.fechaInicio;
      const fin = n.fechaFin    > fechaFin    ? fechaFin    : n.fechaFin;
      const dias = this.diasEntre(ini, fin) + 1; // inclusivo
      diasExcluidos += dias;
      if (!motivos.includes(n.tipo)) motivos.push(n.tipo);
    }

    const diasLaborados = Math.max(0, totalDias - diasExcluidos);

    // Horas válidas: horas de marcaciones en días no excluidos
    const fechasExcluidas = new Set<string>();
    for (const n of novedadesEnRango) {
      if (NOVEDADES_NO_EXCLUYEN.has(n.tipo)) continue;
      const ini = n.fechaInicio < fechaInicio ? fechaInicio : n.fechaInicio;
      const fin = n.fechaFin    > fechaFin    ? fechaFin    : n.fechaFin;
      this.iterarDias(ini, fin, (d) => fechasExcluidas.add(d));
    }

    let horasValidas = 0;
    for (const m of marcaciones) {
      if (m.fecha < fechaInicio || m.fecha > fechaFin) continue;
      if (fechasExcluidas.has(m.fecha)) continue;
      horasValidas += m.horasLaboradas;
    }

    const horasTeoricas = diasLaborados * jornadaHorasDiarias;
    const participacion = horasTeoricas > 0
      ? Math.min(1, horasValidas / horasTeoricas)
      : 0;

    return {
      diasLaborados,
      horasValidas,
      diasExcluidos,
      motivoExclusion: motivos.length ? motivos.join(', ') : null,
      participacion,
    };
  }

  /** Calcula % cumplimiento de presupuesto (cuando validarPresupuesto=true). */
  calcularCumplimientoPresupuesto(ventaNeta: number, presupuesto: number): number {
    if (presupuesto <= 0) return 0;
    return (ventaNeta / presupuesto) * 100;
  }

  /** Calcula % crecimiento vs período anterior. */
  calcularCumplimientoCrecimiento(ventaActual: number, ventaAnterior: number): number {
    if (ventaAnterior <= 0) return 0;
    return ((ventaActual - ventaAnterior) / ventaAnterior) * 100;
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private diasEntre(a: string, b: string): number {
    const da = new Date(a + 'T00:00:00Z').getTime();
    const db = new Date(b + 'T00:00:00Z').getTime();
    return Math.floor((db - da) / 86_400_000);
  }

  private iterarDias(ini: string, fin: string, fn: (d: string) => void): void {
    const da = new Date(ini + 'T00:00:00Z').getTime();
    const db = new Date(fin + 'T00:00:00Z').getTime();
    for (let t = da; t <= db; t += 86_400_000) {
      fn(new Date(t).toISOString().slice(0, 10));
    }
  }
}