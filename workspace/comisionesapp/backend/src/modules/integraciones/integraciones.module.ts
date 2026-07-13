import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IndicadoresService } from './indicadores.service';
import { MidasoftService } from './midasoft.service';
import { IndicadoresMockService } from './mock/indicadores-mock.service';
import { MidasoftMockService } from './mock/midasoft-mock.service';
import { IntegracionesController } from './integraciones.controller';

/**
 * Conexiones externas de SOLO LECTURA:
 *  - SQL Server INDICADORES (10.1.5.61) — ventas ICG vía stored procedures (conexión perezosa).
 *  - API Midasoft — base de empleados / novedades / marcaciones.
 *
 * Modo por FUENTE en .env (cada una conmuta de forma independiente):
 *  - MIDASOFT_MODO:    real | mock
 *  - INDICADORES_MODO: real | mock
 * Si no se definen, heredan de FUENTES_MODO (compatibilidad); default: real.
 * mock = datos de prueba desde Datatest/ (desarrollo sin acceso a la red).
 */
const modoFuente = (cfg: ConfigService, especifica: string): string =>
  cfg.get<string>(especifica) ?? cfg.get<string>('FUENTES_MODO') ?? 'real';

@Module({
  controllers: [IntegracionesController],
  providers: [
    {
      provide: MidasoftService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        modoFuente(cfg, 'MIDASOFT_MODO') === 'mock'
          ? new MidasoftMockService(cfg)
          : new MidasoftService(cfg),
    },
    {
      // Las ventas simuladas se generan para los empleados de la fuente
      // Midasoft ACTIVA (real o mock): así las consultas y la liquidación
      // siempre cruzan con los mismos colaboradores que muestra la app.
      provide: IndicadoresService,
      inject: [ConfigService, MidasoftService],
      useFactory: (cfg: ConfigService, midasoft: MidasoftService) =>
        modoFuente(cfg, 'INDICADORES_MODO') === 'mock'
          ? new IndicadoresMockService(cfg, midasoft)
          : new IndicadoresService(cfg),
    },
  ],
  exports: [IndicadoresService, MidasoftService],
})
export class IntegracionesModule {}
