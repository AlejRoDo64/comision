import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Periodo } from '../../calendarios/entities/periodo.entity';
import { PresupuestoRangoComision } from '../entities/presupuesto-rango.entity';
import { CARGOS_CATALOGO, ICargosCatalogo } from './cargos-catalogo.service';
import { CrearRangoTablaDto } from '../dto/crear-rango-tabla.dto';
import { validarContinuidadRangos } from '../validaciones/validar-rangos.util';

@Injectable()
export class PresupuestoRangosService {
  constructor(
    @InjectRepository(PresupuestoRangoComision)
    private readonly repo: Repository<PresupuestoRangoComision>,
    @Inject(CARGOS_CATALOGO)
    private readonly cargosCatalogo: ICargosCatalogo,
  ) {}

  findAll(
    idPeriodo?: string,
    codigoOficio?: string,
  ): Promise<PresupuestoRangoComision[]> {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.periodo', 'periodo')
      .orderBy('r.codigoOficio', 'ASC')
      .addOrderBy('r.desdePorc', 'ASC');

    if (idPeriodo) qb.andWhere('r.id_periodo = :idPeriodo', { idPeriodo });
    if (codigoOficio) qb.andWhere('r.codigo_oficio = :codigoOficio', { codigoOficio });

    return qb.getMany();
  }

  async findOne(id: string): Promise<PresupuestoRangoComision> {
    const r = await this.repo.findOne({ where: { idRango: id }, relations: ['periodo'] });
    if (!r) throw new NotFoundException(`Rango de presupuesto ${id} no encontrado`);
    return r;
  }

  /** Reemplaza TODOS los rangos de un (cargo, período). Útil para edición masiva. */
  async replaceAll(
    codigoOficio: string,
    idPeriodo: string,
    rangos: CrearRangoTablaDto[],
    usuario: string,
  ): Promise<PresupuestoRangoComision[]> {
    await this.validarCargoOficial(codigoOficio);
    validarContinuidadRangos(rangos);
    void usuario; // reservado para auditoría estructural del módulo

    // delete + insert atómicos: un fallo no debe dejar la tabla vacía
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(PresupuestoRangoComision);
      await repo.delete({ codigoOficio, periodo: { idPeriodo } as Periodo });
      if (!rangos.length) return [];
      const entities = rangos.map((r) =>
        repo.create({
          codigoOficio,
          periodo: { idPeriodo } as Periodo,
          desdePorc: r.desdePorc,
          hastaPorc: r.hastaPorc ?? null,
          porcLinea: r.porcLinea,
          porcPromocion: r.porcPromocion,
        }),
      );
      return repo.save(entities);
    });
  }

  async removeAll(codigoOficio: string, idPeriodo: string): Promise<{ mensaje: string }> {
    await this.repo.delete({ codigoOficio, periodo: { idPeriodo } as Periodo });
    return { mensaje: `Rangos de presupuesto eliminados para ${codigoOficio}` };
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