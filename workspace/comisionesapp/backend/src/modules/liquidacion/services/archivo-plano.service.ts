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
   * Retorna el string listo para escribir a disco.
   */
  generar(
    liquidacionId: string,
    detalles: ResultadoRegla['detalles'],
    _param: ParametrizacionCargo,
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

    const lineas: string[] = [HEADER.join(SEP)];

    for (const d of detalles) {
      const fila = this.construirFila(d);
      lineas.push(fila.join(SEP));
    }

    this.logger.log(
      `Archivo plano generado: ${liquidacionId} — ${detalles.length} filas`,
    );
    return lineas.join('\n') + '\n';
  }

  private construirFila(d: ResultadoRegla['detalles'][number]): string[] {
    // Mapeo mínimo viable para Midasoft.
    // Los 33 campos restantes quedan en blanco para que negocio los complete
    // cuando integre con su archivo de nómina real.
    return [
      d.idColaborador,                                                 // EMPLEADO
      'A201',                                                           // CONCEPTO (default)
      '0',                                                              // HORAS
      String(Math.round(d.comision)),                                  // VALOR
      '0', '', '', '', '',                                              // CANTIDAD, CCOSTO, N_PRESTAMO, LABOR, SUERTE
      '', '', '', '', '',                                              // EQUIPO, F_P_LIQ, F_NOVEDAD, IDENTIFICADOR, TP_CONTR
      '', '', '', '', '',                                              // CDG_CCF, SALMES, CONVENIO, CPTCONVENIO, CNSEMPZ
      d.idCargo,                                                       // OFICIO
      '', '', '', '',                                                  // DPTO, AREA, GRUPO, SUBGRUPO
      d.idTienda ?? '',                                                // UBICACION (placeholder con tienda)
      '', '', '', '',                                                  // NIVEL, SECCION, PROYECTO, DIVISION
      '', '', '', '',                                                  // SUBDIVISION, CLASE_EMP, REL_LABORAL, REL_SINDICAL
      d.tipoVenta,                                                     // PRODUCTO
      '',                                                              // SUC_CIA
      '',                                                              // HORA
    ];
  }
}