import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoTiendas } from './entities/grupo-tiendas.entity';
import { Tienda } from './entities/tienda.entity';
import { Colaborador } from './entities/colaborador.entity';
import { VentaICG } from './entities/venta-icg.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoTiendas, Tienda, Colaborador, VentaICG])],
  exports: [TypeOrmModule],
})
export class CatalogosModule {}
