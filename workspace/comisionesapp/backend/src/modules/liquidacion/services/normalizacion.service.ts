import { Injectable, Logger } from '@nestjs/common';
import { TipoVenta } from '../entities/liquidacion-detalle.entity';

/** Venta cruda tal como llega de ICG (o de la tabla venta_icg). */
export interface VentaBruta {
  fecha: string;
  idTienda: string;
  idColaborador: string;
  tipoVenta: TipoVenta;
  importe: number;          // puede incluir IVA
  incluyeIva: boolean;
  tasaComisionBancaria: number;
}

/** Venta normalizada: sin IVA, agrupada por tipo. */
export interface VentaNormalizada {
  idColaborador: string;
  idTienda: string;
  tipoVenta: TipoVenta;
  ventaSinIva: number;
  comisionBancaria: number;   // prorrateada por importe
}

/** Resultado de la normalización por colaborador (suma por tipo). */
export interface ColaboradorNormalizado {
  idColaborador: string;
  idTienda: string;
  porTipo: Record<TipoVenta, { ventaSinIva: number; comisionBancaria: number }>;
  totalSinIva: number;
  totalComBancaria: number;
}

const IVA = 1.19;

@Injectable()
export class NormalizacionService {
  private readonly logger = new Logger(NormalizacionService.name);

  /**
   * Normaliza ventas (HU-03 — Normalización financiera):
   * 1. ÷1.19 por transacción si incluye IVA.
   * 2. Agrupa por (colaborador, tienda, tipo de venta).
   * 3. Prorratea la comisión bancaria TOTAL entre colaboradores según su
   *    participación en la venta, y la asigna al tipo de mayor valor de cada uno.
   */
  normalizar(
    ventas: VentaBruta[],
    comisionBancariaTotal: number,
  ): ColaboradorNormalizado[] {
    // 1) ÷1.19 + 2) agrupación
    const porColab = new Map<string, ColaboradorNormalizado>();

    for (const v of ventas) {
      const sinIva = v.incluyeIva ? v.importe / IVA : v.importe;
      const key = `${v.idColaborador}|${v.idTienda}`;
      let n = porColab.get(key);
      if (!n) {
        n = {
          idColaborador: v.idColaborador,
          idTienda: v.idTienda,
          porTipo: {
            [TipoVenta.LINEA]:            { ventaSinIva: 0, comisionBancaria: 0 },
            [TipoVenta.LINEA_ESTRATEGIA]: { ventaSinIva: 0, comisionBancaria: 0 },
            [TipoVenta.PROMOCION]:        { ventaSinIva: 0, comisionBancaria: 0 },
          },
          totalSinIva: 0,
          totalComBancaria: 0,
        };
        porColab.set(key, n);
      }
      n.porTipo[v.tipoVenta].ventaSinIva += sinIva;
      n.totalSinIva += sinIva;
    }

    // 3) Comisión bancaria: prorrateada por participación en la venta total
    //    (el total del período NO puede descontarse completo a cada colaborador)
    //    y asignada al tipo de mayor acumulado de cada colaborador.
    const ventaGlobal = [...porColab.values()].reduce((acc, n) => acc + n.totalSinIva, 0);
    for (const n of porColab.values()) {
      let tipoMax: TipoVenta = TipoVenta.LINEA;
      let max = -1;
      for (const tipo of Object.values(TipoVenta)) {
        const v = n.porTipo[tipo].ventaSinIva;
        if (v > max) { max = v; tipoMax = tipo; }
      }
      // Si hay varios en cero, el mayor es LINEA por default.
      if (max > 0 && ventaGlobal > 0) {
        const parte = comisionBancariaTotal * (n.totalSinIva / ventaGlobal);
        n.porTipo[tipoMax].comisionBancaria = parte;
        n.totalComBancaria = parte;
      }
    }

    this.logger.log(
      `Normalización: ${ventas.length} ventas → ${porColab.size} colaboradores`,
    );
    return [...porColab.values()];
  }

  /** Construye el mapa de venta_neta por tipo, descontando com. bancaria del tipo mayor. */
  static calcularVentaNeta(
    porTipo: ColaboradorNormalizado['porTipo'],
  ): Record<TipoVenta, number> {
    return {
      [TipoVenta.LINEA]:            porTipo[TipoVenta.LINEA].ventaSinIva            - porTipo[TipoVenta.LINEA].comisionBancaria,
      [TipoVenta.LINEA_ESTRATEGIA]: porTipo[TipoVenta.LINEA_ESTRATEGIA].ventaSinIva - porTipo[TipoVenta.LINEA_ESTRATEGIA].comisionBancaria,
      [TipoVenta.PROMOCION]:        porTipo[TipoVenta.PROMOCION].ventaSinIva        - porTipo[TipoVenta.PROMOCION].comisionBancaria,
    };
  }
}