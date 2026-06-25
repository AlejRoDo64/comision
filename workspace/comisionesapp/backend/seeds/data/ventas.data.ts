import { TipoVenta } from '../../src/modules/catalogos/entities/venta-icg.entity';

export interface VentaICGData {
  fecha: string;
  codigoTienda: string;
  idColaboradorMidasoft: string;
  tipoVenta: TipoVenta;
  importe: number;
  incluyeIva: boolean;
  tasaComisionBancaria: number;
  escenario: string;
}

/**
 * Escenarios de prueba para el motor de normalización (HU-3).
 *
 * La normalización que debe aplicar el motor es:
 *   1. venta_sin_iva = importe / 1.19  (si incluyeIva = true)
 *   2. Identificar el tipo con mayor venta_sin_iva.
 *   3. Descontar comisión bancaria SOLO sobre el tipo mayor.
 *   4. venta_neta del tipo mayor = venta_sin_iva × (1 - tasaComisionBancaria).
 *
 * Los resultados esperados están documentados en cada escenario.
 */
export const VENTAS_ICG_SEED: VentaICGData[] = [

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO A — LINEA con IVA, SIN comisión bancaria
  // venta_sin_iva = 1.190.000 / 1.19 = 1.000.000 | venta_neta = 1.000.000
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-22', codigoTienda: 'T001', idColaboradorMidasoft: 'EMP001',
    tipoVenta: TipoVenta.LINEA, importe: 1190000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'A: LINEA con IVA, sin comision bancaria',
  },
  {
    fecha: '2026-06-23', codigoTienda: 'T001', idColaboradorMidasoft: 'EMP002',
    tipoVenta: TipoVenta.LINEA, importe: 595000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'A: LINEA con IVA, sin comision bancaria',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO B — LINEA con IVA, CON comisión bancaria 3.2%
  // venta_sin_iva = 714.000 / 1.19 = 600.000 | venta_neta = 600.000 × 0.968 = 580.800
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-22', codigoTienda: 'T001', idColaboradorMidasoft: 'EMP001',
    tipoVenta: TipoVenta.LINEA, importe: 714000, incluyeIva: true, tasaComisionBancaria: 0.032,
    escenario: 'B: LINEA con IVA y comision bancaria 3.2%',
  },
  {
    fecha: '2026-06-24', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP006',
    tipoVenta: TipoVenta.LINEA, importe: 1071000, incluyeIva: true, tasaComisionBancaria: 0.032,
    escenario: 'B: LINEA con IVA y comision bancaria 3.2%',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO C — PROMOCION SIN IVA (importe ya es venta_sin_iva)
  // venta_sin_iva = 200.000 | venta_neta = 200.000
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-22', codigoTienda: 'T001', idColaboradorMidasoft: 'EMP003',
    tipoVenta: TipoVenta.PROMOCION, importe: 200000, incluyeIva: false, tasaComisionBancaria: 0,
    escenario: 'C: PROMOCION sin IVA',
  },
  {
    fecha: '2026-06-23', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP005',
    tipoVenta: TipoVenta.PROMOCION, importe: 150000, incluyeIva: false, tasaComisionBancaria: 0,
    escenario: 'C: PROMOCION sin IVA',
  },
  {
    fecha: '2026-06-24', codigoTienda: 'T004', idColaboradorMidasoft: 'EMP011',
    tipoVenta: TipoVenta.PROMOCION, importe: 320000, incluyeIva: false, tasaComisionBancaria: 0,
    escenario: 'C: PROMOCION sin IVA',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO D — LINEA_ESTRATEGIA con IVA, sin comisión bancaria
  // venta_sin_iva = 476.000 / 1.19 = 400.000 | venta_neta = 400.000
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-23', codigoTienda: 'T003', idColaboradorMidasoft: 'EMP009',
    tipoVenta: TipoVenta.LINEA_ESTRATEGIA, importe: 476000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'D: LINEA_ESTRATEGIA con IVA, sin comision',
  },
  {
    fecha: '2026-06-24', codigoTienda: 'T005', idColaboradorMidasoft: 'EMP014',
    tipoVenta: TipoVenta.LINEA_ESTRATEGIA, importe: 357000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'D: LINEA_ESTRATEGIA con IVA, sin comision',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO E — Normalización multi-tipo para EMP008 (mismo colaborador, misma fecha)
  //   LINEA          1.190.000 con IVA → sin_iva 1.000.000 (MAYOR) → tasa 3.2% → neta 968.000
  //   LINEA_ESTRATEG.  595.000 con IVA → sin_iva   500.000          → sin comisión → neta 500.000
  //   PROMOCION        238.000 con IVA → sin_iva   200.000          → sin comisión → neta 200.000
  // El motor debe descontar comisión bancaria ÚNICAMENTE sobre el tipo LINEA (el mayor).
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-25', codigoTienda: 'T003', idColaboradorMidasoft: 'EMP008',
    tipoVenta: TipoVenta.LINEA, importe: 1190000, incluyeIva: true, tasaComisionBancaria: 0.032,
    escenario: 'E: Normalizacion multi-tipo - LINEA mayor con comision bancaria',
  },
  {
    fecha: '2026-06-25', codigoTienda: 'T003', idColaboradorMidasoft: 'EMP008',
    tipoVenta: TipoVenta.LINEA_ESTRATEGIA, importe: 595000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'E: Normalizacion multi-tipo - LINEA_ESTRATEGIA sin comision',
  },
  {
    fecha: '2026-06-25', codigoTienda: 'T003', idColaboradorMidasoft: 'EMP008',
    tipoVenta: TipoVenta.PROMOCION, importe: 238000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'E: Normalizacion multi-tipo - PROMOCION sin comision',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO F — GlobalTienda T002: ventas del pool de la tienda
  // Todos los asesores aportan al total de tienda; se distribuye por días laborados (HU-3)
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-06-22', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP005',
    tipoVenta: TipoVenta.LINEA, importe: 892500, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'F: GlobalTienda T002 - aporte EMP005',
  },
  {
    fecha: '2026-06-23', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP005',
    tipoVenta: TipoVenta.LINEA_ESTRATEGIA, importe: 357000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'F: GlobalTienda T002 - aporte EMP005 estrategia',
  },
  {
    fecha: '2026-06-22', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP006',
    tipoVenta: TipoVenta.LINEA, importe: 1190000, incluyeIva: true, tasaComisionBancaria: 0.032,
    escenario: 'F: GlobalTienda T002 - aporte EMP006 con comision',
  },

  // ══════════════════════════════════════════════════════════════════════
  // ESCENARIO G — Período CERRADO ENE-2026: ventas históricas (inmutabilidad)
  // Sirve para verificar que el motor no permite reliquidar un período cerrado
  // ══════════════════════════════════════════════════════════════════════
  {
    fecha: '2026-01-25', codigoTienda: 'T001', idColaboradorMidasoft: 'EMP001',
    tipoVenta: TipoVenta.LINEA, importe: 1190000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'G: Historico periodo CERRADO ENE-2026',
  },
  {
    fecha: '2026-01-28', codigoTienda: 'T002', idColaboradorMidasoft: 'EMP005',
    tipoVenta: TipoVenta.LINEA, importe: 595000, incluyeIva: true, tasaComisionBancaria: 0,
    escenario: 'G: Historico periodo CERRADO ENE-2026',
  },

  // EMP020 (Coordinador Regional) — sin ventas propias en JUN-2026
  // La ausencia de registros valida que el motor lo maneje sin errores (resultado = 0)
];
