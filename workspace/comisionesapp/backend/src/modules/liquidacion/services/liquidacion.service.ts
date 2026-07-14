import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Liquidacion, EstadoLiquidacion } from '../entities/liquidacion.entity';
import { LiquidacionDetalle, TipoVenta } from '../entities/liquidacion-detalle.entity';
import { LiquidacionSubperiodo, MotivoSubperiodo } from '../entities/liquidacion-subperiodo.entity';
import { LiquidacionLog, NivelLog } from '../entities/liquidacion-log.entity';
import { CambioCargoPeriodo } from '../entities/cambio-cargo-periodo.entity';
import { Periodo, EstadoOperativo } from '../../calendarios/entities/periodo.entity';
import { ParametrizacionCargo } from '../../parametrizacion/entities/parametrizacion-cargo.entity';
import { NormalizacionService, VentaBruta } from './normalizacion.service';
import { SubPeriodoService } from './subperiodo.service';
import { ReglasComisionService, ResultadoRegla } from './reglas-comision.service';
import { Marcacion, Novedad } from './afectaciones.service';
import { codigoOficioBase } from '../../../common/utils/oficio.util';
import { ArchivoPlanoService } from './archivo-plano.service';
import { LiquidacionLockService } from './liquidacion-lock.service';
import {
  LiquidacionCancelacionService,
  LiquidacionDetenida,
} from './liquidacion-cancelacion.service';
import { IndicadoresService } from '../../integraciones/indicadores.service';
import { MidasoftService } from '../../integraciones/midasoft.service';

export interface EjecutarLiquidacionInput {
  idPeriodo: string;
  usuario: string;
}

@Injectable()
export class LiquidacionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LiquidacionService.name);

  /**
   * Recuperación ante caídas: si el proceso murió a mitad de una liquidación,
   * la cabecera queda EN_CURSO para siempre y bloquea la edición del período.
   * Al arrancar se marcan como ERROR para que el período quede operable.
   */
  async onApplicationBootstrap(): Promise<void> {
    const res = await this.liqRepo.update(
      { estado: EstadoLiquidacion.EN_CURSO },
      { estado: EstadoLiquidacion.ERROR, fechaFin: new Date() },
    );
    if (res.affected) {
      this.logger.warn(
        `${res.affected} liquidación(es) EN_CURSO huérfana(s) marcada(s) como ERROR (proceso interrumpido).`,
      );
    }
  }

  constructor(
    @InjectRepository(Liquidacion)
    private readonly liqRepo: Repository<Liquidacion>,
    @InjectRepository(Periodo)
    private readonly periodoRepo: Repository<Periodo>,
    @InjectRepository(CambioCargoPeriodo)
    private readonly cambioRepo: Repository<CambioCargoPeriodo>,
    @InjectRepository(LiquidacionSubperiodo)
    private readonly subRepo: Repository<LiquidacionSubperiodo>,
    @InjectRepository(LiquidacionDetalle)
    private readonly detRepo: Repository<LiquidacionDetalle>,
    @InjectRepository(LiquidacionLog)
    private readonly logRepo: Repository<LiquidacionLog>,
    @InjectRepository(ParametrizacionCargo)
    private readonly paramRepo: Repository<ParametrizacionCargo>,

    private readonly dataSource: DataSource,
    private readonly lockService: LiquidacionLockService,
    private readonly cancelacion: LiquidacionCancelacionService,
    private readonly normalizacion: NormalizacionService,
    private readonly subPeriodo: SubPeriodoService,
    private readonly reglas: ReglasComisionService,
    private readonly archivoPlano: ArchivoPlanoService,
    private readonly indicadores: IndicadoresService,
    private readonly midasoft: MidasoftService,
  ) {}

  // ── Resolución de identificador de período ───────────────────────

  /**
   * Acepta el UUID del período o su código generado (ej. "2026-P01").
   * Si el código existe en más de un calendario se exige el UUID,
   * porque el código solo es único dentro de su calendario.
   */
  async resolverIdPeriodo(idOCodigo: string): Promise<string> {
    const esUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOCodigo);
    if (esUuid) return idOCodigo;

    const coincidencias = await this.periodoRepo.find({
      where: { codigo: idOCodigo },
      relations: ['calendario'],
    });
    if (coincidencias.length === 0) {
      throw new NotFoundException(`No existe un período con código "${idOCodigo}".`);
    }
    if (coincidencias.length > 1) {
      const calendarios = coincidencias.map((p) => p.calendario?.nombre).join(', ');
      throw new BadRequestException(
        `El código "${idOCodigo}" existe en varios calendarios (${calendarios}). Use el UUID del período para desambiguar.`,
      );
    }
    return coincidencias[0].idPeriodo;
  }

  // ── Validación de elegibilidad (HU-03) ───────────────────────────

  async verificarElegibilidad(idOCodigoPeriodo: string): Promise<{
    elegible: boolean;
    motivo?: string;
    periodoAnteriorCerrado: boolean;
    parametrizacionVigente: boolean;
  }> {
    const idPeriodo = await this.resolverIdPeriodo(idOCodigoPeriodo);
    const periodo = await this.periodoRepo.findOne({
      where: { idPeriodo },
      relations: ['calendario'],
    });
    if (!periodo) throw new NotFoundException(`Período ${idOCodigoPeriodo} no encontrado`);

    if (periodo.estadoOperativo !== EstadoOperativo.ABIERTO) {
      return {
        elegible: false,
        motivo: `El período está en estado ${periodo.estadoOperativo}; solo se liquidan períodos en estado Abierto.`,
        periodoAnteriorCerrado: false,
        parametrizacionVigente: false,
      };
    }

    // Período inmediatamente anterior: el de mayor fechaFin ANTES del inicio
    // de este período. Si no existe (primer período del calendario) no bloquea.
    const periodoAnterior = await this.periodoRepo.findOne({
      where: {
        calendario: { idCalendario: periodo.calendario.idCalendario },
        fechaFin: LessThan(periodo.fechaInicio),
      },
      order: { fechaFin: 'DESC' },
    });
    const periodoAnteriorCerrado =
      !periodoAnterior || periodoAnterior.estadoOperativo === EstadoOperativo.CERRADO;

    if (!periodoAnteriorCerrado) {
      return {
        elegible: false,
        motivo: 'El período anterior del calendario no está Cerrado.',
        periodoAnteriorCerrado,
        parametrizacionVigente: false,
      };
    }

    const parametrizaciones = await this.obtenerParametrizacionesVigentes(periodo);
    if (!parametrizaciones.length) {
      // HU-03: no se permite ejecutar si faltan datos críticos. La vigencia se
      // evalúa en la fecha de inicio del período: la parametrización debe
      // cubrir esa fecha (o no tener vigencia definida).
      return {
        elegible: false,
        motivo:
          `No hay parametrización vigente para este período: la vigencia debe cubrir ` +
          `la fecha de inicio (${periodo.fechaInicio}). Revise las vigencias en Parametrización.`,
        periodoAnteriorCerrado,
        parametrizacionVigente: false,
      };
    }
    return {
      elegible: true,
      periodoAnteriorCerrado,
      parametrizacionVigente: true,
    };
  }

  // ── Ejecución principal (HU-03) ──────────────────────────────────

  async ejecutar(input: EjecutarLiquidacionInput): Promise<Liquidacion> {
    // Resolver ANTES del lock: la clave del lock debe ser siempre el UUID,
    // aunque el llamador haya enviado el código del período.
    const idPeriodo = await this.resolverIdPeriodo(input.idPeriodo);
    const entrada = { ...input, idPeriodo };

    const elegibilidad = await this.verificarElegibilidad(idPeriodo);
    if (!elegibilidad.elegible) {
      throw new BadRequestException(elegibilidad.motivo);
    }

    return this.lockService.ejecutarBajoLock(idPeriodo, async () => {
      // Habilita el botón "Detener" solo mientras este período está corriendo
      this.cancelacion.registrarInicio(idPeriodo);
      try {
        return await this.ejecutarTransaccional(entrada);
      } finally {
        this.cancelacion.registrarFin(idPeriodo);
      }
    });
  }

  private async ejecutarTransaccional(
    input: EjecutarLiquidacionInput,
  ): Promise<Liquidacion> {
    const t0 = Date.now();

    // 1) Cabecera
    const liquidacion: Liquidacion = await this.dataSource.transaction(async (manager) => {
      const periodo = await manager.getRepository(Periodo).findOne({
        where: { idPeriodo: input.idPeriodo },
      });
      if (!periodo) throw new NotFoundException('Período no encontrado');

      const liq = manager.getRepository(Liquidacion).create({
        periodo,
        estado: EstadoLiquidacion.EN_CURSO,
        fechaInicio: new Date(),
        usuarioEjecuta: input.usuario,
        parametrizacionId: null,
      });
      const saved = await manager.getRepository(Liquidacion).save(liq);
      await this.logEnTx(manager, saved.idLiquidacion, 'INICIO', NivelLog.INFO,
        `Liquidación iniciada por ${input.usuario}`, null, Date.now() - t0);
      return saved;
    });
    try {
      const periodo = await this.periodoRepo.findOne({
        where: { idPeriodo: input.idPeriodo },
        relations: ['calendario'],
      });
      if (!periodo) throw new NotFoundException('Período no encontrado');

      // Cronómetro por paso: cada log registra SOLO la duración de su paso
      let tPaso = Date.now();
      const duracionPaso = () => {
        const d = Date.now() - tPaso;
        tPaso = Date.now();
        return d;
      };

      // 3) Consumir ventas + com. bancaria de ICG
      this.puntoDeControl(input.idPeriodo, 'CONSUMO_ICG');
      const [ventas, comisionBancariaTotal] = await Promise.all([
        this.consumirVentasICG(periodo),
        this.consumirComisionBancariaICG(periodo),
      ]);
      await this.logDirecto(liquidacion.idLiquidacion, 'CONSUMO_ICG', NivelLog.OK,
        `Ventas: ${ventas.length} · Com. bancaria: ${comisionBancariaTotal}`,
        { ventas: ventas.length, comisionBancaria: comisionBancariaTotal }, duracionPaso());

      // 4) Normalizar
      const colabNorm = this.normalizacion.normalizar(ventas, comisionBancariaTotal);
      await this.logDirecto(liquidacion.idLiquidacion, 'NORMALIZACION', NivelLog.OK,
        `${colabNorm.length} colaboradores normalizados`, null, duracionPaso());

      // 5) Consumir empleados / novedades / marcaciones / cambios de Midasoft.
      // Los empleados van primero: aportan la correlación código Midasoft → cédula
      // con la que se indexan novedades y marcaciones (ICG identifica por cédula).
      this.puntoDeControl(input.idPeriodo, 'CONSUMO_MIDASOFT');
      const empleados = await this.consumirEmpleadosMidasoft(periodo);
      const cedulaPorCodigo = new Map(empleados.map((e) => [e.idMidasoft, e.idColaborador]));
      const [novPorColab, marPorColab, cambios] = await Promise.all([
        this.consumirNovedadesMidasoft(cedulaPorCodigo),
        this.consumirMarcacionesMidasoft(cedulaPorCodigo),
        this.cambioRepo.find({ where: { idPeriodo: input.idPeriodo } }),
      ]);
      await this.logDirecto(liquidacion.idLiquidacion, 'CONSUMO_MIDASOFT', NivelLog.OK,
        `Empleados: ${empleados.length} · Cambios: ${cambios.length}`,
        { empleados: empleados.length, cambios: cambios.length }, duracionPaso());

      // 6) Generar subperíodos
      const subGenerados = this.subPeriodo.generar(
        empleados, cambios, periodo.fechaInicio, periodo.fechaFin,
      );
      await this.logDirecto(liquidacion.idLiquidacion, 'SUBPERIODOS', NivelLog.OK,
        `${subGenerados.length} tramos generados`, null, duracionPaso());

      // 7) Calcular comisión — multi-cargo: iterar todas las parametrizaciones
      this.puntoDeControl(input.idPeriodo, 'CALCULO');
      const parametrizaciones = await this.obtenerParametrizacionesVigentes(periodo);
      if (!parametrizaciones.length) {
        throw new BadRequestException(
          'No existe parametrización vigente para este período. Configure la parametrización antes de liquidar.',
        );
      }

      // HU-03: "identificar cada colaborador activo DEL CARGO" — cada
      // parametrización aplica ÚNICAMENTE a los colaboradores cuyo cargo
      // real (Midasoft) coincide con el cargo parametrizado.
      const cargoPorCedula = new Map(empleados.map((e) => [e.idColaborador, e.idCargoInicial]));
      const resultadoAcumulado: ResultadoRegla = { detalles: [] };
      for (const param of parametrizaciones) {
        const colabsDelCargo = colabNorm.filter(
          (c) => cargoPorCedula.get(c.idColaborador) === param.codigoOficio,
        );
        await this.logDirecto(liquidacion.idLiquidacion, 'CALCULO', NivelLog.INFO,
          `Cargo ${param.codigoOficio} (${param.nombreCargo}): ${colabsDelCargo.length} colaborador(es) con ventas`,
          { cargo: param.codigoOficio, colaboradores: colabsDelCargo.length }, 0);
        if (!colabsDelCargo.length) continue;

        const r = this.reglas.aplicar(
          param,
          colabsDelCargo,
          novPorColab,
          marPorColab,
          null,    // presupuestoPorTiendaOCargo (Fase 6.4)
          null,    // ventaAnteriorPorUnidad (Fase 6.4)
        );
        resultadoAcumulado.detalles.push(...r.detalles);
      }

      // Colaboradores vigentes con ventas cuyo cargo NO tiene parametrización:
      // no comisionan, pero queda constancia auditable.
      const cargosParametrizados = new Set(parametrizaciones.map((p) => p.codigoOficio));
      const sinParametrizacion = colabNorm.filter((c) => {
        const cargo = cargoPorCedula.get(c.idColaborador);
        return cargo !== undefined && !cargosParametrizados.has(cargo);
      });
      if (sinParametrizacion.length) {
        await this.logDirecto(liquidacion.idLiquidacion, 'EXCLUSION', NivelLog.WARN,
          `${sinParametrizacion.length} colaborador(es) con ventas cuyo cargo no tiene parametrización — no comisionan`,
          { sinParametrizacion: sinParametrizacion.map((c) => c.idColaborador) }, 0);
      }
      await this.logDirecto(liquidacion.idLiquidacion, 'CALCULO', NivelLog.OK,
        `${parametrizaciones.length} parametrización(es) · ${resultadoAcumulado.detalles.length} líneas de detalle`,
        { parametrizaciones: parametrizaciones.length, detalles: resultadoAcumulado.detalles.length },
        duracionPaso());

      // Solo se liquidan colaboradores con subperíodo, es decir, empleados de
      // Midasoft vigentes en el período. Vendedores presentes en ICG pero sin
      // empleado (retirados, códigos de caja, datos sucios) se excluyen con
      // advertencia en lugar de abortar toda la liquidación.
      const conSubperiodo = new Set(subGenerados.map((s) => s.idColaborador));
      const detallesLiquidables = resultadoAcumulado.detalles.filter((d) =>
        conSubperiodo.has(d.idColaborador),
      );
      const excluidos = new Set(
        resultadoAcumulado.detalles
          .filter((d) => !conSubperiodo.has(d.idColaborador))
          .map((d) => d.idColaborador),
      );
      if (excluidos.size) {
        await this.logDirecto(liquidacion.idLiquidacion, 'EXCLUSION', NivelLog.WARN,
          `${excluidos.size} vendedor(es) de ICG sin empleado Midasoft en el período — excluidos de la liquidación`,
          { excluidos: excluidos.size }, 0);
      }
      if (!detallesLiquidables.length) {
        throw new BadRequestException(
          'Ningún vendedor de las ventas ICG corresponde a un empleado Midasoft vigente en el período; no hay nada que liquidar.',
        );
      }

      // 8-11) Persistencia, cierre de la liquidación y cambio de estado del
      // período en UNA sola transacción (HU-03: rollback total ante fallo).
      // Último punto de detención: después de aquí el resultado se persiste.
      this.puntoDeControl(input.idPeriodo, 'PERSISTENCIA');
      const parametrizacionParaArchivo = parametrizaciones[0];   // cabecera representativa
      // HU-03: EMPLEADO del plano = código Midasoft, no la cédula
      const codigoPorCedula = new Map(empleados.map((e) => [e.idColaborador, e.idMidasoft]));
      const contenido = this.archivoPlano.generar(
        liquidacion.idLiquidacion, detallesLiquidables, parametrizacionParaArchivo, codigoPorCedula,
      );
      const totalComision = detallesLiquidables.reduce((acc, d) => acc + d.comision, 0);
      const colabUnicos = new Set(detallesLiquidables.map((d) => d.idColaborador));
      const tiendaUnicas = new Set(detallesLiquidables.map((d) => d.idTienda).filter(Boolean));

      // id_tienda es GUID del catálogo local; ICG entrega códigos de tienda
      // (CO, texto). Insertar texto en la columna uniqueidentifier rompe el
      // INSERT (error TDS), así que el código va a codigo_tienda.
      const esGuid = (v: unknown): v is string =>
        typeof v === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

      const finalizada = await this.dataSource.transaction(async (manager) => {
        const subRepo = manager.getRepository(LiquidacionSubperiodo);
        const subEntities = subGenerados.map((sp) =>
          subRepo.create({
            idLiquidacion: liquidacion.idLiquidacion,
            idColaborador: sp.idColaborador,
            fechaInicio: sp.fechaInicio,
            fechaFin: sp.fechaFin,
            idCargo: sp.idCargo,
            idTienda: esGuid(sp.idTienda) ? sp.idTienda : null,
            codigoTienda: esGuid(sp.idTienda) ? null : sp.idTienda || null,
            idCentroCosto: sp.idCentroCosto ?? null,
            motivo: sp.motivo,
          }),
        );
        const saved = await subRepo.save(subEntities);

        const detRepo = manager.getRepository(LiquidacionDetalle);
        const detEntities = detallesLiquidables.map((d) => {
          // Asociación exacta: colaborador + cargo; si el colaborador tiene un
          // solo subperíodo se usa ese. Nunca un subperíodo de otro colaborador.
          const delColab = saved.filter((s) => s.idColaborador === d.idColaborador);
          const sp = delColab.find((s) => s.idCargo === d.idCargo) ?? delColab[0];
          if (!sp) {
            throw new BadRequestException(
              `No hay subperíodo para el colaborador ${d.idColaborador}; detalle sin trazabilidad.`,
            );
          }
          return detRepo.create({
            idLiquidacion: liquidacion.idLiquidacion,
            idSubperiodo: sp.idSubperiodo,
            idColaborador: d.idColaborador,
            idCargo: d.idCargo,
            idTienda: esGuid(d.idTienda) ? d.idTienda : null,
            codigoTienda: esGuid(d.idTienda) ? null : d.idTienda || null,
            tipoVenta: d.tipoVenta,
            ventaBruta: d.ventaBruta,
            ventaSinIva: d.ventaSinIva,
            comisionBancaria: d.comisionBancaria,
            ventaNeta: d.ventaNeta,
            porcentajeAplicado: d.porcentajeAplicado,
            comision: d.comision,
            diasLaborados: d.diasLaborados ?? null,
            horasValidas: d.horasValidas ?? null,
            diasExcluidos: d.diasExcluidos ?? null,
            motivoExclusion: d.motivoExclusion ?? null,
            cumplePresupuesto: d.cumplePresupuesto ?? null,
            cumpleCrecimiento: d.cumpleCrecimiento ?? null,
          });
        });
        await detRepo.save(detEntities);

        liquidacion.estado = EstadoLiquidacion.LIQUIDADO;
        liquidacion.fechaFin = new Date();
        liquidacion.totalColaboradores = colabUnicos.size;
        liquidacion.totalTiendas = tiendaUnicas.size;
        liquidacion.totalComision = Math.round(totalComision * 100) / 100;
        liquidacion.parametrizacionId = parametrizacionParaArchivo.idParametrizacion;
        // Snapshot de TODAS las parametrizaciones usadas (HU-04)
        liquidacion.parametrizacionJson = JSON.stringify(
          parametrizaciones.map((p) => ({
            idParametrizacion: p.idParametrizacion,
            codigoOficio: p.codigoOficio,
            nombreCargo: p.nombreCargo,
            tipoLiquidacion: p.tipoLiquidacion,
            tipoDistribucion: p.tipoDistribucion,
            porcLinea: p.porcLinea,
            porcPromocion: p.porcPromocion,
            porcEstrategia: p.porcEstrategia,
          })),
        );
        liquidacion.archivoPlanoPath = join('liquidaciones', `${liquidacion.idLiquidacion}.txt`);
        const fin = await manager
          .getRepository(Liquidacion)
          .save(liquidacion);

        await manager.getRepository(Periodo).update(input.idPeriodo, {
          estadoOperativo: EstadoOperativo.LIQUIDADO,
        });
        return fin;
      });
      await this.logDirecto(liquidacion.idLiquidacion, 'PERSISTENCIA', NivelLog.OK,
        'Subperíodos, detalles, cierre y estado del período persistidos (tx única)', null, duracionPaso());

      // Archivo plano de nómina: entregable físico de HU-03
      await this.escribirArchivoPlano(finalizada.archivoPlanoPath!, contenido);
      await this.logDirecto(liquidacion.idLiquidacion, 'ARCHIVO_PLANO', NivelLog.OK,
        `Archivo plano generado (${contenido.split('\n').length - 1} líneas)`,
        null, duracionPaso());

      await this.logDirecto(liquidacion.idLiquidacion, 'FIN', NivelLog.OK,
        `Liquidación completada en ${Date.now() - t0}ms — ${colabUnicos.size} colaboradores · ${tiendaUnicas.size} tiendas · $${totalComision.toFixed(2)}`,
        null, Date.now() - t0);

      return finalizada;
    } catch (e: any) {
      // Detención solicitada por el usuario: no es una falla. La liquidación
      // queda CANCELADA y el período sigue Abierto para corregir y reintentar.
      if (e instanceof LiquidacionDetenida) {
        await this.liqRepo.update(liquidacion.idLiquidacion, {
          estado: EstadoLiquidacion.CANCELADA,
          fechaFin: new Date(),
        });
        await this.logDirecto(liquidacion.idLiquidacion, 'CANCELADO', NivelLog.WARN,
          e.message, null, Date.now() - t0);
        throw new BadRequestException(
          'Proceso detenido por el usuario. No se guardó ningún resultado; ' +
          'el período sigue Abierto: corrija lo necesario y ejecute de nuevo.',
        );
      }
      await this.liqRepo.update(liquidacion.idLiquidacion, {
        estado: EstadoLiquidacion.ERROR,
        fechaFin: new Date(),
      });
      await this.logDirecto(liquidacion.idLiquidacion, 'ERROR', NivelLog.ERROR,
        `Error: ${e?.message ?? e}`, null, Date.now() - t0);
      throw e;
    }
  }

  /** Punto de control (HU-03 — Detener): aborta entre pasos si el usuario lo pidió. */
  private puntoDeControl(idPeriodo: string, siguientePaso: string): void {
    if (this.cancelacion.fueSolicitada(idPeriodo)) {
      throw new LiquidacionDetenida(siguientePaso);
    }
  }

  /** Solicita detener la liquidación en curso del período (UUID o código). */
  async detener(idOCodigoPeriodo: string): Promise<{ mensaje: string }> {
    const idPeriodo = await this.resolverIdPeriodo(idOCodigoPeriodo);
    if (!this.cancelacion.solicitarDetencion(idPeriodo)) {
      throw new BadRequestException(
        'No hay una liquidación en ejecución para este período.',
      );
    }
    return {
      mensaje: 'Detención solicitada: el proceso se interrumpirá en el siguiente paso.',
    };
  }

  // ── Cierre manual (HU-03 — Cerrar Período) ────────────────────────

  async cerrar(idLiquidacion: string, usuario: string): Promise<Liquidacion> {
    const liq = await this.liqRepo.findOne({
      where: { idLiquidacion },
      relations: ['periodo'],
    });
    if (!liq) throw new NotFoundException(`Liquidación ${idLiquidacion} no encontrada`);
    if (liq.estado !== EstadoLiquidacion.LIQUIDADO) {
      throw new BadRequestException(
        `Solo se puede cerrar una liquidación en estado LIQUIDADO (actual: ${liq.estado}).`,
      );
    }
    liq.estado = EstadoLiquidacion.CERRADO;
    liq.fechaCierre = new Date();
    liq.usuarioCierre = usuario;
    await this.liqRepo.save(liq);
    if (liq.periodo?.idPeriodo) {
      await this.periodoRepo.update(liq.periodo.idPeriodo, {
        estadoOperativo: EstadoOperativo.CERRADO,
      });
    }
    return liq;
  }

  // ── Consultas ─────────────────────────────────────────────────────

  findAll(): Promise<Liquidacion[]> {
    return this.liqRepo.find({
      order: { fechaInicio: 'DESC' },
      relations: ['periodo'],
    });
  }

  async findOne(id: string): Promise<Liquidacion> {
    const liq = await this.liqRepo.findOne({
      where: { idLiquidacion: id },
      relations: ['periodo', 'detalles', 'logs'],
    });
    if (!liq) throw new NotFoundException(`Liquidación ${id} no encontrada`);
    return liq;
  }

  // ── Integración con ICG y Midasoft ───────────────────────────────

  /**
   * Consume el detalle de comisiones POS desde INDICADORES (ICG) para el período
   * y mapea al formato interno VentaBruta.
   *
   * Columnas reales del SP_GetPOSCommissionsDetail (verificadas 2026-07-09):
   *   - Empresa nvarchar(10)
   *   - Fecha date
   *   - CO nvarchar(50)        ← código de tienda
   *   - Codigo nvarchar(50)    ← código de producto
   *   - Cedula nvarchar(100)   ← cédula del vendedor (DNI = "Tienda" cuando es venta de tienda)
   *   - LineaICG nvarchar(100) ← LÍNEA / LÍNEA ESTRATEGIA / PROMOCIÓN
   *   - Uds / Importe / Precio / Maximo / Dcto
   *   - FechaCarga datetime2
   */
  private async consumirVentasICG(periodo: Periodo): Promise<VentaBruta[]> {
    const rows = await this.indicadores.comisionesDetalle(
      periodo.fechaInicio, periodo.fechaFin,
    );

    return rows
      // Ignorar filas de la tienda (sin vendedor) — Cedula = "Tienda" o vacía
      .filter((r: any) => {
        const cedula = r.Cedula ?? r.cedula ?? '';
        return cedula && cedula !== 'Tienda';
      })
      .map((r: any) => {
        return {
          // mssql devuelve date como Date; toISOString() lo pasa a 'YYYY-MM-DD'
          fecha:            this.toIsoDate(r.Fecha ?? r.fecha ?? r.FECHA),
          idTienda:         String(r.CO ?? r.co ?? ''),
          idColaborador:    String(r.Cedula ?? r.cedula ?? ''),
          tipoVenta:         this.parseTipoVenta(String(r.LineaICG ?? r.LINEA_ICG ?? r.lineaICG ?? '')),
          importe:          Number(r.Importe ?? r.importe ?? 0),
          incluyeIva:        true,    // ICG devuelve importes brutos
          tasaComisionBancaria: 0,
        };
      });
  }

  /** Convierte un valor de fecha a string ISO 'YYYY-MM-DD'. */
  private toIsoDate(v: unknown): string {
    if (!v) return '';
    if (v instanceof Date) {
      // 'YYYY-MM-DDTHH:mm:ss.sssZ' → tomamos los primeros 10 chars
      return v.toISOString().slice(0, 10);
    }
    const s = String(v);
    // Si ya viene como 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ss...', recortamos.
    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  private parseTipoVenta(s: string): TipoVenta {
    const t = s.toUpperCase();
    if (t.includes('ESTRAT')) return TipoVenta.LINEA_ESTRATEGIA;
    if (t.includes('PROMO'))  return TipoVenta.PROMOCION;
    return TipoVenta.LINEA;
  }

  /**
   * Total de comisión bancaria del período: suma de la columna
   * ComisionBancaria (por tienda) del resumen de INDICADORES.
   */
  private async consumirComisionBancariaICG(periodo: Periodo): Promise<number> {
    const rows = await this.indicadores.comisionesResumen(
      periodo.fechaInicio, periodo.fechaFin,
    );
    // Se descuenta ÚNICAMENTE la columna ComisionBancaria. Usar TotalImporte
    // como proxy (venta total) destruye el cálculo: la venta neta del tipo
    // mayor queda negativa y todas las comisiones dan $0.
    const total = rows.reduce(
      (acc, r: any) =>
        acc + Number(r.ComisionBancaria ?? r.COMISIONBANCARIA ?? r.comisionBancaria ?? 0),
      0,
    );
    if (rows.length && total === 0) {
      // TODO conexión real: cuando el SP/fuente de pagos exponga la comisión
      // bancaria por centro de costo, mapear aquí la columna correspondiente.
      this.logger.warn(
        'comisionesResumen no trae columna ComisionBancaria — se liquida sin descuento bancario.',
      );
    }
    return total;
  }

  /**
   * Empleados activos o retirados en el rango del período.
   *
   * Columnas reales de /EMP/EmpleadosPermoda (verificadas 2026-07-09):
   *   - Empleado nvarchar(20)    ← id Midasoft del colaborador
   *   - Docto_Ident nvarchar(20)  ← cédula
   *   - Codigo_Oficio nvarchar(20)+ Oficio nvarchar(200)
   *   - F_Ingreso / Fecha_Retiro / Fecha_Contrat_Vig / Fecha_Fin_Contrato
   *   - Estado_Actual varchar(10) ('R' = retirado; vacío = activo)
   *   - Ccosto nvarchar(20) (centro de costo)
   *   - SalarioPeriodo, SalarioMes, SalarioHora
   *
   * NOTA: el endpoint NO devuelve idTienda. La asociación empleado↔tienda
   * se mantiene en la tabla local `colaborador` (sincronizada previamente).
   */
  private async consumirEmpleadosMidasoft(periodo: Periodo) {
    const all = await this.midasoft.empleados();
    const ini = periodo.fechaInicio;
    const fin = periodo.fechaFin;

    return all
      .filter((e: any) => {
        const idColab = e.Empleado ?? e.empleado ?? '';
        if (!idColab) return false;

        const fIngreso = e.F_Ingreso ?? e.f_ingreso;
        const fRetiro  = e.Fecha_Retiro ?? e.fecha_retiro;
        // Estuvo activo en algún punto del período
        if (fIngreso && String(fIngreso).slice(0, 10) > fin) return false;
        if (fRetiro  && String(fRetiro).slice(0, 10)  < ini) return false;
        return true;
      })
      .map((e: any) => ({
        // Clave de correlación con ICG: las ventas identifican al vendedor por
        // CÉDULA (columna Cedula del SP), no por el código interno Midasoft.
        idColaborador:       String(e.Docto_Ident ?? ''),
        idMidasoft:          String(e.Empleado ?? ''),
        // Codigo_Oficio llega compuesto (oficio+ccosto+000) → base de 6 dígitos
        idCargoInicial:      codigoOficioBase(
          String(e.Codigo_Oficio ?? e.Cod_Profesion ?? ''),
          String(e.Ccosto ?? e.ccosto ?? ''),
        ),
        idTiendaInicial:     null,  // No disponible en Midasoft — viene de tabla local
        idCentroCostoInicial:String(e.Ccosto ?? e.ccosto ?? ''),
        nombre:              [
          e.PrimerNombre, e.SegundoNombre, e.PrimerApellido, e.SegundoApellido,
        ].filter(Boolean).join(' ').trim(),
        fechaIngreso:        e.F_Ingreso ? String(e.F_Ingreso).slice(0, 10) : null,
        fechaRetiro:         e.Fecha_Retiro ? String(e.Fecha_Retiro).slice(0, 10) : null,
        cargoTexto:          e.Oficio ?? '',
        cedula:              String(e.Docto_Ident ?? ''),
        activo:              !e.Estado_Actual || e.Estado_Actual !== 'R',
      }));
  }

  /**
   * Novedades por colaborador (indexadas por CÉDULA para cruzar con ICG).
   * En modo real, MidasoftService.novedades() devuelve [] hasta que exista
   * el endpoint; en modo mock llegan las de Datatest/.
   */
  private async consumirNovedadesMidasoft(
    cedulaPorCodigo: Map<string, string>,
  ): Promise<Map<string, Novedad[]>> {
    const rows = await this.midasoft.novedades();
    const porColab = new Map<string, Novedad[]>();
    for (const r of rows) {
      const cedula = cedulaPorCodigo.get(String(r.Empleado ?? '')) ?? String(r.Empleado ?? '');
      if (!cedula) continue;
      const nov: Novedad = {
        idColaborador: cedula,
        fechaInicio: String(r.Fecha_Inicio ?? '').slice(0, 10),
        fechaFin:    String(r.Fecha_Fin ?? '').slice(0, 10),
        tipo:        this.normalizarTipoNovedad(String(r.Tipo ?? '')),
        horasPorDia: Number(r.Horas ?? 0) || undefined,
      };
      (porColab.get(cedula) ?? porColab.set(cedula, []).get(cedula)!).push(nov);
    }
    return porColab;
  }

  /** Marcaciones por colaborador (indexadas por CÉDULA). Mismo esquema que novedades. */
  private async consumirMarcacionesMidasoft(
    cedulaPorCodigo: Map<string, string>,
  ): Promise<Map<string, Marcacion[]>> {
    const rows = await this.midasoft.marcaciones();
    const porColab = new Map<string, Marcacion[]>();
    for (const r of rows) {
      const cedula = cedulaPorCodigo.get(String(r.Empleado ?? '')) ?? String(r.Empleado ?? '');
      if (!cedula) continue;
      const marca: Marcacion = {
        idColaborador:  cedula,
        fecha:          String(r.Fecha ?? '').slice(0, 10),
        horasLaboradas: Number(r.Horas ?? 0),
      };
      (porColab.get(cedula) ?? porColab.set(cedula, []).get(cedula)!).push(marca);
    }
    return porColab;
  }

  /** Tipos de novedad del origen → tipos que entiende AfectacionesService (HU-03). */
  private normalizarTipoNovedad(raw: string): string {
    const t = raw.toUpperCase();
    if (t === 'IN' || t.includes('INCAPACIDAD')) return 'Incapacidad';
    if (t.includes('LUTO'))                      return 'LicenciaLuto';
    if (t.includes('FAMILIA'))                   return 'DiaFamilia';
    if (t.includes('COMPENSATORIO'))             return 'Compensatorio';
    if (t.includes('VACACION'))                  return 'Vacaciones';
    return 'Ausentismo';
  }

  /**
   * Devuelve TODAS las parametrizaciones vigentes del período (multi-cargo).
   * Antes tomaba solo la primera (single-cargo) — esto es el fix multi-cargo.
   */
  private async obtenerParametrizacionesVigentes(periodo: Periodo): Promise<ParametrizacionCargo[]> {
    const fecha = periodo.fechaInicio;
    return this.paramRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.periodo', 'periodo')
      .where('periodo.id_periodo = :idPer', { idPer: periodo.idPeriodo })
      .andWhere('p.estado_activo = 1')
      .andWhere('(p.vigencia_desde IS NULL OR p.vigencia_desde <= :fecha)', { fecha })
      .andWhere('(p.vigencia_hasta IS NULL OR p.vigencia_hasta >= :fecha)', { fecha })
      .orderBy('p.codigo_oficio', 'ASC')
      .getMany();
  }

  /** Escribe el archivo plano de nómina en disco (ruta relativa al proceso). */
  private async escribirArchivoPlano(ruta: string, contenido: string): Promise<void> {
    const absoluta = join(process.cwd(), ruta);
    await mkdir(dirname(absoluta), { recursive: true });
    await writeFile(absoluta, contenido, 'utf8');
  }

  /** Contenido del archivo plano para descarga (HU-03). */
  async obtenerArchivoPlano(id: string): Promise<{ nombre: string; contenido: string }> {
    const liq = await this.liqRepo.findOne({
      where: { idLiquidacion: id },
      relations: ['periodo'],
    });
    if (!liq) throw new NotFoundException(`Liquidación ${id} no encontrada`);
    if (!liq.archivoPlanoPath) {
      throw new NotFoundException('La liquidación no tiene archivo plano generado.');
    }
    try {
      const contenido = await readFile(join(process.cwd(), liq.archivoPlanoPath), 'utf8');
      return { nombre: `plano_${liq.periodo?.codigo ?? liq.idLiquidacion}.txt`, contenido };
    } catch {
      throw new NotFoundException(
        'El archivo plano no está disponible en el servidor; vuelva a ejecutar la liquidación.',
      );
    }
  }

  // ── Logging helpers ──────────────────────────────────────────────

  private async logEnTx(manager: any, idLiq: string, paso: string, nivel: NivelLog, mensaje: string, detalle: any, duracionMs: number) {
    await manager.getRepository(LiquidacionLog).save({
      idLiquidacion: idLiq, paso, nivel, mensaje,
      detalleJson: detalle ? JSON.stringify(detalle) : null,
      duracionMs,
    });
  }

  private async logDirecto(idLiq: string, paso: string, nivel: NivelLog, mensaje: string, detalle: any, duracionMs: number) {
    await this.logRepo.save({
      idLiquidacion: idLiq, paso, nivel, mensaje,
      detalleJson: detalle ? JSON.stringify(detalle) : null,
      duracionMs,
    });
  }
}