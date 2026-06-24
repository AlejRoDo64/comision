import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseRepository } from '../../common/interfaces/base-repository.interface';
import { IProducto } from '../interfaces/producto.interface';

/**
 * Repositorio en memoria — reemplazar por TypeOrmProductosRepository cuando se asigne la BD.
 * Único cambio en el módulo: useClass: ProductosMockRepository → useClass: TypeOrmProductosRepository
 */
@Injectable()
export class ProductosMockRepository implements IBaseRepository<IProducto> {
  private items: IProducto[] = [
    { id: 1, nombre: 'Camiseta Polo', descripcion: 'Algodón 100%', precio: 49900, stock: 50, creadoEn: new Date().toISOString() },
    { id: 2, nombre: 'Jean Clásico', descripcion: 'Denim azul oscuro', precio: 129900, stock: 30, creadoEn: new Date().toISOString() },
    { id: 3, nombre: 'Chaqueta Casual', descripcion: 'Poliéster liviano', precio: 189900, stock: 20, creadoEn: new Date().toISOString() },
  ];
  private counter = 4;

  async findAll(): Promise<IProducto[]> {
    return [...this.items];
  }

  async findById(id: number): Promise<IProducto | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async create(entity: Omit<IProducto, 'id' | 'creadoEn'>): Promise<IProducto> {
    const nuevo: IProducto = { id: this.counter++, ...entity, creadoEn: new Date().toISOString() };
    this.items.push(nuevo);
    return nuevo;
  }

  async update(id: number, entity: Partial<Omit<IProducto, 'id' | 'creadoEn'>>): Promise<IProducto | null> {
    const index = this.items.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...entity };
    return this.items[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.items.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
