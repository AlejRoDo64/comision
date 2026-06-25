import { EstadoOperativo } from '../../src/modules/calendarios/entities/periodo.entity';

export interface PeriodoData {
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estadoOperativo: EstadoOperativo;
}

export interface CalendarioData {
  nombre: string;
  anio: number;
  estadoActivo: boolean;
  periodos: PeriodoData[];
}

export const CALENDARIOS_SEED: CalendarioData[] = [
  {
    nombre: 'Comisiones 2026',
    anio: 2026,
    estadoActivo: true,
    // Patrón 21→20: el período "Enero" empieza el 21 de enero
    periodos: [
      { codigo: 'ENE-2026', fechaInicio: '2026-01-21', fechaFin: '2026-02-20', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'FEB-2026', fechaInicio: '2026-02-21', fechaFin: '2026-03-20', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'MAR-2026', fechaInicio: '2026-03-21', fechaFin: '2026-04-20', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'ABR-2026', fechaInicio: '2026-04-21', fechaFin: '2026-05-20', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'MAY-2026', fechaInicio: '2026-05-21', fechaFin: '2026-06-20', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'JUN-2026', fechaInicio: '2026-06-21', fechaFin: '2026-07-20', estadoOperativo: EstadoOperativo.EN_CURSO },
      { codigo: 'JUL-2026', fechaInicio: '2026-07-21', fechaFin: '2026-08-20', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'AGO-2026', fechaInicio: '2026-08-21', fechaFin: '2026-09-20', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'SEP-2026', fechaInicio: '2026-09-21', fechaFin: '2026-10-20', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'OCT-2026', fechaInicio: '2026-10-21', fechaFin: '2026-11-20', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'NOV-2026', fechaInicio: '2026-11-21', fechaFin: '2026-12-20', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'DIC-2026', fechaInicio: '2026-12-21', fechaFin: '2027-01-20', estadoOperativo: EstadoOperativo.ABIERTO },
    ],
  },
  {
    // RN-1: calendario independiente con fechas solapadas — permitido entre calendarios distintos
    nombre: 'Cumplimiento Meta 2026',
    anio: 2026,
    estadoActivo: true,
    periodos: [
      { codigo: 'ENE-2026', fechaInicio: '2026-01-01', fechaFin: '2026-01-31', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'FEB-2026', fechaInicio: '2026-02-01', fechaFin: '2026-02-28', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'MAR-2026', fechaInicio: '2026-03-01', fechaFin: '2026-03-31', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'ABR-2026', fechaInicio: '2026-04-01', fechaFin: '2026-04-30', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'MAY-2026', fechaInicio: '2026-05-01', fechaFin: '2026-05-31', estadoOperativo: EstadoOperativo.CERRADO },
      { codigo: 'JUN-2026', fechaInicio: '2026-06-01', fechaFin: '2026-06-30', estadoOperativo: EstadoOperativo.EN_CURSO },
      { codigo: 'JUL-2026', fechaInicio: '2026-07-01', fechaFin: '2026-07-31', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'AGO-2026', fechaInicio: '2026-08-01', fechaFin: '2026-08-31', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'SEP-2026', fechaInicio: '2026-09-01', fechaFin: '2026-09-30', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'OCT-2026', fechaInicio: '2026-10-01', fechaFin: '2026-10-31', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'NOV-2026', fechaInicio: '2026-11-01', fechaFin: '2026-11-30', estadoOperativo: EstadoOperativo.ABIERTO },
      { codigo: 'DIC-2026', fechaInicio: '2026-12-01', fechaFin: '2026-12-31', estadoOperativo: EstadoOperativo.ABIERTO },
    ],
  },
];
