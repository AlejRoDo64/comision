import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosMockRepository } from './repositories/productos-mock.repository';
import { PRODUCTO_REPOSITORY } from './interfaces/producto.interface';

@Module({
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: PRODUCTO_REPOSITORY,
      useClass: ProductosMockRepository,
      // Cuando se asigne la BD, cambiar a:
      // useClass: TypeOrmProductosRepository,
    },
  ],
})
export class ProductosModule {}
