import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liquidacion } from './entities/liquidacion.entity';
import { LiquidacionDetalle } from './entities/liquidacion-detalle.entity';
import { LiquidacionSubperiodo } from './entities/liquidacion-subperiodo.entity';
import { LiquidacionLog } from './entities/liquidacion-log.entity';
import { CambioCargoPeriodo } from './entities/cambio-cargo-periodo.entity';
import { Periodo } from '../calendarios/entities/periodo.entity';
import { ParametrizacionCargo } from '../parametrizacion/entities/parametrizacion-cargo.entity';
import { Tienda } from '../catalogos/entities/tienda.entity';
import { IntegracionesModule } from '../integraciones/integraciones.module';
import { LiquidacionService } from './services/liquidacion.service';
import { LiquidacionController } from './controllers/liquidacion.controller';
import { NormalizacionService } from './services/normalizacion.service';
import { AfectacionesService } from './services/afectaciones.service';
import { SubPeriodoService } from './services/subperiodo.service';
import { ReglasComisionService } from './services/reglas-comision.service';
import { ArchivoPlanoService } from './services/archivo-plano.service';
import { LiquidacionLockService } from './services/liquidacion-lock.service';
import { LiquidacionCancelacionService } from './services/liquidacion-cancelacion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Liquidacion,
      LiquidacionDetalle,
      LiquidacionSubperiodo,
      LiquidacionLog,
      CambioCargoPeriodo,
      Periodo,
      ParametrizacionCargo,
      Tienda,
    ]),
    IntegracionesModule,   // IndicadoresService + MidasoftService
  ],
  controllers: [LiquidacionController],
  providers: [
    LiquidacionService,
    NormalizacionService,
    AfectacionesService,
    SubPeriodoService,
    ReglasComisionService,
    ArchivoPlanoService,
    LiquidacionLockService,
    LiquidacionCancelacionService,
  ],
  exports: [LiquidacionService],
})
export class LiquidacionModule {}