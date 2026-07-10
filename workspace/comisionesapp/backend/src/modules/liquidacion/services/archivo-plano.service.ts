import { Injectable, Logger } from '@nestjs/common';
import { ResultadoRegla } from './reglas-comision.service';
import { ParametrizacionCargo } from '../../parametrizacion/entities/parametrizacion-cargo.entity';

/**
 * Genera el archivo plano compatible con nómina (HU-03 — 37 campos).
 * Para Midasoft, los primeros 4 son suficientes: EMPLEADO, CONCEPTO, HORAS, VALOR.
 *
 * Layout CSV con separador `;` (configurable):
 *   00200470;A201;0;968465;...
 */
@Injectable()
export class ArchivoPlanoService {
  private readonly logger = new Logger(ArchivoPlanoService.name);

  /**
   * Construye el contenido del archivo.
   * HU-03: un registro CONSOLIDADO por colaborador (concepto A201), con
   * EMPLEADO = código Midasoft del colaborador (ej. 00200470), no la cédula.
   * Retorna el string listo para escribir a disco.
   */
  generar(
    liquidacionId: string,
    detalles: ResultadoRegla['detalles'],
    _param: ParametrizacionCargo,
    codigoPorCedula: Map<string, string> = new Map(),
  ): string {
    const SEP = ';';
    const HEADER = [
      'EMPLEADO', 'CONCEPTO', 'HORAS', 'VALOR',                       // 4 (Midasoft)
      'CANTIDAD', 'CCOSTO', 'N_PRESTAMO', 'LABOR', 'SUERTE',          // 5
      'EQUIPO', 'F_P_LIQ', 'F_NOVEDAD', 'IDENTIFICADOR', 'TP_CONTR',  // 5
      'CDG_CCF', 'SALMES', 'CONVENIO', 'CPTCONVENIO', 'CNSEMPZ',      // 5
      'OFICIO', 'DPTO', 'AREA', 'GRUPO', 'SUBGRUPO',                 // 5
      'UBICACION', 'NIVEL', 'SECCION', 'PROYECTO', 'DIVISION',        // 5
      'SUBDIVISION', 'CLASE_EMP', 'REL_LABORAL', 'REL_SINDICAL',      // 4
      'PRODUCTO', 'SUC_CIA', 'HORA',                                 // 3
    ];

    // Consolidación por colaborador: la comisión se suma sobre todos los
    // tipos de venta y subperíodos y se redondea UNA sola vez (evita que el
    // redondeo por fila descuadre el total frente a la cabecera).
    const porColaborador = new Map<string, {
      cedula: string; comision: number; idCargo: string; tienda: string;
    }>();
    for (const d of detalles) {
      const actual = porColaborador.get(d.idColaborador);
      if (actual) {
        actual.comision += d.comision;
      } else {
        porColaborador.set(d.idColaborador, {
          cedula: d.idColaborador,
          comision: d.comision,
          idCargo: d.idCargo,
          tienda: d.idTienda ?? '',
        });
      }
    }

    const lineas: string[] = [HEADER.join(SEP)];
    for (const c of porColaborador.values()) {
      lineas.push(this.construirFila(c, codigoPorCedula).join(SEP));
    }

    this.logger.log(
      `Archivo plano generado: ${liquidacionId} — ${porColaborador.size} colaboradores consolidados`,
    );
    return lineas.join('\n') + '\n';
  }

  private construirFila(
    c: { cedula: string; comision: number; idCargo: string; tienda: string },
    codigoPorCedula: Map<string, string>,
  ): string[] {
    // Mapeo mínimo viable para Midasoft (4 primeros campos obligatorios).
    // Los campos restantes quedan en blanco para que negocio los complete
    // cuando integre con su archivo de nómina real.
    return [
      codigoPorCedula.get(c.cedula) ?? c.cedula,                       // EMPLEADO (código Midasoft)
      'A201',                                                           // CONCEPTO (default)
      '0',                                                              // HORAS
      String(Math.round(c.comision)),                                  // VALOR (consolidado)
      '0', c.tienda, '', '', '',                                        // CANTIDAD, CCOSTO, N_PRESTAMO, LABOR, SUERTE
      '', '', '', c.cedula, '',                                         // EQUIPO, F_P_LIQ, F_NOVEDAD, IDENTIFICADOR, TP_CONTR
      '', '', '', '', '',                                              // CDG_CCF, SALMES, CONVENIO, CPTCONVENIO, CNSEMPZ
      c.idCargo,                                                       // OFICIO
      '', '', '', '',                                                  // DPTO, AREA, GRUPO, SUBGRUPO
      c.tienda,                                                        // UBICACION
      '', '', '', '',                                                  // NIVEL, SECCION, PROYECTO, DIVISION
      '', '', '', '',                                                  // SUBDIVISION, CLASE_EMP, REL_LABORAL, REL_SINDICAL
      '',                                                              // PRODUCTO
      '',                                                              // SUC_CIA
      '',                                                              // HORA
    ];
  }
}