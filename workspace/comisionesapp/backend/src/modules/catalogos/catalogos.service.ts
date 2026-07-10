import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colaborador } from './entities/colaborador.entity';

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(Colaborador)
    private readonly colaboradorRepo: Repository<Colaborador>,
  ) {}

  async colaboradores(): Promise<Array<Omit<Colaborador, 'tienda'> & { idTienda: string | null }>> {
    const lista = await this.colaboradorRepo.find({ relations: ['tienda'] });
    return lista.map(({ tienda, ...c }) => ({
      ...c,
      idTienda: tienda?.idTienda ?? null,
    }));
  }
}
