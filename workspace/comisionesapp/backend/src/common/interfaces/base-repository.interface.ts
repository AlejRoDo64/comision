/**
 * Contrato base para repositorios de datos.
 * Las implementaciones concretas pueden ser in-memory (mock) o TypeORM (SQL Server).
 * Para cambiar de mock a BD real: solo reemplazar el useClass en el módulo correspondiente.
 */
export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(entity: Omit<T, 'id' | 'creadoEn'>): Promise<T>;
  update(id: number, entity: Partial<Omit<T, 'id' | 'creadoEn'>>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
