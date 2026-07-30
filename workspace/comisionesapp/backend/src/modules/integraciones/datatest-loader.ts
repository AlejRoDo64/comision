import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Lector de los archivos de prueba de la carpeta Datatest/ (raíz del repo).
 * Formato común: campos entre comillas separados por ';' (export Midasoft).
 * Se usa SOLO en FUENTES_MODO=mock; en modo real estos archivos no se tocan.
 */
export class DatatestLoader {
  constructor(private readonly dir: string) {}

  static resolverDirectorio(configurado?: string): string {
    if (configurado) return resolve(configurado);
    // backend corre en workspace/comisionesapp/backend → Datatest está 3 niveles arriba
    return resolve(process.cwd(), '..', '..', '..', 'Datatest');
  }

  existe(): boolean {
    return existsSync(this.dir);
  }

  /** Última versión del archivo cuyo nombre empieza por el prefijo (ej. BaseEmpleados). */
  private ultimoArchivo(prefijo: string): string | null {
    if (!this.existe()) return null;
    const candidatos = readdirSync(this.dir)
      .filter((f) => f.startsWith(prefijo) && f.endsWith('.txt'))
      .sort();
    return candidatos.length ? join(this.dir, candidatos[candidatos.length - 1]) : null;
  }

  private leerFilas(prefijo: string): string[][] {
    const ruta = this.ultimoArchivo(prefijo);
    if (!ruta) return [];
    return readFileSync(ruta, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => l.split(';').map((c) => c.replace(/^"|"$/g, '').trim()));
  }

  /** dd/MM/yyyy → yyyy-MM-dd (vacío si no parsea). */
  static fechaIso(v: string): string {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v ?? '');
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  /**
   * BaseEmpleados_*.txt:
   * codigo; cedula; apellidos; nombres; tipoContrato; fechaIngreso; fechaRetiro;
   * oficioCompuesto (oficio+ccosto+000); ccosto; jornada; fechaInicioCcosto
   */
  empleados(): Array<{
    codigo: string; cedula: string; apellidos: string; nombres: string;
    fechaIngreso: string; fechaRetiro: string; oficioCompuesto: string;
    ccosto: string; jornada: string;
  }> {
    return this.leerFilas('BaseEmpleados').map((c) => ({
      codigo:          c[0] ?? '',
      cedula:          c[1] ?? '',
      apellidos:       c[2] ?? '',
      nombres:         c[3] ?? '',
      fechaIngreso:    DatatestLoader.fechaIso(c[5] ?? ''),
      fechaRetiro:     DatatestLoader.fechaIso(c[6] ?? ''),
      oficioCompuesto: c[7] ?? '',
      ccosto:          c[8] ?? '',
      jornada:         c[9] ?? '',
    }));
  }

  /** Nombres de centro de costo desde las marcaciones ("42062 - 138 TIENDA KOAJ PALATINO"). */
  nombresCcosto(): Map<string, string> {
    const nombres = new Map<string, string>();
    for (const fila of this.leerFilas('MarcacionesComercial')) {
      const campo = fila[1] ?? '';
      const sep = campo.indexOf('-');
      if (sep < 0) continue;
      const ccosto = campo.slice(0, sep).trim();
      const nombre = campo.slice(sep + 1).trim();
      if (ccosto && nombre && !nombres.has(ccosto)) nombres.set(ccosto, nombre);
    }
    return nombres;
  }

  /** MarcacionesComercial_*.txt: codigo; "ccosto - nombre tienda"; fecha; horas */
  marcaciones(): Array<{ codigo: string; ccosto: string; fecha: string; horas: number }> {
    return this.leerFilas('MarcacionesComercial').map((c) => ({
      codigo: c[0] ?? '',
      ccosto: (c[1] ?? '').split('-')[0].trim(),
      fecha:  DatatestLoader.fechaIso(c[2] ?? ''),
      horas:  Number(c[3] ?? 0),
    }));
  }

  /** NovedadesComercial_*.txt: codigo; fechaIni; fechaFin; horas; tipo */
  novedades(): Array<{
    codigo: string; fechaInicio: string; fechaFin: string; horas: number; tipo: string;
  }> {
    return this.leerFilas('NovedadesComercial').map((c) => ({
      codigo:      c[0] ?? '',
      fechaInicio: DatatestLoader.fechaIso(c[1] ?? ''),
      fechaFin:    DatatestLoader.fechaIso(c[2] ?? ''),
      horas:       Number(c[3] ?? 0),
      tipo:        c[4] ?? '',
    }));
  }
}
