// Utilidades de presentación compartidas entre vistas — auditoría HU-0223

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatearMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return formatoMoneda.format(valor);
}

export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Clase CSS del badge según estado. Claves PascalCase = estado operativo de
 * período (HU-01); claves MAYÚSCULAS = estado de liquidación (HU-03).
 */
export function clsEstado(estado: string): string {
  const mapa: Record<string, string> = {
    Abierto: 's-open',
    EnCurso: 's-active',
    Liquidado: 's-warn',
    Cerrado: 's-closed',
    EN_CURSO: 's-warn',
    LIQUIDADO: 's-active',
    CERRADO: 's-closed',
    ERROR: 's-err',
    CANCELADA: 's-warn',
  };
  return mapa[estado] ?? '';
}
