import { Injectable, Logger } from '@nestjs/common';

/**
 * Control de detención del proceso de liquidación (HU-03 — botón
 * "Detener proceso"). Estado in-memory por período:
 *  - El motor registra el período al iniciar y lo libera al terminar.
 *  - "Detener" solo procede si ese período está en ejecución (evita
 *    banderas huérfanas que cancelarían una ejecución futura).
 *  - El motor consulta la bandera entre pasos y aborta de forma limpia.
 */
@Injectable()
export class LiquidacionCancelacionService {
  private readonly logger = new Logger(LiquidacionCancelacionService.name);
  private readonly enEjecucion = new Set<string>();
  private readonly detencionSolicitada = new Set<string>();

  registrarInicio(idPeriodo: string): void {
    this.enEjecucion.add(idPeriodo);
    this.detencionSolicitada.delete(idPeriodo);
  }

  registrarFin(idPeriodo: string): void {
    this.enEjecucion.delete(idPeriodo);
    this.detencionSolicitada.delete(idPeriodo);
  }

  hayEjecucion(idPeriodo: string): boolean {
    return this.enEjecucion.has(idPeriodo);
  }

  /** Solicita detener; devuelve false si el período no está en ejecución. */
  solicitarDetencion(idPeriodo: string): boolean {
    if (!this.enEjecucion.has(idPeriodo)) return false;
    this.detencionSolicitada.add(idPeriodo);
    this.logger.warn(`Detención solicitada para el período ${idPeriodo}`);
    return true;
  }

  fueSolicitada(idPeriodo: string): boolean {
    return this.detencionSolicitada.has(idPeriodo);
  }
}

/** Error de control: el usuario detuvo el proceso (no es una falla). */
export class LiquidacionDetenida extends Error {
  constructor(public readonly paso: string) {
    super(`Proceso detenido por el usuario antes del paso ${paso}`);
  }
}
