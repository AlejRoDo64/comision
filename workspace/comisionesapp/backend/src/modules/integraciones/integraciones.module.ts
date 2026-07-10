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
 * FUENTES_MODO en .env conmuta la implementación SIN tocar consumidores:
 *  - real (default): conexiones oficiales.
 *  - mock: datos de prueba desde Datatest/ (desarrollo sin acceso a la red).
 */
@Module({
  controllers: [IntegracionesController],
  providers: [
    {
      provide: IndicadoresService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        cfg.get<string>('FUENTES_MODO') === 'mock'
          ? new IndicadoresMockService(cfg)
          : new IndicadoresService(cfg),
    },
    {
      provide: MidasoftService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        cfg.get<string>('FUENTES_MODO') === 'mock'
          ? new MidasoftMockService(cfg)
          : new MidasoftService(cfg),
    },
  ],
  exports: [IndicadoresService, MidasoftService],
})
export class IntegracionesModule {}
