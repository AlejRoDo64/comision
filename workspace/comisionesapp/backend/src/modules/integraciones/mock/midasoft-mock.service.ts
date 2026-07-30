import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatatestLoader } from '../datatest-loader';

/** Nombres del catálogo oficial HU-02 por código base (enriquecimiento del mock). */
const NOMBRES_OFICIO: Record<string, string> = {
  '102110': 'COADMINISTRADOR(A) DE TIENDA',
  '104223': 'CAJERO(A) 36H',
  '104222': 'CAJERO(A) TC',
  '104517': 'STAFF COMERCIAL 36 H',
  '104518': 'STAFF COMERCIAL TC',
  '102058': 'ADMINISTRADOR(A) DE TIENDA',
  '102502': 'PARTNER COMERCIAL',
  '104608': 'VENDEDOR(A)',
  '104275': 'ASESOR(A) DE VENTAS 48H',
  '104341': 'ASESOR(A) DE VENTAS 36H',
  '102571': 'GESTOR COMERCIAL',
};

/**
 * Implementación de prueba de MidasoftService (FUENTES_MODO=mock).
 * Lee los archivos reales de Datatest/ y los expone con la MISMA forma
 * que devuelve el API Midasoft, para que el motor no distinga la fuente:
 *   Ccosto: "42170" · DescripcionCcosto: "070 TIENDA KOAJ TINTAL"
 *   Codigo_Oficio: "10451742170000" (compuesto) · Oficio: "STAFF COMERCIAL 36 H"
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
    const nombresCcosto = this.datos.nombresCcosto();
    return this.datos.empleados().map((e) => {
      const oficioBase = e.oficioCompuesto.slice(0, 6);
      return {
        Empleado:      e.codigo,
        Docto_Ident:   e.cedula,
        PrimerNombre:  e.nombres.split(' ')[0] ?? '',
        SegundoNombre: e.nombres.split(' ').slice(1).join(' '),
        PrimerApellido:  e.apellidos.split(' ')[0] ?? '',
        SegundoApellido: e.apellidos.split(' ').slice(1).join(' '),
        F_Ingreso:     e.fechaIngreso,
        Fecha_Retiro:  e.fechaRetiro || null,
        // Contrato real del API: oficio compuesto (oficio+ccosto+000)
        Codigo_Oficio: e.oficioCompuesto || `104608${e.ccosto}000`,
        Oficio:        NOMBRES_OFICIO[oficioBase] ?? `OFICIO ${oficioBase}`,
        Ccosto:        e.ccosto,
        DescripcionCcosto: nombresCcosto.get(e.ccosto) ?? '',
        Estado_Actual: e.fechaRetiro ? 'R' : '',
      };
    });
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
