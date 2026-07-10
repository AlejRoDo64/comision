import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colaborador } from './entities/colaborador.entity';
import { Tienda } from './entities/tienda.entity';
import { MidasoftService } from '../integraciones/midasoft.service';

export interface TiendaCcosto {
  ccosto: string;
  nombre: string;
}

export interface CargoTienda {
  codigo: string;
  nombre: string;
}

@Injectable()
export class CatalogosService {
  private readonly logger = new Logger(CatalogosService.name);

  // Caché in-memory del API de empleados (fuente primaria de tiendas/cargos).
  // Evita golpear Midasoft en cada apertura del formulario de parametrización.
  private cacheEmpleados: { datos: any[]; expira: number } | null = null;
  private static readonly CACHE_MS = 10 * 60 * 1000;

  constructor(
    @InjectRepository(Colaborador)
    private readonly colaboradorRepo: Repository<Colaborador>,
    @InjectRepository(Tienda)
    private readonly tiendaRepo: Repository<Tienda>,
    private readonly midasoft: MidasoftService,
  ) {}

  async colaboradores(): Promise<Array<Omit<Colaborador, 'tienda'> & { idTienda: string | null }>> {
    const lista = await this.colaboradorRepo.find({ relations: ['tienda'] });
    return lista.map(({ tienda, ...c }) => ({
      ...c,
      idTienda: tienda?.idTienda ?? null,
    }));
  }

  private async empleadosApi(): Promise<any[]> {
    if (this.cacheEmpleados && Date.now() < this.cacheEmpleados.expira) {
      return this.cacheEmpleados.datos;
    }
    const datos = await this.midasoft.empleados();
    this.cacheEmpleados = { datos, expira: Date.now() + CatalogosService.CACHE_MS };
    return datos;
  }

  /**
   * Tiendas (centros de costo) derivadas del API de empleados Midasoft.
   * El nombre se enriquece desde el catálogo local `tienda` cuando existe;
   * si no, se muestra el código del centro de costo.
   */
  async tiendasMidasoft(): Promise<TiendaCcosto[]> {
    const empleados = await this.empleadosApi();
    const ccostos = new Set<string>();
    for (const e of empleados) {
      const cc = String(e.Ccosto ?? e.ccosto ?? '').trim();
      if (cc) ccostos.add(cc);
    }

    const locales = await this.tiendaRepo.find();
    const nombrePorCodigo = new Map(locales.map((t) => [t.codigo, t.nombre]));

    return [...ccostos]
      .sort()
      .map((ccosto) => ({
        ccosto,
        nombre: nombrePorCodigo.get(ccosto) ?? `Centro de costo ${ccosto}`,
      }));
  }

  /**
   * Cargos vinculados a un centro de costo: oficios distintos de los
   * empleados Midasoft asignados a esa tienda (HU-02: la selección del
   * cargo parte de la tienda).
   */
  async cargosPorCcosto(ccosto: string): Promise<CargoTienda[]> {
    const empleados = await this.empleadosApi();
    const porCodigo = new Map<string, string>();
    for (const e of empleados) {
      const cc = String(e.Ccosto ?? e.ccosto ?? '').trim();
      if (cc !== ccosto) continue;
      const codigo = String(e.Codigo_Oficio ?? e.Cod_Profesion ?? '').trim();
      const nombre = String(e.Oficio ?? '').trim();
      if (codigo) porCodigo.set(codigo, nombre || codigo);
    }
    if (!porCodigo.size) {
      throw new NotFoundException(
        `No se encontraron cargos para el centro de costo "${ccosto}" en la base de empleados.`,
      );
    }
    return [...porCodigo.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([codigo, nombre]) => ({ codigo, nombre }));
  }
}
