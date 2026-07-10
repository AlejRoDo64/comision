import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cliente SOLO CONSULTA del API Midasoft (ambiente pruebas).
 * Flujo: POST /SEG (login) → token → GET /EMP/EmpleadosPermoda.
 * Usa fetch nativo de Node 22 — sin dependencias adicionales.
 */
@Injectable()
export class MidasoftService {
  private token: string | null = null;
  private tokenExpira = 0;

  constructor(private readonly cfg: ConfigService) {}

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
}
