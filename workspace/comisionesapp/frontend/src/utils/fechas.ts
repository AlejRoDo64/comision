/**
 * Fechas por defecto de los formularios: siempre relativas al tiempo actual.
 * Todas devuelven strings ISO 'YYYY-MM-DD' (formato de los inputs type=date).
 */

const iso = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** Año en curso. */
export const anioActual = (): number => new Date().getFullYear();

/** Fecha de hoy. */
export const hoyIso = (): string => iso(new Date());

/** Primer día del mes en curso. */
export const primerDiaMesIso = (): string => {
  const h = new Date();
  return iso(new Date(h.getFullYear(), h.getMonth(), 1));
};

/**
 * Ventana del patrón de período (por defecto 21→20, HU-01) que CONTIENE la
 * fecha actual: del día `diaInicio` de un mes al día `diaFin` del siguiente.
 * Ej. el 13-jul → 2026-06-21 a 2026-07-20; el 25-jul → 2026-07-21 a 2026-08-20.
 */
export function ventanaPeriodoActual(diaInicio = 21, diaFin = 20): { inicio: string; fin: string } {
  const hoy = new Date();
  // Si aún no pasa el día de corte, la ventana terminó/termina este mes.
  const mesFin = hoy.getDate() <= diaFin ? hoy.getMonth() : hoy.getMonth() + 1;
  const fin = new Date(hoy.getFullYear(), mesFin, diaFin);
  const inicio = new Date(fin.getFullYear(), fin.getMonth() - 1, diaInicio);
  return { inicio: iso(inicio), fin: iso(fin) };
}
