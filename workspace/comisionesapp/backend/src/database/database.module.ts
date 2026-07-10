import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * BD propia de la app: SQL Server 2022 (puerto 1433).
 * Importado en AppModule. synchronize=true solo en desarrollo.
 *
 * Importante: el orden de las entities en `entities` está forzado en orden
 * topológico (dependencias primero) porque TypeORM con mssql NO respeta
 * automáticamente el orden de creación de tablas con FKs cruzadas.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mssql' as const,
          host: cfg.get<string>('DB_HOST', 'localhost'),
          port: Number(cfg.get<string>('DB_PORT', '1433')),
          username: cfg.get<string>('DB_USERNAME'),
          password: cfg.get<string>('DB_PASSWORD'),
          database: cfg.get<string>('DB_DATABASE'),
          entities: [
            // Nivel 0: sin dependencias
            __dirname + '/../modules/catalogos/entities/grupo-tiendas.entity{.ts,.js}',
            __dirname + '/../modules/calendarios/entities/calendario.entity{.ts,.js}',

            // Nivel 1: dependen de los anteriores
            __dirname + '/../modules/catalogos/entities/tienda.entity{.ts,.js}',
            __dirname + '/../modules/calendarios/entities/periodo.entity{.ts,.js}',

            // Nivel 2: dependen de tienda y/o periodo
            __dirname + '/../modules/catalogos/entities/colaborador.entity{.ts,.js}',
            __dirname + '/../modules/catalogos/entities/venta-icg.entity{.ts,.js}',
            __dirname + '/../common/audit/log-cambio-estructural.entity{.ts,.js}',

            // Nivel 3: parametrizacion depende de periodo
            __dirname + '/../modules/parametrizacion/entities/parametrizacion-cargo.entity{.ts,.js}',
            __dirname + '/../modules/parametrizacion/entities/presupuesto-cargo-periodo.entity{.ts,.js}',

            // Nivel 4: rangos dependen de parametrizacion
            __dirname + '/../modules/parametrizacion/entities/rango-comision.entity{.ts,.js}',
            __dirname + '/../modules/parametrizacion/entities/presupuesto-rango.entity{.ts,.js}',
            __dirname + '/../modules/parametrizacion/entities/crecimiento-rango.entity{.ts,.js}',

            // Nivel 5: cambios estructurales dependen de periodo
            __dirname + '/../modules/liquidacion/entities/cambio-cargo-periodo.entity{.ts,.js}',

            // Nivel 6: liquidacion depende de periodo
            __dirname + '/../modules/liquidacion/entities/liquidacion.entity{.ts,.js}',

            // Nivel 7: subperiodo depende de liquidacion
            __dirname + '/../modules/liquidacion/entities/liquidacion-subperiodo.entity{.ts,.js}',

            // Nivel 8: detalle depende de subperiodo
            __dirname + '/../modules/liquidacion/entities/liquidacion-detalle.entity{.ts,.js}',

            // Nivel 9: log + auditoria
            __dirname + '/../modules/liquidacion/entities/liquidacion-log.entity{.ts,.js}',
            __dirname + '/../modules/trazabilidad/entities/auditoria-consulta.entity{.ts,.js}',
          ],
          synchronize: !isProd,
          logging: !isProd,
          options: { encrypt: false, trustServerCertificate: true },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}