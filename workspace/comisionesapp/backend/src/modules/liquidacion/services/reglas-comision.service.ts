import { Injectable, Logger } from '@nestjs/common';
import {
  TipoDistribucion,
  TipoLiquidacion,
  ParametrizacionCargo,
} from '../../parametrizacion/entities/parametrizacion-cargo.entity';
import { TipoVenta } from '../entities/liquidacion-detalle.entity';
import {
  ColaboradorNormalizado,
  NormalizacionService,
} from './normalizacion.service';
import {
  AfectacionesService,
  Marcacion,
  Novedad,
  ResultadoAfectacion,
} from './afectaciones.service';

export interface ResultadoRegla {
  detalles: Array<{
    idColaborador: string;
    idCargo: string;
    idTienda: string | null;
    tipoVenta: TipoVenta;
    ventaBruta: number;
    ventaSinIva: number;
    comisionBancaria: number;
    ventaNeta: number;
    porcentajeAplicado: number;
    comision: number;
    diasLaborados: number | null;
    horasValidas: number | null;
    diasExcluidos: number | null;
    motivoExclusion: string | null;
    cumplePresupuesto: number | null;
    cumpleCrecimiento: number | null;
  }>;
}

/**
 * Aplica las 6 combinaciones de liquidación + distribución (HU-02 + HU-03).
 *
 *  Individual   + Individual         → comision = venta_neta_colaborador * %cargo
 *  GlobalTienda + Individual         → comision_tienda = venta_neta_tienda * %cargo;
 *                                     comision_colab = comision_tienda * (dias_laborados / dias_periodo)
 *  GlobalTienda + Proporcional       → comision_colab = comision_tienda * (horas_colab / horas_tienda)
 *  GlobalGrupoTiendas + Individual   → similar a GlobalTienda pero a nivel grupo
 *  GlobalGrupoTiendas + Proporcional → similar a GlobalTienda Proporcional pero a nivel grupo
 */
@Injectable()
export class ReglasComisionService {
  private readonly logger = new Logger(ReglasComisionService.name);

  constructor(
    private readonly afectaciones: AfectacionesService,
  ) {}

  aplicar(
    param: ParametrizacionCargo,
    colabsNormalizados: ColaboradorNormalizado[],
    novedadesPorColab: Map<string, Novedad[]>,
    marcacionesPorColab: Map<string, Marcacion[]>,
    presupuestoPorTiendaOCargo: number | null,
    ventaAnteriorPorUnidad: number | null,
  ): ResultadoRegla {
    const liq = param.tipoLiquidacion;
    const dist = param.tipoDistribucion;

    if (liq === TipoLiquidacion.INDIVIDUAL && dist === TipoDistribucion.INDIVIDUAL) {
      return this.reglaIndividualIndividual(param, colabsNormalizados,
        novedadesPorColab, marcacionesPorColab, presupuestoPorTiendaOCargo, ventaAnteriorPorUnidad);
    }
    if (liq === TipoLiquidacion.GLOBAL_TIENDA && dist === TipoDistribucion.INDIVIDUAL) {
      return this.reglaGlobalTiendaIndividual(param, colabsNormalizados,
        novedadesPorColab, marcacionesPorColab, presupuestoPorTiendaOCargo, ventaAnteriorPorUnidad);
    }
    if (liq === TipoLiquidacion.GLOBAL_TIENDA && dist === TipoDistribucion.PROPORCIONAL) {
      return this.reglaGlobalTiendaProporcional(param, colabsNormalizados,
        novedadesPorColab, marcacionesPorColab, presupuestoPorTiendaOCargo, ventaAnteriorPorUnidad);
    }
    if (liq === TipoLiquidacion.GLOBAL_GRUPO && dist === TipoDistribucion.PROPORCIONAL) {
      // TODO HU-03 Fase 3.4: agregar Tienda → GrupoTiendas para granular grupo.
      return this.reglaGlobalTiendaProporcional(param, colabsNormalizados,
        novedadesPorColab, marcacionesPorColab, presupuestoPorTiendaOCargo, ventaAnteriorPorUnidad);
    }
    // GlobalGrupo + Individual
    return this.reglaGlobalTiendaIndividual(param, colabsNormalizados,
      novedadesPorColab, marcacionesPorColab, presupuestoPorTiendaOCargo, ventaAnteriorPorUnidad);
  }

  // ── Regla 1: Individual + Individual ─────────────────────────────
  private reglaIndividualIndividual(
    param: ParametrizacionCargo,
    colabs: ColaboradorNormalizado[],
    nov: Map<string, Novedad[]>,
    mar: Map<string, Marcacion[]>,
    presupuesto: number | null,
    ventaAnt: number | null,
  ): ResultadoRegla {
    const detalles: ResultadoRegla['detalles'] = [];
    for (const c of colabs) {
      const afect = this.calcularAfectacion(c.idColaborador, param, nov, mar);
      const ventaNetaPorTipo = NormalizacionService.calcularVentaNeta(c.porTipo);
      const cumplePres = this.cumplePresupuesto(ventaNetaPorTipo, presupuesto);
      const cumpleCrec = this.cumpleCrecimiento(ventaNetaPorTipo, ventaAnt);

      const base = {
        idColaborador: c.idColaborador, idCargo: param.codigoOficio, idTienda: c.idTienda,
        diasLaborados: afect.diasLaborados, horasValidas: afect.horasValidas,
        diasExcluidos: afect.diasExcluidos, motivoExclusion: afect.motivoExclusion,
        cumplePresupuesto: cumplePres, cumpleCrecimiento: cumpleCrec,
      };

      detalles.push({
        ...base,
        tipoVenta: TipoVenta.LINEA,
        ventaBruta: c.porTipo[TipoVenta.LINEA].ventaSinIva,
        ventaSinIva: c.porTipo[TipoVenta.LINEA].ventaSinIva,
        comisionBancaria: c.porTipo[TipoVenta.LINEA].comisionBancaria,
        ventaNeta: ventaNetaPorTipo[TipoVenta.LINEA],
        porcentajeAplicado: param.porcLinea,
        comision: this.red(ventaNetaPorTipo[TipoVenta.LINEA] * param.porcLinea / 100),
      });
      detalles.push({
        ...base,
        tipoVenta: TipoVenta.PROMOCION,
        ventaBruta: c.porTipo[TipoVenta.PROMOCION].ventaSinIva,
        ventaSinIva: c.porTipo[TipoVenta.PROMOCION].ventaSinIva,
        comisionBancaria: c.porTipo[TipoVenta.PROMOCION].comisionBancaria,
        ventaNeta: ventaNetaPorTipo[TipoVenta.PROMOCION],
        porcentajeAplicado: param.porcPromocion,
        comision: this.red(ventaNetaPorTipo[TipoVenta.PROMOCION] * param.porcPromocion / 100),
      });
      detalles.push({
        ...base,
        tipoVenta: TipoVenta.LINEA_ESTRATEGIA,
        ventaBruta: c.porTipo[TipoVenta.LINEA_ESTRATEGIA].ventaSinIva,
        ventaSinIva: c.porTipo[TipoVenta.LINEA_ESTRATEGIA].ventaSinIva,
        comisionBancaria: c.porTipo[TipoVenta.LINEA_ESTRATEGIA].comisionBancaria,
        ventaNeta: ventaNetaPorTipo[TipoVenta.LINEA_ESTRATEGIA],
        porcentajeAplicado: param.porcEstrategia,
        comision: this.red(ventaNetaPorTipo[TipoVenta.LINEA_ESTRATEGIA] * param.porcEstrategia / 100),
      });
    }
    return { detalles };
  }

  // ── Regla 2: GlobalTienda + Individual ────────────────────────────
  private reglaGlobalTiendaIndividual(
    param: ParametrizacionCargo,
    colabs: ColaboradorNormalizado[],
    nov: Map<string, Novedad[]>,
    mar: Map<string, Marcacion[]>,
    presupuesto: number | null,
    ventaAnt: number | null,
  ): ResultadoRegla {
    const detalles: ResultadoRegla['detalles'] = [];
    const porTienda = this.agruparPorTienda(colabs);

    for (const [idTienda, colabsTienda] of porTienda) {
      const ventaNetaTienda = colabsTienda.reduce(
        (acc, c) => acc + c.totalSinIva - c.totalComBancaria, 0);
      const comisionTienda = this.red(ventaNetaTienda * param.porcLinea / 100);
      const diasEnPeriodo = this.diasEnPeriodo(param);

      for (const c of colabsTienda) {
        const afect = this.calcularAfectacion(c.idColaborador, param, nov, mar);
        const proporcionDias = diasEnPeriodo > 0 ? afect.diasLaborados / diasEnPeriodo : 0;
        const comision = this.red(comisionTienda * proporcionDias);

        detalles.push({
          idColaborador: c.idColaborador, idCargo: param.codigoOficio, idTienda: idTienda,
          tipoVenta: TipoVenta.LINEA,
          ventaBruta: c.totalSinIva, ventaSinIva: c.totalSinIva,
          comisionBancaria: c.totalComBancaria,
          ventaNeta: c.totalSinIva - c.totalComBancaria,
          porcentajeAplicado: param.porcLinea, comision,
          diasLaborados: afect.diasLaborados, horasValidas: afect.horasValidas,
          diasExcluidos: afect.diasExcluidos, motivoExclusion: afect.motivoExclusion,
          cumplePresupuesto: null, cumpleCrecimiento: null,
        });
      }
    }
    return { detalles };
  }

  // ── Regla 3: GlobalTienda + Proporcional (por horas) ──────────────
  private reglaGlobalTiendaProporcional(
    param: ParametrizacionCargo,
    colabs: ColaboradorNormalizado[],
    nov: Map<string, Novedad[]>,
    mar: Map<string, Marcacion[]>,
    presupuesto: number | null,
    ventaAnt: number | null,
  ): ResultadoRegla {
    const detalles: ResultadoRegla['detalles'] = [];
    const porTienda = this.agruparPorTienda(colabs);

    for (const [idTienda, colabsTienda] of porTienda) {
      const ventaNetaTienda = colabsTienda.reduce(
        (acc, c) => acc + c.totalSinIva - c.totalComBancaria, 0);
      const comisionTienda = this.red(ventaNetaTienda * param.porcLinea / 100);

      const afectaciones = colabsTienda.map((c) =>
        this.calcularAfectacion(c.idColaborador, param, nov, mar));
      const horasTienda = afectaciones.reduce((acc, a) => acc + a.horasValidas, 0);

      colabsTienda.forEach((c, i) => {
        const a = afectaciones[i];
        const proporcion = horasTienda > 0 ? a.horasValidas / horasTienda : 0;
        const comision = this.red(comisionTienda * proporcion);
        detalles.push({
          idColaborador: c.idColaborador, idCargo: param.codigoOficio, idTienda: idTienda,
          tipoVenta: TipoVenta.LINEA,
          ventaBruta: c.totalSinIva, ventaSinIva: c.totalSinIva,
          comisionBancaria: c.totalComBancaria,
          ventaNeta: c.totalSinIva - c.totalComBancaria,
          porcentajeAplicado: param.porcLinea, comision,
          diasLaborados: a.diasLaborados, horasValidas: a.horasValidas,
          diasExcluidos: a.diasExcluidos, motivoExclusion: a.motivoExclusion,
          cumplePresupuesto: null, cumpleCrecimiento: null,
        });
      });
    }
    return { detalles };
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private agruparPorTienda(colabs: ColaboradorNormalizado[]): Map<string, ColaboradorNormalizado[]> {
    const m = new Map<string, ColaboradorNormalizado[]>();
    for (const c of colabs) {
      const list = m.get(c.idTienda) ?? [];
      list.push(c);
      m.set(c.idTienda, list);
    }
    return m;
  }

  private diasEnPeriodo(param: ParametrizacionCargo): number {
    const ini = param.periodo?.fechaInicio;
    const fin = param.periodo?.fechaFin;
    if (!ini || !fin) return 30;
    const da = new Date(ini + 'T00:00:00Z').getTime();
    const db = new Date(fin + 'T00:00:00Z').getTime();
    return Math.floor((db - da) / 86_400_000) + 1;
  }

  private calcularAfectacion(
    idColab: string,
    param: ParametrizacionCargo,
    nov: Map<string, Novedad[]>,
    mar: Map<string, Marcacion[]>,
  ): ResultadoAfectacion {
    const ini = param.periodo?.fechaInicio;
    const fin = param.periodo?.fechaFin;
    if (!ini || !fin) {
      return { diasLaborados: 0, horasValidas: 0, diasExcluidos: 0, motivoExclusion: null, participacion: 0 };
    }
    return this.afectaciones.calcular(
      ini, fin,
      nov.get(idColab) ?? [],
      mar.get(idColab) ?? [],
    );
  }

  private cumplePresupuesto(ventaNetaPorTipo: Record<TipoVenta, number>, presupuesto: number | null): number | null {
    if (presupuesto == null) return null;
    const total = Object.values(ventaNetaPorTipo).reduce((a, b) => a + b, 0);
    return this.afectaciones.calcularCumplimientoPresupuesto(total, presupuesto);
  }

  private cumpleCrecimiento(ventaNetaPorTipo: Record<TipoVenta, number>, ventaAnt: number | null): number | null {
    if (ventaAnt == null) return null;
    const total = Object.values(ventaNetaPorTipo).reduce((a, b) => a + b, 0);
    return this.afectaciones.calcularCumplimientoCrecimiento(total, ventaAnt);
  }

  private red(v: number): number {
    return Math.round(v * 100) / 100;
  }
}