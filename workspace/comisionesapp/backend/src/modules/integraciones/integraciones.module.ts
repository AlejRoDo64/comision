import { Module } from '@nestjs/common';
import { IndicadoresService } from './indicadores.service';
import { MidasoftService } from './midasoft.service';
import { IntegracionesController } from './integraciones.controller';

/**
 * Conexiones externas de SOLO LECTURA:
 *  - SQL Server INDICADORES (10.1.5.61) — ventas ICG vía stored procedures (conexión perezosa).
 *  - API Midasoft — base de empleados.
 * No bloquean el arranque de la app si faltan credenciales.
 */
@Module({
  controllers: [IntegracionesController],
  providers: [IndicadoresService, MidasoftService],
  exports: [IndicadoresService, MidasoftService],
})
export class IntegracionesModule {}
