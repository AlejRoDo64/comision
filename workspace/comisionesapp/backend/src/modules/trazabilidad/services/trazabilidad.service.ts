import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Liquidacion, EstadoLiquidacion } from '../../liquidacion/entities/liquidacion.entity';
import { LiquidacionDetalle, TipoVenta } from '../../liquidacion/entities/liquidacion-detalle.entity';
import { LiquidacionSubperiodo } from '../../liquidacion/entities/liquidacion-subperiodo.entity';
import {
  AuditoriaConsulta,
  AccionAuditoria,
} from '../entities/auditoria-consulta.entity';
import { FiltrosTrazabilidadDto } from '../dto/filtros-trazabilidad.dto';

export interface ResumenTrazabilidad {
  idLiquidacion: string;
  idPeriodo: string;
  periodoCodigo: string;
  estado: EstadoLiquidacion;
  totalColaboradores: number;
  totalTiendas: number;
  totalComision: number;
  fechaInicio: string;
  fechaCierre: string | null;
}

export interface DetalleTrazabilidad {
  idLiquidacion: string;
  idColaborador: string;
  idCargo: string;
  idTienda: string | null;
  /** Código de tienda del origen (CO de ICG) cuando no hay tienda en catálogo local */
  codigoTienda: string | null;
  periodoCodigo: string;
  parametrizacion: {
    tipoLiquidacion: string;
    tipoDistribucion: string;
    porcLinea: number;
    porcPromocion: number;
    porcEstrategia: number;
    estrategiaTipoDescuento: string | null;
    estrategiaPorcDescuentoCorporativo: number | null;
  } | null;
  base: {
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
  };
  afectacion: {
    subperiodoId: string;
    fechaInicioSub: string;
    fechaFinSub: string;
    motivo: string;
  };
  desglose: Array<{
    tipoVenta: TipoVenta;
    ventaBruta: number;
    ventaSinIva: number;
    comisionBancaria: number;
    ventaNeta: number;
    porcentajeAplicado: number;
    comision: number;
  }>;
}

@Injectable()
export class TrazabilidadService {
  private readonly logger = new Logger(TrazabilidadService.name);

  constructor(
    @InjectRepository(Liquidacion)
    private readonly liqRepo: Repository<Liquidacion>,
    @InjectRepository(LiquidacionDetalle)
    private readonly detRepo: Repository<LiquidacionDetalle>,
    @InjectRepository(LiquidacionSubperiodo)
    private readonly subRepo: Repository<LiquidacionSubperiodo>,
    @InjectRepository(AuditoriaConsulta)
    private readonly audRepo: Repository<AuditoriaConsulta>,
  ) {}

  // ── Resumen con filtros (HU-04) ──────────────────────────────────

  async resumen(
    filtros: FiltrosTrazabilidadDto,
    usuario: string,
  ): Promise<ResumenTrazabilidad[]> {
    const t0 = Date.now();
    const qb = this.liqRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.periodo', 'periodo')
      .leftJoinAndSelect('periodo.calendario', 'calendario')
      .where('l.estado IN (:...estados)', {
        estados: [EstadoLiquidacion.LIQUIDADO, EstadoLiquidacion.CERRADO],
      });

    if (filtros.idCalendario) qb.andWhere('calendario.id_calendario = :idCal', { idCal: filtros.idCalendario });
    if (filtros.anio)        qb.andWhere('calendario.anio = :anio', { anio: filtros.anio });
    if (filtros.idPeriodo)   qb.andWhere('periodo.id_periodo = :idPer', { idPer: filtros.idPeriodo });
    if (filtros.idLiquidacion) qb.andWhere('l.id_liquidacion = :idLiq', { idLiq: filtros.idLiquidacion });
    if (filtros.comisionMin != null) qb.andWhere('l.total_comision >= :min', { min: filtros.comisionMin });
    if (filtros.comisionMax != null) qb.andWhere('l.total_comision <= :max', { max: filtros.comisionMax });

    // Filtros por contenido del detalle (HU-04: combinables) — EXISTS sobre
    // liquidacion_detalle para no multiplicar filas del resumen.
    const filtrosDetalle: string[] = [];
    const paramsDetalle: Record<string, unknown> = {};
    if (filtros.idColaborador) {
      filtrosDetalle.push('d.id_colaborador = :fColab');
      paramsDetalle.fColab = filtros.idColaborador;
    }
    if (filtros.codigoOficio) {
      filtrosDetalle.push('d.id_cargo = :fCargo');
      paramsDetalle.fCargo = filtros.codigoOficio;
    }
    if (filtros.idTienda) {
      filtrosDetalle.push('d.id_tienda = :fTienda');
      paramsDetalle.fTienda = filtros.idTienda;
    }
    if (filtros.codigoTienda) {
      filtrosDetalle.push('d.codigo_tienda = :fCodTienda');
      paramsDetalle.fCodTienda = filtros.codigoTienda;
    }
    if (filtrosDetalle.length) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM liquidacion_detalle d
           WHERE d.id_liquidacion = l.id_liquidacion AND ${filtrosDetalle.join(' AND ')})`,
        paramsDetalle,
      );
    }

    // Tipo de liquidación/distribución: viven en el snapshot JSON de la
    // parametrización usada (HU-04 exige consultar contra esa versión).
    if (filtros.tipoLiquidacion) {
      qb.andWhere('l.parametrizacion_json LIKE :fLiq', {
        fLiq: `%"tipoLiquidacion":"${filtros.tipoLiquidacion}"%`,
      });
    }
    if (filtros.tipoDistribucion) {
      qb.andWhere('l.parametrizacion_json LIKE :fDist', {
        fDist: `%"tipoDistribucion":"${filtros.tipoDistribucion}"%`,
      });
    }

    qb.orderBy('periodo.fecha_inicio', 'DESC');

    const rows = await qb.getMany();
    const resultado: ResumenTrazabilidad[] = rows.map((l) => ({
      idLiquidacion: l.idLiquidacion,
      idPeriodo: l.periodo?.idPeriodo ?? '',
      periodoCodigo: l.periodo?.codigo ?? '',
      estado: l.estado,
      totalColaboradores: l.totalColaboradores ?? 0,
      totalTiendas: l.totalTiendas ?? 0,
      totalComision: l.totalComision ?? 0,
      fechaInicio: l.fechaInicio?.toISOString() ?? '',
      fechaCierre: l.fechaCierre?.toISOString() ?? null,
    }));

    await this.auditar(AccionAuditoria.CONSULTA_RESUMEN, filtros.idLiquidacion ?? null, filtros.idColaborador ?? null, filtros, usuario, Date.now() - t0);
    return resultado;
  }

  // ── Drill-down por colaborador (HU-04) ─────────────────────────

  async drillDown(
    idLiquidacion: string,
    idColaborador: string,
    usuario: string,
  ): Promise<DetalleTrazabilidad | null> {
    const t0 = Date.now();
    const detalles = await this.detRepo.find({
      where: { idLiquidacion, idColaborador },
    });
    if (!detalles.length) {
      await this.auditar(AccionAuditoria.DRILLDOWN, idLiquidacion, idColaborador, null, usuario, Date.now() - t0);
      return null;
    }

    const sub = await this.subRepo.findOne({ where: { idSubperiodo: detalles[0].idSubperiodo } });
    const liquidacion = await this.liqRepo.findOne({
      where: { idLiquidacion },
      relations: ['periodo', 'periodo.calendario'],
    });

    // El snapshot es un ARREGLO (una entrada por cargo parametrizado):
    // se toma la parametrización del cargo del colaborador consultado.
    const snapshotRaw = liquidacion?.parametrizacionJson
      ? JSON.parse(liquidacion.parametrizacionJson)
      : null;
    const snapshot = Array.isArray(snapshotRaw)
      ? snapshotRaw.find((s) => s.codigoOficio === detalles[0].idCargo) ?? snapshotRaw[0] ?? null
      : snapshotRaw;

    const totalBruta  = detalles.reduce((a, d) => a + Number(d.ventaBruta), 0);
    const totalSinIva = detalles.reduce((a, d) => a + Number(d.ventaSinIva), 0);
    const totalComBan = detalles.reduce((a, d) => a + Number(d.comisionBancaria), 0);
    const totalNeta    = detalles.reduce((a, d) => a + Number(d.ventaNeta), 0);
    const totalComis   = detalles.reduce((a, d) => a + Number(d.comision), 0);

    const primerDet = detalles[0];

    const desglose = detalles.map((d) => ({
      tipoVenta: d.tipoVenta,
      ventaBruta: Number(d.ventaBruta),
      ventaSinIva: Number(d.ventaSinIva),
      comisionBancaria: Number(d.comisionBancaria),
      ventaNeta: Number(d.ventaNeta),
      porcentajeAplicado: Number(d.porcentajeAplicado),
      comision: Number(d.comision),
    }));

    await this.auditar(AccionAuditoria.DRILLDOWN, idLiquidacion, idColaborador, null, usuario, Date.now() - t0);

    return {
      idLiquidacion,
      idColaborador,
      idCargo: primerDet.idCargo,
      idTienda: primerDet.idTienda ?? null,
      codigoTienda: primerDet.codigoTienda ?? null,
      periodoCodigo: liquidacion?.periodo?.codigo ?? '',
      parametrizacion: snapshot ? {
        tipoLiquidacion: snapshot.tipoLiquidacion,
        tipoDistribucion: snapshot.tipoDistribucion,
        porcLinea: Number(snapshot.porcLinea),
        porcPromocion: Number(snapshot.porcPromocion),
        porcEstrategia: Number(snapshot.porcEstrategia),
        estrategiaTipoDescuento: snapshot.estrategiaTipoDescuento ?? null,
        estrategiaPorcDescuentoCorporativo: snapshot.estrategiaPorcDescuentoCorporativo ?? null,
      } : null,
      base: {
        ventaBruta: totalBruta,
        ventaSinIva: totalSinIva,
        comisionBancaria: totalComBan,
        ventaNeta: totalNeta,
        porcentajeAplicado: detalles[0] ? Number(detalles[0].porcentajeAplicado) : 0,
        comision: totalComis,
        diasLaborados: primerDet.diasLaborados,
        horasValidas: primerDet.horasValidas != null ? Number(primerDet.horasValidas) : null,
        diasExcluidos: primerDet.diasExcluidos,
        motivoExclusion: primerDet.motivoExclusion,
        cumplePresupuesto: primerDet.cumplePresupuesto != null ? Number(primerDet.cumplePresupuesto) : null,
        cumpleCrecimiento: primerDet.cumpleCrecimiento != null ? Number(primerDet.cumpleCrecimiento) : null,
      },
      afectacion: {
        subperiodoId: primerDet.idSubperiodo,
        fechaInicioSub: sub?.fechaInicio ?? '',
        fechaFinSub: sub?.fechaFin ?? '',
        motivo: sub?.motivo ?? '',
      },
      desglose,
    };
  }

  // ── Exportación CSV (HU-04) ─────────────────────────────────────

  async exportarCsv(
    idLiquidacion: string,
    usuario: string,
  ): Promise<string> {
    const t0 = Date.now();
    const detalles = await this.detRepo.find({
      where: { idLiquidacion },
      order: { idColaborador: 'ASC', tipoVenta: 'ASC' },
    });

    const SEP = ';';
    const HEADERS = [
      'id_colaborador', 'id_cargo', 'codigo_tienda', 'tipo_venta',
      'venta_bruta', 'venta_sin_iva', 'comision_bancaria', 'venta_neta',
      'porcentaje_aplicado', 'comision',
      'dias_laborados', 'horas_validas', 'dias_excluidos', 'motivo_exclusion',
    ];
    const lineas = [HEADERS.join(SEP)];
    for (const d of detalles) {
      lineas.push([
        d.idColaborador, d.idCargo, d.codigoTienda ?? d.idTienda ?? '',
        d.tipoVenta,
        d.ventaBruta, d.ventaSinIva, d.comisionBancaria, d.ventaNeta,
        d.porcentajeAplicado, d.comision,
        d.diasLaborados ?? '', d.horasValidas ?? '', d.diasExcluidos ?? '',
        d.motivoExclusion ?? '',
      ].join(SEP));
    }

    await this.auditar(AccionAuditoria.EXPORTACION, idLiquidacion, null, null, usuario, Date.now() - t0);
    return lineas.join('\n') + '\n';
  }

  // ── Auditoría ─────────────────────────────────────────────────────

  private async auditar(
    accion: AccionAuditoria,
    idLiquidacion: string | null,
    idColaborador: string | null,
    filtros: FiltrosTrazabilidadDto | null,
    usuario: string,
    duracionMs: number,
  ): Promise<void> {
    await this.audRepo.save({
      idLiquidacion,
      idColaborador,
      accion,
      filtrosJson: filtros ? JSON.stringify(filtros) : null,
      usuario,
      duracionMs,
    });
  }

  /**
   * Devuelve la lista de IDs de colaboradores distintos que tienen detalle
   * en una liquidación. Endpoint batch (HU-04) para que el frontend pueda
   * poblar la lista de drill-down sin N llamadas individuales.
   */
  async listarColaboradores(
    idLiquidacion: string,
    usuario: string,
  ): Promise<string[]> {
    const t0 = Date.now();
    const rows = await this.detRepo
      .createQueryBuilder('d')
      .select('DISTINCT d.id_colaborador', 'id')
      .where('d.id_liquidacion = :idLiq', { idLiq: idLiquidacion })
      .orderBy('id', 'ASC')
      .getRawMany<{ id: string }>();

    const ids = rows.map((r) => r.id).filter(Boolean);
    await this.audRepo.save({
      idLiquidacion,
      idColaborador: null,
      accion: AccionAuditoria.CONSULTA_RESUMEN,
      filtrosJson: JSON.stringify({ op: 'listarColaboradores' }),
      usuario,
      duracionMs: Date.now() - t0,
    });
    return ids;
  }
}