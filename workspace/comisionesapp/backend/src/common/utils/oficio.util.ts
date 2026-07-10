/**
 * El API Midasoft entrega el oficio COMPUESTO por cargo + centro de costo:
 *   Codigo_Oficio = "10451742170000" = 104517 (oficio) + 42170 (ccosto) + 000
 * La parametrización HU-02 trabaja con el código base de 6 dígitos.
 */
export function codigoOficioBase(raw: string, ccosto?: string): string {
  const codigo = (raw ?? '').trim();
  if (codigo.length <= 6) return codigo;
  // Compuesto confirmado: contiene el ccosto a partir de la posición 6
  if (ccosto && codigo.slice(6).startsWith(ccosto)) return codigo.slice(0, 6);
  // Fallback: formato compuesto estándar de 14 dígitos
  if (/^\d{14}$/.test(codigo)) return codigo.slice(0, 6);
  return codigo;
}
