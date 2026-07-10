import { BadRequestException } from '@nestjs/common';

/** Forma mínima que comparten todos los rangos parametrizables del módulo. */
export interface RangoContinuo {
  desdePorc: number;
  hastaPorc?: number | null;
}

/**
 * Regla común de tablas de rangos (HU-02): sin huecos, sin solapamientos,
 * solo el último puede ser abierto (hasta = ∞). Compartida por rangos de
 * comisión, de presupuesto y de crecimiento.
 */
export function validarContinuidadRangos(rangos: RangoContinuo[]): void {
  const orden = [...rangos].sort((a, b) => a.desdePorc - b.desdePorc);
  for (let i = 0; i < orden.length; i++) {
    const r = orden[i];
    if (r.hastaPorc != null && r.hastaPorc <= r.desdePorc) {
      throw new BadRequestException(
        `Rango inválido: hasta (${r.hastaPorc}%) debe ser mayor que desde (${r.desdePorc}%).`,
      );
    }
    if (r.hastaPorc == null && i < orden.length - 1) {
      throw new BadRequestException('Solo el último rango puede ser abierto (hasta = ∞).');
    }
    if (i > 0) {
      const prev = orden[i - 1];
      if (prev.hastaPorc == null || r.desdePorc !== prev.hastaPorc) {
        throw new BadRequestException(
          `Los rangos deben ser continuos: el rango que inicia en ${r.desdePorc}% no empalma con el anterior (termina en ${prev.hastaPorc ?? '∞'}%).`,
        );
      }
    }
  }
}
