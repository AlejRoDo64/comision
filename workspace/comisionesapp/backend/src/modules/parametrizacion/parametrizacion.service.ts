import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  TipoEntidadLog,
  AccionLog,
  LogEstructuralService,
} from '../../common/audit';
import {
  ParametrizacionCargo,
  TipoLiquidacion,
  TipoDistribucion,
  EstrategiaTipoDescuento,
} from './entities/parametrizacion-cargo.entity';
import { RangoComision } from './entities/rango-comision.entity';
import { Periodo } from '../calendarios/entities/periodo.entity';
import { CrearParametrizacionDto } from './dto/crear-parametrizacion.dto';
import { ActualizarParametrizacionDto } from './dto/actualizar-parametrizacion.dto';
import { CrearRangoDto } from './dto/crear-rango.dto';
import {
  CARGOS_CATALOGO,
  ICargosCatalogo,
  type CargoCatalogo,
} from './services/cargos-catalogo.service';
import { validarContinuidadRangos } from './validaciones/validar-rangos.util';

@Injectable()
export class ParametrizacionService {
  constructor(
    @InjectRepository(ParametrizacionCargo)
    private readonly paramRepo: Repository<ParametrizacionCargo>,
    @InjectRepository(RangoComision)
    private readonly rangoRepo: Repository<RangoComision>,
    @InjectRepository(Periodo)
    private readonly periodoRepo: Repository<Periodo>,
    @Inject(CARGOS_CATALOGO)
    private readonly cargosCatalogo: ICargosCatalogo,
    private readonly dataSource: DataSource,
    private readonly logService: LogEstructuralService,
  ) {}

  /** Catálogo oficial de cargos comisionables (HU-02). */
  async catalogoCargos(): Promise<CargoCatalogo[]> {
    return this.cargosCatalogo.listar();
  }

  /** Lista configuraciones, filtrables por período y/o cargo. */
  findAll(idPeriodo?: string, codigoOficio?: string): Promise<ParametrizacionCargo[]> {
    const qb = this.paramRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.periodo', 'periodo')
      .leftJoinAndSelect('periodo.calendario', 'calendario')
      .leftJoinAndSelect('p.rangos', 'rangos')
      .orderBy('p.codigoOficio', 'ASC')
      .addOrderBy('rangos.desdePorc', 'ASC');

    if (idPeriodo) qb.andWhere('p.id_periodo = :idPeriodo', { idPeriodo });
    if (codigoOficio) qb.andWhere('p.codigo_oficio = :codigoOficio', { codigoOficio });
    return qb.getMany();
  }

  async findOne(id: string): Promise<ParametrizacionCargo> {
    const param = await this.paramRepo.findOne({
      where: { idParametrizacion: id },
      relations: ['periodo', 'periodo.calendario', 'rangos'],
    });
    if (!param) throw new NotFoundException(`Parametrización ${id} no encontrada`);
    return param;
  }

  /**
   * Devuelve la parametrización VIGENTE para un cargo en una fecha dada (HU-02).
   * Considera estadoActivo + vigencia_desde + vigencia_hasta.
   * Retorna null si no hay ninguna aplicable.
   */
  async findVigente(
    codigoOficio: string,
    fecha: string,
  ): Promise<ParametrizacionCargo | null> {
    const qb = this.paramRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.periodo', 'periodo')
      .leftJoinAndSelect('p.rangos', 'rangos')
      .where('p.codigo_oficio = :codigoOficio', { codigoOficio })
      .andWhere('p.estado_activo = 1')
      .andWhere('(p.vigencia_desde IS NULL OR p.vigencia_desde <= :fecha)', { fecha })
      .andWhere('(p.vigencia_hasta IS NULL OR p.vigencia_hasta >= :fecha)', { fecha })
      .orderBy('p.vigencia_desde', 'DESC')
      .addOrderBy('p.createdAt', 'DESC');

    const results = await qb.getMany();
    return results[0] ?? null;
  }

  async create(dto: CrearParametrizacionDto, usuario: string): Promise<ParametrizacionCargo> {
    const cargo = await this.validarCargoOficial(dto.codigoOficio);
    const periodo = await this.validarPeriodo(dto.idPeriodo);

    this.validarCruzadaLiqDist(dto.tipoLiquidacion, dto.tipoDistribucion);
    this.validarEstrategia(dto);
    this.validarVigencia(dto.vigenciaDesde, dto.vigenciaHasta);
    this.validarRangos(dto.rangos);

    // Vigencia sin solapamiento contra otras activas del mismo cargo
    if (dto.vigenciaDesde || dto.vigenciaHasta) {
      await this.validarVigenciaNoSolapa(
        dto.codigoOficio,
        dto.idPeriodo,
        dto.vigenciaDesde ?? null,
        dto.vigenciaHasta ?? null,
      );
    } else {
      // Sin vigencia explícita: bloquea duplicado activo (igual que antes)
      const duplicada = await this.paramRepo.findOne({
        where: {
          codigoOficio: dto.codigoOficio,
          periodo: { idPeriodo: dto.idPeriodo },
          estadoActivo: true,
        },
      });
      if (duplicada) {
        throw new BadRequestException(
          `Ya existe una parametrización activa para el cargo ${cargo.nombre} en el período ${periodo.codigo}. ` +
            'Defina vigencias o edítela.',
        );
      }
    }

    const param = this.paramRepo.create({
      codigoOficio: dto.codigoOficio,
      nombreCargo: cargo.nombre,
      periodo,
      tipoLiquidacion: dto.tipoLiquidacion,
      tipoDistribucion: dto.tipoDistribucion,
      porcLinea: dto.porcLinea,
      porcPromocion: dto.porcPromocion,
      porcEstrategia: this.calcularPorcEstrategia(dto),
      validarPresupuesto: dto.validarPresupuesto ?? false,
      validarCrecimiento: dto.validarCrecimiento ?? false,
      tipoAfectacion: dto.tipoAfectacion,
      vigenciaDesde: dto.vigenciaDesde ?? null,
      vigenciaHasta: dto.vigenciaHasta ?? null,
      estrategiaTipoDescuento: dto.estrategiaTipoDescuento ?? null,
      estrategiaPorcDescuentoCorporativo:
        dto.estrategiaPorcDescuentoCorporativo ?? null,
      motivo: dto.motivo,
      usuarioCambio: usuario,
      rangos: dto.rangos.map((r) =>
        this.rangoRepo.create({ ...r, hastaPorc: r.hastaPorc ?? null }),
      ),
    });
    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(ParametrizacionCargo).save(param);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PARAMETRIZACION,
        idEntidad: saved.idParametrizacion,
        accion: AccionLog.CREATE,
        datosNuevos: saved,
        usuario,
        motivo: dto.motivo,
      }, manager);
      return saved;
    });
  }

  async update(
    id: string,
    dto: ActualizarParametrizacionDto,
    usuario: string,
  ): Promise<ParametrizacionCargo> {
    const param = await this.findOne(id);
    const anteriores = { ...param, rangos: param.rangos?.map((r) => ({ ...r })) };

    if (dto.codigoOficio && dto.codigoOficio !== param.codigoOficio) {
      const cargo = await this.validarCargoOficial(dto.codigoOficio);
      param.codigoOficio = dto.codigoOficio;
      param.nombreCargo = cargo.nombre;
    }
    if (dto.idPeriodo && dto.idPeriodo !== param.periodo.idPeriodo) {
      param.periodo = await this.validarPeriodo(dto.idPeriodo);
    }
    if (dto.tipoLiquidacion) param.tipoLiquidacion = dto.tipoLiquidacion;
    if (dto.tipoDistribucion) param.tipoDistribucion = dto.tipoDistribucion;

    this.validarCruzadaLiqDist(param.tipoLiquidacion, param.tipoDistribucion);

    if (dto.porcLinea != null) param.porcLinea = dto.porcLinea;
    if (dto.porcPromocion != null) param.porcPromocion = dto.porcPromocion;
    if (dto.porcEstrategia != null) param.porcEstrategia = dto.porcEstrategia;
    if (dto.validarPresupuesto != null) param.validarPresupuesto = dto.validarPresupuesto;
    if (dto.validarCrecimiento != null) param.validarCrecimiento = dto.validarCrecimiento;
    if (dto.tipoAfectacion) param.tipoAfectacion = dto.tipoAfectacion;
    if (dto.vigenciaDesde !== undefined) param.vigenciaDesde = dto.vigenciaDesde ?? null;
    if (dto.vigenciaHasta !== undefined) param.vigenciaHasta = dto.vigenciaHasta ?? null;
    if (dto.estrategiaTipoDescuento !== undefined) {
      param.estrategiaTipoDescuento = dto.estrategiaTipoDescuento ?? null;
    }
    if (dto.estrategiaPorcDescuentoCorporativo !== undefined) {
      param.estrategiaPorcDescuentoCorporativo =
        dto.estrategiaPorcDescuentoCorporativo ?? null;
    }

    this.validarEstrategia({
      porcLinea: param.porcLinea,
      porcEstrategia: param.porcEstrategia,
      estrategiaTipoDescuento: param.estrategiaTipoDescuento ?? undefined,
      estrategiaPorcDescuentoCorporativo:
        param.estrategiaPorcDescuentoCorporativo ?? undefined,
    } as CrearParametrizacionDto);
    this.validarVigencia(param.vigenciaDesde ?? undefined, param.vigenciaHasta ?? undefined);

    // Re-validar solapamiento de vigencias (misma regla que en create),
    // excluyendo la propia parametrización.
    if (param.vigenciaDesde || param.vigenciaHasta) {
      await this.validarVigenciaNoSolapa(
        param.codigoOficio,
        param.periodo.idPeriodo,
        param.vigenciaDesde,
        param.vigenciaHasta,
        id,
      );
    }

    if (dto.rangos) {
      this.validarRangos(dto.rangos);
    }

    param.motivo = dto.motivo;
    param.usuarioCambio = usuario;

    // Reemplazo de rangos + save + log en UNA transacción: si el save falla,
    // la parametrización no queda sin rangos.
    return this.dataSource.transaction(async (manager) => {
      if (dto.rangos) {
        await manager
          .getRepository(RangoComision)
          .delete({ parametrizacion: { idParametrizacion: id } });
        param.rangos = dto.rangos.map((r) =>
          this.rangoRepo.create({ ...r, hastaPorc: r.hastaPorc ?? null }),
        );
      }
      const saved = await manager.getRepository(ParametrizacionCargo).save(param);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PARAMETRIZACION,
        idEntidad: id,
        accion: AccionLog.UPDATE,
        datosAnteriores: anteriores,
        datosNuevos: saved,
        usuario,
        motivo: dto.motivo,
      }, manager);
      return saved;
    });
  }

  /** Desactiva (no borra) — la HU exige conservar histórico para auditoría. */
  async desactivar(id: string, usuario: string): Promise<ParametrizacionCargo> {
    const param = await this.findOne(id);
    const anteriores = { ...param, rangos: undefined };
    param.estadoActivo = false;
    param.usuarioCambio = usuario;
    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(ParametrizacionCargo).save(param);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PARAMETRIZACION,
        idEntidad: id,
        accion: AccionLog.UPDATE,
        datosAnteriores: anteriores,
        datosNuevos: { estadoActivo: false },
        usuario,
        motivo: 'Desactivación',
      }, manager);
      return saved;
    });
  }

  /** Eliminación física — solo para configuraciones creadas por error. */
  async remove(id: string, usuario: string): Promise<{ mensaje: string }> {
    const param = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ParametrizacionCargo).remove(param);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PARAMETRIZACION,
        idEntidad: id,
        accion: AccionLog.DELETE,
        datosAnteriores: param,
        usuario,
      }, manager);
    });
    return { mensaje: 'Parametrización eliminada correctamente' };
  }

  // ── Validaciones de negocio (HU-02) ────────────────────────────────

  private async validarCargoOficial(codigoOficio: string): Promise<CargoCatalogo> {
    const cargo = await this.cargosCatalogo.buscarPorCodigo(codigoOficio);
    if (!cargo) {
      throw new BadRequestException(
        `El código de oficio ${codigoOficio} no existe en el catálogo oficial de Midasoft`,
      );
    }
    return cargo;
  }

  private async validarPeriodo(idPeriodo: string): Promise<Periodo> {
    const periodo = await this.periodoRepo.findOne({
      where: { idPeriodo },
      relations: ['calendario'],
    });
    if (!periodo) throw new NotFoundException(`Período ${idPeriodo} no encontrado`);
    return periodo;
  }

  /**
   * Regla cruzada (HU-02): Liquidación Individual solo admite Distribución Individual.
   * Si es Global Tienda/Grupo → Individual o Proporcional.
   */
  private validarCruzadaLiqDist(
    liq: TipoLiquidacion,
    dist: TipoDistribucion,
  ): void {
    if (liq === TipoLiquidacion.INDIVIDUAL && dist !== TipoDistribucion.INDIVIDUAL) {
      throw new BadRequestException(
        'Liquidación Individual solo admite Distribución Individual.',
      );
    }
  }

  /** Vigencia: desde <= hasta. */
  private validarVigencia(
    desde: string | undefined,
    hasta: string | undefined,
  ): void {
    if (desde && hasta && hasta < desde) {
      throw new BadRequestException(
        'vigenciaHasta debe ser mayor o igual que vigenciaDesde.',
      );
    }
  }

  /**
   * Vigencia sin solapamiento contra otras parametrizaciones activas del mismo
   * (codigoOficio, periodo). Si una tiene vigencia NULA, se considera "siempre vigente"
   * y bloquea a cualquier otra con cualquier rango.
   */
  private async validarVigenciaNoSolapa(
    codigoOficio: string,
    idPeriodo: string,
    desde: string | null,
    hasta: string | null,
    excludeId?: string,
  ): Promise<void> {
    const candidatas = await this.paramRepo.find({
      where: {
        codigoOficio,
        periodo: { idPeriodo },
        estadoActivo: true,
      },
    });

    for (const otra of candidatas) {
      if (excludeId && otra.idParametrizacion === excludeId) continue;
      if (this.vigenciasSolapan(desde, hasta, otra.vigenciaDesde, otra.vigenciaHasta)) {
        throw new BadRequestException(
          `La vigencia se solapa con la parametrización ${otra.idParametrizacion} ` +
            `(${otra.vigenciaDesde ?? '∞'} → ${otra.vigenciaHasta ?? '∞'}).`,
        );
      }
    }
  }

  private vigenciasSolapan(
    aDesde: string | null,
    aHasta: string | null,
    bDesde: string | null,
    bHasta: string | null,
  ): boolean {
    const aD = aDesde ?? '-9999-12-31';
    const aH = aHasta  ?? '9999-12-31';
    const bD = bDesde ?? '-9999-12-31';
    const bH = bHasta  ?? '9999-12-31';
    return aD <= bH && aH >= bD;
  }

  /**
   * Estrategia: si tipo=CORPORATIVO, validar porcEstrategia + descuento <= porcLinea.
   * Si tipo=REAL, el descuento se calcula en tiempo de liquidación (HU-03) a partir
   * de cada venta individual — aquí solo validamos que porcEstrategia <= porcLinea.
   */
  private validarEstrategia(dto: CrearParametrizacionDto): void {
    const tipo = dto.estrategiaTipoDescuento;

    if (tipo === EstrategiaTipoDescuento.CORPORATIVO) {
      if (dto.estrategiaPorcDescuentoCorporativo == null) {
        throw new BadRequestException(
          'Si estrategiaTipoDescuento = CORPORATIVO, debe indicar estrategiaPorcDescuentoCorporativo.',
        );
      }
      if (
        dto.porcEstrategia + dto.estrategiaPorcDescuentoCorporativo > dto.porcLinea
      ) {
        throw new BadRequestException(
          `Estrategia inválida: porcEstrategia (${dto.porcEstrategia}) + ` +
            `descuentoCorporativo (${dto.estrategiaPorcDescuentoCorporativo}) ` +
            `no puede superar porcLinea (${dto.porcLinea}).`,
        );
      }
    }

    if (dto.porcEstrategia > dto.porcLinea) {
      throw new BadRequestException(
        `porcEstrategia (${dto.porcEstrategia}) no puede ser mayor que porcLinea (${dto.porcLinea}).`,
      );
    }
  }

  /** Si el tipo es CORPORATIVO, devuelve porcLinea - descuentoCorporativo. */
  private calcularPorcEstrategia(dto: CrearParametrizacionDto): number {
    if (
      dto.estrategiaTipoDescuento === EstrategiaTipoDescuento.CORPORATIVO &&
      dto.estrategiaPorcDescuentoCorporativo != null
    ) {
      return Math.max(0, dto.porcLinea - dto.estrategiaPorcDescuentoCorporativo);
    }
    return dto.porcEstrategia;
  }

  /** Rangos: sin solapamientos ni huecos — regla compartida del módulo. */
  private validarRangos(rangos: CrearRangoDto[]) {
    validarContinuidadRangos(rangos);
  }
}