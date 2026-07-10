import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatatestLoader } from './datatest-loader';

/**
 * Implementación de prueba de MidasoftService (FUENTES_MODO=mock).
 * Lee los archivos reales de Datatest/ y los expone con la MISMA forma
 * que devuelve el API Midasoft, para que el motor no distinga la fuente.
 *
 * Enriquecimiento de prueba: el export de empleados no trae oficio, así que
 * se asigna 102058 (Administrador(a) de tienda) al primer empleado y
 * 104608 (Vendedor(a)) al resto — códigos oficiales del catálogo HU-02.
 */
@Injectable()
export class MidasoftMockService {
  private readonly logger = new Logger(MidasoftMockService.name);
  private readonly datos: DatatestLoader;

  constructor(cfg: ConfigService) {
    this.datos = new DatatestLoader(
      DatatestLoader.resolverDirectorio(cfg.get<string>('DATATEST_DIR')),
    );
    this.logger.warn('FUENTES_MODO=mock — empleados/novedades/marcaciones desde Datatest/');
  }

  async empleados(): Promise<any[]> {
    return this.datos.empleados().map((e, i) => ({
      Empleado:      e.codigo,
      Docto_Ident:   e.cedula,
      PrimerNombre:  e.nombres.split(' ')[0] ?? '',
      SegundoNombre: e.nombres.split(' ').slice(1).join(' '),
      PrimerApellido:  e.apellidos.split(' ')[0] ?? '',
      SegundoApellido: e.apellidos.split(' ').slice(1).join(' '),
      F_Ingreso:     e.fechaIngreso,
      Fecha_Retiro:  e.fechaRetiro || null,
      Codigo_Oficio: i === 0 ? '102058' : '104608',
      Oficio:        i === 0 ? 'Administrador(a) de tienda' : 'Vendedor(a)',
      Ccosto:        e.ccosto,
      Estado_Actual: e.fechaRetiro ? 'R' : '',
    }));
  }

  /** Filas con la forma prevista del futuro endpoint de novedades. */
  async novedades(): Promise<any[]> {
    return this.datos.novedades().map((n) => ({
      Empleado:     n.codigo,
      Fecha_Inicio: n.fechaInicio,
      Fecha_Fin:    n.fechaFin,
      Horas:        n.horas,
      Tipo:         n.tipo,
    }));
  }

  /** Filas con la forma prevista del futuro endpoint de marcaciones. */
  async marcaciones(): Promise<any[]> {
    return this.datos.marcaciones().map((m) => ({
      Empleado: m.codigo,
      Ccosto:   m.ccosto,
      Fecha:    m.fecha,
      Horas:    m.horas,
    }));
  }
}
