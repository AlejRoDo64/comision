import { Injectable, Logger } from '@nestjs/common';
import {
  CambioCargoPeriodo,
  TipoCambio,
} from '../entities/cambio-cargo-periodo.entity';
import {
  LiquidacionSubperiodo,
  MotivoSubperiodo,
} from '../entities/liquidacion-subperiodo.entity';

export interface EmpleadoPeriodo {
  idColaborador: string;
  idCargoInicial: string;
  idTiendaInicial: string | null;
  idCentroCostoInicial: string | null;
}

export interface SubPeriodoGenerado {
  idColaborador: string;
  fechaInicio: string;
  fechaFin: string;
  idCargo: string;
  idTienda: string | null;
  idCentroCosto: string | null;
  motivo: MotivoSubperiodo;
}

/**
 * Fragmenta un período por colaborador según los cambios estructurales
 * detectados (HU-03). Si no hay cambios, retorna un único subperíodo INICIAL.
 */
@Injectable()
export class SubPeriodoService {
  private readonly logger = new Logger(SubPeriodoService.name);

  generar(
    empleados: EmpleadoPeriodo[],
    cambios: CambioCargoPeriodo[],
    periodoInicio: string,
    periodoFin: string,
  ): SubPeriodoGenerado[] {
    const resultado: SubPeriodoGenerado[] = [];

    for (const emp of empleados) {
      const cambiosEmpleado = cambios
        .filter((c) => c.idColaborador === emp.idColaborador)
        .filter((c) => c.fechaCambio >= periodoInicio && c.fechaCambio <= periodoFin)
        .sort((a, b) => a.fechaCambio.localeCompare(b.fechaCambio));

      if (cambiosEmpleado.length === 0) {
        resultado.push({
          idColaborador: emp.idColaborador,
          fechaInicio: periodoInicio,
          fechaFin: periodoFin,
          idCargo: emp.idCargoInicial,
          idTienda: emp.idTiendaInicial,
          idCentroCosto: emp.idCentroCostoInicial,
          motivo: MotivoSubperiodo.INICIAL,
        });
        continue;
      }

      let cursor = periodoInicio;
      let cargoActual = emp.idCargoInicial;
      let tiendaActual = emp.idTiendaInicial;
      let ccActual = emp.idCentroCostoInicial;

      for (const cambio of cambiosEmpleado) {
        // Subperíodo anterior al cambio
        if (cambio.fechaCambio > cursor) {
          const finAnterior = this.sumarUnDia(cambio.fechaCambio, -1);
          resultado.push({
            idColaborador: emp.idColaborador,
            fechaInicio: cursor,
            fechaFin: finAnterior,
            idCargo: cargoActual,
            idTienda: tiendaActual,
            idCentroCosto: ccActual,
            motivo:
              cambio.tipoCambio === TipoCambio.CAMBIO_CARGO
                ? MotivoSubperiodo.CAMBIO_CARGO
                : MotivoSubperiodo.TRASLADO_CC,
          });
        }
        // Aplicar el cambio
        if (cambio.tipoCambio === TipoCambio.CAMBIO_CARGO && cambio.cargoNuevo) {
          cargoActual = cambio.cargoNuevo;
        }
        if (cambio.tiendaNueva) tiendaActual = cambio.tiendaNueva;
        if (cambio.centroCostoNuevo) ccActual = cambio.centroCostoNuevo;
        cursor = cambio.fechaCambio;
      }

      // Subperíodo restante hasta el fin del período
      if (cursor <= periodoFin) {
        resultado.push({
          idColaborador: emp.idColaborador,
          fechaInicio: cursor,
          fechaFin: periodoFin,
          idCargo: cargoActual,
          idTienda: tiendaActual,
          idCentroCosto: ccActual,
          motivo:
            cambiosEmpleado[cambiosEmpleado.length - 1].tipoCambio === TipoCambio.CAMBIO_CARGO
              ? MotivoSubperiodo.CAMBIO_CARGO
              : MotivoSubperiodo.TRASLADO_CC,
        });
      }
    }

    this.logger.log(
      `Subperíodos generados: ${empleados.length} colaboradores → ${resultado.length} tramos`,
    );
    return resultado;
  }

  private sumarUnDia(fecha: string, delta: number): string {
    const [y, m, d] = fecha.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return dt.toISOString().slice(0, 10);
  }
}