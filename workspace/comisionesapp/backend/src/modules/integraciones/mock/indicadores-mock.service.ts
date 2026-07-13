import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatatestLoader } from './datatest-loader';

/** Fuente de vendedores para generar las ventas simuladas. */
interface FuenteEmpleados {
  empleados(): Promise<any[]>;
}

/**
 * Implementación de prueba de IndicadoresService (INDICADORES_MODO=mock).
 * Genera ventas POS deterministas (misma entrada → mismas ventas) dentro del
 * rango de fechas solicitado, con la MISMA forma de columnas que los SP
 * reales (Cedula, CO, LineaICG, Importe...).
 *
 * Los vendedores salen de la FUENTE DE EMPLEADOS ACTIVA (API Midasoft real o
 * mock), de modo que las ventas siempre cruzan con los empleados que muestra
 * la aplicación; si la fuente falla, cae a los archivos de Datatest/.
 *
 * comisionesResumen incluye la columna ComisionBancaria (~1.5% de la venta),
 * que es la que el motor descuenta — igual que deberá exponer la fuente real.
 */
@Injectable()
export class IndicadoresMockService {
  private readonly logger = new Logger(IndicadoresMockService.name);
  private readonly datos: DatatestLoader;

  private static readonly LINEAS = ['LÍNEA', 'LÍNEA ESTRATEGIA', 'PROMOCIÓN'];

  constructor(
    cfg: ConfigService,
    private readonly fuenteEmpleados?: FuenteEmpleados,
  ) {
    this.datos = new DatatestLoader(
      DatatestLoader.resolverDirectorio(cfg.get<string>('DATATEST_DIR')),
    );
    this.logger.warn(
      'INDICADORES_MODO=mock — ventas ICG simuladas a partir de la fuente de empleados activa',
    );
  }

  /** Vendedores (cédula + ccosto) desde la fuente de empleados activa. */
  private async vendedores(): Promise<Array<{ cedula: string; ccosto: string }>> {
    if (this.fuenteEmpleados) {
      try {
        const api = await this.fuenteEmpleados.empleados();
        const lista = api
          .map((e: any) => ({
            cedula: String(e.Docto_Ident ?? '').trim(),
            ccosto: String(e.Ccosto ?? '').trim(),
          }))
          .filter((e) => e.cedula && e.ccosto);
        if (lista.length) return lista;
      } catch {
        this.logger.warn('Fuente de empleados no disponible — usando Datatest/ como respaldo');
      }
    }
    return this.datos.empleados().map((e) => ({ cedula: e.cedula, ccosto: e.ccosto }));
  }

  async comisionesDetalle(fechaInicial: string, fechaFinal: string): Promise<any[]> {
    const empleados = await this.vendedores();
    const filas: any[] = [];

    for (const e of empleados) {
      for (const fecha of this.dias(fechaInicial, fechaFinal)) {
        // ~70% de los días el colaborador vende; 1-2 transacciones por tipo
        if (this.rand(`${e.cedula}|${fecha}|vende`) < 0.3) continue;
        for (const linea of IndicadoresMockService.LINEAS) {
          const n = this.rand(`${e.cedula}|${fecha}|${linea}|n`) < 0.5 ? 1 : 2;
          for (let i = 0; i < n; i++) {
            const importe = 50_000 + Math.floor(
              this.rand(`${e.cedula}|${fecha}|${linea}|${i}`) * 350_000,
            );
            filas.push({
              Empresa:  'PERMODA',
              Fecha:    fecha,
              CO:       e.ccosto,
              Codigo:   `PRD${1000 + i}`,
              Cedula:   e.cedula,
              LineaICG: linea,
              Uds:      1,
              Importe:  importe,          // bruto con IVA, igual que ICG
            });
          }
        }
      }
    }
    this.logger.log(`Mock ventas: ${filas.length} transacciones (${fechaInicial} → ${fechaFinal})`);
    return filas;
  }

  async comisionesResumen(fechaInicial: string, fechaFinal: string): Promise<any[]> {
    const detalle = await this.comisionesDetalle(fechaInicial, fechaFinal);
    const porTienda = new Map<string, number>();
    for (const d of detalle) {
      porTienda.set(d.CO, (porTienda.get(d.CO) ?? 0) + d.Importe);
    }
    return [...porTienda.entries()].map(([co, total]) => ({
      CO:                co,
      TotalImporte:      total,
      // Comisión bancaria por tienda: ~1.5% del total transado (datos de prueba)
      ComisionBancaria:  Math.round(total * 0.015),
    }));
  }

  // ── Helpers deterministas ─────────────────────────────────────────

  /** Pseudoaleatorio [0,1) determinista a partir de una semilla de texto. */
  private rand(semilla: string): number {
    let h = 2166136261;
    for (let i = 0; i < semilla.length; i++) {
      h ^= semilla.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 100_000) / 100_000;
  }

  private dias(ini: string, fin: string): string[] {
    const out: string[] = [];
    const a = new Date(ini + 'T00:00:00Z').getTime();
    const b = new Date(fin + 'T00:00:00Z').getTime();
    for (let t = a; t <= b; t += 86_400_000) {
      out.push(new Date(t).toISOString().slice(0, 10));
    }
    return out;
  }
}
