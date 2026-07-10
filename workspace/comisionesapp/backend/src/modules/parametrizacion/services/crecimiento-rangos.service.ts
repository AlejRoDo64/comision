import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrecimientoRango } from '../entities/crecimiento-rango.entity';
import { CARGOS_CATALOGO, ICargosCatalogo } from './cargos-catalogo.service';
import { CrearRangoTablaDto } from '../dto/crear-rango-tabla.dto';
import { validarContinuidadRangos } from '../validaciones/validar-rangos.util';

@Injectable()
export class CrecimientoRangosService {
  constructor(
    @InjectRepository(CrecimientoRango)
    private readonly repo: Repository<CrecimientoRango>,
    @Inject(CARGOS_CATALOGO)
    private readonly cargosCatalogo: ICargosCatalogo,
  ) {}

  findAll(
    idPeriodo?: string,
    codigoOficio?: string,
  ): Promise<CrecimientoRango[]> {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.periodo', 'periodo')
      .orderBy('r.codigoOficio', 'ASC')
      .addOrderBy('r.desdePorcCrec', 'ASC');

    if (idPeriodo) qb.andWhere('r.id_periodo = :idPeriodo', { idPeriodo });
    if (codigoOficio) qb.andWhere('r.codigo_oficio = :codigoOficio', { codigoOficio });

    return qb.getMany();
  }

  async findOne(id: string): Promise<CrecimientoRango> {
    const r = await this.repo.findOne({ where: { idRango: id }, relations: ['periodo'] });
    if (!r) throw new NotFoundException(`Rango de crecimiento ${id} no encontrado`);
    return r;
  }

  async replaceAll(
    codigoOficio: string,
    idPeriodo: string,
    rangos: CrearRangoTablaDto[],
  ): Promise<CrecimientoRango[]> {
    await this.validarCargoOficial(codigoOficio);
    validarContinuidadRangos(rangos);

    // delete + insert atómicos: un fallo no debe dejar la tabla vacía
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(CrecimientoRango);
      await repo.delete({ codigoOficio, periodo: { idPeriodo } as any });
      if (!rangos.length) return [];
      const entities = rangos.map((r) =>
        repo.create({
          codigoOficio,
          periodo: { idPeriodo } as any,
          desdePorcCrec: r.desdePorc,
          hastaPorcCrec: r.hastaPorc ?? null,
          porcLinea: r.porcLinea,
          porcPromocion: r.porcPromocion,
        }),
      );
      return repo.save(entities);
    });
  }

  async removeAll(codigoOficio: string, idPeriodo: string): Promise<{ mensaje: string }> {
    await this.repo.delete({ codigoOficio, periodo: { idPeriodo } as any });
    return { mensaje: `Rangos de crecimiento eliminados para ${codigoOficio}` };
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