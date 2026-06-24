import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBaseRepository } from '../common/interfaces/base-repository.interface';
import { IProducto, PRODUCTO_REPOSITORY } from './interfaces/producto.interface';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly repo: IBaseRepository<IProducto>,
  ) {}

  findAll(): Promise<IProducto[]> {
    return this.repo.findAll();
  }

  async findOne(id: number): Promise<IProducto> {
    const producto = await this.repo.findById(id);
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  create(dto: CrearProductoDto): Promise<IProducto> {
    return this.repo.create(dto);
  }

  async update(id: number, dto: ActualizarProductoDto): Promise<IProducto> {
    const actualizado = await this.repo.update(id, dto);
    if (!actualizado) throw new NotFoundException(`Producto #${id} no encontrado`);
    return actualizado;
  }

  async remove(id: number): Promise<{ mensaje: string }> {
    const eliminado = await this.repo.delete(id);
    if (!eliminado) throw new NotFoundException(`Producto #${id} no encontrado`);
    return { mensaje: `Producto #${id} eliminado correctamente` };
  }
}
