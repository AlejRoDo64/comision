import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from '../src/modules/calendarios/entities/calendario.entity';
import { Periodo } from '../src/modules/calendarios/entities/periodo.entity';
import { GrupoTiendas } from '../src/modules/catalogos/entities/grupo-tiendas.entity';
import { Tienda } from '../src/modules/catalogos/entities/tienda.entity';
import { Colaborador } from '../src/modules/catalogos/entities/colaborador.entity';
import { VentaICG } from '../src/modules/catalogos/entities/venta-icg.entity';
import { AuditLog } from '../src/modules/auditoria/entities/audit-log.entity';
import { SeedService } from './seed.service';

const ENTITIES = [Calendario, Periodo, GrupoTiendas, Tienda, Colaborador, VentaICG, AuditLog];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get<string>('NODE_ENV') === 'production';
        const dbType = cfg.get<string>('DB_TYPE', 'mssql');
        const dbPort = Number(cfg.get<string>('DB_PORT', dbType === 'mysql' ? '3306' : '1433'));

        if (dbType === 'mysql') {
          return {
            type: 'mysql' as const,
            host: cfg.get<string>('DB_HOST', 'localhost'),
            port: dbPort,
            username: cfg.get<string>('DB_USERNAME'),
            password: cfg.get<string>('DB_PASSWORD'),
            database: cfg.get<string>('DB_DATABASE'),
            entities: ENTITIES,
            synchronize: !isProd,
            logging: false,
          };
        }

        return {
          type: 'mssql' as const,
          host: cfg.get<string>('DB_HOST', 'localhost'),
          port: dbPort,
          username: cfg.get<string>('DB_USERNAME'),
          password: cfg.get<string>('DB_PASSWORD'),
          database: cfg.get<string>('DB_DATABASE'),
          entities: ENTITIES,
          synchronize: !isProd,
          logging: false,
          options: { encrypt: false, trustServerCertificate: true },
        };
      },
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [SeedService],
})
export class SeedModule {}
