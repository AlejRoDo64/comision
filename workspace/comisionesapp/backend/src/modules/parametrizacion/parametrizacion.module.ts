import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametrizacionCargo } from './entities/parametrizacion-cargo.entity';
import { RangoComision } from './entities/rango-comision.entity';
import { PresupuestoCargoPeriodo } from './entities/presupuesto-cargo-periodo.entity';
import { PresupuestoRangoComision } from './entities/presupuesto-rango.entity';
import { CrecimientoRango } from './entities/crecimiento-rango.entity';
import { Periodo } from '../calendarios/entities/periodo.entity';
import { Tienda } from '../catalogos/entities/tienda.entity';
import { ParametrizacionService } from './parametrizacion.service';
import { ParametrizacionController } from './parametrizacion.controller';
import { PresupuestosService } from './services/presupuestos.service';
import { PresupuestosController } from './controllers/presupuestos.controller';
import { PresupuestoRangosService } from './services/presupuesto-rangos.service';
import { PresupuestoRangosController } from './controllers/presupuesto-rangos.controller';
import { CrecimientoRangosService } from './services/crecimiento-rangos.service';
import { CrecimientoRangosController } from './controllers/crecimiento-rangos.controller';
import {
  CARGOS_CATALOGO,
  CargosCatalogoInMemoryService,
} from './services/cargos-catalogo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParametrizacionCargo,
      RangoComision,
      PresupuestoCargoPeriodo,
      PresupuestoRangoComision,
      CrecimientoRango,
      Periodo,
      Tienda,
    ]),
  ],
  controllers: [
    ParametrizacionController,
    PresupuestosController,
    PresupuestoRangosController,
    CrecimientoRangosController,
  ],
  providers: [
    ParametrizacionService,
    PresupuestosService,
    PresupuestoRangosService,
    CrecimientoRangosService,
    {
      provide: CARGOS_CATALOGO,
      useClass: CargosCatalogoInMemoryService,
      // Cuando Midasoft exponga endpoint de cargos:
      // useClass: CargosCatalogoMidasoftService,
    },
  ],
  exports: [TypeOrmModule, ParametrizacionService],
})
export class ParametrizacionModule {}