import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoTiendas } from './entities/grupo-tiendas.entity';
import { Tienda } from './entities/tienda.entity';
import { Colaborador } from './entities/colaborador.entity';
import { VentaICG } from './entities/venta-icg.entity';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { IntegracionesModule } from '../integraciones/integraciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GrupoTiendas, Tienda, Colaborador, VentaICG]),
    // Fuente primaria de tiendas/cargos: API de empleados Midasoft
    IntegracionesModule,
  ],
  controllers: [CatalogosController],
  providers: [CatalogosService],
  exports: [TypeOrmModule],
})
export class CatalogosModule {}
