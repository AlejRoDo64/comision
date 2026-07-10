import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PresupuestoCargoPeriodo,
  TipoPresupuesto,
} from '../entities/presupuesto-cargo-periodo.entity';
import {
  CARGOS_CATALOGO,
  ICargosCatalogo,
} from '../services/cargos-catalogo.service';
import {
  CrearPresupuestoDto,
  ActualizarPresupuestoDto,
} from '../dto/presupuesto.dto';

@Injectable()
export class PresupuestosService {
  constructor(
    @InjectRepository(PresupuestoCargoPeriodo)
    private readonly repo: Repository<PresupuestoCargoPeriodo>,
    @Inject(CARGOS_CATALOGO)
    private readonly cargosCatalogo: ICargosCatalogo,
  ) {}

  /** Lista presupuestos filtrables por período, cargo y/o tienda. */
  findAll(
    idPeriodo?: string,
    codigoOficio?: string,
    idTienda?: string,
  ): Promise<PresupuestoCargoPeriodo[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.periodo', 'periodo')
      .leftJoinAndSelect('p.tienda', 'tienda')
      .orderBy('p.codigoOficio', 'ASC')
      .addOrderBy('p.tipo', 'ASC');

    if (idPeriodo) qb.andWhere('p.id_periodo = :idPeriodo', { idPeriodo });
    if (codigoOficio) qb.andWhere('p.codigo_oficio = :codigoOficio', { codigoOficio });
    if (idTienda) qb.andWhere('p.id_tienda = :idTienda', { idTienda });

    return qb.getMany();
  }

  async findOne(id: string): Promise<PresupuestoCargoPeriodo> {
    const p = await this.repo.findOne({
      where: { idPresupuesto: id },
      relations: ['periodo', 'tienda'],
    });
    if (!p) throw new NotFoundException(`Presupuesto ${id} no encontrado`);
    return p;
  }

  async create(dto: CrearPresupuestoDto): Promise<PresupuestoCargoPeriodo> {
    await this.validarCargoOficial(dto.codigoOficio);
    const entity = this.repo.create({
      codigoOficio: dto.codigoOficio,
      tipo: dto.tipo,
      valor: dto.valor,
      periodo: { idPeriodo: dto.idPeriodo } as any,
      tienda: dto.idTienda ? ({ idTienda: dto.idTienda } as any) : null,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: ActualizarPresupuestoDto): Promise<PresupuestoCargoPeriodo> {
    const p = await this.findOne(id);
    if (dto.tipo) p.tipo = dto.tipo;
    if (dto.valor != null) p.valor = dto.valor;
    if (dto.idTienda !== undefined) {
      p.tienda = dto.idTienda ? ({ idTienda: dto.idTienda } as any) : null;
    }
    return this.repo.save(p);
  }

  async remove(id: string): Promise<{ mensaje: string }> {
    const p = await this.findOne(id);
    await this.repo.remove(p);
    return { mensaje: 'Presupuesto eliminado correctamente' };
  }

  private async validarCargoOficial(codigoOficio: string): Promise<void> {
    const cargo = await this.cargosCatalogo.buscarPorCodigo(codigoOficio);
    if (!cargo) {
      throw new BadRequestException(
        `El código de oficio ${codigoOficio} no existe en el catálogo oficial de Midasoft`,
      );
    }
  }
}