import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

/**
 * Acceso SOLO LECTURA a la BD INDICADORES (ventas ICG).
 * Consume los mismos SP que usa hoy el Excel de comisiones.
 * La conexión es perezosa: se abre en el primer uso, de modo que la app
 * puede arrancar aunque falten credenciales de INDICADORES en el .env.
 * Nunca ejecutar INSERT/UPDATE/DELETE contra esta conexión.
 */
@Injectable()
export class IndicadoresService implements OnModuleDestroy {
  private ds: DataSource | null = null;

  constructor(private readonly cfg: ConfigService) {}

  /** Detalle de comisiones POS por rango de fechas (SP_GetPOSCommissionsDetail). */
  async comisionesDetalle(fechaInicial: string, fechaFinal: string): Promise<any[]> {
    return this.exec('SP_GetPOSCommissionsDetail', fechaInicial, fechaFinal);
  }

  /** Resumen de comisiones POS por rango de fechas (SP_GetPOSCommissionsSummary). */
  async comisionesResumen(fechaInicial: string, fechaFinal: string): Promise<any[]> {
    return this.exec('SP_GetPOSCommissionsSummary', fechaInicial, fechaFinal);
  }

  private async conexion(): Promise<DataSource> {
    if (this.ds?.isInitialized) return this.ds;

    const password = this.cfg.get<string>('INDICADORES_PASSWORD');
    if (!password) {
      throw new ServiceUnavailableException(
        'INDICADORES_PASSWORD no está configurada en el .env — no es posible consultar INDICADORES.',
      );
    }

    this.ds = new DataSource({
      name: 'indicadores',
      type: 'mssql',
      host: this.cfg.get<string>('INDICADORES_HOST', '10.1.5.61'),
      port: Number(this.cfg.get<string>('INDICADORES_PORT', '1433')),
      username: this.cfg.get<string>('INDICADORES_USER', 'LecturaBd'),
      password,
      database: this.cfg.get<string>('INDICADORES_DB', 'INDICADORES'),
      entities: [],
      synchronize: false,
      logging: false,
      options: { encrypt: false, trustServerCertificate: true },
      extra: { connectionTimeout: 15000, requestTimeout: 120000 },
    });

    try {
      await this.ds.initialize();
    } catch (e: any) {
      this.ds = null;
      throw new ServiceUnavailableException(
        `No fue posible conectar a INDICADORES: ${e?.message ?? e}`,
      );
    }
    return this.ds;
  }

  /**
   * Guardarraíl de volumen: los SP devuelven el detalle POS de todas las
   * tiendas y el resultado se carga completo en memoria. Un rango muy amplio
   * (p.ej. 6 meses) agota el heap de Node y tumba el proceso. Los períodos de
   * liquidación son mensuales (patrón 21–20), así que 62 días da margen doble.
   */
  private static readonly MAX_DIAS_RANGO = 62;

  private validarRango(fechaInicial: string, fechaFinal: string): void {
    const ini = new Date(fechaInicial);
    const fin = new Date(fechaFinal);
    if (fin < ini) {
      throw new BadRequestException('La fecha final no puede ser anterior a la inicial.');
    }
    const dias = (fin.getTime() - ini.getTime()) / 86_400_000;
    if (dias > IndicadoresService.MAX_DIAS_RANGO) {
      throw new BadRequestException(
        `El rango solicitado (${Math.ceil(dias)} días) supera el máximo de ` +
          `${IndicadoresService.MAX_DIAS_RANGO} días por consulta a INDICADORES. ` +
          'Verifique las fechas del período: los períodos de liquidación son mensuales.',
      );
    }
  }

  private async exec(sp: string, fechaInicial: string, fechaFinal: string): Promise<any[]> {
    this.validarRango(fechaInicial, fechaFinal);
    const ds = await this.conexion();
    try {
      return await ds.query(
        `EXEC [dbo].[${sp}] @FechaInicial = @0, @FechaFinal = @1`,
        [fechaInicial, fechaFinal],
      );
    } catch (e: any) {
      throw new ServiceUnavailableException(
        `Error consultando INDICADORES (${sp}): ${e?.message ?? e}`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.ds?.isInitialized) await this.ds.destroy();
  }
}
