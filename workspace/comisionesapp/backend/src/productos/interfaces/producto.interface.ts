export interface IProducto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  creadoEn: string;
}

export const PRODUCTO_REPOSITORY = 'PRODUCTO_REPOSITORY';
