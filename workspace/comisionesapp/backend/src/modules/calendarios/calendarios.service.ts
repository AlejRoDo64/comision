import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsOrder, Not, Repository } from 'typeorm';
import { Calendario } from './entities/calendario.entity';
import { Periodo, EstadoOperativo } from './entities/periodo.entity';
import { Liquidacion } from '../liquidacion/entities/liquidacion.entity';
import { CrearCalendarioDto } from './dto/crear-calendario.dto';
import { ActualizarCalendarioDto } from './dto/actualizar-calendario.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { GenerarAnioPeriodosDto } from './dto/generar-anio-periodos.dto';
import {
  TipoEntidadLog,
  AccionLog,
  LogEstructuralService,
} from '../../common/audit';

const MESES_ES: readonly string[] = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

@Injectable()
export class CalendariosService {
  constructor(
    @InjectRepository(Calendario)
    private readonly calRepo: Repository<Calendario>,
    @InjectRepository(Periodo)
    private readonly perRepo: Repository<Periodo>,
    private readonly logService: LogEstructuralService,
    private readonly dataSource: DataSource,
  ) {}

  // ── Calendarios ────────────────────────────────────────────────────

  findAllCalendarios(): Promise<Calendario[]> {
    return this.calRepo.find({ order: { anio: 'DESC' } });
  }

  async findOneCalendario(id: string): Promise<Calendario> {
    const orderCalendario: FindOptionsOrder<Calendario> = {
      periodos: { fechaInicio: 'ASC' },
    };
    const cal = await this.calRepo.findOne({
      where: { idCalendario: id },
      relations: ['periodos'],
      order: orderCalendario,
    });
    if (!cal) throw new NotFoundException(`Calendario ${id} no encontrado`);
    return cal;
  }

  async createCalendario(
    dto: CrearCalendarioDto,
    usuario: string,
  ): Promise<Calendario> {
    // HU-01: se admiten MÚLTIPLES calendarios independientes por año; lo único
    // que no puede repetirse es el NOMBRE dentro del mismo año.
    const duplicado = await this.calRepo.findOne({
      where: { anio: dto.anio, nombre: dto.nombre },
    });
    if (duplicado) {
      throw new BadRequestException(
        `Ya existe un calendario llamado "${dto.nombre}" para el año ${dto.anio}. Use un nombre distinto.`,
      );
    }
    return this.dataSource.transaction(async (manager) => {
      const cal = manager.getRepository(Calendario).create({
        ...dto, estadoActivo: dto.estadoActivo ?? true,
      });
      const saved = await manager.getRepository(Calendario).save(cal);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.CALENDARIO,
        idEntidad: saved.idCalendario,
        accion: AccionLog.CREATE,
        datosNuevos: saved,
        usuario,
      }, manager);
      return saved;
    });
  }

  async updateCalendario(
    id: string,
    dto: ActualizarCalendarioDto,
    usuario: string,
  ): Promise<Calendario> {
    const cal = await this.findOneCalendario(id);
    return this.dataSource.transaction(async (manager) => {
      const anteriores = { ...cal };
      Object.assign(cal, dto);
      const saved = await manager.getRepository(Calendario).save(cal);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.CALENDARIO,
        idEntidad: id,
        accion: AccionLog.UPDATE,
        datosAnteriores: anteriores,
        datosNuevos: saved,
        usuario,
      }, manager);
      return saved;
    });
  }

  async removeCalendario(
    id: string,
    usuario: string,
  ): Promise<{ mensaje: string }> {
    const cal = await this.calRepo.findOne({
      where: { idCalendario: id },
      relations: ['periodos'],
    });
    if (!cal) throw new NotFoundException(`Calendario ${id} no encontrado`);
    if (cal.periodos?.length) {
      throw new BadRequestException(
        'No se puede eliminar un calendario que tiene períodos registrados',
      );
    }
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Calendario).remove(cal);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.CALENDARIO,
        idEntidad: id,
        accion: AccionLog.DELETE,
        datosAnteriores: cal,
        usuario,
      }, manager);
    });
    return { mensaje: 'Calendario eliminado correctamente' };
  }

  // ── Periodos ───────────────────────────────────────────────────────

  async findPeriodosByCalendario(idCalendario: string): Promise<Periodo[]> {
    await this.findOneCalendario(idCalendario);
    return this.perRepo.find({
      where: { calendario: { idCalendario } },
      order: { fechaInicio: 'ASC' },
    });
  }

  async findOnePeriodo(id: string): Promise<Periodo> {
    const per = await this.perRepo.findOne({
      where: { idPeriodo: id },
      relations: ['calendario'],
    });
    if (!per) throw new NotFoundException(`Período ${id} no encontrado`);
    return per;
  }

  async createPeriodo(
    dto: CrearPeriodoDto,
    usuario: string,
  ): Promise<Periodo> {
    const cal = await this.calRepo.findOne({ where: { idCalendario: dto.idCalendario } });
    if (!cal) throw new NotFoundException(`Calendario ${dto.idCalendario} no encontrado`);

    // Código autogenerado si no viene: mismo formato MES-AÑO de la generación
    // anual, tomado de la fecha fin (patrón 21–20: el período "es" del mes en
    // que termina).
    const codigo = dto.codigo ?? this.generarCodigoPeriodo(dto.fechaFin);

    const duplicado = await this.perRepo.findOne({
      where: { codigo, calendario: { idCalendario: dto.idCalendario } },
    });
    if (duplicado) {
      throw new BadRequestException(
        `Ya existe un período con código ${codigo} en este calendario`,
      );
    }

    await this.validarSolapamiento(dto.idCalendario, dto.fechaInicio, dto.fechaFin);
    await this.validarSecuencia(dto.idCalendario, dto.fechaInicio, dto.fechaFin);

    return this.dataSource.transaction(async (manager) => {
      const per = manager.getRepository(Periodo).create({
        codigo,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        calendario: cal,
        estadoOperativo: EstadoOperativo.ABIERTO,
      });
      const saved = await manager.getRepository(Periodo).save(per);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PERIODO,
        idEntidad: saved.idPeriodo,
        accion: AccionLog.CREATE,
        datosNuevos: saved,
        usuario,
      }, manager);
      return saved;
    });
  }

  async updatePeriodo(
    id: string,
    dto: ActualizarPeriodoDto,
    usuario: string,
  ): Promise<Periodo> {
    const per = await this.findOnePeriodo(id);
    this.validarEstadoEditable(per);
    await this.validarSinLiquidaciones(id, 'editar');

    // CRIT-3: validar fechas efectivas (combinando dto + existing) en el servicio
    // porque el DTO no puede ver la BD.
    const fechaInicioEfectiva = dto.fechaInicio ?? per.fechaInicio;
    const fechaFinEfectiva    = dto.fechaFin ?? per.fechaFin;
    if (fechaFinEfectiva < fechaInicioEfectiva) {
      throw new BadRequestException(
        `fechaFin (${fechaFinEfectiva}) no puede ser anterior a fechaInicio (${fechaInicioEfectiva}).`,
      );
    }

    // CRIT-4: solo validar contra otros períodos si realmente cambió alguna fecha.
    const huboCambioFechas =
      dto.fechaInicio !== undefined || dto.fechaFin !== undefined;

    if (huboCambioFechas) {
      await this.validarSolapamiento(
        per.calendario.idCalendario,
        fechaInicioEfectiva,
        fechaFinEfectiva,
        id,
      );
      await this.validarSecuencia(
        per.calendario.idCalendario,
        fechaInicioEfectiva,
        fechaFinEfectiva,
        id,
      );
    }

    // CRIT-4 (cont): no-op si no hay cambios
    if (!huboCambioFechas && dto.codigo === undefined) {
      return per;
    }

    return this.dataSource.transaction(async (manager) => {
      const anteriores = { ...per };
      Object.assign(per, dto);
      const saved = await manager.getRepository(Periodo).save(per);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PERIODO,
        idEntidad: id,
        accion: AccionLog.UPDATE,
        datosAnteriores: anteriores,
        datosNuevos: saved,
        usuario,
      }, manager);
      return saved;
    });
  }

  async removePeriodo(
    id: string,
    usuario: string,
  ): Promise<{ mensaje: string }> {
    const per = await this.findOnePeriodo(id);
    this.validarEstadoEditable(per);
    await this.validarSinLiquidaciones(id, 'eliminar');

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Periodo).remove(per);
      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PERIODO,
        idEntidad: id,
        accion: AccionLog.DELETE,
        datosAnteriores: per,
        usuario,
      }, manager);
    });

    return { mensaje: 'Período eliminado correctamente' };
  }

  // ── Generación masiva anual ────────────────────────────────────────

  /**
   * Genera los 12 períodos del año (por defecto patrón 21 → 20) en una sola
   * transacción atómica. El año se toma del calendario (CRIT-6: fuente única
   * de verdad, ya no viene en el DTO).
   */
  async generarAnioPeriodos(
    idCalendario: string,
    dto: GenerarAnioPeriodosDto,
    usuario: string,
  ): Promise<Periodo[]> {
    const cal = await this.findOneCalendario(idCalendario);
    const anio = cal.anio;       // CRIT-6: fuente única de verdad

    const existentes = await this.perRepo.count({
      where: { calendario: { idCalendario } },
    });
    if (existentes > 0) {
      throw new BadRequestException(
        `El calendario ya tiene ${existentes} período(s). Elimínelos antes de generar el año.`,
      );
    }

    const diaInicio = dto.patron?.diaInicio ?? 21;
    const diaFin    = dto.patron?.diaFin ?? 20;

    const periodos = this.construirPeriodosAnio(anio, diaInicio, diaFin);

    // Validar no solapamiento contra TODOS los períodos del mismo calendario
    // (en este caso ninguno, pero dejamos la defensa).
    await this.validarSolapamiento(
      idCalendario,
      periodos[0].fechaInicio,
      periodos[periodos.length - 1].fechaFin,
    );

    // CRIT-1: usar la entity class para el log (no string + snake_case).
    return this.dataSource.transaction(async (manager) => {
      const entities = periodos.map((p) =>
        manager.getRepository(Periodo).create({
          ...p,
          calendario: cal,
          estadoOperativo: EstadoOperativo.ABIERTO,
        }),
      );
      const saved = await manager.getRepository(Periodo).save(entities);

      await this.logService.registrar({
        tipoEntidad: TipoEntidadLog.PERIODO,
        idEntidad: idCalendario,
        accion: AccionLog.CREATE,
        datosNuevos: {
          generado: saved.length,
          anio,
          patron: { diaInicio, diaFin },
        },
        usuario,
      }, manager);

      return saved;
    });
  }

  // ── Validaciones de negocio (HU-01) ───────────────────────────────

  /**
   * Regla de no solapamiento (HU-01): dentro del mismo calendario,
   * ningún par de períodos puede tener intersección de fechas.
   * Excluye `excludeId` para permitir updates del mismo período.
   */
  private async validarSolapamiento(
    idCalendario: string,
    fechaInicio: string,
    fechaFin: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.perRepo
      .createQueryBuilder('p')
      .where('p.id_calendario = :idCalendario', { idCalendario })
      .andWhere('p.fecha_inicio <= :fechaFin',  { fechaFin })
      .andWhere('p.fecha_fin    >= :fechaInicio', { fechaInicio });

    if (excludeId) {
      qb.andWhere('p.id_periodo <> :excludeId', { excludeId });
    }

    const conflictivo = await qb.getOne();
    if (conflictivo) {
      throw new BadRequestException(
        `El período se solapa con "${conflictivo.codigo}" (${conflictivo.fechaInicio} → ${conflictivo.fechaFin}). ` +
          'Los calendarios no admiten solapamiento entre períodos.',
      );
    }
  }

  /**
   * Regla de secuencia temporal (HU-01): no debe haber huecos.
   *
   * CRIT-2 (reescrito): en lugar de tomar el período con mayor fechaFin,
   * se identifican los períodos **inmediatamente anterior** y **posterior**
   * al rango que se quiere validar, y se exige contigüidad con ambos.
   * Esto cubre tanto creación (rango nuevo contra calendario existente)
   * como update (rango modificado contra períodos adyacentes, sin falsos
   * positivos al editar un período que no es el último del calendario).
   */
  private async validarSecuencia(
    idCalendario: string,
    fechaInicio: string,
    fechaFin: string,
    excludeId?: string,
  ): Promise<void> {
    const where: any = { calendario: { idCalendario } };
    if (excludeId) {
      where.idPeriodo = Not(excludeId);
    }

    const todos = await this.perRepo.find({ where, order: { fechaInicio: 'ASC' } });
    if (!todos.length) return;     // calendario vacío: no hay con qué validar

    // Período inmediatamente anterior (termina justo antes del inicio propuesto)
    const previo = [...todos]
      .filter((p) => p.fechaFin < fechaInicio)
      .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))[0];

    // Período inmediatamente posterior (inicia justo después del fin propuesto)
    const siguiente = [...todos]
      .filter((p) => p.fechaInicio > fechaFin)
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];

    if (previo) {
      const diaEsperado = this.sumarUnDia(previo.fechaFin);
      if (fechaInicio !== diaEsperado) {
        throw new BadRequestException(
          `Secuencia rota: el período anterior "${previo.codigo}" termina el ${previo.fechaFin}; ` +
            `el nuevo debe iniciar el ${diaEsperado}.`,
        );
      }
    }

    if (siguiente) {
      const diaEsperadoSiguiente = this.sumarUnDia(fechaFin);
      if (siguiente.fechaInicio !== diaEsperadoSiguiente) {
        throw new BadRequestException(
          `Secuencia rota: el nuevo período termina el ${fechaFin}; ` +
            `el siguiente "${siguiente.codigo}" debe iniciar el ${diaEsperadoSiguiente}.`,
        );
      }
    }
  }

  /** HU-01: no se pueden editar ni eliminar períodos con liquidaciones asociadas. */
  private async validarSinLiquidaciones(idPeriodo: string, accion: string): Promise<void> {
    const tiene = await this.dataSource
      .getRepository(Liquidacion)
      .exists({ where: { periodo: { idPeriodo } } });
    if (tiene) {
      throw new BadRequestException(
        `No se puede ${accion} un período con liquidaciones asociadas.`,
      );
    }
  }

  private validarEstadoEditable(per: Periodo): void {
    if (per.estadoOperativo !== EstadoOperativo.ABIERTO) {
      throw new BadRequestException(
        `Solo se pueden editar períodos en estado Abierto (actual: ${per.estadoOperativo}).`,
      );
    }
  }

  /** Construye los 12 períodos del año según el patrón díaInicio → díaFin. */
  private construirPeriodosAnio(
    anio: number,
    diaInicio: number,
    diaFin: number,
  ): Array<{ codigo: string; fechaInicio: string; fechaFin: string }> {
    return Array.from({ length: 12 }, (_, i) => {
      const mesIdx = i;
      const mesAnterior = (mesIdx + 11) % 12;
      const anioAnterior = mesIdx === 0 ? anio - 1 : anio;
      const fechaInicio = this.formatearFecha(anioAnterior, mesAnterior, diaInicio);
      const fechaFin    = this.formatearFecha(anio, mesIdx, diaFin);
      return {
        codigo: `${MESES_ES[mesIdx]}-${anio}`,
        fechaInicio,
        fechaFin,
      };
    });
  }

  /**
   * Código MES-AÑO a partir de la fecha fin del período (ej. "2027-01-20"
   * → "ENE-2027"). Mismo formato que la generación anual masiva.
   */
  private generarCodigoPeriodo(fechaFin: string): string {
    const [anio, mes] = fechaFin.split('-').map(Number);
    return `${MESES_ES[mes - 1]}-${anio}`;
  }

  private formatearFecha(anio: number, mesIdx: number, dia: number): string {
    const mm = String(mesIdx + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    return `${anio}-${mm}-${dd}`;
  }

  /** Suma un día en zona horaria local (MED-2: evita el bug de UTC). */
  private sumarUnDia(fecha: string): string {
    const [y, m, d] = fecha.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
}