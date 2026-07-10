import { Injectable, Inject } from '@nestjs/common';
import { TipoAfectacion } from '../entities/parametrizacion-cargo.entity';

/** Forma pública de un cargo del catálogo oficial (HU-02). */
export interface CargoCatalogo {
  codigo: string;
  nombre: string;
  afectacion: TipoAfectacion;
}

/** Token DI para permitir reemplazar la fuente del catálogo sin tocar al consumidor. */
export const CARGOS_CATALOGO = 'CARGOS_CATALOGO';

/**
 * Contrato del proveedor del catálogo de cargos comisionables.
 * La implementación por defecto es in-memory (CargosCatalogoInMemoryService).
 * Cuando Midasoft exponga un endpoint de cargos, crear CargosCatalogoMidasoftService
 * y cambiar el useClass en ParametrizacionModule.
 */
export interface ICargosCatalogo {
  listar(): Promise<CargoCatalogo[]>;
  buscarPorCodigo(codigo: string): Promise<CargoCatalogo | null>;
}

/**
 * Catálogo oficial de cargos comisionables de Permoda Ltda.
 * Fuente: HU-02 (tabla de Identificación oficial de cargos).
 * TODO: reemplazar por CargosCatalogoMidasoftService cuando el endpoint de Midasoft
 * esté disponible — el contrato ICargosCatalogo permite hacerlo sin tocar al consumidor.
 */
@Injectable()
export class CargosCatalogoInMemoryService implements ICargosCatalogo {
  private readonly cargos: ReadonlyArray<CargoCatalogo> = [
    { codigo: '102110', nombre: 'Coadministrador(a) de tienda', afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104223', nombre: 'Cajero(a) 36H',                afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104222', nombre: 'Cajero(a) TC',                 afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104517', nombre: 'Staff comercial 36H',          afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104518', nombre: 'Staff comercial TC',           afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '102058', nombre: 'Administrador(a) de tienda',   afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '102502', nombre: 'Partner comercial',            afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104608', nombre: 'Vendedor(a)',                  afectacion: TipoAfectacion.NOVEDADES },
    { codigo: '104275', nombre: 'Asesor(a) de ventas 48H',      afectacion: TipoAfectacion.HORAS },
    { codigo: '104341', nombre: 'Asesor(a) de ventas 36H',      afectacion: TipoAfectacion.HORAS },
    { codigo: '102571', nombre: 'Gestor comercial',             afectacion: TipoAfectacion.NOVEDADES },
  ];

  async listar(): Promise<CargoCatalogo[]> {
    return [...this.cargos];
  }

  async buscarPorCodigo(codigo: string): Promise<CargoCatalogo | null> {
    return this.cargos.find((c) => c.codigo === codigo) ?? null;
  }
}