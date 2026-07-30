import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatatestLoader } from './datatest-loader';

/**
 * Cliente SOLO CONSULTA del API Midasoft (ambiente pruebas).
 * Flujo: POST /SEG (login) → token → GET /EMP/EmpleadosPermoda.
 * Usa fetch nativo de Node 22 — sin dependencias adicionales.
 */
@Injectable()
export class MidasoftService {
  private readonly logger = new Logger(MidasoftService.name);
  private token: string | null = null;
  private tokenExpira = 0;
  private readonly datosLocales: DatatestLoader;

  constructor(private readonly cfg: ConfigService) {
    this.datosLocales = new DatatestLoader(
      DatatestLoader.resolverDirectorio(cfg.get<string>('DATATEST_DIR')),
    );
  }

  private get baseUrl(): string {
    return this.cfg.get<string>(
      'MIDASOFT_BASE_URL',
      'https://pruebaspermoda.midasoft.co/APIS/Midas_APIS/api',
    );
  }

  /**
   * fetch que convierte errores de red (DNS, timeout, sin conexión) en 503
   * con mensaje claro, en lugar del 500 genérico que produce el TypeError.
   */
  private async fetchSeguro(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (e: any) {
      throw new ServiceUnavailableException(
        `No fue posible conectar a Midasoft (${url}): ${e?.cause?.message ?? e?.message ?? e}`,
      );
    }
  }

  /** Autentica contra /SEG y cachea el token 10 minutos. */
  private async autenticar(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpira) return this.token;

    const res = await this.fetchSeguro(`${this.baseUrl}/SEG`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: this.cfg.get<string>('MIDASOFT_COMPANY_ID', ''),
        username: this.cfg.get<string>('MIDASOFT_USERNAME', ''),
        password: this.cfg.get<string>('MIDASOFT_PASSWORD', ''),
      }),
    });

    if (!res.ok) {
      throw new ServiceUnavailableException(
        `Midasoft login falló: HTTP ${res.status} ${await res.text().catch(() => '')}`,
      );
    }

    // El API responde el JWT como texto plano (Content-Type: text/plain).
    const cuerpo = (await res.text()).trim();
    let token: string | null = null;
    if (cuerpo.startsWith('{')) {
      const data: any = JSON.parse(cuerpo);
      token = data?.token ?? data?.Token ?? data?.access_token ?? null;
    } else if (cuerpo.split('.').length === 3) {
      token = cuerpo; // JWT crudo
    }
    if (!token) {
      throw new ServiceUnavailableException(
        `Midasoft login no devolvió token. Respuesta: ${cuerpo.slice(0, 300)}`,
      );
    }

    this.token = token;
    this.tokenExpira = Date.now() + 10 * 60 * 1000;
    return token;
  }

  /** Base de empleados Permoda (todos los colaboradores activos o retirados). */
  async empleados(): Promise<any[]> {
    const token = await this.autenticar();
    const res = await this.fetchSeguro(`${this.baseUrl}/EMP/EmpleadosPermoda`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new ServiceUnavailableException(
        `Midasoft EmpleadosPermoda falló: HTTP ${res.status} ${await res.text().catch(() => '')}`,
      );
    }
    return res.json();
  }

  /**
   * Novedades del personal. Midasoft aún NO expone este endpoint (HU-03).
   * PUENTE TEMPORAL: en la operación real, este reporte llega hoy como
   * archivo plano (no vía API); mientras no exista el endpoint, se lee el
   * último NovedadesComercial_*.txt de Datatest/ con el mismo formato.
   * Cuando Midasoft exponga el endpoint, reemplazar este método por la
   * llamada autenticada — la forma de cada fila ya coincide:
   * { Empleado, Fecha_Inicio, Fecha_Fin, Horas, Tipo }.
   */
  async novedades(): Promise<any[]> {
    if (!this.datosLocales.existe()) return [];
    const filas = this.datosLocales.novedades();
    if (filas.length) {
      this.logger.warn(
        `Novedades sin endpoint Midasoft — usando ${filas.length} registro(s) de NovedadesComercial_*.txt (Datatest/) como puente temporal.`,
      );
    }
    return filas.map((n) => ({
      Empleado: n.codigo,
      Fecha_Inicio: n.fechaInicio,
      Fecha_Fin: n.fechaFin,
      Horas: n.horas,
      Tipo: n.tipo,
    }));
  }

  /**
   * Marcaciones (horas laboradas por día). Mismo puente temporal que
   * novedades(): lee MarcacionesComercial_*.txt de Datatest/ mientras
   * Midasoft no exponga el endpoint. Forma: { Empleado, Ccosto, Fecha, Horas }.
   */
  async marcaciones(): Promise<any[]> {
    if (!this.datosLocales.existe()) return [];
    const filas = this.datosLocales.marcaciones();
    if (filas.length) {
      this.logger.warn(
        `Marcaciones sin endpoint Midasoft — usando ${filas.length} registro(s) de MarcacionesComercial_*.txt (Datatest/) como puente temporal.`,
      );
    }
    return filas.map((m) => ({
      Empleado: m.codigo,
      Ccosto: m.ccosto,
      Fecha: m.fecha,
      Horas: m.horas,
    }));
  }
}
