import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liquidacion } from '../liquidacion/entities/liquidacion.entity';
import { LiquidacionDetalle } from '../liquidacion/entities/liquidacion-detalle.entity';
import { LiquidacionSubperiodo } from '../liquidacion/entities/liquidacion-subperiodo.entity';
import { AuditoriaConsulta } from './entities/auditoria-consulta.entity';
import { TrazabilidadService } from './services/trazabilidad.service';
import { TrazabilidadController } from './controllers/trazabilidad.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Liquidacion,
      LiquidacionDetalle,
      LiquidacionSubperiodo,
      AuditoriaConsulta,
    ]),
  ],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService],
})
export class TrazabilidadModule {}